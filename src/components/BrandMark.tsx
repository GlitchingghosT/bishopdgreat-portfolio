type BrandMarkProps = {
  className?: string
  decorative?: boolean
}

export function BrandMark({ className, decorative = false }: BrandMarkProps) {
  return (
    <svg
      className={className}
      viewBox="100 50 320 320"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : 'BishopDGreat circuit cross'}
    >
      <defs>
        <linearGradient id="brand-signal" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#61dbfb" />
          <stop offset=".52" stopColor="#7e5bff" />
          <stop offset="1" stopColor="#eebe5c" />
        </linearGradient>
        <filter id="brand-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle className="brand-orbit brand-orbit-outer" cx="260" cy="210" r="148" />
      <circle className="brand-orbit brand-orbit-inner" cx="260" cy="210" r="112" />
      <g className="brand-circuit" fill="none" stroke="url(#brand-signal)" strokeLinecap="round" strokeLinejoin="round" filter="url(#brand-glow)">
        <path className="brand-line brand-line-main" d="M153 210H367M260 72V348" strokeWidth="7" />
        <path className="brand-line brand-line-branch" d="M168 210v-34h28M352 210v34h-28M260 94h31v25M260 326h-31v-25" strokeWidth="4" />
      </g>
      <g className="brand-nodes" fill="#eebe5c">
        <circle cx="260" cy="210" r="8" /><circle cx="196" cy="176" r="4" />
        <circle cx="324" cy="244" r="4" /><circle cx="291" cy="119" r="4" />
        <circle cx="229" cy="301" r="4" />
      </g>
    </svg>
  )
}
