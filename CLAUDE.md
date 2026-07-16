# CLAUDE.md — Project Summit marketing site

Operational notes for future Claude sessions working on this repo. Read this
first; it captures how the site is wired and the gotchas that aren't obvious
from the file tree.

## Hardening done 2026-06-05 (current state)

A privacy/security/SEO pass landed on branch `claude/practical-curie-UpinE`
(PR). What exists now:

- **Self-hosted fonts + flag icons** — no Google Fonts / cdnjs at runtime. Faces
  live in `assets/fonts/` (+ `@font-face` in `summit.css`); the 3 used flags in
  `assets/img/flags/`. (Enables the strict CSP; no SRI needed.)
- **Cookie consent (GDPR opt-in)** — PostHog inits `opt_out_capturing_by_default:
  true`; nothing is captured until the visitor accepts. `assets/js/consent.js`
  (banner, EN/ES/CA), choice in `localStorage.summit_consent`, footer "Cookie
  settings" link reopens it.
- **CI hardening** — Actions pinned to commit SHAs + Dependabot; `verify`
  workflow (i18n coverage, internal links, shell-in-sync) via `tools/check-*.js`
  / `npm run check`.
- **SEO** — real favicons (`favicon-16/32`, `apple-touch-icon`, `icon-192/512`,
  generated from the logo — replaced the 1.4 MB full-logo favicon),
  `site.webmanifest`, `robots.txt`, `sitemap.xml`, styled `404.html`, and
  per-page canonical + OpenGraph/Twitter on every page.

**Cloudflare (live now, applied via API — see `docs/cloudflare-security.md`):**
- ✅ Security response headers active on `projectsummit.app`: HSTS
  (`max-age=31536000`, no includeSubDomains/preload yet), `X-Content-Type-Options`,
  `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`,
  `Cross-Origin-Opener-Policy`.
- ✅ Rate-limit on `/ingest`: action `block`, 40 req / 10 s per IP (Free-plan caps).
- 🟡 **CSP is still in `Report-Only`** (rule id `680eae136b4f4e0aad7626991b8c714b`,
  `http_response_headers_transform` phase). As of **2026-07-16** a live check of
  `projectsummit.app` shows the **deploy gap is closed** — production now serves
  this redesign (self-hosted `summit.css`, no `cdnjs`/Google Fonts in the
  response), so the original blocker for enforcing no longer applies. Flipping
  it (re-PUT the entrypoint renaming the header
  `Content-Security-Policy-Report-Only` → `Content-Security-Policy`) needs
  Cloudflare API/dashboard access, which a coding session doesn't have by
  default — do it from a session with a Cloudflare API token (Rulesets scope)
  or the dashboard, and re-validate the console for CSP violations across all
  pages first.

**Still manual (the session API token only had Rulesets access):** dashboard
toggles (strengthen HSTS, min TLS 1.2, DNSSEC, Bot Fight) and email DNS
(SPF/DKIM/DMARC — needs DNS perms + your ESP). **BIMI** intentionally skipped (paid
VMC). The temporary API token used that session should be revoked if it hasn't
been already.

## What this is
A **static** marketing site for the Project Summit iOS cycling app, served by
**GitHub Pages** on the custom domain **projectsummit.app** (`CNAME` at repo
root). No framework, no server: plain HTML + one CSS file + a few vanilla JS
files. There is a tiny Node build step for the shared shell (see below), but the
deployed artifact is the committed HTML itself.

## Layout
```
*.html                     pages (committed, served as-is)
es/*.html, ca/*.html        GENERATED locale shells — see "Internationalized URLs"; don't hand-edit
partials/header.html       single source of truth for the site header
partials/footer.html       single source of truth for the site footer
build.js                   injects the partials into every page + generates es//ca/ locale shells
package.json               `npm run build` -> node build.js
assets/css/summit.css      design system (light + dark, @font-face, all components)
assets/js/app.js           controller: theme, language, carousel, nav, analytics hooks
assets/js/i18n.js          translations (English in HTML; ES + CA overrides here)
assets/js/lang-routing.js  makes the language switcher navigate to the translated URL (blog + shell pages)
assets/js/analytics.js     PostHog helpers (internal-user flag)
assets/js/consent.js       cookie-consent banner (PostHog opt-in gating)
assets/fonts/              self-hosted Instrument Serif + JetBrains Mono (woff2)
assets/img/                logo, og-image, founder photo, favicons, flags/
assets/screenshots/        app screenshots used in the home carousel
tools/check-i18n.js        CI/local check: every data-i18n key has ES + CA
tools/check-links.js       CI/local check: internal links/assets/anchors resolve (incl. es//ca/)
tools/i18n-meta.js         shared title/description/FAQ-order config for build.js + check-meta-sync.js
tools/check-meta-sync.js   CI/local check: i18n-meta.js still matches the live HTML
docs/cloudflare-security.md Cloudflare headers/CSP + SPF/DKIM/DMARC guide
.github/workflows/         build-shell (auto-rebuild) + verify (quality gate)
infra/cloudflare-worker.js Cloudflare Worker: PostHog proxy at /ingest + App Store rating at /appstore-rating
robots.txt, sitemap.xml    SEO (indexable pages only, incl. es//ca/ with hreflang)
404.html, site.webmanifest standalone error page / PWA manifest
SummitLogo-Mail.png        ROOT on purpose — see "Gotchas"
CNAME, ATTRIBUTION.md      site config / credits
```
Pages with the shared shell: `index, roadmap, faq, about, ambassadors, terms,
privacy-policy`. `thanks.html` is **standalone** (no shared header/footer) — it's
a minimal confirmation page and is intentionally excluded from the build.

## Shared header/footer (the build step)
The header and footer are **not** duplicated by hand. Edit them once in
`partials/header.html` / `partials/footer.html`, then run:
```
npm run build      # or: node build.js
```
How it works:
- Each page has exactly one `<header class="site-header">…</header>` and one
  `<footer class="site-footer">…</footer>`. Those tags are the boundaries;
  `build.js` overwrites whatever is between them with the current partial.
- Active nav state is applied at build time: the header partial uses `$$key$$`
  tokens (`$$home$$`, `$$roadmap$$`, `$$faq$$`, `$$about$$`, `$$ambassadors$$`,
  `$$terms$$`, `$$privacy$$`). The `PAGES` map in `build.js` says which key is
  active per file; the matching token becomes `active`, the rest are removed.
- The build is **idempotent**. Re-running with no partial change = 0 files
  changed.

**Do NOT hand-edit the `<header>`/`<footer>` blocks inside the pages** — they are
generated and will be overwritten on the next build. Edit the partials instead.

### CI: auto-rebuild + verify
`.github/workflows/build-shell.yml` runs on every push: it runs `build.js` and,
if the committed HTML drifted from the partials, commits the rebuild back to the
branch with `[skip ci]` (so it doesn't loop). This means you normally don't have
to remember to build — but **still run `npm run build` locally** before
committing partial changes so the diff is clean and reviewable. The auto-commit
only works on branches in this repo, not forks.

`.github/workflows/verify.yml` is a read-only quality gate on push/PR: i18n
coverage (`tools/check-i18n.js`), internal links (`tools/check-links.js`),
title/description/FAQ-order sync (`tools/check-meta-sync.js`), and a
shell-in-sync check. Run all of them locally with **`npm run check`**. Actions
are pinned to commit SHAs and kept current by Dependabot.

## Internationalization
- **English is the source** and lives directly in the HTML (every translatable
  element has `data-i18n="some.key"`).
- **Spanish + Catalan** live in `assets/js/i18n.js` as the `ES` and `CA` objects.
- At runtime `app.js` calls `SummitLang.set(lang)`; the engine captures each
  element's English once, then swaps to the dict value (or falls back to English
  if a key is missing). This runtime swap still exists (used for same-page
  previews — see "Internationalized URLs" below) but as of 2026-07-16 it's no
  longer the mechanism that makes the site multilingual for SEO — that's now
  real per-locale URLs, generated at build time.
- **Default language is Spanish** (`DEFAULTS.lang = 'es'` in `app.js`) for the
  *client-side preference* (returning visitors, the cookie banner's language,
  etc). This is unrelated to which language a given URL serves — see below.
- There is **no `translations.js`** anymore — it was replaced by `i18n.js`.

To add/change a translatable string:
1. Add/edit the English text in the HTML element with its `data-i18n` key.
2. Add the same key with its value to **both** `ES` and `CA` in `i18n.js`.
3. Keep coverage complete — every `data-i18n` key used in the HTML must exist in
   `ES` and `CA`. Quick check:
   ```
   node -e "const fs=require('fs');const i=fs.readFileSync('assets/js/i18n.js','utf8');
   ['index','roadmap','faq','about','ambassadors','terms','privacy-policy'].forEach(p=>{
     const h=fs.readFileSync(p+'.html','utf8');
     [...new Set([...h.matchAll(/data-i18n=\"([^\"]+)\"/g)].map(m=>m[1]))]
       .forEach(k=>{ if(!i.includes('\"'+k+'\"')) console.log('MISSING',p,k); });
   });"
   ```
   Shared nav/footer strings come from the partials, so their keys appear once in
   the partials and are translated like any other key.
4. Run `npm run build` — the 14 `es/*.html` / `ca/*.html` shells (see below) are
   regenerated FROM the English HTML + these dictionaries, so your edit
   propagates automatically. Nothing under `es/`/`ca/` is hand-edited.

### Internationalized URLs (`es/*.html`, `ca/*.html`) — 2026-07-16
The problem this solves: translated content only living in `i18n.js` and
getting DOM-swapped at runtime means Google only ever sees the **English**
markup — ES/CA visitors and search traffic were invisible to SEO, and there
was no indexable Spanish/Catalan URL to rank. The fix is real per-locale
URLs — **without hand-tripling every page**, by generating them.

- `build.js` now has a second stage (`augmentRootShells()` +
  `generateLocaleShells()`, run after the existing header/footer stage) that:
  1. Adds `hreflang` alternates + `data-alt-en/es/ca` (on `<body>`) to the 7
     canonical English root pages (`index.html`, `roadmap.html`, `faq.html`,
     `about.html`, `ambassadors.html`, `terms.html`, `privacy-policy.html`).
  2. Generates `es/<file>` and `ca/<file>` for each of those 7 — same HTML,
     same `partials/`-driven header/footer, but with every `data-i18n`
     element's inner HTML swapped for the `i18n.js` dictionary value (a
     **build-time twin of `i18n.js`'s own runtime `set()`** — same
     fallback-to-English rule, just baked into the static file instead of
     applied by the browser). `<html lang>`, `<title>`, meta description,
     OG/Twitter tags, canonical, and the page's own JSON-LD `@graph` (see
     "Structured data" above) are all rewritten to match. Internal links
     between the 7 shell pages stay same-directory relative (the es/ca copy
     sits right next to its siblings); asset paths get `../`; the Blog nav
     link points at `../blog/<locale>/index.html` (the blog already has
     per-locale directories — see below).
  3. `i18n.js` itself is **not modified or required as a module** — build.js
     just string-extracts the plain `var ES = {...}` / `var CA = {...}`
     object literals out of the file and `new Function()`s them into data.
     Don't break that extraction (`loadI18nDict()` in build.js) by reshaping
     those declarations.
  4. `<title>`/meta description are composed from copy that's **already
     translated and reviewed elsewhere on the page** (nav labels, the page's
     own "sub" line — see the `META` map in `tools/i18n-meta.js`) — not new
     marketing copy invented at build time. `terms.html`/`privacy-policy.html`
     don't have a reviewed translated one-liner to reuse, so their meta
     description stays in English until someone writes real translated
     legal-page copy (tracked via `descKey: null` in `META`).
- **`tools/i18n-meta.js`** holds `META`/`TITLE_EN`/`DESC_EN`/`OG_TITLE_EN`/
  `OG_DESC_EN`/`FAQ_KEYS` — hand-kept copies of each page's real `<title>`/
  meta/OG/Twitter text and of the order `faq.html`'s hand-authored FAQPage
  JSON-LD lists its questions in. `build.js` requires this module; so does
  **`tools/check-meta-sync.js`** (run by `npm run check`), which fails loudly
  if a page's copy changes without the matching entry being updated — without
  it, that drift would fail silently (the es/ca build would just quietly stop
  localizing that field, or misalign FAQ answers, with no error). If you
  change a `<title>`/meta description/OG tag or reorder `faq.html`'s
  questions, update `tools/i18n-meta.js` to match and re-run `npm run check`.
- **Root = English, `/es/`, `/ca/` are the translations** (matches "English is
  the source" and the blog's existing convention — see below). `x-default` in
  every hreflang block points at the English root.
- **The blog already did exactly this by hand**: `blog/es/`, `blog/ca/` are
  hand-translated (not generated — blog is English-first content per
  `docs/blog.md`, so there's no dictionary to generate from) but use the
  identical URL / hreflang / `data-alt-*` convention. `assets/js/lang-routing.js`
  (renamed from `blog-i18n.js` — the logic was already fully generic, only the
  name and comment were blog-specific) is what makes the language switcher
  **navigate** to the translated URL instead of just DOM-swapping, on any page
  that carries `data-alt-en` — now the shell pages too, not just the blog.
- **`app.js`'s `load()`** derives `state.lang` from `document.documentElement`'s
  `lang` attribute (not the stored/default preference) whenever a page has
  `data-alt-en` AND the visitor hasn't made an explicit choice yet
  (`langExplicit`). Without this, a first-time visitor landing on the English
  `/roadmap.html` would get their page silently DOM-swapped to the stored
  `'es'` default. Once a choice IS explicit, this is intentionally skipped —
  that's what lets `lang-routing.js` notice a mismatch (stored `es`, landed on
  an English URL) and redirect to the visitor's actual preferred locale.
- `tools/check-links.js` now also validates all 14 `es/`/`ca/` shell files
  (paths resolved relative to each file's own directory, not always repo
  root). `sitemap.xml` lists `index/roadmap/faq/about/ambassadors` × en/es/ca
  with hreflang annotations (terms/privacy-policy stay out, same as before —
  they're `noindex`).
- **Known gaps / next steps**: `terms.html`/`privacy-policy.html` meta
  descriptions aren't translated yet (see above). Nothing here removes the
  runtime `data-i18n`/`SummitLang` swap — it still exists and still runs (for
  the same-page preview flash before `lang-routing.js` navigates) — a deeper
  cleanup could retire it once every DOM-swap consumer is confirmed
  unnecessary, but that wasn't done here to keep this change bounded.

## Blog / Journal (`/blog/`)
A first-party, **English-first** content section for SEO + email capture. Full
details in **`docs/blog.md`**. Key points:
- Pages live in `blog/` (one level deep). The shared header/footer are injected
  by `build.js` and **re-rooted with `../`** (see `BLOG_PAGES` + `reroot()` in
  `build.js`) — so edit `partials/` and `npm run build` as usual. Blog pages
  load `assets/css/blog.css` after `summit.css`.
- Two paths were made absolute so sub-dir pages don't break: `BADGE_BASE` in
  `app.js` and the cookie-banner privacy link in `consent.js`.
- Email capture (`assets/js/blog-signup.js`) posts to the `blog_subscribe_v1`
  Edge Function, which upserts into the **existing** `contacts` table + sends the
  magnet via Resend. **That function lives in the app repo `Project-Summit-MVP`**
  and ships via its git→prod sync — Supabase functions/migrations are NOT managed
  from this static-site repo. This repo only holds the front-end that calls it.
- Framing stays anti-chatbot: always "the engine" / "the algorithm", never "AI"
  or "coach".
- Blog pages are **not** in `tools/check-links.js` (its list is the root pages);
  verify blog internal links by hand.

## Theming (light/dark)
- `app.js` sets `data-theme` on `<html>`. It **follows the device** color scheme
  (`prefers-color-scheme`) and live-updates on system change, until the user
  clicks the theme toggle — then the explicit choice is persisted in
  `localStorage` under `summit_site_v1` (`{theme, themeExplicit, lang}`).
- All colors are CSS tokens in `summit.css` (`:root` for light,
  `[data-theme="dark"]` for dark). **Never hardcode hex colors** in page-scoped
  styles — use the tokens (`var(--ink)`, `var(--accent)`, `var(--card)`, etc.) so
  dark mode keeps working.
- Inner pages keep a small page-scoped `<style>` for components unique to that
  page (FAQ accordion, roadmap timeline, legal prose, etc.), all using tokens.
- `thanks.html` has its own tiny inline theme bootstrap in `<head>` because it
  doesn't load `app.js`.

## Scroll reveal (motion)
Single shared mechanism across the whole site (`app.js` `initReveal()` +
`.reveal`/`.reveal.is-visible` in `summit.css`) — see "Scroll reveal" comments
in both files. Per page (`body[data-page]`), `REVEAL_MAPS` maps a trigger
container to the child items that get staggered. Tunables live in exactly two
places:
- **Trigger point** — `app.js`, `var trigger = window.innerHeight * 0.8`
  (fires when a group's top crosses 80% down the viewport, i.e. while it's
  still entering from the bottom — tuned up from `0.7` because reveals felt
  late).
- **Speed** — `summit.css` `.reveal.is-visible`: `0.46s` transition duration,
  `90ms` per-item stagger delay (`--reveal-i`) — tuned down from `0.66s`/`170ms`
  because the cascade felt sluggish, especially on sections with many items
  (FAQ, feature cards). Change both together; they're the only two dials.
- No-JS and `prefers-reduced-motion: reduce` always show full content — the
  hidden state only exists once `.reveal` is added by JS inside a
  `no-preference` media query.

## Placeholders (swap these when the real values exist)
- **App Store links**: ✅ done — every `.appstore` badge points to
  `https://apps.apple.com/app/id6754172654` (Apple ID `6754172654`) and keeps its
  `data-source="…"` for analytics. The badge artwork is Apple's **official SVG
  lockup** (`assets/img/appstore-badges/`, en/es/ca × black/white): each badge is
  an `<img class="appstore-img">` and `app.js updateBadges()` swaps the file by
  language + surface (white on dark surfaces/`appstore--white`/dark mode, black
  otherwise) on every theme/lang change. `thanks.html` is standalone so it sets
  its badge with a small inline script. Update the Apple ID in all badge anchors
  if the listing changes.
- **Rating**: the star rows (`#stars-prod`, `#stars-cta`) are filled by
  `app.js renderStars()` and are a placeholder until real reviews exist. The home
  hero also has a **live** rating badge (`#rating-badge`): `app.js
  initRatingBadge()` fetches `/appstore-rating` (the Worker proxies the iTunes
  lookup — Apple sends no CORS), and only un-hides the badge if the App Store has
  ≥1 rating (otherwise the page is unchanged; it also hides the placeholder stars
  when it shows). Needs the `/appstore-rating` Worker route deployed (see
  `infra/cloudflare-worker.js`).
- **Hero phones**: the three home-hero phones use dedicated hero art
  (`assets/screenshots/hero-recovery.png`, `hero-today.png`,
  `hero-training-load.png`) — separate from the carousel shots, so the hero and
  carousel can differ. (They currently start as copies of the carousel images;
  overwrite the `hero-*` files with the final hero art.)

## Analytics & consent
- PostHog is **lazy-initialised** for real opt-in: each page's `<head>` only has
  the PostHog *stub* (queues calls into `window.posthog`); the actual
  `posthog.init(...)` lives in `assets/js/consent.js` and runs only when
  `localStorage.summit_consent === 'granted'`. If the visitor rejects or never
  decides, the lib script is never fetched and nothing hits `/ingest`. The
  legacy `opt_out_capturing_by_default: true` flag did **not** block
  autocapture / `$pageview` on the modern `defaults: '2026-01-30'` preset — the
  earlier setup was leaking ~95% of events without consent.
- The PostHog **config lives in one place** — `POSTHOG_CONFIG` inside
  `consent.js`. Update it there, not per-page.
- The footer "Cookie settings" link reopens the banner
  (`SummitConsent.reopen()`); choice is stored in
  `localStorage.summit_consent` as `granted` / `denied`.
- `assets/js/analytics.js` flags internal/test browsers (`?internal=1`). Its old
  responsibility of forwarding UTM params to a Tally waitlist link was removed
  once the waitlist form was replaced by direct App Store links.
- `app.js` fires guarded events (`window.posthog` checked): theme toggle,
  language change, carousel, App Store badge clicks, mobile menu.
- PostHog traffic is proxied through `projectsummit.app/ingest` via
  `infra/cloudflare-worker.js`.

## SEO / social
- Every page has `canonical` + OpenGraph + Twitter meta. `og:image` /
  `twitter:image` point to the **absolute** URL
  `https://projectsummit.app/assets/img/og-image.png`. If you move that file,
  update those meta tags.
- `robots.txt` + `sitemap.xml` (indexable pages only — legal pages and
  `thanks.html`/`404.html` are `noindex`). Favicons + `site.webmanifest` are
  generated from the logo; regenerate with an image tool if the logo changes.
- **Structured data (JSON-LD)** — every page has a `<script
  type="application/ld+json">` in `<head>` (hand-authored per page, right
  before the `summit.css` link — there's no build-time generation/dedup for
  this, same convention as the OG/Twitter tags). Shared nodes repeated
  verbatim on every page via `@id` (`#organization`, `#website`) so they can
  cross-reference: `Organization` (Project Summit, founder Jordi Espanyol) +
  `WebSite`. Page-specific on top: `SoftwareApplication` (index — deliberately
  **no `aggregateRating`**, since the on-page stars are a placeholder; adding
  fake review markup is a Google spam violation — only add it once
  `initRatingBadge()`'s live App Store rating is meaningful and you're willing
  to keep the JSON-LD in sync with it), `FAQPage` (faq.html — 15 `Question`s,
  text must stay verbatim with the `<details>` content), `Person` + `AboutPage`
  (about.html), `Blog`/`BlogPosting` (blog/ + posts — the posts already had
  this before today), plus `WebPage` + `BreadcrumbList` everywhere else
  (roadmap, ambassadors, terms, privacy-policy). Keep new pages consistent
  with this pattern, and validate with
  https://search.google.com/test/rich-results after edits.

## Security / privacy
- Fonts and flag icons are **self-hosted** (no Google Fonts / cdnjs) — privacy
  (no third-party IP logging), speed, and it allows a strict CSP. There are no
  hot-linked third-party scripts/styles, so no SRI is needed.
- Headers (CSP/HSTS/etc.), `/ingest` rate-limiting, and email auth
  (SPF/DKIM/DMARC/BIMI) are applied at **Cloudflare**, not in the repo. The exact
  copy/paste config is in **`docs/cloudflare-security.md`**.

## Privacy policy (`privacy-policy.html`)
11 numbered sections (`#s1`–`#s11`), TOC + anchors built the same way as the
rest of the site (English in the HTML, `privacy.sN.body` + `sN.title` keys
translated in `i18n.js`). Keep this current when integrations or website
tracking change:
- **s2** (data we collect) and **s4** (third-party integrations) list every
  connected service/device by name — e.g. Strava, **Hammerhead Karoo**,
  intervals.icu, Apple HealthKit, Supabase. Add a row in both tables whenever a
  new integration ships (check `roadmap.html`/`faq.html`/`terms.html` for what's
  already shipped vs. still on the roadmap).
- **s10** ("Cookies & website analytics") documents *this website's* tracking —
  separate from what the App collects — since PostHog/the cookie banner
  (`assets/js/consent.js`) has its own opt-in flow. Update it if the PostHog
  config, the proxy path, or the `localStorage` keys (`summit_consent`,
  `summit_site_v1`) change.
- **s11** is Contact (renumbered from s10 when the cookies section was
  inserted — if you add/remove a section, the trailing `<span class="num">NN</span>`
  badges and TOC entries need renumbering too, there's no build-time numbering).

## Gotchas
- **`SummitLogo-Mail.png` stays at the repo root.** It's hotlinked by email
  templates at `https://projectsummit.app/SummitLogo-Mail.png` and is not used by
  the site. Moving it 404s the logo in already-sent (immutable) emails.
- **Don't hand-edit page header/footer** — edit `partials/` and rebuild.
- **Don't hand-edit `es/*.html` / `ca/*.html`** — they're generated from the
  English root pages + `i18n.js` on every `npm run build`; edit the English
  HTML and/or `i18n.js` instead.
- **Run the i18n coverage check** after touching copy or keys.
- **Keep colors as tokens** so dark mode survives.
- `thanks.html` is standalone — changes to the shared shell don't reach it.

## Deploy
Push to the branch GitHub Pages serves (the site builds from the branch, not from
an Actions artifact). The committed HTML is what ships, so make sure the shell is
rebuilt (locally or by the CI auto-commit) before/at merge.
