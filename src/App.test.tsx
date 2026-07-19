import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('portfolio', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  it('renders factual identity, selected work, and contact routes', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: /I build web products/i })).toBeInTheDocument()
    expect(screen.getAllByText('Lagos, Nigeria')).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'TaskDuty' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Around the Globe' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Calculator' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Space Tourism Explorer' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Activity' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Coding hours' })).not.toBeInTheDocument()
    expect(screen.getByText('04 / Contact')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Emmanuel Nwachinemere' })).toHaveAttribute(
      'src',
      '/emmanuel-nwachinemere.webp',
    )

    expect(screen.getByRole('link', { name: /Open résumé/i })).toHaveAttribute(
      'href',
      '/resume/Emmanuel_Nwachinemere_Full_Stack_Developer_CV.pdf',
    )
    expect(screen.getByRole('link', { name: /nwachinemereemmanuel43@gmail.com/i })).toHaveAttribute(
      'href',
      expect.stringContaining('https://mail.google.com/mail/'),
    )
    expect(screen.getByRole('link', { name: /\+234 906 339 2734/i })).toHaveAttribute('href', 'tel:+2349063392734')
    expect(screen.getByRole('link', { name: /Message on WhatsApp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/2349063392734'),
    )
    expect(document.querySelector('a[href^="mailto:"]')).not.toBeInTheDocument()
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

  it('switches theme accessibly and persists the choice', async () => {
    const user = userEvent.setup()
    localStorage.setItem('bishopdgreat-theme', 'dark')
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }))

    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(localStorage.getItem('bishopdgreat-theme')).toBe('light')
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument()
  })
})
