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

## Files (this repo = the static site + front-end only)
```
blog/index.html                         hub / article index
blog/gran-diagonal-999km-portugal.html  hero case study (flagship)
assets/css/blog.css                     article + index styles (loaded after summit.css)
assets/js/blog-signup.js                email-capture front-end (posts to the Edge Function)
assets/downloads/summit-season-template.pdf     the lead magnet (+ .src.html source)
```
The **backend** (the `blog_subscribe_v1` Edge Function and any migration) does
**not** live here — it belongs in the app repo **`Project-Summit-MVP`**, where all
Supabase functions/migrations ship through the normal **git→prod sync**. This
static-site repo has no Supabase sync of its own.

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
The `blog_subscribe_v1` Edge Function lives in **`Project-Summit-MVP`** and ships
via its git→prod sync (see that repo). This repo only calls it.

1. Visitor submits `<div class="email-capture">` (a div, not a form, so it can
   sit inside `<article>` prose). `blog-signup.js` validates email + consent,
   checks the honeypot, and POSTs JSON to `blog_subscribe_v1`.
2. `blog_subscribe_v1` (service role) upserts into `contacts` (source
   `gran_diagonal` for the hero, tag `blog:<article>`), ledgers a `contact_events`
   row, and emails the lead magnet via Resend, logging `email_sends`.
3. GDPR: explicit consent checkbox + privacy link + one-click unsubscribe. To
   harden to double opt-in, insert `email_subscribed=false` + a token and add a
   confirm endpoint (noted in the function header).

## The lead magnet
Committed at `assets/downloads/summit-season-template.pdf` (a 3-page branded
PDF: the season-planning framework + fillable worksheet + the Gran Diagonal
fueling sheet with real per-stage energy). It goes live at `MAGNET_URL`
(`https://projectsummit.app/assets/downloads/summit-season-template.pdf`) once
this branch is what GitHub Pages serves. Source of record:
`assets/downloads/summit-season-template.src.html` — edit it and re-render with
headless Chrome (`--print-to-pdf`, command in the file's top comment).

## Go-live checklist
- [ ] **Backend (in `Project-Summit-MVP`):** land `blog_subscribe_v1` there and let
      the git→prod sync deploy it (verify_jwt off, custom honeypot/validation).
      Confirm `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` secrets.
      The signup `contacts` insert uses the existing `contact_source` value
      `gran_diagonal`; a generic `blog` value is only needed for other articles.
- [ ] **Swap the estimated per-stage TSS** in the hero article for the engine's
      exact values (the table note flags which numbers are estimated).
- [x] **Cloudflare CSP:** resolved 2026-07-16 by routing the POST same-origin —
      `blog-signup.js` now posts to `/blog-subscribe` and the Worker forwards to
      the Edge Function (`infra/cloudflare-worker.js`), so `connect-src 'self'`
      covers it and no Supabase origin is needed in the CSP. **The Worker route
      `projectsummit.app/blog-subscribe` must be deployed, and this branch must
      be what GitHub Pages serves, before CSP is flipped to enforcing** —
      otherwise the live signup form breaks.
- [ ] **Rate-limiting:** now that the POST is same-origin, Cloudflare *can*
      rate-limit `/blog-subscribe` — but the Free plan allows one rate-limit
      rule and it's used by `/ingest`; either widen that rule's expression to
      match both paths or rely on the honeypot + Supabase.

## Summer → September
Signups are tagged `blog:<article>`, so you can segment the September
season-launch broadcast by which pillar/article brought each contact in. Drip a
couple of value-only notes over the summer to stay warm; keep the voice
consistent — "the engine", never "AI" or "coach".
