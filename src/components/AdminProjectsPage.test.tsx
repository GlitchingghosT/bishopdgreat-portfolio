import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AdminProjectsPage } from './AdminProjectsPage'


describe('AdminProjectsPage', () => {
  it('builds a structured owner-reviewed GitHub submission', async () => {
    const user = userEvent.setup()
    render(<AdminProjectsPage />)

    await user.type(screen.getByLabelText('Repository URL (required)'), 'https://github.com/GlitchingghosT/sample-project')
    await user.type(screen.getByLabelText('Project title (optional)'), 'Sample Project')
    await user.type(screen.getByLabelText('What did you personally build? (required)'), 'I built the interface and API integration.')
    await user.type(screen.getByLabelText('Portfolio order (required)'), '5')
    await user.selectOptions(screen.getByLabelText('Status (required)'), 'Live')
    await user.selectOptions(screen.getByLabelText('Featured project (required)'), 'No')
    await user.click(screen.getByRole('button', { name: 'Prepare GitHub submission' }))

    const link = screen.getByRole('link', { name: 'Continue to GitHub' })
    const url = new URL(link.getAttribute('href') ?? '')
    const body = url.searchParams.get('body') ?? ''

    expect(url.origin + url.pathname).toBe('https://github.com/GlitchingghosT/bishopdgreat-portfolio/issues/new')
    expect(url.searchParams.get('labels')).toBe('project-submission')
    expect(body).toContain('### Repository URL\n\nhttps://github.com/GlitchingghosT/sample-project')
    expect(body).toContain('### What I built\n\nI built the interface and API integration.')
    expect(body).toContain('### Portfolio order\n\n5')
    expect(screen.getByText(/Nothing has been published yet/)).toBeInTheDocument()
  })
})
