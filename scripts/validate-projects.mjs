#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateProjectCatalog } from './project-content.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CATALOG_PATH = resolve(ROOT, 'content/projects.json')
const PUBLIC_DIR = resolve(ROOT, 'public')

try {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'))
  validateProjectCatalog(catalog, { publicDir: PUBLIC_DIR })
  console.log(`[projects] valid (${catalog.projects.length} published projects)`)
} catch (error) {
  console.error('[projects] validation failed')
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
