import projectCatalog from '../../content/projects.json'

export type Project = {
  slug: string
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
  order: number
  visual?: 'taskduty-architecture'
}

export const projects: Project[] = [...(projectCatalog.projects as Project[])]
  .sort((left, right) => left.order - right.order)

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
