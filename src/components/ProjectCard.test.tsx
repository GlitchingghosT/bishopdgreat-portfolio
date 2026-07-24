import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProjectCard } from './ProjectCard'

const project = {
  slug: 'sample-project',
  title: 'Sample Project',
  description: 'A sample application with a valid portfolio description.',
  contribution: 'I built and tested the complete sample application.',
  stack: ['React', 'TypeScript'],
  source: 'https://github.com/GlitchingghosT/sample-project',
  featured: false,
  order: 5,
}

describe('ProjectCard fallback visual', () => {
  it('uses a neutral generated preview for projects without a screenshot', () => {
    render(<ProjectCard project={project} index={0} />)

    expect(screen.getByLabelText('Sample Project project preview')).toBeInTheDocument()
    expect(screen.queryByLabelText('TaskDuty system architecture')).not.toBeInTheDocument()
  })
})
