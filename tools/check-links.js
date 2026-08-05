#!/usr/bin/env node
/* Fail on broken internal references: local .html links, assets/ paths, and
   in-page #anchors that don't resolve. External (http/mailto/tel) and bare "#"
   placeholders are skipped. Run by CI and locally (`npm run check`). */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const rootPages = ['index', 'roadmap', 'faq', 'pricing', 'about', 'ambassadors', 'changelog', 'terms', 'privacy-policy', 'thanks'];
const shellPages = ['index', 'roadmap', 'faq', 'pricing', 'about', 'ambassadors', 'changelog', 'terms', 'privacy-policy'];

// Blog pages: discovered from disk rather than hardcoded. build.js's BLOG_PAGES
// map is the "real" source of truth for this list, but build.js runs its build
// (writes files) as a top-level side effect on require(), so importing it here
// would trigger a full rebuild as a side effect of running the link checker —
// not acceptable for a read-only check. Globbing blog/, blog/es/, blog/ca/
// achieves the same goal (no second hand-maintained list to drift out of sync)
// without executing build.js.
const blogDirs = ['blog', 'blog/es', 'blog/ca'];
const blogFiles = blogDirs.flatMap((dir) =>
  fs.readdirSync(path.join(ROOT, dir))
    .filter((f) => f.endsWith('.html'))
    .map((f) => dir + '/' + f)
);

const files = [
  ...rootPages.map((p) => p + '.html'),
  ...['es', 'ca'].flatMap((locale) => shellPages.map((p) => locale + '/' + p + '.html')),
  ...blogFiles,
];
let problems = 0;
const fail = (msg) => { console.error('BROKEN  ' + msg); problems++; };

for (const file of files) {
  const raw = fs.readFileSync(path.join(ROOT, file), 'utf8');
  // Commented-out markup is not a reference. Blog posts park unshipped <figure>
  // blocks in HTML comments while their art is still being produced (see the
  // TODO screenshots in blog/apple-watch-sleep-recovery-cycling.html), and a
  // link the browser never resolves must not fail a link check — otherwise the
  // gate stays red for everyone until an unrelated asset exists.
  const html = raw.replace(/<!--[\s\S]*?-->/g, '');
  const ids = new Set([...raw.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

  // href and src references, resolved relative to this file's own directory
  // (root pages live at ROOT; es/ca shells live one level down).
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:)/.test(ref)) continue; // external
    if (ref === '#') continue;                                // intentional placeholder
    if (ref.startsWith('#')) {                                // same-page anchor
      if (!ids.has(ref.slice(1))) fail(`${file} -> ${ref} (no such id)`);
      continue;
    }
    const [pathPart, frag] = ref.split('#');
    // A leading "/" is root-absolute on the served site, not relative to the
    // page — resolve it from the repo root. Without this the checker silently
    // reports every root-absolute link as missing (or, worse, passes one by
    // accident of path.join semantics). The site prefers relative paths so it
    // resolves under any serving root, but a handful of root-absolute links are
    // deliberate — see docs/blog.md — and they have to be judged correctly.
    const target = pathPart.startsWith('/')
      ? path.join(ROOT, pathPart)
      : path.join(ROOT, path.dirname(file), pathPart);
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
