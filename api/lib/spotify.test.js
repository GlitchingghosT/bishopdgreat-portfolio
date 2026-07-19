import { describe, expect, it, vi } from 'vitest'
import { getSpotifyActivity, normalizeTrack } from './spotify.js'

const response = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => payload,
})

const track = {
  type: 'track',
  name: 'Signals',
  duration_ms: 210000,
  artists: [{ name: 'Example Artist' }],
  album: {
    name: 'Night Build',
    images: [{ url: 'https://i.scdn.co/image/example' }],
  },
  external_urls: { spotify: 'https://open.spotify.com/track/example' },
}

const env = {
  SPOTIFY_CLIENT_ID: 'client-id',
  SPOTIFY_CLIENT_SECRET: 'client-secret',
  SPOTIFY_REFRESH_TOKEN: 'refresh-token',
}

describe('Spotify activity contract', () => {
  it('stays explicitly unconfigured when server credentials are absent', async () => {
    await expect(getSpotifyActivity({ env: {}, fetchImpl: vi.fn() })).resolves.toEqual({
      status: 'unconfigured',
    })
  })

  it('returns a sanitized currently playing track', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(response({ access_token: 'temporary-access-token' }))
      .mockResolvedValueOnce(response({ item: track, is_playing: true }))

    const result = await getSpotifyActivity({ env, fetchImpl })

    expect(result).toEqual({
      status: 'playing',
      track: {
        title: 'Signals',
        artists: ['Example Artist'],
        album: 'Night Build',
        imageUrl: 'https://i.scdn.co/image/example',
        spotifyUrl: 'https://open.spotify.com/track/example',
        isPlaying: true,
        playedAt: null,
        durationMs: 210000,
      },
    })
    expect(JSON.stringify(result)).not.toContain('temporary-access-token')
    expect(JSON.stringify(result)).not.toContain('refresh-token')
  })

  it('falls back to the most recently played track', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(response({ access_token: 'temporary-access-token' }))
      .mockResolvedValueOnce(response(null, 204))
      .mockResolvedValueOnce(response({ items: [{ track, played_at: '2026-07-19T10:00:00Z' }] }))

    const result = await getSpotifyActivity({ env, fetchImpl })

    expect(result.status).toBe('recent')
    expect(result.track.isPlaying).toBe(false)
    expect(result.track.playedAt).toBe('2026-07-19T10:00:00.000Z')
  })

  it('drops artwork and links from unexpected hosts', () => {
    const normalized = normalizeTrack({
      ...track,
      album: { ...track.album, images: [{ url: 'https://sub.i.scdn.co/art.jpg' }] },
      external_urls: { spotify: 'https://attacker.example/track' },
    })

    expect(normalized.imageUrl).toBeNull()
    expect(normalized.spotifyUrl).toBeNull()
  })

  it('bounds artist names and rejects malformed timestamps', () => {
    const normalized = normalizeTrack({
      ...track,
      artists: [{ name: 'A'.repeat(5_000) }],
    }, { playedAt: 'not-a-timestamp'.repeat(1_000) })

    expect(normalized.artists[0]).toHaveLength(120)
    expect(normalized.playedAt).toBeNull()
  })
})
