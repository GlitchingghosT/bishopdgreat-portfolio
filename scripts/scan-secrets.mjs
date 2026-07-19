import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
  encoding: 'utf8',
}).split('\0').filter(Boolean)

const patterns = [
  { name: 'private key', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'GitHub token', regex: /gh[pousr]_[A-Za-z0-9_]{20,}/ },
  { name: 'Slack token', regex: /xox[baprs]-[A-Za-z0-9-]{20,}/ },
  { name: 'AWS access key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'WakaTime secret', regex: /waka_(?:sec|tok)_[A-Za-z0-9_-]{16,}/ },
  { name: 'Spotify environment secret', regex: /^[ \t]*SPOTIFY_(?:CLIENT_SECRET|REFRESH_TOKEN)[ \t]*=[ \t]*(?!$|\.\.\.|<)[^\s#]{12,}/m },
  { name: 'credential URL', regex: /https?:\/\/[^\s/:]+:[^\s/@]+@/ },
]

const findings = []
let checked = 0
for (const file of files) {
  if (file.startsWith('node_modules/') || file.startsWith('dist/')) continue
  let content
  try {
    content = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  if (content.includes('\0')) continue
  checked += 1
  for (const pattern of patterns) {
    if (pattern.regex.test(content)) findings.push(`${file}: possible ${pattern.name}`)
  }
}

if (findings.length > 0) {
  console.error('[secret-scan] failed')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log(`[secret-scan] passed (${checked} tracked and untracked files checked)`)
