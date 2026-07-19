const WAKATIME_HOST = 'wakatime.com'
const REQUEST_TIMEOUT_MS = 7_000
const MAX_RESPONSE_BYTES = 2_000_000

export function formatCodingDuration(seconds) {
  const totalMinutes = Math.max(0, Math.round(Number(seconds) / 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}

function validateShareUrl(value) {
  const url = new URL(value)
  const validPath = /^\/share\/@[A-Za-z0-9._-]+\/[A-Za-z0-9-]+\.json$/.test(url.pathname)
  if (url.protocol !== 'https:'
    || url.hostname !== WAKATIME_HOST
    || url.port !== ''
    || url.username !== ''
    || url.password !== ''
    || url.search !== ''
    || url.hash !== ''
    || !validPath) {
    throw new Error('Invalid WakaTime share URL')
  }
  return url
}

function normalizeDays(payload) {
  if (!payload || !Array.isArray(payload.days)) throw new Error('Unexpected WakaTime response')

  return payload.days
    .filter((day) => day && /^\d{4}-\d{2}-\d{2}$/.test(day.date) && Number.isFinite(day.total) && day.total >= 0)
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(-7)
    .map((day) => ({
      date: day.date,
      seconds: Math.round(day.total),
      hours: Number((day.total / 3600).toFixed(2)),
    }))
}

async function readJsonWithLimit(response) {
  const declaredLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RESPONSE_BYTES) {
    throw new Error('WakaTime response was too large')
  }
  if (!response.body) throw new Error('WakaTime response had no body')

  const reader = response.body.getReader()
  const chunks = []
  let received = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      received += value.byteLength
      if (received > MAX_RESPONSE_BYTES) {
        await reader.cancel('response too large')
        throw new Error('WakaTime response was too large')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const bytes = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
}

export async function getWakaTimeActivity({
  shareUrl = process.env.WAKATIME_SHARE_URL,
  fetchImpl = fetch,
} = {}) {
  if (!shareUrl) return { status: 'unconfigured' }

  const url = validateShareUrl(shareUrl)
  const response = await fetchImpl(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    redirect: 'error',
  })
  if (!response.ok) throw new Error(`WakaTime request failed with ${response.status}`)

  const days = normalizeDays(await readJsonWithLimit(response))
  if (days.length === 0) return { status: 'empty' }

  const totalSeconds = days.reduce((total, day) => total + day.seconds, 0)
  const dailyAverageSeconds = totalSeconds / days.length

  return {
    status: 'ok',
    range: 'Last 7 days',
    totalSeconds,
    totalText: formatCodingDuration(totalSeconds),
    dailyAverageText: formatCodingDuration(dailyAverageSeconds),
    days,
  }
}
