import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const REQUIRED_TEXT_FIELDS = ['slug', 'title', 'description', 'contribution', 'source']
const ALLOWED_PROJECT_FIELDS = new Set([
  'slug',
  'title',
  'description',
  'contribution',
  'stack',
  'source',
  'live',
  'image',
  'imageAlt',
  'status',
  'featured',
  'order',
  'visual',
])

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isHttpsUrl(value) {
  if (!isNonEmptyString(value)) return false
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function parseGitHubRepositoryUrl(value) {
  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error('Repository must be a valid https://github.com URL')
  }

  if (url.protocol !== 'https:' || !['github.com', 'www.github.com'].includes(url.hostname.toLowerCase())) {
    throw new Error('Repository must use https://github.com')
  }

  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length !== 2) throw new Error('Repository URL must identify one GitHub owner and repository')

  const owner = parts[0]
  const repository = parts[1].replace(/\.git$/i, '')
  const validSegment = /^[A-Za-z0-9_.-]+$/
  if (!validSegment.test(owner) || !validSegment.test(repository)) {
    throw new Error('Repository URL contains an invalid owner or repository name')
  }

  return { owner, repository }
}

const TECHNOLOGY_NAMES = new Map([
  ['css', 'CSS'],
  ['express', 'Express'],
  ['html', 'HTML'],
  ['javascript', 'JavaScript'],
  ['mongodb', 'MongoDB'],
  ['mongoose', 'Mongoose'],
  ['netlify', 'Netlify'],
  ['node', 'Node.js'],
  ['nodejs', 'Node.js'],
  ['react', 'React'],
  ['react-router', 'React Router'],
  ['tailwind', 'Tailwind CSS'],
  ['tailwind-css', 'Tailwind CSS'],
  ['tailwindcss', 'Tailwind CSS'],
  ['typescript', 'TypeScript'],
  ['vercel', 'Vercel'],
  ['vite', 'Vite'],
  ['vitest', 'Vitest'],
])

function humanizeRepositoryName(value) {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function normaliseTechnology(value) {
  return TECHNOLOGY_NAMES.get(value.toLowerCase()) ?? value
}

function normaliseTopic(value) {
  return TECHNOLOGY_NAMES.get(value.toLowerCase())
}

function unique(values) {
  return [...new Set(values.filter(isNonEmptyString))]
}

export function getDraftMissingFields(project) {
  const missing = []
  for (const field of ['slug', 'title', 'description', 'contribution', 'source']) {
    if (!isNonEmptyString(project?.[field])) missing.push(field)
  }
  if (!Array.isArray(project?.stack) || project.stack.length === 0) missing.push('stack')
  if (!Number.isInteger(project?.order) || project.order < 1) missing.push('order')
  if (project?.image && (!isNonEmptyString(project.imageAlt) || project.imageAlt.trim().length < 12)) {
    missing.push('imageAlt')
  }
  return missing
}

const ISSUE_FIELD_NAMES = new Map([
  ['Repository URL', 'repositoryUrl'],
  ['Project title', 'title'],
  ['Description', 'description'],
  ['What I built', 'contribution'],
  ['Technologies', 'stack'],
  ['Live URL', 'live'],
  ['Status', 'status'],
  ['Portfolio order', 'order'],
  ['Featured project', 'featured'],
])

export function parseProjectIssueBody(body) {
  const fields = {}
  const pattern = /^### (.+)\r?\n\r?\n([\s\S]*?)(?=\r?\n### |$)/gm
  for (const match of body.matchAll(pattern)) {
    const field = ISSUE_FIELD_NAMES.get(match[1].trim())
    if (!field) continue
    const value = match[2].trim()
    if (value && value !== '_No response_') fields[field] = value
  }
  return fields
}

export function applyIssueFieldsToDraft(originalDraft, fields) {
  const draft = {
    ...originalDraft,
    _draft: {
      ...(originalDraft._draft ?? {}),
    },
  }
  const provided = []
  for (const field of ['title', 'description', 'contribution', 'live', 'status']) {
    if (isNonEmptyString(fields[field])) {
      draft[field] = fields[field].trim()
      provided.push(field)
    }
  }
  if (isNonEmptyString(fields.stack)) {
    draft.stack = unique(fields.stack.split(',').map((item) => item.trim()))
    provided.push('stack')
  }
  if (isNonEmptyString(fields.order)) {
    draft.order = Number(fields.order)
    provided.push('order')
  }
  if (isNonEmptyString(fields.featured)) {
    draft.featured = /^yes$/i.test(fields.featured.trim())
    provided.push('featured')
  }

  draft._draft.provided = provided
  draft._draft.inferred = (draft._draft.inferred ?? []).filter((field) => !provided.includes(field))
  draft._draft.missing = getDraftMissingFields(draft)
  return draft
}

export async function fetchGitHubProjectDraft(repositoryUrl, options = {}) {
  const { owner, repository } = parseGitHubRepositoryUrl(repositoryUrl)
  const fetchImpl = options.fetchImpl ?? fetch
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (options.token) headers.Authorization = `Bearer ${options.token}`

  async function request(path) {
    const response = await fetchImpl(`https://api.github.com/repos/${owner}/${repository}${path}`, { headers })
    if (!response.ok) {
      throw new Error(`GitHub metadata request failed with HTTP ${response.status}`)
    }
    return response.json()
  }

  const [metadata, languages] = await Promise.all([
    request(''),
    request('/languages'),
  ])
  const stack = unique([
    ...(metadata.topics ?? []).map(normaliseTopic),
    ...Object.keys(languages ?? {}).map(normaliseTechnology),
  ])
  const slug = metadata.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const live = isHttpsUrl(metadata.homepage) ? metadata.homepage : undefined
  const draft = {
    slug,
    title: humanizeRepositoryName(metadata.name),
    description: metadata.description ?? '',
    contribution: '',
    stack,
    source: metadata.html_url,
    ...(live ? { live } : {}),
    status: metadata.archived ? 'Archived' : live ? 'Live' : 'Source available',
    featured: false,
    order: null,
  }

  return {
    ...draft,
    _draft: {
      createdAt: (options.now ?? (() => new Date().toISOString()))(),
      repository: `${owner}/${repository}`,
      inferred: ['slug', 'title', 'description', 'stack', 'source', ...(live ? ['live'] : []), 'status'],
      missing: getDraftMissingFields(draft),
    },
  }
}

export function validateProjectCatalog(catalog, options = {}) {
  if (!catalog || catalog.version !== 1 || !Array.isArray(catalog.projects)) {
    throw new Error('Project catalogue must use version 1 and contain a projects array')
  }

  const errors = []
  const seen = {
    slug: new Set(),
    source: new Set(),
    live: new Set(),
    order: new Set(),
  }

  catalog.projects.forEach((project, index) => {
    const label = isNonEmptyString(project?.slug) ? project.slug : `project ${index + 1}`

    for (const field of Object.keys(project ?? {})) {
      if (!ALLOWED_PROJECT_FIELDS.has(field)) errors.push(`${label}: unsupported field ${field}`)
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project?.slug ?? '')) {
      errors.push(`${label}: slug must contain lowercase letters, numbers, and hyphens`)
    }
    if (project?.featured !== undefined && typeof project.featured !== 'boolean') {
      errors.push(`${label}: featured must be true or false`)
    }
    if (project?.visual !== undefined && project.visual !== 'taskduty-architecture') {
      errors.push(`${label}: visual is unsupported`)
    }

    for (const field of REQUIRED_TEXT_FIELDS) {
      if (!isNonEmptyString(project?.[field])) errors.push(`${label}: ${field} is required`)
    }

    if (!Array.isArray(project?.stack) || project.stack.length === 0 || project.stack.some((item) => !isNonEmptyString(item))) {
      errors.push(`${label}: stack must contain at least one technology`)
    }

    if (!Number.isInteger(project?.order) || project.order < 1) {
      errors.push(`${label}: order must be a positive integer`)
    }

    if (!isHttpsUrl(project?.source)) errors.push(`${label}: source must be a valid HTTPS URL`)
    if (project?.live !== undefined && !isHttpsUrl(project.live)) {
      errors.push(`${label}: live must be a valid HTTPS URL`)
    }

    if (project?.image !== undefined) {
      if (!/^\/projects\/[a-z0-9-]+\.webp$/.test(project.image)) {
        errors.push(`${label}: image must use /projects/<slug>.webp`)
      }
      if (!isNonEmptyString(project.imageAlt) || project.imageAlt.trim().length < 12) {
        errors.push(`${label}: imageAlt must meaningfully describe the screenshot`)
      }
      if (options.publicDir && !existsSync(join(options.publicDir, project.image))) {
        errors.push(`${label}: image file does not exist at public${project.image}`)
      }
    } else if (project?.imageAlt !== undefined) {
      errors.push(`${label}: imageAlt cannot be set without an image`)
    }

    for (const field of ['slug', 'source', 'live', 'order']) {
      const value = project?.[field]
      if (value === undefined) continue
      const comparable = typeof value === 'string' ? value.toLowerCase().replace(/\/$/, '') : value
      if (seen[field].has(comparable)) errors.push(`${label}: duplicate ${field}`)
      seen[field].add(comparable)
    }
  })

  if (errors.length > 0) throw new Error(errors.join('\n'))
  return catalog
}

export function writeProjectDraft(draft, options) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft?.slug ?? '')) {
    throw new Error('Draft slug must contain only lowercase letters, numbers, and hyphens')
  }

  mkdirSync(options.draftDir, { recursive: true })
  const draftPath = join(options.draftDir, `${draft.slug}.json`)
  try {
    writeFileSync(draftPath, `${JSON.stringify(draft, null, 2)}\n`, {
      flag: options.force ? 'w' : 'wx',
    })
  } catch (error) {
    if (error?.code === 'EEXIST') {
      throw new Error(`Draft already exists: ${draft.slug}. Use --force to replace it.`)
    }
    throw error
  }
  return draftPath
}

export function publishProjectDraft(slug, options) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Draft slug must contain only lowercase letters, numbers, and hyphens')
  }

  const draftPath = join(options.draftDir, `${slug}.json`)
  if (!existsSync(draftPath)) throw new Error(`Draft not found: ${slug}`)

  const draft = JSON.parse(readFileSync(draftPath, 'utf8'))
  const project = { ...draft }
  delete project._draft
  const catalog = JSON.parse(readFileSync(options.catalogPath, 'utf8'))
  const updatedCatalog = {
    ...catalog,
    projects: [...catalog.projects, project].sort((left, right) => left.order - right.order),
  }
  validateProjectCatalog(updatedCatalog, { publicDir: options.publicDir })

  const temporaryPath = `${options.catalogPath}.tmp`
  writeFileSync(temporaryPath, `${JSON.stringify(updatedCatalog, null, 2)}\n`)
  renameSync(temporaryPath, options.catalogPath)
  unlinkSync(draftPath)
  return project
}
