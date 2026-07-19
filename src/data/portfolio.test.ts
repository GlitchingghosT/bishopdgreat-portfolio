import { describe, expect, it } from 'vitest'
import { projects } from './portfolio'

describe('portfolio project data', () => {
  it('keeps every public link secure and every screenshot described', () => {
    expect(projects).toHaveLength(4)

    for (const project of projects) {
      expect(project.source).toMatch(/^https:\/\//)
      if (project.live) expect(project.live).toMatch(/^https:\/\//)
      if (project.image) {
        expect(project.image).toMatch(/^\/projects\/.+\.webp$/)
        expect(project.imageAlt?.trim().length).toBeGreaterThan(12)
      }
    }
  })

  it('does not present TaskDuty as already deployed', () => {
    const taskDuty = projects.find((project) => project.title === 'TaskDuty')
    expect(taskDuty?.live).toBeUndefined()
    expect(taskDuty?.status).toBe('Deployment ready')
  })
})
