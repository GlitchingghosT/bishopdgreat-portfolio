export type Project = {
  title: string
  description: string
  contribution: string
  stack: string[]
  source: string
  live?: string
  image?: string
  imageAlt?: string
  status?: string
  featured?: boolean
}

export const projects: Project[] = [
  {
    title: 'TaskDuty',
    description: 'A full-stack task manager with accounts, protected routes, and task data isolated per user.',
    contribution: 'I connected the React client to an Express and MongoDB API, added authentication and ownership checks, and backed the system with 31 automated tests.',
    stack: ['React', 'TypeScript', 'Express', 'MongoDB', 'Vitest'],
    source: 'https://github.com/GlitchingghosT/personal-task-manager',
    status: 'Deployment ready',
    featured: true,
  },
  {
    title: 'Around the Globe',
    description: 'A country explorer for searching, filtering, and opening detailed profiles for 250 countries and territories.',
    contribution: 'I tightened its responsive states, search accessibility, direct routes, not-found handling, and deployment rewrites.',
    stack: ['React', 'TypeScript', 'React Router', 'Tailwind CSS'],
    source: 'https://github.com/GlitchingghosT/around-the-globe',
    live: 'https://around-the-globe-three.vercel.app',
    image: '/projects/around-the-globe.webp',
    imageAlt: 'Around the Globe country explorer showing searchable country cards',
  },
  {
    title: 'Calculator',
    description: 'A keyboard-friendly calculator with chained arithmetic, percentage handling, saved themes, and readable output.',
    contribution: 'I separated the calculation engine, covered its behavior with tests, and fixed the small state details that make repeated calculations feel right.',
    stack: ['React', 'TypeScript', 'Vitest', 'Tailwind CSS'],
    source: 'https://github.com/GlitchingghosT/Calculator',
    live: 'https://magnificent-heliotrope-8e9d7b.netlify.app/',
    image: '/projects/calculator.webp',
    imageAlt: 'Dark themed calculator with number and operation controls',
  },
  {
    title: 'Space Tourism Explorer',
    description: 'An animated Frontend Mentor project covering destinations, crew members, and launch technology.',
    contribution: 'I used route-based screens, responsive layouts, and measured transitions to turn the supplied design into a working browser experience.',
    stack: ['React', 'TypeScript', 'Framer Motion', 'React Router'],
    source: 'https://github.com/GlitchingghosT/space-tourism-explorer',
    live: 'https://let-s-tour-space-together.vercel.app',
    image: '/projects/space-tourism.webp',
    imageAlt: 'Space Tourism destination screen featuring the Moon',
  },
]

export const principles = [
  {
    number: '01',
    title: 'Start with the real problem',
    text: 'I want to understand who is using the product, what they need to finish, and what can go wrong before I start decorating screens.',
  },
  {
    number: '02',
    title: 'Build through the stack',
    text: 'A feature is not finished at the component boundary. I follow it into validation, API behavior, data ownership, and useful failure states.',
  },
  {
    number: '03',
    title: 'Check the unglamorous parts',
    text: 'Mobile layouts, keyboard access, direct routes, empty screens, errors, and tests are where a polished demo becomes dependable software.',
  },
]
