#!/usr/bin/env node
/* Fail on broken internal references: local .html links, assets/ paths, and
   in-page #anchors that don't resolve. External (http/mailto/tel) and bare "#"
   placeholders are skipped. Run by CI and locally (`npm run check`). */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const pages = ['index', 'roadmap', 'faq', 'about', 'ambassadors', 'terms', 'privacy-policy', 'thanks'];
let problems = 0;
const fail = (msg) => { console.error('BROKEN  ' + msg); problems++; };

for (const p of pages) {
  const file = p + '.html';
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

  // href and src references
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:)/.test(ref)) continue; // external
    if (ref === '#') continue;                                // intentional placeholder
    if (ref.startsWith('#')) {                                // same-page anchor
      if (!ids.has(ref.slice(1))) fail(`${file} -> ${ref} (no such id)`);
      continue;
    }
    const [pathPart, frag] = ref.split('#');
    const target = path.join(ROOT, pathPart);
    if (!fs.existsSync(target)) { fail(`${file} -> ${ref} (missing file)`); continue; }
    if (frag) {
      const targetHtml = fs.readFileSync(target, 'utf8');
      const targetIds = new Set([...targetHtml.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
      if (!targetIds.has(frag)) fail(`${file} -> ${ref} (no #${frag} in ${pathPart})`);
    }
  }
}

if (problems) { console.error(`\nlink check failed: ${problems} broken reference(s).`); process.exit(1); }
console.log('link check OK — internal links, assets and anchors resolve.');
