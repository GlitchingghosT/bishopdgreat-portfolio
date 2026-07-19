# BishopDGreat portfolio

My personal portfolio for selected full-stack work, experience, engineering approach, résumé downloads, and contact details.

The visual system continues the dark circuit-cross identity used on my GitHub profile. The site is intentionally lightweight: React and TypeScript for structure and behavior, CSS for the responsive layout and motion, and no runtime API dependency.

## What is included

- Responsive layouts for mobile, tablet, laptop, and wide desktop screens
- Persistent light and dark themes with system-preference support
- Selected project cards with verified source and live-demo links
- Optional, feature-gated WakaTime coding hours and Spotify current/recent track cards
- A TaskDuty architecture panel that does not imply the app is deployed
- Accessible mobile navigation, skip link, focus states, semantic landmarks, and reduced-motion support
- Visible-by-default scroll content with animation as progressive enhancement
- Designed and ATS résumé downloads
- Self-hosted Manrope and Geist Mono fonts
- SEO metadata and Person structured data
- Netlify production security headers

## Run locally

Requirements: Node.js 22.x and npm 10 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Quality checks

```bash
npm run check
```

This runs the component/data tests, Oxlint, TypeScript production build, Vite build, and dependency audit.

## Production build

```bash
npm run build
npm run preview
```

The deployable output is written to `dist/`.

## Live integrations

WakaTime uses a safe public JSON share; Spotify uses server-only Netlify environment variables. See [docs/INTEGRATIONS.md](./docs/INTEGRATIONS.md) for the exact setup and authorization steps. Never commit `.env.local` or expose Spotify credentials through `VITE_` variables.

## Content and assets

Project screenshots in `public/projects/` are captures of my published work. My portrait, résumé files, and the BishopDGreat circuit-cross artwork are personal identity assets. See [ASSET-LICENSE.md](./ASSET-LICENSE.md) for their terms.

## License

The source code is available under the [MIT License](./LICENSE). Brand, résumé, and personal assets are excluded from that grant as described in `ASSET-LICENSE.md`.
