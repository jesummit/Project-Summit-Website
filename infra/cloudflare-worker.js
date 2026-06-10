/**
 * Cloudflare Worker — PostHog reverse proxy + App Store rating proxy
 *
 * Routes:
 *   projectsummit.app/ingest/static/*  →  eu-assets.i.posthog.com/static/*
 *   projectsummit.app/ingest/*         →  eu.i.posthog.com/*
 *   projectsummit.app/appstore-rating  →  itunes.apple.com lookup (rating JSON)
 *
 * Deploy instructions:
 *   1. Cloudflare dashboard → Workers & Pages → Create Worker
 *   2. Paste this file → Deploy
 *   3. Settings → Triggers → Add routes (same zone projectsummit.app):
 *        projectsummit.app/ingest*
 *        projectsummit.app/appstore-rating
 */

const POSTHOG_API_HOST   = 'eu.i.posthog.com'
const POSTHOG_ASSET_HOST = 'eu-assets.i.posthog.com'

const APP_ID        = '6754172654'
const APP_STOREFRONT = 'es'

export default {
  async fetch(request) {
    const url = new URL(request.url)

    // App Store rating: do the cross-origin call server-side (Apple sends no CORS)
    // and hand the page a tiny same-origin JSON. Stays empty on any failure.
    if (url.pathname === '/appstore-rating') {
      return appStoreRating()
    }

    if (url.pathname.startsWith('/ingest/static/')) {
      url.hostname = POSTHOG_ASSET_HOST
      url.pathname = url.pathname.replace('/ingest', '')
    } else if (url.pathname.startsWith('/ingest/') || url.pathname === '/ingest') {
      url.hostname = POSTHOG_API_HOST
      url.pathname = url.pathname.replace('/ingest', '') || '/'
    } else {
      return new Response('Not found', { status: 404 })
    }

    return fetch(new Request(url.toString(), request))
  }
}

async function appStoreRating() {
  const empty = { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600' }
  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${APP_ID}&country=${APP_STOREFRONT}`,
      { cf: { cacheTtl: 3600, cacheEverything: true } }
    )
    const data = await res.json()
    const r = data && data.results && data.results[0]
    const count = r && r.userRatingCount
    const rating = r && r.averageUserRating
    // Only expose a usable rating; otherwise {} so the badge stays hidden.
    if (r && count > 0 && typeof rating === 'number') {
      return new Response(JSON.stringify({ rating, count }), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
      })
    }
    return new Response('{}', { headers: empty })
  } catch (e) {
    return new Response('{}', { headers: empty })
  }
}
