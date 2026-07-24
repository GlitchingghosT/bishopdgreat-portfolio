// @vitest-environment node

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
  fetchGitHubProjectDraft,
  getDraftMissingFields,
  parseProjectIssueBody,
  applyIssueFieldsToDraft,
  parseGitHubRepositoryUrl,
  publishProjectDraft,
  validateProjectCatalog,
  writeProjectDraft,
} from './project-content.mjs'

const validProject = {
  slug: 'sample-project',
  title: 'Sample Project',
  description: 'A dependable sample project with enough detail for a portfolio card.',
  contribution: 'I built the interface, validation flow, and production deployment.',
  stack: ['React', 'TypeScript'],
  source: 'https://github.com/GlitchingghosT/sample-project',
  live: 'https://sample-project.example.com',
  image: '/projects/sample-project.webp',
  imageAlt: 'Sample Project application dashboard',
  status: 'Live',
  featured: false,
  order: 5,
}

describe('GitHub repository intake', () => {
  it('parses canonical GitHub repository links and rejects lookalike hosts', () => {
    expect(parseGitHubRepositoryUrl('https://github.com/GlitchingghosT/sample-project.git'))
      .toEqual({ owner: 'GlitchingghosT', repository: 'sample-project' })
    expect(() => parseGitHubRepositoryUrl('https://github.example.com/GlitchingghosT/sample-project'))
      .toThrow(/github\.com/)
  })

  it('builds a reviewable draft from public GitHub metadata', async () => {
    const responses = new Map([
      ['https://api.github.com/repos/GlitchingghosT/sample-project', {
        name: 'sample-project',
        description: 'A sample application for managing structured work.',
        html_url: 'https://github.com/GlitchingghosT/sample-project',
        homepage: 'https://sample-project.example.com',
        topics: ['react', 'typescript', 'frontend-mentor', 'tailwindcss'],
        archived: false,
      }],
      ['https://api.github.com/repos/GlitchingghosT/sample-project/languages', {
        TypeScript: 900,
        CSS: 100,
      }],
    ])
    const fetchImpl = vi.fn(async (url) => ({
      ok: responses.has(url),
      status: responses.has(url) ? 200 : 404,
      json: async () => responses.get(url),
    }))

    const draft = await fetchGitHubProjectDraft(
      'https://github.com/GlitchingghosT/sample-project',
      { fetchImpl, now: () => '2026-07-22T15:00:00.000Z' },
    )

    expect(draft).toMatchObject({
      slug: 'sample-project',
      title: 'Sample Project',
      description: 'A sample application for managing structured work.',
      source: 'https://github.com/GlitchingghosT/sample-project',
      live: 'https://sample-project.example.com',
      stack: ['React', 'TypeScript', 'Tailwind CSS', 'CSS'],
      contribution: '',
      order: null,
    })
    expect(draft._draft.missing).toEqual(['contribution', 'order'])
  })

  it('reports only fields still required for publication', () => {
    expect(getDraftMissingFields(validProject)).toEqual([])
    expect(getDraftMissingFields({ ...validProject, contribution: '', order: null }))
      .toEqual(['contribution', 'order'])
  })

  it('writes a draft without silently overwriting an existing review', () => {
    const draftDir = mkdtempSync(join(tmpdir(), 'portfolio-draft-'))
    const draft = { ...validProject, _draft: { missing: [], inferred: [] } }

    try {
      const draftPath = writeProjectDraft(draft, { draftDir })
      expect(JSON.parse(readFileSync(draftPath, 'utf8'))).toEqual(draft)
      expect(() => writeProjectDraft(draft, { draftDir })).toThrow(/already exists/)
    } finally {
      rmSync(draftDir, { recursive: true, force: true })
    }
  })

  it('parses the issue form and applies allowlisted overrides', () => {
    const body = `### Repository URL

https://github.com/GlitchingghosT/sample-project

### Project title

_No response_

### Description

A reviewed project description.

### What I built

I built the interface and API integration.

### Technologies

React, TypeScript, Express

### Live URL

https://sample-project.example.com

### Status

Live

### Portfolio order

6

### Featured project

Yes`
    const fields = parseProjectIssueBody(body)
    const draft = applyIssueFieldsToDraft({
      ...validProject,
      title: 'Inferred Title',
      contribution: '',
      order: null,
      _draft: { inferred: ['title', 'description', 'stack', 'live', 'status'], missing: [] },
    }, fields)

    expect(fields.repositoryUrl).toBe('https://github.com/GlitchingghosT/sample-project')
    expect(draft).toMatchObject({
      title: 'Inferred Title',
      description: 'A reviewed project description.',
      contribution: 'I built the interface and API integration.',
      stack: ['React', 'TypeScript', 'Express'],
      live: 'https://sample-project.example.com',
      status: 'Live',
      order: 6,
      featured: true,
    })
    expect(draft._draft.missing).toEqual([])
  })
})

describe('draft publication', () => {
  it('publishes a complete draft and removes draft-only metadata', () => {
    const root = mkdtempSync(join(tmpdir(), 'portfolio-project-'))
    const draftDir = join(root, 'drafts')
    const publicDir = join(root, 'public')
    const catalogPath = join(root, 'projects.json')
    mkdirSync(draftDir, { recursive: true })
    mkdirSync(join(publicDir, 'projects'), { recursive: true })
    writeFileSync(join(publicDir, 'projects', 'sample-project.webp'), 'webp fixture')
    writeFileSync(catalogPath, JSON.stringify({ version: 1, projects: [] }))
    writeFileSync(
      join(draftDir, 'sample-project.json'),
      JSON.stringify({ ...validProject, _draft: { missing: [], inferred: [] } }),
    )

    try {
      const published = publishProjectDraft('sample-project', { draftDir, publicDir, catalogPath })
      const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'))

      expect(published.slug).toBe('sample-project')
      expect(catalog.projects).toEqual([validProject])
      expect(existsSync(join(draftDir, 'sample-project.json'))).toBe(false)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('leaves an incomplete draft and catalogue unchanged', () => {
    const root = mkdtempSync(join(tmpdir(), 'portfolio-project-'))
    const draftDir = join(root, 'drafts')
    const publicDir = join(root, 'public')
    const catalogPath = join(root, 'projects.json')
    const draftPath = join(draftDir, 'sample-project.json')
    mkdirSync(draftDir, { recursive: true })
    mkdirSync(publicDir, { recursive: true })
    writeFileSync(catalogPath, JSON.stringify({ version: 1, projects: [] }))
    writeFileSync(draftPath, JSON.stringify({ ...validProject, contribution: '', _draft: {} }))

    try {
      expect(() => publishProjectDraft('sample-project', { draftDir, publicDir, catalogPath }))
        .toThrow(/contribution/)
      expect(JSON.parse(readFileSync(catalogPath, 'utf8')).projects).toEqual([])
      expect(existsSync(draftPath)).toBe(true)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('project catalogue validation', () => {
  it('accepts a complete catalogue', () => {
    expect(() => validateProjectCatalog({ version: 1, projects: [validProject] })).not.toThrow()
  })

  it('rejects projects with missing required fields', () => {
    const incompleteProject = { ...validProject, contribution: '', stack: [] }

    expect(() => validateProjectCatalog({ version: 1, projects: [incompleteProject] }))
      .toThrow(/contribution|stack/)
  })

  it('rejects unsafe links and incomplete image metadata', () => {
    const unsafeProject = {
      ...validProject,
      source: 'http://github.com/GlitchingghosT/sample-project',
      live: 'javascript:alert(1)',
      image: '/projects/sample-project.png',
      imageAlt: '',
    }

    expect(() => validateProjectCatalog({ version: 1, projects: [unsafeProject] }))
      .toThrow(/source|live|image|imageAlt/)
  })

  it('rejects duplicate project identifiers, links, and order values', () => {
    const duplicateProject = { ...validProject, title: 'Duplicate Project' }

    expect(() => validateProjectCatalog({ version: 1, projects: [validProject, duplicateProject] }))
      .toThrow(/duplicate/i)
  })

  it('rejects draft metadata and unsupported canonical fields', () => {
    const leakedDraft = { ...validProject, _draft: { missing: [] }, visual: 'unknown-visual' }

    expect(() => validateProjectCatalog({ version: 1, projects: [leakedDraft] }))
      .toThrow(/unsupported|visual/)
  })
})
