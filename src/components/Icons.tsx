type IconProps = { size?: number; className?: string }

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  className,
})

export function ArrowUpRight({ size = 18, className }: IconProps) {
  return <svg {...base(size, className)}><path d="M7 17 17 7M7 7h10v10" /></svg>
}

export function GithubIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size, className)}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.3 4 5 5 0 0 0 19.1.5S18 0 15 1.8a13.4 13.4 0 0 0-7 0C5 0 3.9.5 3.9.5A5 5 0 0 0 3.7 4a5.4 5.4 0 0 0-1.5 3.7c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 8 18v4" /><path d="M8 19c-3 .9-3-1.5-4-2" /></svg>
}

export function LinkedinIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size, className)}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" /><path d="M2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg>
}

export function MailIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size, className)}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
}

export function PhoneIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size, className)}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92Z" /></svg>
}

export function MessageIcon({ size = 20, className }: IconProps) {
  return <svg {...base(size, className)}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /><path d="M8 9h8M8 13h5" /></svg>
}

export function DownloadIcon({ size = 18, className }: IconProps) {
  return <svg {...base(size, className)}><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M5 21h14" /></svg>
}

export function MenuIcon({ size = 22, className }: IconProps) {
  return <svg {...base(size, className)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
}

export function CloseIcon({ size = 22, className }: IconProps) {
  return <svg {...base(size, className)}><path d="m6 6 12 12M18 6 6 18" /></svg>
}

export function SunIcon({ size = 19, className }: IconProps) {
  return <svg {...base(size, className)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" /></svg>
}

export function MoonIcon({ size = 19, className }: IconProps) {
  return <svg {...base(size, className)}><path d="M20.4 15.1A8.5 8.5 0 0 1 8.9 3.6 8.5 8.5 0 1 0 20.4 15.1Z" /></svg>
}
