import { getWakaTimeActivity } from '../../api/lib/wakatime.js'

const json = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  body: JSON.stringify(body),
})

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return json(405, { status: 'error', code: 'METHOD_NOT_ALLOWED' }, {
      Allow: 'GET',
      'Cache-Control': 'no-store',
    })
  }

  try {
    const activity = await getWakaTimeActivity()
    if (activity.status === 'unconfigured') {
      return json(503, activity, { 'Cache-Control': 'no-store' })
    }
    return json(200, activity, {
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
    })
  } catch {
    return json(502, { status: 'unavailable' }, { 'Cache-Control': 'no-store' })
  }
}
