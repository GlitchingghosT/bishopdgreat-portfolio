import type { Project } from '../data/portfolio'
import { ArrowUpRight, GithubIcon } from './Icons'
import { Reveal } from './Reveal'

type ProjectCardProps = {
  project: Project
  index: number
}

function ArchitectureVisual() {
  return (
    <div className="architecture-visual" aria-label="TaskDuty system architecture">
      <div className="architecture-grid" aria-hidden="true" />
      <div className="architecture-row">
        <div className="architecture-node"><span>Client</span><strong>React</strong></div>
        <span className="architecture-link" aria-hidden="true">→</span>
        <div className="architecture-node"><span>API</span><strong>Express</strong></div>
        <span className="architecture-link" aria-hidden="true">→</span>
        <div className="architecture-node"><span>Data</span><strong>MongoDB</strong></div>
      </div>
      <div className="architecture-auth"><span className="status-dot" /> Auth · ownership · validation · 31 tests</div>
    </div>
  )
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <Reveal
      className={`project-card project-card-${index} ${project.featured ? 'project-featured' : ''}`}
      delay={index * 70}
      variant={index % 2 === 0 ? 'slide-left' : 'slide-right'}
    >
      <article>
        <div className="project-visual">
          {project.image ? (
            <img src={project.image} alt={project.imageAlt} loading="eager" width="1200" height="800" />
          ) : (
            <ArchitectureVisual />
          )}
          <div className="project-visual-shade" aria-hidden="true" />
          {project.status && <span className="project-status"><span className="status-dot" />{project.status}</span>}
        </div>
        <div className="project-copy">
          <div className="project-heading">
            <p className="mono-label">0{index + 1} / selected work</p>
            <h3>{project.title}</h3>
          </div>
          <p className="project-description">{project.description}</p>
          <p className="project-contribution">{project.contribution}</p>
          <ul className="tag-list" aria-label={`${project.title} technologies`}>
            {project.stack.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="project-links">
            {project.live && (
              <a href={project.live} target="_blank" rel="noreferrer">
                View live <ArrowUpRight size={17} />
              </a>
            )}
            <a href={project.source} target="_blank" rel="noreferrer">
              <GithubIcon size={17} /> Source
            </a>
          </div>
        </div>
      </article>
    </Reveal>
  )
}
