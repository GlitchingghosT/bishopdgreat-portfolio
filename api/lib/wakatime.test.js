import { describe, expect, it, vi } from 'vitest'
import { formatCodingDuration, getWakaTimeActivity } from './wakatime.js'

const response = (payload, status = 200) => new Response(JSON.stringify(payload), {
  status,
  headers: { 'Content-Type': 'application/json' },
})

describe('WakaTime activity contract', () => {
  it('stays explicitly unconfigured without a public share URL', async () => {
    await expect(getWakaTimeActivity({ shareUrl: '', fetchImpl: vi.fn() })).resolves.toEqual({
      status: 'unconfigured',
    })
  })

  it('normalizes the latest seven daily totals without exposing upstream account data', async () => {
    const days = Array.from({ length: 9 }, (_, index) => ({
      date: `2026-07-${String(index + 1).padStart(2, '0')}`,
      total: (index + 1) * 600,
      categories: [{ name: 'Coding', total: (index + 1) * 600 }],
    }))
    const fetchImpl = vi.fn().mockResolvedValue(response({ days, user_id: 'must-not-leak' }))

    const result = await getWakaTimeActivity({
      shareUrl: 'https://wakatime.com/share/@bishop/example.json',
      fetchImpl,
    })

    expect(result.status).toBe('ok')
    expect(result.days).toHaveLength(7)
    expect(result.days[0].date).toBe('2026-07-03')
    expect(result.totalSeconds).toBe(25_200)
    expect(result.totalText).toBe('7h')
    expect(result.dailyAverageText).toBe('1h')
    expect(result).not.toHaveProperty('user_id')
  })

  it('rejects non-WakaTime and non-HTTPS share URLs', async () => {
    await expect(getWakaTimeActivity({
      shareUrl: 'https://example.com/share/data.json',
      fetchImpl: vi.fn(),
    })).rejects.toThrow('Invalid WakaTime share URL')
  })

  it.each([
    'https://wakatime.com/share/not-json',
    'https://wakatime.com/share/@bishop/example.svg',
    ['https://user:', 'password@wakatime.com/share/@bishop/example.json'].join(''),
    'https://wakatime.com:8443/share/@bishop/example.json',
    'https://wakatime.com/share/@bishop/example.json?download=1',
  ])('rejects non-official share shape %s', async (shareUrl) => {
    await expect(getWakaTimeActivity({ shareUrl, fetchImpl: vi.fn() })).rejects.toThrow(
      'Invalid WakaTime share URL',
    )
  })

  it('rejects oversized upstream payloads before parsing them', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', {
      headers: { 'Content-Length': '2000001' },
    }))

    await expect(getWakaTimeActivity({
      shareUrl: 'https://wakatime.com/share/@bishop/example.json',
      fetchImpl,
    })).rejects.toThrow('WakaTime response was too large')
  })

  it('cancels a chunked response as soon as the streaming limit is exceeded', async () => {
    let cancelled = false
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(1_200_000))
        controller.enqueue(new Uint8Array(900_000))
      },
      cancel() {
        cancelled = true
      },
    })
    const fetchImpl = vi.fn().mockResolvedValue(new Response(stream))

    await expect(getWakaTimeActivity({
      shareUrl: 'https://wakatime.com/share/@bishop/example.json',
      fetchImpl,
    })).rejects.toThrow('WakaTime response was too large')
    expect(cancelled).toBe(true)
  })

  it('formats short and mixed durations clearly', () => {
    expect(formatCodingDuration(1_500)).toBe('25m')
    expect(formatCodingDuration(5_580)).toBe('1h 33m')
  })
})
