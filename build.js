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
 * Blog pages live one level deep in blog/. The partials use root-relative paths
 * (index.html, assets/…), so for those pages the injected shell is re-rooted
 * with a "../" prefix. The page body itself is authored with correct paths and
 * is left untouched.
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

// Root-level pages: file -> active-nav key (matches $$key$$ tokens in the header).
const PAGES = {
  'index.html': 'home',
  'roadmap.html': 'roadmap',
  'faq.html': 'faq',
  'about.html': 'about',
  'ambassadors.html': 'ambassadors',
  'terms.html': 'terms',
  'privacy-policy.html': 'privacy',
};

// Blog pages (one directory deep). The shared shell is re-rooted with "../".
const BLOG_PAGES = {
  'blog/index.html': 'blog',
  'blog/gran-diagonal-999km-portugal.html': 'blog',
};

function renderHeader(activeKey) {
  let h = headerTpl.replace(/\$\$([a-z]+)\$\$/g, (_, k) => (k === activeKey ? 'active' : ''));
  h = h.replace(/ class=""/g, '');                                   // drop emptied nav-link classes
  h = h.replace(/class="nav-more-option "/g, 'class="nav-more-option"'); // tidy trailing space
  return h;
}

// Prefix root-relative href/src so the shared shell resolves from a sub-directory
// page. External (http/mailto/tel/data), absolute (/…) and #anchors are left as-is.
function reroot(html, prefix) {
  if (!prefix) return html;
  return html.replace(/\b(href|src)="([^"]*)"/g, (m, attr, val) =>
    /^(https?:|mailto:|tel:|data:|#|\/)/.test(val) ? m : `${attr}="${prefix}${val}"`);
}

let changed = 0;
function processPages(map, prefix) {
  for (const [file, key] of Object.entries(map)) {
    const p = path.join(ROOT, file);
    let html = fs.readFileSync(p, 'utf8');

    const hCount = (html.match(/<header class="site-header">/g) || []).length;
    const fCount = (html.match(/<footer class="site-footer">/g) || []).length;
    if (hCount !== 1 || fCount !== 1) {
      throw new Error(`${file}: expected exactly 1 header and 1 footer, found header=${hCount} footer=${fCount}`);
    }

    const before = html;
    html = html.replace(/<header class="site-header">[\s\S]*?<\/header>/, () => reroot(renderHeader(key), prefix));
    html = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, () => reroot(footerHtml, prefix));

    if (html !== before) { fs.writeFileSync(p, html); changed++; console.log('  updated   ' + file); }
    else console.log('  unchanged ' + file);
  }
}

processPages(PAGES, '');
processPages(BLOG_PAGES, '../');
const total = Object.keys(PAGES).length + Object.keys(BLOG_PAGES).length;
console.log(`build complete — ${total} pages, ${changed} updated`);
