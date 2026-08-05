# App screenshots

The captures used by the marketing site's home page. They contain the app's own
UI text, so they are **localized**: the site can serve a different set per
language.

## Where to drop each locale's set

```
assets/screenshots/en/   English captures
assets/screenshots/es/   Spanish captures
assets/screenshots/ca/   Catalan captures
```

The flat `.webp` files at the top level of this directory are the **fallback**:
any locale with no override directory keeps using them. They are currently
Spanish, which is why the English page needs `en/` most urgently — `index.html`
is the canonical URL and the `x-default` hreflang target.

## The 10 filenames (identical in every locale directory)

Hero — the three phones at the top of the home page:

| File | Position |
| --- | --- |
| `hero-recovery.webp` | left phone |
| `hero-today.webp` | centre phone (the LCP image) |
| `hero-training-load.webp` | right phone |

Carousel — the seven frames in the "screens" section, in order:

| File | Caption |
| --- | --- |
| `today.webp` | Today |
| `training-load.webp` | Training Load |
| `workout.webp` | Workout |
| `recovery.webp` | Recovery |
| `calendar.webp` | Calendar |
| `activity.webp` | Activity |
| `nutrition.webp` | Nutrition |

## Format

- **1206 × 2622 px**, **WebP**. That is what the current flat files are and what
  the `width`/`height` attributes hard-code in `index.html`. A different size
  will render distorted — the attributes are not regenerated per image.

## A locale directory must be complete

`tools/check-screenshots.js` (run by `npm run check` and by CI) fails if a
locale directory exists but is missing any of the 10 filenames, or contains a
`.webp` the flat set doesn't have. This is deliberate: `build.js` localizes each
`<img>` individually and only when that exact file exists, so a half-filled
directory would ship a mix of languages on one page — worse than a consistent
fallback — and a typo'd filename would be silently ignored.

## After dropping the files in

No code change is needed. Run:

```
npm run build
```

`localizeScreenshots()` in `build.js` rewrites each `<img src>` to
`assets/screenshots/<locale>/<file>.webp` for every capture it finds on disk,
for the English root pages and the generated `es/`/`ca/` shells alike. The
substitution happens at build time, never at runtime — the hero's centre phone
is the LCP image and carries `fetchpriority="high"`, so a JS `src` swap would
download the wrong language first and then a second file.

Commit the images **and** the rebuilt HTML; CI re-runs the build and fails if the
committed HTML is stale.

## Note on the hero files

`hero-today.webp`, `hero-recovery.webp` and `hero-training-load.webp` are
currently byte-identical duplicates of `today.webp`, `recovery.webp` and
`training-load.webp`. They exist as separate files precisely so the hero art
*can* differ from the carousel. If the hero is meant to have its own treatment,
this is where it diverges — overwrite the `hero-*` files with the final hero art.
