# Adding portfolio projects

The portfolio uses a reviewed, repository-backed project catalogue. New projects are created as drafts first; incomplete or ambiguous metadata cannot reach the production build.

## Source of truth

- Published catalogue: `content/projects.json`
- Review drafts: `content/project-drafts/<slug>.json`
- Screenshots: `public/projects/<slug>.webp`
- Validation and intake logic: `scripts/project-content.mjs`

`src/data/portfolio.ts` reads the published catalogue directly. Do not duplicate project records in React components.

## Self-service web workflow

Use either entry point:

- Admin form: `https://bishopdgreat.netlify.app/admin/projects`
- GitHub form: `https://github.com/GlitchingghosT/bishopdgreat-portfolio/issues/new?template=add-project.yml`

The admin form does not receive GitHub credentials. It prepares a structured issue and sends you to GitHub, where your existing GitHub session verifies your identity.

After submitting:

1. The preview workflow ignores submissions unless the actor is the repository owner.
2. It reads public repository metadata, applies only allowlisted issue fields, and validates the proposed canonical record.
3. It comments a project preview on the issue. Invalid or duplicate submissions remain unpublished and show the validation error.
4. Review the preview and comment exactly `/publish`.
5. The publication workflow checks the owner again, rebuilds the record from the issue, runs `npm run check`, and commits only the validated `content/projects.json` change to `main`.
6. It closes the issue after the commit succeeds. If any step fails, no catalogue commit is pushed.

The workflows use explicit least-privilege GitHub permissions. Anonymous users can view the unlisted admin route or issue template, but they cannot trigger project processing or publication.

## Command-line workflow

For local maintenance, start a review draft from a public GitHub repository:

```bash
npm run project:add -- --repo https://github.com/OWNER/REPOSITORY
```

The command reads public GitHub metadata and creates a draft. It can infer:

- repository slug and a display-title suggestion
- repository description
- source URL
- HTTPS homepage/live URL
- topics and detected repository languages
- whether the repository is archived

It deliberately does **not** invent:

- what Emmanuel personally contributed
- project outcomes or metrics
- unverified technologies
- accessibility, testing, or deployment claims
- featured ordering

A link-only draft normally still requires `contribution` and `order`. If GitHub has no useful description or languages, those fields are also listed as missing.

## Supply known details during intake

```bash
npm run project:add -- \
  --repo https://github.com/GlitchingghosT/example-project \
  --contribution "I built the responsive interface and API integration." \
  --stack "React, TypeScript, Express" \
  --live https://example-project.netlify.app \
  --status "Live" \
  --order 5
```

Optional flags:

```text
--title
--description
--contribution
--stack                 comma-separated
--live                  HTTPS only
--status
--image                 /projects/<slug>.webp
--image-alt             required with --image; at least 12 characters
--order                  positive integer and unique
--featured
--force                  intentionally replace an existing draft
```

`GITHUB_TOKEN` is optional. When present, it is used only as a bearer token for GitHub API reads and is never written to the draft or printed. Public repositories work without it, subject to GitHub's unauthenticated rate limit.

## Review the draft

Open:

```text
content/project-drafts/<slug>.json
```

Review every inferred value and fill the fields listed under `_draft.missing`. `_draft.inferred` records what came from GitHub; `_draft.provided` records command-line overrides.

A screenshot is optional. Without one, the portfolio renders a neutral circuit-style project preview. If a screenshot is used:

1. Create an optimized WebP image.
2. Save it as `public/projects/<slug>.webp`.
3. Set `image` to `/projects/<slug>.webp`.
4. Add an accurate `imageAlt` description.

TaskDuty's custom architecture panel is intentionally restricted to its existing `visual: "taskduty-architecture"` record.

## Validate before publication

```bash
npm run project:validate
```

Validation rejects:

- missing required text or an empty stack
- non-HTTPS source/live URLs
- invalid slugs and display order
- duplicate slugs, repositories, live URLs, or order values
- unsupported canonical fields
- invalid screenshot paths or missing screenshot files
- screenshot records without meaningful alt text
- draft-only `_draft` metadata in the published catalogue

The same validation runs automatically before `npm run dev`, `npm run build`, and Netlify's production build.

## Publish a reviewed draft

```bash
npm run project:publish -- <slug> --confirm
```

Publication:

1. Reads the named draft.
2. Removes `_draft` review metadata.
3. Validates the complete prospective catalogue and assets.
4. Writes `content/projects.json` atomically.
5. Removes the draft only after the canonical write succeeds.

It does **not** commit, push, deploy, or update the GitHub profile.

## Verify and release

```bash
npm run check
npm run dev
```

Review the new card locally in light/dark themes and at mobile/desktop widths. After approval, commit and push through the normal portfolio workflow; verify the Netlify deployment before calling the project live.

## GitHub profile workflow

The GitHub profile remains assistant-mediated. After a portfolio project record is approved, send Alpha the project name or repository link. Alpha will use `content/projects.json` as the factual source, propose the profile wording, run the profile checks, and publish only after review.
