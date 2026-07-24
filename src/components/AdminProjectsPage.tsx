import { useEffect, useState, type FormEvent } from 'react'
import '../App.css'
import './AdminProjectsPage.css'
import { buildProjectIssueUrl, type ProjectSubmission } from '../lib/projectSubmission'
import { BrandMark } from './BrandMark'
import { ThemeToggle } from './ThemeToggle'

export function AdminProjectsPage() {
  const [issueUrl, setIssueUrl] = useState('')

  useEffect(() => {
    const previousTitle = document.title
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const createdRobots = !robots
    const previousRobots = robots?.content
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.append(robots)
    }
    document.title = 'Project Admin — BishopDGreat'
    robots.content = 'noindex, nofollow'

    return () => {
      document.title = previousTitle
      if (createdRobots) robots.remove()
      else if (previousRobots) robots.content = previousRobots
    }
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const submission = Object.fromEntries(form.entries()) as ProjectSubmission
    setIssueUrl(buildProjectIssueUrl(submission))
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <a className="admin-brand" href="/" aria-label="Return to BishopDGreat portfolio">
          <BrandMark decorative />
          <span>BishopDGreat</span>
        </a>
        <ThemeToggle />
      </header>

      <main className="admin-shell">
        <section className="admin-intro" aria-labelledby="admin-title">
          <p className="mono-label">PROJECT INTAKE / OWNER GATED</p>
          <h1 id="admin-title">Add work without editing the portfolio.</h1>
          <p>
            Enter the project facts here. GitHub verifies your identity, checks the repository,
            and posts a preview before anything can be published.
          </p>
          <ol className="admin-steps" aria-label="Publication steps">
            <li><span className="admin-step-number">01</span><span className="admin-step-copy">Complete this form</span></li>
            <li><span className="admin-step-number">02</span><span className="admin-step-copy">Continue to GitHub and submit</span></li>
            <li><span className="admin-step-number">03</span><span className="admin-step-copy">Comment <code>/publish</code> on the generated issue</span></li>
          </ol>
          <div className="admin-security-note">
            <strong>No portfolio credentials enter this page.</strong>
            <span>Only the authenticated repository owner can trigger automation.</span>
          </div>
        </section>

        <section className="admin-form-panel" aria-labelledby="project-form-title">
          <div className="admin-panel-heading">
            <p className="mono-label">NEW PROJECT</p>
            <h2 id="project-form-title">Project details</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Repository URL (required)
              <input name="repositoryUrl" type="url" required pattern="https://github\.com/.+/.+" placeholder="https://github.com/GlitchingghosT/project" />
            </label>

            <div className="admin-form-row">
              <label>
                Project title (optional)
                <input name="title" type="text" maxLength={80} placeholder="Inferred from repository" />
              </label>
              <label>
                Live URL (optional)
                <input name="live" type="url" placeholder="https://project.example.com" />
              </label>
            </div>

            <label>
              Description (optional)
              <textarea name="description" rows={3} maxLength={220} placeholder="Leave blank to review the repository description." />
            </label>

            <label>
              What did you personally build? (required)
              <textarea name="contribution" rows={4} required maxLength={320} placeholder="I built..." />
            </label>

            <label>
              Technologies (optional)
              <input name="stack" type="text" placeholder="React, TypeScript, Express" />
              <span className="field-help">Comma-separated. Leave blank to review detected technologies.</span>
            </label>

            <div className="admin-form-row admin-form-row-three">
              <label>
                Status (required)
                <select name="status" required defaultValue="Live">
                  <option>Live</option>
                  <option>Deployment ready</option>
                  <option>In development</option>
                  <option>Source available</option>
                  <option>Archived</option>
                </select>
              </label>
              <label>
                Portfolio order (required)
                <input name="order" type="number" min="1" step="1" required placeholder="5" />
              </label>
              <label>
                Featured project (required)
                <select name="featured" required defaultValue="No">
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </label>
            </div>

            <div className="admin-owner-gate">
              <strong>GitHub will require the repository owner.</strong>
              <span>Submissions from accounts other than @GlitchingghosT are rejected by the workflow.</span>
            </div>
            <button className="admin-submit" type="submit">Prepare GitHub submission</button>
          </form>

          {issueUrl && (
            <div className="admin-review" role="status">
              <p><strong>Submission prepared.</strong> Nothing has been published yet.</p>
              <p>GitHub will show the complete issue before you submit it.</p>
              <a href={issueUrl}>Continue to GitHub</a>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
