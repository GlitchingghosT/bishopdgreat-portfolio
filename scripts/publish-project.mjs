#!/usr/bin/env node

import { parseArgs } from 'node:util'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { publishProjectDraft } from './project-content.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { values, positionals } = parseArgs({
  options: {
    confirm: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
  allowPositionals: true,
  strict: true,
})

if (values.help) {
  console.log(`Publish a reviewed project draft into the portfolio catalogue.

Usage:
  npm run project:publish -- PROJECT-SLUG --confirm

The command validates every project and referenced screenshot before writing.
It does not commit, push, or deploy the result.
`)
  process.exit(0)
}

const [slug] = positionals
if (!slug) {
  console.error('Missing project slug. Run with --help for usage.')
  process.exit(1)
}
if (!values.confirm) {
  console.error('Publication requires --confirm after reviewing the draft and its inferred fields.')
  process.exit(1)
}

try {
  const project = publishProjectDraft(slug, {
    draftDir: resolve(ROOT, 'content/project-drafts'),
    catalogPath: resolve(ROOT, 'content/projects.json'),
    publicDir: resolve(ROOT, 'public'),
  })
  console.log(`Published project record: ${project.title} (${project.slug})`)
  console.log('Run npm run check and review the local portfolio before committing or deploying.')
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
