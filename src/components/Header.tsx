import { useEffect, useRef, useState } from 'react'
import { BrandMark } from './BrandMark'
import { ArrowUpRight, CloseIcon, MenuIcon } from './Icons'
import { ThemeToggle } from './ThemeToggle'
import { liveActivityEnabled } from '../config'

const links = [
  { href: '#work', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#approach', label: 'Approach' },
  ...(liveActivityEnabled ? [{ href: '#activity', label: 'Activity' }] : []),
  { href: '#contact', label: 'Contact' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        requestAnimationFrame(() => menuButtonRef.current?.focus())
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <header className="site-header">
      <nav className="nav shell" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="BishopDGreat home" onClick={() => setOpen(false)}>
          <BrandMark className="brand-mark brand-mark-small" decorative />
          <span>BishopDGreat</span>
        </a>

        <div className="nav-controls">
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            className="menu-button"
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            onClick={() => setOpen((value) => !value)}
          >
            <span>{open ? 'Close' : 'Menu'}</span>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        <div className={`nav-menu ${open ? 'is-open' : ''}`} id="site-menu">
          <div className="nav-links">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
            ))}
          </div>
          <a
            className="button button-quiet nav-resume"
            href="/resume/Emmanuel_Nwachinemere_Full_Stack_Developer_CV.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Résumé <ArrowUpRight size={16} />
          </a>
        </div>
      </nav>
    </header>
  )
}
