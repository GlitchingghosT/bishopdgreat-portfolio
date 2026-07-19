import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('portfolio', () => {
  it('renders factual identity, selected work, and contact routes', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: /I build web products/i })).toBeInTheDocument()
    expect(screen.getByText('Lagos, Nigeria')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'TaskDuty' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Around the Globe' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Calculator' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Space Tourism Explorer' })).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /Open résumé/i })).toHaveAttribute(
      'href',
      '/resume/Emmanuel_Nwachinemere_Full_Stack_Developer_CV.pdf',
    )
    expect(screen.getByRole('link', { name: /Start a conversation/i })).toHaveAttribute(
      'href',
      'mailto:nwachinemereemmanuel43@gmail.com',
    )
  })

  it('opens and closes the mobile navigation accessibly', async () => {
    const user = userEvent.setup()
    render(<App />)

    const menu = screen.getByRole('button', { name: 'Open navigation' })
    expect(menu).toHaveAttribute('aria-expanded', 'false')

    await user.click(menu)
    expect(screen.getByRole('button', { name: 'Close navigation' })).toHaveAttribute('aria-expanded', 'true')

    const workLink = screen.getByRole('link', { name: 'Work' })
    workLink.focus()
    expect(workLink).toHaveFocus()

    await user.keyboard('{Escape}')
    const closedMenu = screen.getByRole('button', { name: 'Open navigation' })
    expect(closedMenu).toHaveAttribute('aria-expanded', 'false')
    expect(closedMenu).toHaveFocus()
  })
})
