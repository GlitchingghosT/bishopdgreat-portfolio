#!/usr/bin/env node

import { parseArgs } from 'node:util'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  fetchGitHubProjectDraft,
  getDraftMissingFields,
  writeProjectDraft,
} from './project-content.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DRAFT_DIR = resolve(ROOT, 'content/project-drafts')

const { values } = parseArgs({
  options: {
    repo: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    contribution: { type: 'string' },
    stack: { type: 'string' },
    live: { type: 'string' },
    status: { type: 'string' },
    image: { type: 'string' },
    'image-alt': { type: 'string' },
    order: { type: 'string' },
    featured: { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
  strict: true,
})

if (values.help) {
  console.log(`Create a review draft from a public GitHub repository.

Usage:
  npm run project:add -- --repo https://github.com/OWNER/REPOSITORY [options]

Options:
  --title "Project title"
  --description "Short project description"
  --contribution "What I personally built"
  --stack "React, TypeScript, Express"
  --live https://project.example.com
  --status "Live"
  --image /projects/project-slug.webp
  --image-alt "Accessible screenshot description"
  --order 5
  --featured
  --force        Replace an existing draft with the same slug
`)
  process.exit(0)
}

if (!values.repo) {
  console.error('Missing --repo. Run with --help for usage.')
  process.exit(1)
}

try {
  const draft = await fetchGitHubProjectDraft(values.repo, {
    token: process.env.GITHUB_TOKEN,
  })
  const overrides = {
    title: values.title,
    description: values.description,
    contribution: values.contribution,
    live: values.live,
    status: values.status,
    image: values.image,
    imageAlt: values['image-alt'],
  }
  const provided = []
  for (const [field, value] of Object.entries(overrides)) {
    if (value !== undefined) {
      draft[field] = value
      provided.push(field)
    }
  }

  if (values.stack !== undefined) {
    draft.stack = values.stack.split(',').map((item) => item.trim()).filter(Boolean)
    provided.push('stack')
  }
  if (values.order !== undefined) {
    draft.order = Number(values.order)
    provided.push('order')
  }
  if (values.featured) {
    draft.featured = true
    provided.push('featured')
  }

  draft._draft.provided = provided
  draft._draft.inferred = draft._draft.inferred.filter((field) => !provided.includes(field))
  draft._draft.missing = getDraftMissingFields(draft)

  const draftPath = writeProjectDraft(draft, {
    draftDir: DRAFT_DIR,
    force: values.force,
  })

  console.log(`Draft created: ${draftPath}`)
  console.log(`Inferred fields: ${draft._draft.inferred.join(', ') || 'none'}`)
  console.log(`Provided fields: ${provided.join(', ') || 'none'}`)
  if (draft._draft.missing.length > 0) {
    console.log(`Still required: ${draft._draft.missing.join(', ')}`)
    console.log('Edit the draft, then run project:validate before publishing.')
  } else {
    console.log(`Ready for review. Publish with: npm run project:publish -- ${draft.slug} --confirm`)
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
