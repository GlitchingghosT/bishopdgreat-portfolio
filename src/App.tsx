import { useEffect, useState } from 'react'
import './App.css'
import { BrandMark } from './components/BrandMark'
import { Header } from './components/Header'
import { ArrowUpRight, DownloadIcon, GithubIcon, LinkedinIcon, MailIcon } from './components/Icons'
import { LiveActivity } from './components/LiveActivity'
import { ProjectCard } from './components/ProjectCard'
import { Reveal } from './components/Reveal'
import { principles, projects, skillGroups } from './data/portfolio'
import { liveActivityEnabled } from './config'

function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight
        setProgress(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0)
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
}

function SectionHeading({ number, kicker, title, text }: { number: string; kicker: string; title: string; text?: string }) {
  return (
    <div className="section-heading">
      <p className="mono-label"><span>{number}</span>{kicker}</p>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}

function App() {
  useEffect(() => {
    const scrollToHash = () => {
      if (!window.location.hash) return
      const target = document.querySelector(window.location.hash)
      target?.scrollIntoView({ block: 'start' })
    }
    const frame = requestAnimationFrame(scrollToHash)
    window.addEventListener('hashchange', scrollToHash)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('hashchange', scrollToHash)
    }
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <ScrollProgress />
      <Header />

      <main id="main">
        <section className="hero shell" id="top" aria-labelledby="hero-title">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy">
            <div className="availability"><span className="status-dot" />Available for full-time and contract work</div>
            <p className="hero-kicker">Emmanuel Nwachinemere · Full-Stack Developer</p>
            <h1 id="hero-title">I build web products that feel good to use <span>and hold up behind the screen.</span></h1>
            <p className="hero-intro">Most of my work starts in React and TypeScript. When a feature needs an API, database, authentication, or better failure handling, I follow it there.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#work">See my work <ArrowUpRight /></a>
              <a className="button button-quiet" href="/resume/Emmanuel_Nwachinemere_Full_Stack_Developer_CV.pdf" target="_blank" rel="noreferrer">Open résumé <ArrowUpRight /></a>
            </div>
            <div className="hero-socials" aria-label="Social profiles">
              <a href="https://github.com/GlitchingghosT" target="_blank" rel="noreferrer"><GithubIcon />GitHub</a>
              <a href="https://www.linkedin.com/in/emmanuel-nwachinemere-b166aa234/" target="_blank" rel="noreferrer"><LinkedinIcon />LinkedIn</a>
              <a href="mailto:nwachinemereemmanuel43@gmail.com"><MailIcon />Email</a>
            </div>
            <a className="hero-scroll-cue" href="#work">Selected work <span aria-hidden="true">↓</span></a>
          </div>

          <div className="hero-visual" aria-label="BishopDGreat full-stack development profile">
            <div className="signal-halo" aria-hidden="true" />
            <BrandMark className="brand-mark brand-mark-hero" />
            <div className="system-panel system-panel-top">
              <span className="panel-light panel-light-cyan" />
              <span className="mono-label">Interface layer</span>
              <strong>React · TypeScript</strong>
            </div>
            <div className="system-panel system-panel-bottom">
              <span className="panel-light panel-light-violet" />
              <span className="mono-label">Application layer</span>
              <strong>Node · Express · MongoDB</strong>
            </div>
            <div className="hero-location"><span>Based in</span><strong>Lagos, Nigeria</strong></div>
          </div>
        </section>

        <section className="work-section section shell" id="work" aria-labelledby="work-title">
          <Reveal>
            <SectionHeading
              number="01"
              kicker="Selected work"
              title="Projects I have built, tested, and kept improving."
              text="Each one taught me something different: state that behaves correctly, routes that survive refreshes, APIs that protect user data, and interfaces that work beyond one screen size."
            />
          </Reveal>
          <div className="project-grid">
            {projects.map((project, index) => <ProjectCard key={project.title} project={project} index={index} />)}
          </div>
        </section>

        <section className="about-section section" id="about" aria-labelledby="about-title">
          <div className="shell about-grid">
            <Reveal className="about-copy">
              <SectionHeading number="02" kicker="About" title="I like seeing the whole feature, not only my side of it." />
              <div className="about-profile">
                <figure className="about-portrait">
                  <img
                    src="/emmanuel-nwachinemere.webp"
                    alt="Emmanuel Nwachinemere"
                    width="640"
                    height="800"
                    loading="lazy"
                  />
                  <figcaption>
                    <strong>Emmanuel Nwachinemere</strong>
                    <span>Lagos, Nigeria</span>
                  </figcaption>
                </figure>
                <div className="about-details">
                  <div className="about-body">
                    <p>I am Emmanuel, a full-stack developer in Lagos. I enjoy frontend work because the details are visible, but I am just as interested in the logic and data that make the interface trustworthy.</p>
                    <p>I pay attention to the parts that are easy to skip in a demo: useful errors, loading states, validation, ownership checks, keyboard access, mobile layouts, and code I can still understand later.</p>
                  </div>
                  <div className="about-links">
                    <a href="mailto:nwachinemereemmanuel43@gmail.com">Email me <ArrowUpRight size={16} /></a>
                    <a href="/resume/Emmanuel_Nwachinemere_Full_Stack_Developer_ATS_CV.pdf" download>Download ATS résumé <DownloadIcon size={16} /></a>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal className="experience-panel" delay={100}>
              <p className="mono-label">Experience</p>
              <div className="experience-entry">
                <div className="experience-date">Mar — Jun 2026</div>
                <h3>Full-Stack Developer Intern</h3>
                <p className="experience-org">Tech Studio Academy</p>
                <ul>
                  <li>Built responsive interfaces and server-side features with JavaScript, TypeScript, React, Node.js, and Express.</li>
                  <li>Implemented REST endpoints and MongoDB-backed CRUD workflows.</li>
                  <li>Debugged data flow across interface, API, and database layers using Git and GitHub.</li>
                </ul>
              </div>
              <div className="experience-current">
                <span className="status-dot" />Currently turning my strongest projects into complete case studies and deployed products.
              </div>
            </Reveal>
          </div>
        </section>

        <section className="approach-section section shell" id="approach" aria-labelledby="approach-title">
          <Reveal>
            <SectionHeading
              number="03"
              kicker="Approach"
              title="My process is practical on purpose."
              text="I would rather ship a smaller system that works clearly than hide a weak foundation behind more features."
            />
          </Reveal>
          <div className="principle-grid">
            {principles.map((principle, index) => (
              <Reveal key={principle.number} className="principle-card" delay={index * 90}>
                <article>
                  <span>{principle.number}</span>
                  <h3>{principle.title}</h3>
                  <p>{principle.text}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="stack-panel">
            <div className="stack-intro">
              <p className="mono-label">What I work with</p>
              <h3>A focused stack, used across the full product.</h3>
            </div>
            <div className="skill-groups">
              {skillGroups.map((group) => (
                <div className="skill-group" key={group.label}>
                  <h4>{group.label}</h4>
                  <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {liveActivityEnabled && <LiveActivity />}

        <section className="contact-section section" id="contact" aria-labelledby="contact-title">
          <div className="contact-circuit" aria-hidden="true" />
          <div className="shell contact-inner">
            <Reveal>
              <p className="mono-label">{liveActivityEnabled ? '05' : '04'} / Contact</p>
              <h2 id="contact-title">Have a product to build or a team I could help?</h2>
              <p>Tell me what you are working on, where it is stuck, and what a good outcome looks like.</p>
              <div className="contact-actions">
                <a className="button button-primary" href="mailto:nwachinemereemmanuel43@gmail.com">Start a conversation <MailIcon /></a>
                <a className="button button-quiet" href="https://www.linkedin.com/in/emmanuel-nwachinemere-b166aa234/" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight /></a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-inner">
          <a className="brand footer-brand" href="#top"><BrandMark className="brand-mark brand-mark-small" decorative /><span>BishopDGreat</span></a>
          <p>Built by Emmanuel Nwachinemere with React and TypeScript.</p>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </>
  )
}

export default App
