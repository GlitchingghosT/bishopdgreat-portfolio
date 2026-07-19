import { Buffer } from 'node:buffer'

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const CURRENT_URL = 'https://api.spotify.com/v1/me/player/currently-playing'
const RECENT_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1'
const REQUEST_TIMEOUT_MS = 7_000

function safeHttpsUrl(value, allowedHost) {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === allowedHost && url.port === '' && url.username === '' && url.password === ''
      ? url.toString()
      : null
  } catch {
    return null
  }
}

export function normalizeTrack(item, { isPlaying = false, playedAt = null } = {}) {
  if (!item || item.type !== 'track' || typeof item.name !== 'string') return null
  const artists = Array.isArray(item.artists)
    ? item.artists.map((artist) => artist?.name).filter((name) => typeof name === 'string').slice(0, 4).map((name) => name.slice(0, 120))
    : []
  if (artists.length === 0) return null

  const images = Array.isArray(item.album?.images) ? item.album.images : []
  const imageUrl = images.map((image) => safeHttpsUrl(image?.url, 'i.scdn.co')).find(Boolean) ?? null
  const spotifyUrl = safeHttpsUrl(item.external_urls?.spotify, 'open.spotify.com')

  const normalizedPlayedAt = typeof playedAt === 'string' && playedAt.length <= 40 && Number.isFinite(Date.parse(playedAt))
    ? new Date(playedAt).toISOString()
    : null

  return {
    title: item.name.slice(0, 180),
    artists,
    album: typeof item.album?.name === 'string' ? item.album.name.slice(0, 180) : '',
    imageUrl,
    spotifyUrl,
    isPlaying,
    playedAt: normalizedPlayedAt,
    durationMs: Number.isFinite(item.duration_ms) ? Math.max(0, item.duration_ms) : null,
  }
}

async function getAccessToken({ clientId, clientSecret, refreshToken, fetchImpl }) {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const response = await fetchImpl(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Spotify token request failed with ${response.status}`)
  const payload = await response.json()
  if (typeof payload.access_token !== 'string') throw new Error('Spotify token response was invalid')
  return payload.access_token
}

async function spotifyGet(url, accessToken, fetchImpl) {
  return fetchImpl(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
}

export async function getSpotifyActivity({ env = process.env, fetchImpl = fetch } = {}) {
  const clientId = env.SPOTIFY_CLIENT_ID
  const clientSecret = env.SPOTIFY_CLIENT_SECRET
  const refreshToken = env.SPOTIFY_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken) return { status: 'unconfigured' }

  const accessToken = await getAccessToken({ clientId, clientSecret, refreshToken, fetchImpl })
  const currentResponse = await spotifyGet(CURRENT_URL, accessToken, fetchImpl)

  if (currentResponse.status === 200) {
    const current = await currentResponse.json()
    const track = normalizeTrack(current.item, { isPlaying: current.is_playing === true })
    if (track?.isPlaying) return { status: 'playing', track }
  } else if (currentResponse.status !== 204) {
    throw new Error(`Spotify current-track request failed with ${currentResponse.status}`)
  }

  const recentResponse = await spotifyGet(RECENT_URL, accessToken, fetchImpl)
  if (!recentResponse.ok) throw new Error(`Spotify recent-track request failed with ${recentResponse.status}`)
  const recent = await recentResponse.json()
  const lastItem = Array.isArray(recent.items) ? recent.items[0] : null
  const track = normalizeTrack(lastItem?.track, { playedAt: lastItem?.played_at })
  return track ? { status: 'recent', track } : { status: 'empty' }
}
