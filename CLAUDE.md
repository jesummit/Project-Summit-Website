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
- 🟡 **CSP is in `Report-Only`** (rule id `680eae136b4f4e0aad7626991b8c714b`,
  `http_response_headers_transform` phase). **It is NOT enforcing** because
  **production still serves the OLD site** (loads cdnjs + Google Fonts, which the
  strict CSP would block). Flip to enforcing **only after the self-hosted redesign
  is deployed to the Pages branch** — re-PUT the entrypoint renaming the header
  `Content-Security-Policy-Report-Only` → `Content-Security-Policy`.

**Still manual (the session API token only had Rulesets access):** dashboard
toggles (strengthen HSTS, min TLS 1.2, DNSSEC, Bot Fight) and email DNS
(SPF/DKIM/DMARC — needs DNS perms + your ESP). **BIMI** intentionally skipped (paid
VMC). The temporary API token used this session should be revoked.

> ⚠️ **Deploy gap:** the live site at `projectsummit.app` is still the pre-redesign
> version (references `translations.js`, `SummitLogo.png`, root screenshots,
> cdnjs). This whole repo (the "V4 Momentum" redesign) has **not** been deployed
> to the branch GitHub Pages serves. Until it is, keep the CSP in Report-Only.

## What this is
A **static** marketing site for the Project Summit iOS cycling app, served by
**GitHub Pages** on the custom domain **projectsummit.app** (`CNAME` at repo
root). No framework, no server: plain HTML + one CSS file + a few vanilla JS
files. There is a tiny Node build step for the shared shell (see below), but the
deployed artifact is the committed HTML itself.

## Layout
```
*.html                     pages (committed, served as-is)
partials/header.html       single source of truth for the site header
partials/footer.html       single source of truth for the site footer
build.js                   injects the partials into every page
package.json               `npm run build` -> node build.js
assets/css/summit.css      design system (light + dark, @font-face, all components)
assets/js/app.js           controller: theme, language, carousel, nav, analytics hooks
assets/js/i18n.js          translations (English in HTML; ES + CA overrides here)
assets/js/analytics.js     PostHog helpers (internal-user flag; legacy UTM code now inert)
assets/js/consent.js       cookie-consent banner (PostHog opt-in gating)
assets/fonts/              self-hosted Instrument Serif + JetBrains Mono (woff2)
assets/img/                logo, og-image, founder photo, favicons, flags/
assets/screenshots/        app screenshots used in the home carousel
tools/check-i18n.js        CI/local check: every data-i18n key has ES + CA
tools/check-links.js       CI/local check: internal links/assets/anchors resolve
docs/cloudflare-security.md Cloudflare headers/CSP + SPF/DKIM/DMARC guide
.github/workflows/         build-shell (auto-rebuild) + verify (quality gate)
infra/cloudflare-worker.js Cloudflare Worker: PostHog reverse proxy at /ingest
robots.txt, sitemap.xml    SEO (indexable pages only)
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
coverage (`tools/check-i18n.js`), internal links (`tools/check-links.js`), and a
shell-in-sync check. Run both checks locally with **`npm run check`**. Actions
are pinned to commit SHAs and kept current by Dependabot.

## Internationalization
- **English is the source** and lives directly in the HTML (every translatable
  element has `data-i18n="some.key"`).
- **Spanish + Catalan** live in `assets/js/i18n.js` as the `ES` and `CA` objects.
- At runtime `app.js` calls `SummitLang.set(lang)`; the engine captures each
  element's English once, then swaps to the dict value (or falls back to English
  if a key is missing).
- **Default language is Spanish** (`DEFAULTS.lang = 'es'` in `app.js`).
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

## Placeholders (swap these when the real values exist)
- **App Store links**: ✅ done — every `.appstore` badge points to
  `https://apps.apple.com/app/id6754172654` (Apple ID `6754172654`). They keep
  their `data-source="…"` for analytics. The link lives in the header partial (nav
  badges) and inline on each page (hero/CTA) + `thanks.html`; update the ID in all
  of them if the listing ever changes.
- **Rating**: the star rows (`#stars-prod`, `#stars-cta`) are filled by
  `app.js renderStars()` and are a placeholder until real reviews exist.
- **Hero phones**: the three phones in the home hero are `.ph-ph` placeholders
  (the same three screens already appear in the carousel). Swap in dedicated hero
  art when available.

## Analytics & consent
- PostHog is **opt-in**: each page inits with `opt_out_capturing_by_default: true`
  and nothing is captured until the visitor accepts in the consent banner
  (`assets/js/consent.js`, choice stored in `localStorage.summit_consent`). The
  footer "Cookie settings" link reopens it (`SummitConsent.reopen()`).
- The PostHog snippet is inlined in each page's `<head>` (and `thanks.html`).
- `assets/js/analytics.js` flags internal/test browsers (`?internal=1`) and used
  to forward UTM params to a Tally waitlist link. The waitlist is gone, so that
  forwarding is now a harmless no-op; it can be trimmed.
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

## Security / privacy
- Fonts and flag icons are **self-hosted** (no Google Fonts / cdnjs) — privacy
  (no third-party IP logging), speed, and it allows a strict CSP. There are no
  hot-linked third-party scripts/styles, so no SRI is needed.
- Headers (CSP/HSTS/etc.), `/ingest` rate-limiting, and email auth
  (SPF/DKIM/DMARC/BIMI) are applied at **Cloudflare**, not in the repo. The exact
  copy/paste config is in **`docs/cloudflare-security.md`**.

## Gotchas
- **`SummitLogo-Mail.png` stays at the repo root.** It's hotlinked by email
  templates at `https://projectsummit.app/SummitLogo-Mail.png` and is not used by
  the site. Moving it 404s the logo in already-sent (immutable) emails.
- **Don't hand-edit page header/footer** — edit `partials/` and rebuild.
- **Run the i18n coverage check** after touching copy or keys.
- **Keep colors as tokens** so dark mode survives.
- `thanks.html` is standalone — changes to the shared shell don't reach it.

## Deploy
Push to the branch GitHub Pages serves (the site builds from the branch, not from
an Actions artifact). The committed HTML is what ships, so make sure the shell is
rebuilt (locally or by the CI auto-commit) before/at merge.
