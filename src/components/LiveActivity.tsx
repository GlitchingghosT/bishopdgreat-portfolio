import { useEffect, useState, type CSSProperties } from 'react'
import { ArrowUpRight } from './Icons'
import { Reveal } from './Reveal'

type WakaDay = { date: string; seconds: number; hours: number }
type WakaState =
  | { status: 'loading' }
  | { status: 'unconfigured' }
  | { status: 'unavailable' }
  | { status: 'empty' }
  | { status: 'ok'; range: string; totalText: string; dailyAverageText: string; days: WakaDay[] }

type Track = {
  title: string
  artists: string[]
  album: string
  imageUrl: string | null
  spotifyUrl: string | null
  isPlaying: boolean
  playedAt: string | null
}
type SpotifyState =
  | { status: 'loading' }
  | { status: 'unconfigured' }
  | { status: 'unavailable' }
  | { status: 'empty' }
  | { status: 'playing' | 'recent'; track: Track }

async function getJson(endpoint: string) {
  const response = await fetch(endpoint, { headers: { Accept: 'application/json' } })
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) throw new Error('Expected JSON')
  return response.json()
}

function isWakaState(value: unknown): value is WakaState {
  if (!value || typeof value !== 'object' || !('status' in value)) return false
  const status = (value as { status: string }).status
  if (['unconfigured', 'unavailable', 'empty'].includes(status)) return true
  if (status !== 'ok') return false
  const data = value as Partial<Extract<WakaState, { status: 'ok' }>>
  return typeof data.totalText === 'string'
    && typeof data.dailyAverageText === 'string'
    && Array.isArray(data.days)
}

function isSpotifyState(value: unknown): value is SpotifyState {
  if (!value || typeof value !== 'object' || !('status' in value)) return false
  const status = (value as { status: string }).status
  if (['unconfigured', 'unavailable', 'empty'].includes(status)) return true
  if (status !== 'playing' && status !== 'recent') return false
  const data = value as Partial<Extract<SpotifyState, { status: 'playing' | 'recent' }>>
  return Boolean(data.track && typeof data.track.title === 'string' && Array.isArray(data.track.artists))
}

function CodingActivity({ state }: { state: WakaState }) {
  if (state.status === 'loading') return <p className="activity-message">Loading coding activity…</p>
  if (state.status === 'unconfigured') return <p className="activity-message">WakaTime connection pending. Verified coding hours will appear here after setup.</p>
  if (state.status === 'unavailable') return <p className="activity-message">Coding activity is temporarily unavailable.</p>
  if (state.status === 'empty') return <p className="activity-message">No coding activity was recorded for this period.</p>

  const maximum = Math.max(...state.days.map((day) => day.seconds), 1)
  return (
    <>
      <div className="coding-summary">
        <div><span>Total</span><strong>{state.totalText}</strong></div>
        <div><span>Daily average</span><strong>{state.dailyAverageText}</strong></div>
      </div>
      <ol className="coding-bars" aria-label="Daily coding time for the last seven days">
        {state.days.map((day) => {
          const height = Math.max(8, (day.seconds / maximum) * 100)
          return (
            <li key={day.date} aria-label={`${day.date}: ${day.hours} hours`}>
              <span style={{ '--coding-height': `${height}%` } as CSSProperties} />
              <time dateTime={day.date}>{new Date(`${day.date}T00:00:00`).toLocaleDateString('en', { weekday: 'short' })}</time>
            </li>
          )
        })}
      </ol>
      <p className="activity-source">{state.range} · tracked with WakaTime</p>
    </>
  )
}

function SpotifyActivity({ state }: { state: SpotifyState }) {
  if (state.status === 'loading') return <p className="activity-message">Checking Spotify…</p>
  if (state.status === 'unconfigured') return <p className="activity-message">Spotify connection pending. My current or latest track will appear here after setup.</p>
  if (state.status === 'unavailable') return <p className="activity-message">Spotify activity is temporarily unavailable.</p>
  if (state.status === 'empty') return <p className="activity-message">No recent Spotify track is available.</p>

  const { track } = state
  return (
    <div className="spotify-track">
      {track.imageUrl ? <img src={track.imageUrl} alt="" width="160" height="160" /> : <div className="album-placeholder" aria-hidden="true">♪</div>}
      <div className="track-copy">
        <p className="track-state">
          {state.status === 'playing' && <span className="playing-bars" aria-hidden="true"><i /><i /><i /></span>}
          {state.status === 'playing' ? 'Playing now' : 'Last played'}
        </p>
        <h3>{track.title}</h3>
        <p>{track.artists.join(', ')}</p>
        {track.album && <span>{track.album}</span>}
        {track.spotifyUrl && <a href={track.spotifyUrl} target="_blank" rel="noreferrer">Open in Spotify <ArrowUpRight size={15} /></a>}
      </div>
    </div>
  )
}

export function LiveActivity() {
  const [waka, setWaka] = useState<WakaState>({ status: 'loading' })
  const [spotify, setSpotify] = useState<SpotifyState>({ status: 'loading' })

  useEffect(() => {
    let active = true
    getJson('/api/wakatime')
      .then((data) => active && setWaka(isWakaState(data) ? data : { status: 'unavailable' }))
      .catch(() => active && setWaka({ status: 'unconfigured' }))

    const loadSpotify = () => {
      getJson('/api/spotify')
        .then((data) => active && setSpotify(isSpotifyState(data) ? data : { status: 'unavailable' }))
        .catch(() => active && setSpotify({ status: 'unconfigured' }))
    }
    loadSpotify()
    const interval = window.setInterval(loadSpotify, 30_000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  return (
    <section className="activity-section section shell" id="activity" aria-labelledby="activity-title">
      <Reveal variant="clip">
        <div className="section-heading">
          <p className="mono-label"><span>05</span>Live activity</p>
          <h2 id="activity-title">A small window into what I’m doing lately.</h2>
          <p>Coding time comes from WakaTime. Music comes from Spotify. Both are live when their connections are available.</p>
        </div>
      </Reveal>
      <div className="activity-grid">
        <Reveal className="activity-card" delay={60} variant="slide-left">
          <article>
            <div className="activity-card-heading"><span className="activity-icon" aria-hidden="true">&gt;_</span><div><p className="mono-label">WakaTime</p><h3>Coding hours</h3></div></div>
            <CodingActivity state={waka} />
          </article>
        </Reveal>
        <Reveal className="activity-card" delay={120} variant="slide-right">
          <article>
            <div className="activity-card-heading"><span className="activity-icon spotify-icon" aria-hidden="true">♫</span><div><p className="mono-label">Spotify</p><h3>On repeat</h3></div></div>
            <SpotifyActivity state={spotify} />
          </article>
        </Reveal>
      </div>
    </section>
  )
}
