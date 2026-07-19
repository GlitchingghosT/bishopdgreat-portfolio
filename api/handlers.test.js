import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { handler as spotifyHandler } from '../netlify/functions/spotify.mjs'
import { handler as wakatimeHandler } from '../netlify/functions/wakatime.mjs'

const originalEnvironment = { ...process.env }
const parseBody = (response) => JSON.parse(response.body)

beforeEach(() => {
  delete process.env.WAKATIME_SHARE_URL
  delete process.env.SPOTIFY_CLIENT_ID
  delete process.env.SPOTIFY_CLIENT_SECRET
  delete process.env.SPOTIFY_REFRESH_TOKEN
})

afterEach(() => {
  process.env = { ...originalEnvironment }
  vi.unstubAllGlobals()
})

describe('Netlify function contracts', () => {
  it('rejects unsupported methods without caching the response', async () => {
    const response = await wakatimeHandler({ httpMethod: 'POST' })

    expect(response.statusCode).toBe(405)
    expect(response.headers.Allow).toBe('GET')
    expect(response.headers['Cache-Control']).toBe('no-store')
    expect(parseBody(response)).toEqual({ status: 'error', code: 'METHOD_NOT_ALLOWED' })
  })

  it.each([
    ['WakaTime', wakatimeHandler],
    ['Spotify', spotifyHandler],
  ])('returns uncached 503 when %s is not configured', async (_name, handler) => {
    const response = await handler({ httpMethod: 'GET' })

    expect(response.statusCode).toBe(503)
    expect(response.headers['Cache-Control']).toBe('no-store')
    expect(parseBody(response)).toEqual({ status: 'unconfigured' })
  })

  it('caches only a successful WakaTime response', async () => {
    process.env.WAKATIME_SHARE_URL = 'https://wakatime.com/share/@bishop/example.json'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      days: [{ date: '2026-07-19', total: 3600 }],
    }), { headers: { 'Content-Type': 'application/json' } })))

    const response = await wakatimeHandler({ httpMethod: 'GET' })

    expect(response.statusCode).toBe(200)
    expect(response.headers['Cache-Control']).toContain('s-maxage=900')
    expect(parseBody(response).status).toBe('ok')
  })

  it('returns uncached 502 without leaking upstream errors', async () => {
    process.env.WAKATIME_SHARE_URL = 'https://wakatime.com/share/@bishop/example.json'
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sensitive upstream detail')))

    const response = await wakatimeHandler({ httpMethod: 'GET' })

    expect(response.statusCode).toBe(502)
    expect(response.headers['Cache-Control']).toBe('no-store')
    expect(parseBody(response)).toEqual({ status: 'unavailable' })
    expect(response.body).not.toContain('sensitive')
  })
})
