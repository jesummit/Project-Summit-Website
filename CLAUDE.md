# CLAUDE.md — Project Summit marketing site

Operational notes for future Claude sessions working on this repo. Read this
first; it captures how the site is wired and the gotchas that aren't obvious
from the file tree.

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
assets/css/summit.css      design system (light + dark, all shared components)
assets/js/app.js           controller: theme, language, carousel, nav, analytics hooks
assets/js/i18n.js          translations (English in HTML; ES + CA overrides here)
assets/js/analytics.js     PostHog helpers (internal-user flag; legacy UTM code now inert)
assets/img/                logo, og-image, founder photo
assets/screenshots/        app screenshots used in the home carousel
infra/cloudflare-worker.js Cloudflare Worker: PostHog reverse proxy at /ingest
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

### CI: auto-rebuild on push
`.github/workflows/build-shell.yml` runs on every push: it runs `build.js` and,
if the committed HTML drifted from the partials, commits the rebuild back to the
branch with `[skip ci]` (so it doesn't loop). This means you normally don't have
to remember to build — but **still run `npm run build` locally** before
committing partial changes so the diff is clean and reviewable. The auto-commit
only works on branches in this repo, not forks.

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
- **App Store links**: every `.appstore` badge is `href="#"` with a
  `<!-- PLACEHOLDER … -->` comment and a `data-source="…"` (used for analytics).
  Replace `#` with the real App Store listing URL across the partials (nav badges)
  and the relevant pages (hero/CTA badges, `thanks.html`).
- **Rating**: the star rows (`#stars-prod`, `#stars-cta`) are filled by
  `app.js renderStars()` and are a placeholder until real reviews exist.
- **Hero phones**: the three phones in the home hero are `.ph-ph` placeholders
  (the same three screens already appear in the carousel). Swap in dedicated hero
  art when available.

## Analytics
- The PostHog snippet is inlined in each page's `<head>` (and `thanks.html`).
- `assets/js/analytics.js` flags internal/test browsers (`?internal=1`) and used
  to forward UTM params to a Tally waitlist link. The waitlist is gone, so that
  forwarding is now a harmless no-op; it can be trimmed.
- `app.js` fires guarded events (`window.posthog` checked): theme toggle,
  language change, carousel, App Store badge clicks, mobile menu.
- PostHog traffic is proxied through `projectsummit.app/ingest` via
  `infra/cloudflare-worker.js`.

## SEO / social
- Full SEO + OpenGraph + Twitter meta lives on `index.html` only (inner pages
  never had per-page OG cards — adding them is optional future work).
- `og:image` / `twitter:image` point to the **absolute** URL
  `https://projectsummit.app/assets/img/og-image.png`. If you move that file,
  update those meta tags.

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
