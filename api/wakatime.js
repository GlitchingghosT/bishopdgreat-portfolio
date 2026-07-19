import { getWakaTimeActivity } from './lib/wakatime.js'

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.setHeader('Cache-Control', 'no-store')
    return response.status(405).json({ status: 'error', code: 'METHOD_NOT_ALLOWED' })
  }

  try {
    const activity = await getWakaTimeActivity()
    if (activity.status === 'unconfigured') {
      response.setHeader('Cache-Control', 'no-store')
      return response.status(503).json(activity)
    }
    response.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600')
    return response.status(200).json(activity)
  } catch {
    response.setHeader('Cache-Control', 'no-store')
    return response.status(502).json({ status: 'unavailable' })
  }
}
