/**
 * Cloudflare Worker — PostHog reverse proxy + App Store rating proxy
 *
 * Routes:
 *   projectsummit.app/ingest/static/*  →  eu-assets.i.posthog.com/static/*
 *   projectsummit.app/ingest/*         →  eu.i.posthog.com/*
 *   projectsummit.app/appstore-rating  →  itunes.apple.com lookup (rating JSON)
 *   projectsummit.app/blog-subscribe   →  blog_subscribe_v1 Supabase Edge Function
 *   projectsummit.app/unsubscribe      →  unsubscribe_v1 Supabase Edge Function
 *
 * Deploy instructions:
 *   1. Cloudflare dashboard → Workers & Pages → Create Worker
 *   2. Paste this file → Deploy
 *   3. Settings → Triggers → Add routes (same zone projectsummit.app):
 *        projectsummit.app/ingest*
 *        projectsummit.app/appstore-rating
 *        projectsummit.app/blog-subscribe
 *        projectsummit.app/unsubscribe
 */

const POSTHOG_API_HOST   = 'eu.i.posthog.com'
const POSTHOG_ASSET_HOST = 'eu-assets.i.posthog.com'

// blog-signup.js posts here same-origin so the strict CSP (connect-src 'self')
// can stay; the Worker does the cross-origin hop. The function checks the
// forwarded Origin header, so the original request headers must be passed on.
const BLOG_SUBSCRIBE_UPSTREAM = 'https://nzxgsopmqpvhiikcbdfo.supabase.co/functions/v1/blog_subscribe_v1'

// Every marketing email's List-Unsubscribe header points at
// projectsummit.app/unsubscribe (RFC 8058 one-click). Hosting it on the branded
// domain instead of *.supabase.co is both a deliverability signal and what lets
// the opt-out page inherit the site's security headers. The URL's HMAC token is
// the authentication, so the Worker just forwards — query string included.
const UNSUBSCRIBE_UPSTREAM = 'https://nzxgsopmqpvhiikcbdfo.supabase.co/functions/v1/unsubscribe_v1'

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

    if (url.pathname === '/blog-subscribe') {
      if (request.method !== 'POST' && request.method !== 'OPTIONS') {
        return new Response('Method not allowed', { status: 405 })
      }
      return fetch(new Request(BLOG_SUBSCRIBE_UPSTREAM, request))
    }

    // GET renders the confirmation page, POST applies the opt-out (the form and
    // the mail client's one-click both POST). The query string carries the
    // contact/campaign/token, so it must survive the hop.
    if (url.pathname === '/unsubscribe') {
      if (request.method !== 'GET' && request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
      }
      return fetch(new Request(UNSUBSCRIBE_UPSTREAM + url.search, request))
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
