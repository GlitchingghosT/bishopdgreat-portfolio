#!/usr/bin/env node

import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import {
  applyIssueFieldsToDraft,
  fetchGitHubProjectDraft,
  parseProjectIssueBody,
  publishProjectDraft,
  validateProjectCatalog,
  writeProjectDraft,
} from './project-content.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { values } = parseArgs({
  options: {
    mode: { type: 'string' },
    event: { type: 'string', default: process.env.GITHUB_EVENT_PATH },
    output: { type: 'string', default: resolve(ROOT, '.project-submission-preview.md') },
  },
  strict: true,
})

if (!['preview', 'publish'].includes(values.mode ?? '')) {
  console.error('--mode must be preview or publish')
  process.exit(1)
}
if (!values.event) {
  console.error('Missing GitHub event path')
  process.exit(1)
}

function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`)
}

function safeFence(value) {
  return value.replaceAll('```', '``\u200b`')
}

function publicProject(draft) {
  const project = { ...draft }
  delete project._draft
  return project
}

function previewMarkdown(project, issueNumber) {
  return `<!-- portfolio-project-preview -->
## Portfolio project preview

This submission is valid and ready for owner approval.

- **Project:** ${project.title}
- **Repository:** ${project.source}
- **Live URL:** ${project.live ?? 'Not supplied'}
- **Status:** ${project.status ?? 'Not supplied'}
- **Order:** ${project.order}
- **Featured:** ${project.featured ? 'Yes' : 'No'}
- **Technologies:** ${project.stack.join(', ')}

<details>
<summary>Canonical project record</summary>

\`\`\`json
${safeFence(JSON.stringify(project, null, 2))}
\`\`\`
</details>

Review the wording and links above. To publish issue #${issueNumber}, comment exactly:

\`/publish\`
`
}

function errorMarkdown(error) {
  const message = error instanceof Error ? error.message : String(error)
  return `<!-- portfolio-project-preview -->
## Portfolio project needs attention

The submission was not published.

\`\`\`text
${safeFence(message)}
\`\`\`

Edit the issue fields and save it to run validation again.
`
}

const event = JSON.parse(readFileSync(values.event, 'utf8'))
const owner = event.repository?.owner?.login
const actor = event.sender?.login
const labels = event.issue?.labels?.map((label) => typeof label === 'string' ? label : label.name) ?? []

if (!owner || actor !== owner || owner !== 'GlitchingghosT') {
  console.error('Only the repository owner can process portfolio project submissions')
  process.exit(1)
}
if (!labels.includes('project-submission')) {
  console.error('Issue is not labeled project-submission')
  process.exit(1)
}
if (values.mode === 'publish' && event.comment?.body?.trim() !== '/publish') {
  console.error('Publication requires an exact /publish owner comment')
  process.exit(1)
}

try {
  const fields = parseProjectIssueBody(event.issue.body ?? '')
  if (!fields.repositoryUrl) throw new Error('Repository URL is required')

  const inferredDraft = await fetchGitHubProjectDraft(fields.repositoryUrl, {
    token: process.env.GITHUB_TOKEN,
  })
  const draft = applyIssueFieldsToDraft(inferredDraft, fields)
  if (draft._draft.missing.length > 0) {
    throw new Error(`Required fields are missing: ${draft._draft.missing.join(', ')}`)
  }

  const project = publicProject(draft)
  const catalogPath = resolve(ROOT, 'content/projects.json')
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'))
  validateProjectCatalog(
    { ...catalog, projects: [...catalog.projects, project] },
    { publicDir: resolve(ROOT, 'public') },
  )

  if (values.mode === 'publish') {
    const draftDir = resolve(ROOT, 'content/project-drafts')
    writeProjectDraft(draft, { draftDir, force: true })
    publishProjectDraft(draft.slug, {
      draftDir,
      catalogPath,
      publicDir: resolve(ROOT, 'public'),
    })
  }

  writeFileSync(values.output, previewMarkdown(project, event.issue.number))
  setOutput('ready', 'true')
  setOutput('slug', draft.slug)
  setOutput('title', draft.title.replace(/[\r\n]/g, ' '))
  console.log(`${values.mode} ready for ${draft.slug}`)
} catch (error) {
  writeFileSync(values.output, errorMarkdown(error))
  setOutput('ready', 'false')
  console.error(error instanceof Error ? error.message : error)
  if (values.mode === 'publish') process.exit(1)
}
