/**
 * Cloudflare Worker — PostHog reverse proxy
 *
 * Routes:
 *   projectsummit.app/ingest/static/*  →  eu-assets.i.posthog.com/static/*
 *   projectsummit.app/ingest/*         →  eu.i.posthog.com/*
 *
 * Deploy instructions:
 *   1. Cloudflare dashboard → Workers & Pages → Create Worker
 *   2. Paste this file → Deploy
 *   3. Settings → Triggers → Add route:
 *        Route:   projectsummit.app/ingest*
 *        Zone:    projectsummit.app
 */

const POSTHOG_API_HOST   = 'eu.i.posthog.com'
const POSTHOG_ASSET_HOST = 'eu-assets.i.posthog.com'

export default {
  async fetch(request) {
    const url = new URL(request.url)

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
