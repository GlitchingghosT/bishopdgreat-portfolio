import { createServer } from 'node:http'
import { Buffer } from 'node:buffer'
import { randomBytes } from 'node:crypto'
import { chmod, readFile, writeFile } from 'node:fs/promises'

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const redirectUri = 'http://127.0.0.1:8888/callback'
const scopes = ['user-read-currently-playing', 'user-read-recently-played']
const environmentFile = new URL('../.env.local', import.meta.url)

if (!clientId || !clientSecret) {
  console.error('Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local first.')
  process.exit(1)
}

const state = randomBytes(24).toString('hex')
const authorizationUrl = new URL('https://accounts.spotify.com/authorize')
authorizationUrl.search = new URLSearchParams({
  response_type: 'code',
  client_id: clientId,
  scope: scopes.join(' '),
  redirect_uri: redirectUri,
  state,
  show_dialog: 'true',
}).toString()

async function saveRefreshToken(refreshToken) {
  if (refreshToken.length < 20 || refreshToken.includes('\n') || refreshToken.includes('\r')) {
    throw new Error('Spotify returned an invalid refresh token')
  }
  let content = ''
  try {
    content = await readFile(environmentFile, 'utf8')
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error
  }
  const entry = `SPOTIFY_REFRESH_TOKEN=${refreshToken}`
  content = /^SPOTIFY_REFRESH_TOKEN=.*$/m.test(content)
    ? content.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, entry)
    : `${content.trimEnd()}\n${entry}\n`
  await writeFile(environmentFile, content, { mode: 0o600 })
  await chmod(environmentFile, 0o600)
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1:8888')
  if (requestUrl.pathname !== '/callback') {
    response.writeHead(404).end('Not found')
    return
  }

  if (requestUrl.searchParams.get('state') !== state) {
    response.writeHead(400).end('State validation failed. Return to the terminal and try again.')
    server.close()
    return
  }

  const code = requestUrl.searchParams.get('code')
  if (!code) {
    response.writeHead(400).end('Spotify did not return an authorization code.')
    server.close()
    return
  }

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!tokenResponse.ok) throw new Error(`Token exchange failed with ${tokenResponse.status}`)
    const token = await tokenResponse.json()
    if (typeof token.refresh_token !== 'string') throw new Error('Spotify did not return a refresh token')
    await saveRefreshToken(token.refresh_token)

    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Spotify authorization complete. You can close this tab and return to the terminal.')
    console.log('\nSpotify refresh token saved to ignored .env.local with owner-only permissions.')
    console.log('Add the same value directly to your Netlify environment without sharing it.')
  } catch (error) {
    response.writeHead(500).end('Authorization failed. Return to the terminal for details.')
    console.error(error instanceof Error ? error.message : 'Spotify authorization failed')
  } finally {
    server.close()
  }
})

server.listen(8888, '127.0.0.1', () => {
  console.log('Open this URL in your browser and approve the two read-only scopes:\n')
  console.log(authorizationUrl.toString())
  console.log('\nWaiting for Spotify on http://127.0.0.1:8888/callback …')
})

setTimeout(() => {
  console.error('Spotify authorization timed out after five minutes.')
  server.close()
}, 5 * 60 * 1000).unref()
