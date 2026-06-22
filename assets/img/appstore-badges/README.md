# App Store badges (official)

Apple's official **"Download on the App Store"** lockups, downloaded from Apple's
marketing tools (`toolbox.marketingtools.apple.com`). Original Apple filenames are
kept as-is. Three locales × two colours.

## Files (Apple's original names)

| File | Locale | Colour | Used for |
|------|--------|--------|----------|
| `Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg` | English (US-UK) | Black | `en`, light surfaces |
| `Download_on_the_App_Store_Badge_US-UK_RGB_wht_092917.svg` | English (US-UK) | White | `en`, dark surfaces |
| `Download_on_the_App_Store_Badge_ES_RGB_blk_100217.svg`    | Español         | Black | `es`, light surfaces |
| `Download_on_the_App_Store_Badge_ES_RGB_wht_100217.svg`    | Español         | White | `es`, dark surfaces |
| `Download_on_the_App_Store_Badge_CAES_blk_082124.svg`      | Català          | Black | `ca`, light surfaces |
| `Download_on_the_App_Store_Badge_CAES_wht_082124.svg`      | Català          | White | `ca`, dark surfaces |

## Rules
- Don't recolour, rotate, redraw or add effects. Keep the clear space and the
  minimum size. Black lockup on light surfaces, white on dark.
- To refresh, re-download from Apple (same API/toolbox) and keep the filenames.

## Usage
The `.appstore` links pick a badge by **language** (en/es/ca) and **context**:
white when the badge sits on a dark surface (nav header, dark CTA cards) or in
dark mode, black otherwise — swapped at runtime by `app.js` when the language or
theme changes.
