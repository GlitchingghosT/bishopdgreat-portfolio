const REPOSITORY = 'GlitchingghosT/bishopdgreat-portfolio'

export type ProjectSubmission = {
  repositoryUrl: string
  title: string
  description: string
  contribution: string
  stack: string
  live: string
  status: string
  order: string
  featured: string
}

function issueValue(value: string) {
  return value.trim() || '_No response_'
}

export function buildProjectIssueUrl(submission: ProjectSubmission) {
  const displayTitle = submission.title.trim()
    || submission.repositoryUrl.split('/').filter(Boolean).at(-1)?.replace(/[-_]+/g, ' ')
    || 'New project'
  const body = `### Repository URL

${issueValue(submission.repositoryUrl)}

### Project title

${issueValue(submission.title)}

### Description

${issueValue(submission.description)}

### What I built

${issueValue(submission.contribution)}

### Technologies

${issueValue(submission.stack)}

### Live URL

${issueValue(submission.live)}

### Status

${issueValue(submission.status)}

### Portfolio order

${issueValue(submission.order)}

### Featured project

${issueValue(submission.featured)}

### Confirmation

I confirm that the contribution and project details are accurate, and I will review the generated preview before commenting \`/publish\`.`
  const url = new URL(`https://github.com/${REPOSITORY}/issues/new`)
  url.searchParams.set('labels', 'project-submission')
  url.searchParams.set('title', `[Project]: ${displayTitle}`)
  url.searchParams.set('body', body)
  return url.toString()
}
