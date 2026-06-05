#!/usr/bin/env node
/*
 * Project Summit — static shell assembler.
 *
 * The marketing site is plain static HTML (GitHub Pages). The shared header and
 * footer live once in partials/ and are injected into every page here so the
 * committed .html keeps full static markup (good for SEO, no flash).
 *
 * Usage:  npm run build   (or: node build.js)
 *
 * How it works: each page has exactly one <header class="site-header">…</header>
 * and one <footer class="site-footer">…</footer>; those tags act as the
 * boundaries, so the script overwrites whatever is between them with the current
 * partial. $$key$$ tokens in the header partial are replaced with the active-nav
 * class for that page. Re-running is idempotent. thanks.html is standalone (no
 * shared shell) and is intentionally excluded.
 *
 * To change the header/footer: edit partials/header.html or partials/footer.html,
 * then run the build. Do NOT hand-edit the generated blocks inside the pages.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;

function loadPartial(file, tag) {
  const raw = fs.readFileSync(path.join(ROOT, 'partials', file), 'utf8');
  const open = '<' + tag + ' class="site-' + tag + '">';
  const close = '</' + tag + '>';
  const start = raw.indexOf(open);
  const end = raw.indexOf(close);
  if (start === -1 || end === -1) throw new Error('partial ' + file + ' missing <' + tag + '> boundaries');
  return raw.slice(start, end + close.length);
}

const headerTpl = loadPartial('header.html', 'header');
const footerHtml = loadPartial('footer.html', 'footer');

// page file -> active-nav key (matches $$key$$ tokens in the header partial)
const PAGES = {
  'index.html': 'home',
  'roadmap.html': 'roadmap',
  'faq.html': 'faq',
  'about.html': 'about',
  'ambassadors.html': 'ambassadors',
  'terms.html': 'terms',
  'privacy-policy.html': 'privacy',
};

function renderHeader(activeKey) {
  let h = headerTpl.replace(/\$\$([a-z]+)\$\$/g, (_, k) => (k === activeKey ? 'active' : ''));
  h = h.replace(/ class=""/g, '');                                   // drop emptied nav-link classes
  h = h.replace(/class="nav-more-option "/g, 'class="nav-more-option"'); // tidy trailing space
  return h;
}

let changed = 0;
for (const [file, key] of Object.entries(PAGES)) {
  const p = path.join(ROOT, file);
  let html = fs.readFileSync(p, 'utf8');

  const hCount = (html.match(/<header class="site-header">/g) || []).length;
  const fCount = (html.match(/<footer class="site-footer">/g) || []).length;
  if (hCount !== 1 || fCount !== 1) {
    throw new Error(`${file}: expected exactly 1 header and 1 footer, found header=${hCount} footer=${fCount}`);
  }

  const before = html;
  html = html.replace(/<header class="site-header">[\s\S]*?<\/header>/, () => renderHeader(key));
  html = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, () => footerHtml);

  if (html !== before) { fs.writeFileSync(p, html); changed++; console.log('  updated   ' + file); }
  else console.log('  unchanged ' + file);
}
console.log(`build complete — ${Object.keys(PAGES).length} pages, ${changed} updated`);
