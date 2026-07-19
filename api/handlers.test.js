import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import spotifyHandler from './spotify.js'
import wakatimeHandler from './wakatime.js'

function createResponse() {
  const headers = new Map()
  return {
    headers,
    statusCode: null,
    body: null,
    setHeader: vi.fn((name, value) => headers.set(name.toLowerCase(), value)),
    status: vi.fn(function setStatus(code) {
      this.statusCode = code
      return this
    }),
    json: vi.fn(function sendJson(body) {
      this.body = body
      return this
    }),
  }
}

const originalEnvironment = { ...process.env }

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

describe('serverless handler contracts', () => {
  it('rejects unsupported methods without caching the response', async () => {
    const response = createResponse()

    await wakatimeHandler({ method: 'POST' }, response)

    expect(response.statusCode).toBe(405)
    expect(response.headers.get('allow')).toBe('GET')
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.body).toEqual({ status: 'error', code: 'METHOD_NOT_ALLOWED' })
  })

  it.each([
    ['WakaTime', wakatimeHandler],
    ['Spotify', spotifyHandler],
  ])('returns uncached 503 when %s is not configured', async (_name, handler) => {
    const response = createResponse()

    await handler({ method: 'GET' }, response)

    expect(response.statusCode).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.body).toEqual({ status: 'unconfigured' })
  })

  it('caches only a successful WakaTime response', async () => {
    process.env.WAKATIME_SHARE_URL = 'https://wakatime.com/share/@bishop/example.json'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      days: [{ date: '2026-07-19', total: 3600 }],
    }), { headers: { 'Content-Type': 'application/json' } })))
    const response = createResponse()

    await wakatimeHandler({ method: 'GET' }, response)

    expect(response.statusCode).toBe(200)
    expect(response.headers.get('cache-control')).toContain('s-maxage=900')
    expect(response.body.status).toBe('ok')
  })

  it('returns uncached 502 without leaking upstream errors', async () => {
    process.env.WAKATIME_SHARE_URL = 'https://wakatime.com/share/@bishop/example.json'
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sensitive upstream detail')))
    const response = createResponse()

    await wakatimeHandler({ method: 'GET' }, response)

    expect(response.statusCode).toBe(502)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.body).toEqual({ status: 'unavailable' })
    expect(JSON.stringify(response.body)).not.toContain('sensitive')
  })
})
