# Blog / Journal — how it works & how to ship it

The blog is a first-party content section at **`/blog/`**, built for organic SEO
and email capture. It reuses the site's design system and shared shell, and the
signup plugs into the **existing** `contacts` + Resend stack (no new table).

## Language
The blog is **English-first** by deliberate SEO choice: the data-literate,
self-coached ICP searches and congregates in English (intervals.icu forum,
r/Velo, TrainerRoad), and English demand dwarfs Spanish for training-load topics.
Product pages stay trilingual (EN/ES/CA) as before. A native ES version of a
post can come later at a separate URL with reciprocal `hreflang` — do **not**
machine-translate the same article onto a second URL (duplicate-content risk).

## Files
```
blog/index.html                         hub / article index
blog/gran-diagonal-999km-portugal.html  hero case study (flagship)
assets/css/blog.css                     article + index styles (loaded after summit.css)
assets/js/blog-signup.js                email-capture front-end (posts to the Edge Function)
supabase/functions/blog_subscribe_v1/   email-capture backend (REVIEW & DEPLOY — see below)
supabase/migrations/20260715090000_blog_source.sql   optional 'blog' enum value
```

## The shared shell in a sub-directory
Blog pages are one level deep, but the header/footer partials use root-relative
paths. `build.js` handles this: it injects the shared shell and **re-roots** its
`href`/`src` with a `../` prefix for anything under `blog/` (see `BLOG_PAGES` and
`reroot()`), while leaving each page's own body untouched. So the workflow is the
same as any page: edit `partials/…`, run `npm run build`.

Two small paths were made **absolute** so sub-directory pages don't break:
- `assets/js/app.js` → `BADGE_BASE` (App Store badge swap)
- `assets/js/consent.js` → the cookie-banner "More info" privacy link

Blog pages are added to `build.js` (`BLOG_PAGES`) but **not** to
`tools/check-links.js` (its fixed page list is the root pages); verify blog links
by hand or extend the checker if the section grows.

## Email capture flow (single opt-in)
1. Visitor submits `<div class="email-capture">` (a div, not a form, so it can
   sit inside `<article>` prose). `blog-signup.js` validates email + consent,
   checks the honeypot, and POSTs JSON to `blog_subscribe_v1`.
2. `blog_subscribe_v1` (service role) upserts into `contacts` (source
   `gran_diagonal` for the hero, tag `blog:<article>`), ledgers a `contact_events`
   row, and emails the lead magnet via Resend, logging `email_sends`.
3. GDPR: explicit consent checkbox + privacy link + one-click unsubscribe. To
   harden to double opt-in, insert `email_subscribed=false` + a token and add a
   confirm endpoint (noted in the function header).

## Go-live checklist
- [ ] **Create the lead magnet** and host it at `MAGNET_URL`
      (`https://projectsummit.app/assets/downloads/summit-season-template.pdf`),
      or change the constant in `blog_subscribe_v1`.
- [ ] **Swap the estimated per-stage TSS** in the hero article for the engine's
      exact values (the table note flags which numbers are estimated).
- [ ] **Deploy the function:** `supabase functions deploy blog_subscribe_v1 --no-verify-jwt`.
      Confirm `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` secrets.
- [ ] **Cloudflare CSP:** add `https://nzxgsopmqpvhiikcbdfo.supabase.co` to
      `connect-src` **before** flipping CSP to enforcing (see
      `docs/cloudflare-security.md`). Without it the form POST is blocked.
- [ ] **Cloudflare rate-limit:** add a rule on
      `/functions/v1/blog_subscribe_v1` mirroring the `/ingest` rule.
- [ ] Optional: apply `20260715090000_blog_source.sql` when adding more articles.

## Summer → September
Signups are tagged `blog:<article>`, so you can segment the September
season-launch broadcast by which pillar/article brought each contact in. Drip a
couple of value-only notes over the summer to stay warm; keep the voice
consistent — "the engine", never "AI" or "coach".
