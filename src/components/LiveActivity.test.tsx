import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LiveActivity } from './LiveActivity'

const jsonResponse = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), {
  status,
  headers: { 'Content-Type': 'application/json' },
})

afterEach(() => vi.unstubAllGlobals())

describe('LiveActivity', () => {
  it('renders sanitized WakaTime and Spotify data', async () => {
    const fetchMock = vi.fn((endpoint: string) => {
      if (endpoint === '/api/wakatime') {
        return Promise.resolve(jsonResponse({
          status: 'ok',
          range: 'Last 7 days',
          totalText: '8h 20m',
          dailyAverageText: '1h 11m',
          days: [
            { date: '2026-07-13', seconds: 1800, hours: 0.5 },
            { date: '2026-07-14', seconds: 3600, hours: 1 },
          ],
        }))
      }
      return Promise.resolve(jsonResponse({
        status: 'playing',
        track: {
          title: 'Signals',
          artists: ['Example Artist'],
          album: 'Night Build',
          imageUrl: 'https://i.scdn.co/image/example',
          spotifyUrl: 'https://open.spotify.com/track/example',
          isPlaying: true,
          playedAt: null,
        },
      }))
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<LiveActivity />)

    expect(await screen.findByText('8h 20m')).toBeInTheDocument()
    expect(screen.getByText('1h 11m')).toBeInTheDocument()
    expect(await screen.findByText('Signals')).toBeInTheDocument()
    expect(screen.getByText('Playing now')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open in Spotify/i })).toHaveAttribute(
      'href',
      'https://open.spotify.com/track/example',
    )
  })

  it('states clearly when integrations are not configured', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ status: 'unconfigured' }, 503)))

    render(<LiveActivity />)

    expect(await screen.findByText(/WakaTime connection pending/i)).toBeInTheDocument()
    expect(await screen.findByText(/Spotify connection pending/i)).toBeInTheDocument()
  })
})
