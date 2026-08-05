#!/usr/bin/env node
/* Fail if a locale screenshot override directory is incomplete or has a file
   the canonical set doesn't know about. build.js localizes each <img> src only
   when that exact file exists (see localizeScreenshots()), so a half-filled
   assets/screenshots/es/ would silently ship a mix of Spanish and English
   captures on the same page, and a typo'd filename would be ignored outright.
   No locale directory at all is the normal state and passes quietly.
   Run by CI and locally (`npm run check`). */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const SHOTS = path.join(ROOT, 'assets/screenshots');
const LOCALES = ['en', 'es', 'ca'];

// Canonical set = the .webp files sitting directly in assets/screenshots/
// (the flat fallback), not recursing into the locale directories.
const canonical = fs.readdirSync(SHOTS)
  .filter((f) => f.endsWith('.webp') && fs.statSync(path.join(SHOTS, f)).isFile())
  .sort();

let problems = 0;
const fail = (msg) => { console.error('INCOMPLETE  ' + msg); problems++; };

let found = 0;
for (const locale of LOCALES) {
  const dir = path.join(SHOTS, locale);
  if (!fs.existsSync(dir)) continue; // no override for this locale — flat fallback applies
  found++;

  const present = new Set(fs.readdirSync(dir).filter((f) => f.endsWith('.webp')));
  const missing = canonical.filter((f) => !present.has(f));
  if (missing.length) {
    fail(`assets/screenshots/${locale}/ is missing ${missing.length} of ${canonical.length} capture(s): ${missing.join(', ')}`);
  }
  const extra = [...present].filter((f) => !canonical.includes(f)).sort();
  if (extra.length) {
    fail(`assets/screenshots/${locale}/ has file(s) with no counterpart in assets/screenshots/: ${extra.join(', ')} (typo? the build ignores them)`);
  }
}

if (problems) { console.error(`\nscreenshot check failed: ${problems} incomplete locale set(s).`); process.exit(1); }
console.log(`screenshot check OK — ${found} locale override(s), ${canonical.length} captures each.`);
