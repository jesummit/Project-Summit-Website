# App Store badges (official)

Apple's official **"Download on the App Store"** lockups, used by the `.appstore`
links across the site. Three languages × two colours = 6 files.

## Files — keep these exact names

| File | Locale | Colour | Shown on |
|------|--------|--------|----------|
| `appstore-black-en.svg` | English | Black | light backgrounds (light mode) |
| `appstore-black-es.svg` | Español | Black | light backgrounds (light mode) |
| `appstore-black-ca.svg` | Català  | Black | light backgrounds (light mode) |
| `appstore-white-en.svg` | English | White | dark backgrounds / dark mode |
| `appstore-white-es.svg` | Español | White | dark backgrounds / dark mode |
| `appstore-white-ca.svg` | Català  | White | dark backgrounds / dark mode |

**SVG is preferred** (crisp at any size, tiny, CSP-friendly). If you only have
PNG, keep the same base name with a `.png` extension and say so, so the wiring
points at the right files.

## Source & rules
- Get them from Apple's marketing resources / badge tool:
  https://developer.apple.com/app-store/marketing/guidelines/
- Do **not** recolour, rotate, redraw or add effects to the lockup. Keep the
  required clear space around it and respect the minimum size.
- Black lockup on light surfaces; white lockup on dark surfaces.
- Apple doesn't ship an official **Catalan** badge — if `…-ca.svg` is a custom
  build, keep the official typography/lockup so it matches.

## Wiring (pending)
The site switches language (en/es/ca) and theme (light/dark) at runtime, so the
badge `<img>` must swap on both. Once the 6 files are here, the `.appstore`
links get rewired to pick `appstore-{black|white}-{lang}.svg` accordingly.
Until then the current CSS/SVG lockup stays in place.
