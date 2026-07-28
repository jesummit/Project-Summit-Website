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

// Blog pages (in sub-directories). The shared shell is re-rooted per depth
// ("../" for /blog/, "../../" for /blog/<lang>/). English is the canonical set;
// es/ca are native translations at their own URLs (hreflang in each page).
const BLOG_PAGES = {
  'blog/index.html': 'blog',
  'blog/gran-diagonal-999km-portugal.html': 'blog',
  'blog/periodization-base-build-peak.html': 'blog',
  'blog/taper-and-peak-tsb.html': 'blog',
  'blog/cycling-in-the-heat-hydration-sodium.html': 'blog',
  'blog/es/index.html': 'blog',
  'blog/es/gran-diagonal-999km-portugal.html': 'blog',
  'blog/es/periodization-base-build-peak.html': 'blog',
  'blog/es/taper-and-peak-tsb.html': 'blog',
  'blog/ca/index.html': 'blog',
  'blog/ca/gran-diagonal-999km-portugal.html': 'blog',
  'blog/ca/periodization-base-build-peak.html': 'blog',
  'blog/ca/taper-and-peak-tsb.html': 'blog',
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
// "" for root pages, "../" one dir deep, "../../" two deep, …
function prefixFor(file) { return '../'.repeat(file.split('/').length - 1); }
function processPages(map) {
  for (const [file, key] of Object.entries(map)) {
    const prefix = prefixFor(file);
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

processPages(PAGES);
processPages(BLOG_PAGES);
const total = Object.keys(PAGES).length + Object.keys(BLOG_PAGES).length;
console.log(`build complete — ${total} pages, ${changed} updated`);

// ============================================================================
// Locale shells: es/*.html, ca/*.html generated from the just-built English
// source above + assets/js/i18n.js's ES/CA dictionaries, so translated,
// indexable per-locale URLs don't require hand-tripling the HTML. Same
// URL / hreflang / data-alt-* convention as the hand-authored blog/es/,
// blog/ca/ (see assets/js/lang-routing.js) — generated here instead of
// hand-translated. See CLAUDE.md "Internationalized URLs" for the full picture.
const LOCALES = ['es', 'ca'];

// i18n.js is a browser IIFE (no module.exports) holding `var ES = {...}` and
// `var CA = {...}` object literals. Pull them out as plain data without
// touching the runtime file or adding a dependency.
function loadI18nDict(varName) {
  const src = fs.readFileSync(path.join(ROOT, 'assets/js/i18n.js'), 'utf8');
  const marker = 'var ' + varName + ' = {';
  const start = src.indexOf(marker);
  if (start === -1) throw new Error('i18n.js: missing ' + marker);
  const objStart = src.indexOf('{', start);
  const end = src.indexOf('\n};', objStart);
  if (end === -1) throw new Error('i18n.js: unterminated ' + varName + ' block');
  return new Function('return ' + src.slice(objStart, end + 2))();
}
const DICTS = { es: loadI18nDict('ES'), ca: loadI18nDict('CA') };

function stripTags(s) { return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }

// Depth-aware search for a tag's matching close (handles nested same-name
// tags, e.g. the privacy-policy tables' nested <div class="callout">).
function findMatchingClose(html, from, tagName) {
  const openRe = new RegExp('<' + tagName + '(?:\\s|>)', 'gi');
  const closeRe = new RegExp('</' + tagName + '>', 'gi');
  let depth = 1, pos = from;
  while (depth > 0) {
    openRe.lastIndex = pos; closeRe.lastIndex = pos;
    const o = openRe.exec(html), c = closeRe.exec(html);
    if (!c) throw new Error('unclosed <' + tagName + '> while localizing');
    if (o && o.index < c.index) { depth++; pos = o.index + o[0].length; }
    else { depth--; pos = c.index + c[0].length; if (depth === 0) return { start: c.index, end: pos }; }
  }
}
// Build-time twin of i18n.js's runtime `set()`: swap each data-i18n element's
// inner HTML for dict[key], falling back to the English already in the
// markup — the exact same rule the browser applies at runtime, baked in here.
function localizeContent(html, dict) {
  const openRe = /<([a-z0-9]+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>/gi;
  let out = '', cursor = 0, m;
  while ((m = openRe.exec(html))) {
    const tagName = m[1], key = m[2];
    const openEnd = openRe.lastIndex;
    const close = findMatchingClose(html, openEnd, tagName);
    out += html.slice(cursor, openEnd);
    out += (dict[key] != null) ? dict[key] : html.slice(openEnd, close.start);
    out += html.slice(close.start, close.end);
    cursor = close.end;
    openRe.lastIndex = close.end;
  }
  return out + html.slice(cursor);
}

// <title>/description/FAQPage config lives in tools/i18n-meta.js — shared with
// tools/check-meta-sync.js, which fails `npm run check` loudly if these ever
// drift out of sync with the live HTML (see that file's own header comment).
const { META, TITLE_EN, DESC_EN, OG_TITLE_EN, OG_DESC_EN, FAQ_KEYS } = require('./tools/i18n-meta');

function replaceIfPresent(html, from, to) { return html.includes(from) ? html.split(from).join(to) : html; }

// The per-page JSON-LD block (added separately, page by page) isn't wired
// into data-i18n at all, so localizeContent() above never touches it — without
// this it would ship English url/@id/inLanguage/breadcrumb text on the es/ca
// pages, silently wrong for crawlers. Parse + rewrite just the fields that are
// page/locale-specific; Organization/WebSite stay untouched (locale-invariant).
function localizeJsonLd(html, file, locale, title, desc) {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!m) return html;
  const data = JSON.parse(m[1]);
  const graph = data['@graph'] || [];
  const localeCanonical = canonicalFor(file, locale);
  const dict = DICTS[locale];
  const homeLabel = dict['nav.home'] != null ? dict['nav.home'] : 'Home';
  const pageLabel = title.replace(/ — Project Summit$/, '');

  graph.forEach((node) => {
    if (node['@type'] === 'WebPage' || node['@type'] === 'AboutPage') {
      node.url = localeCanonical;
      node['@id'] = localeCanonical + '#webpage';
      node.name = title;
      if (node.description) node.description = desc;
      node.inLanguage = locale;
    } else if (node['@type'] === 'SoftwareApplication') {
      node.description = desc;
    } else if (node['@type'] === 'Person') {
      node.url = localeCanonical;
      const role = dict['about.founder.role'];
      if (node.jobTitle && role) node.jobTitle = role.split(' · ')[0];
    } else if (node['@type'] === 'BreadcrumbList') {
      node.itemListElement.forEach((li) => {
        if (li.position === 1) { li.name = homeLabel; li.item = canonicalFor('index.html', locale); }
        else if (li.position === 2) { li.name = pageLabel; li.item = localeCanonical; }
      });
    } else if (node['@type'] === 'FAQPage') {
      node.url = localeCanonical;
      node['@id'] = localeCanonical + '#faqpage';
      node.mainEntity = node.mainEntity.map((q, i) => {
        const key = FAQ_KEYS[i];
        const qText = dict[key + '.q'];
        const aText = dict[key + '.a'];
        return {
          '@type': 'Question',
          name: qText != null ? qText : q.name,
          acceptedAnswer: { '@type': 'Answer', text: aText != null ? stripTags(aText) : q.acceptedAnswer.text },
        };
      });
    }
  });

  const rebuilt = '<script type="application/ld+json">\n' + JSON.stringify(data, null, 2) + '\n</script>';
  return html.slice(0, m.index) + rebuilt + html.slice(m.index + m[0].length);
}

function canonicalFor(file, locale) {
  const base = 'https://projectsummit.app/';
  if (file === 'index.html') return locale ? base + locale + '/' : base;
  return locale ? base + locale + '/' + file : base + file;
}
function altPathFor(file, locale) {
  if (file === 'index.html') return locale ? '/' + locale + '/' : '/';
  return locale ? '/' + locale + '/' + file : '/' + file;
}
function hreflangBlock(file) {
  const en = canonicalFor(file, null);
  return [
    `  <link rel="alternate" hreflang="en" href="${en}" />`,
    `  <link rel="alternate" hreflang="es" href="${canonicalFor(file, 'es')}" />`,
    `  <link rel="alternate" hreflang="ca" href="${canonicalFor(file, 'ca')}" />`,
    `  <link rel="alternate" hreflang="x-default" href="${en}" />`,
  ].join('\n');
}

// hreflang, data-alt-* body attributes, and the lang-routing script are
// identical across a page's en/es/ca variants, so they're added to the
// canonical (English) root pages ONCE, before locale copies are made — the
// copies just inherit them via generateLocaleShells() below.
function augmentRootShells() {
  for (const file of Object.keys(PAGES)) {
    const p = path.join(ROOT, file);
    let html = fs.readFileSync(p, 'utf8');
    const before = html;

    if (!html.includes('rel="alternate" hreflang=')) {
      html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, (m) => `${m}\n${hreflangBlock(file)}`);
    }
    if (!html.includes('data-alt-en=')) {
      html = html.replace(/<body([^>]*)>/, (m, attrs) =>
        `<body${attrs} data-alt-en="${altPathFor(file, null)}" data-alt-es="${altPathFor(file, 'es')}" data-alt-ca="${altPathFor(file, 'ca')}">`);
    }
    if (!html.includes('lang-routing.js')) {
      html = html.replace(
        '  <script src="assets/js/consent.js"></script>',
        '  <script src="assets/js/consent.js"></script>\n<script src="assets/js/lang-routing.js"></script>'
      );
    }

    if (html !== before) fs.writeFileSync(p, html);
  }
}

const SHELL_FILES = new Set(Object.keys(PAGES));
// Like reroot() above, but sibling shell pages (index.html, roadmap.html, …)
// stay as same-directory relative links (the es/ca copy sits next to them),
// while everything else (assets/, site.webmanifest, favicons) gets "../", and
// the Blog nav link is special-cased to the matching localized blog section.
function rerootShellLocale(html, locale) {
  return html.replace(/\b(href|src)="([^"]*)"/g, (whole, attr, val) => {
    if (/^(https?:|mailto:|tel:|data:|#|\/)/.test(val)) return whole;
    if (val === 'blog/index.html') return `${attr}="../blog/${locale}/index.html"`;
    if (SHELL_FILES.has(val.split('#')[0])) return whole;
    return `${attr}="../${val}"`;
  });
}

function localeTitle(file, locale) {
  if (file === 'index.html') {
    const tagline = DICTS[locale]['foot.tagline'];
    return 'Project Summit — ' + (tagline != null ? tagline : 'Train harder. Smarter.');
  }
  const cfg = META[file];
  const label = DICTS[locale][cfg.navKey];
  return (label != null ? label : cfg.navKey) + ' — Project Summit';
}
function localeDesc(file, locale) {
  const cfg = META[file];
  if (!cfg.descKey) return DESC_EN[file]; // no reviewed translation yet — keep English
  const v = DICTS[locale][cfg.descKey];
  const text = v != null ? v : DESC_EN[file];
  return cfg.stripDesc ? stripTags(text) : text;
}

function generateLocaleShells() {
  for (const file of Object.keys(PAGES)) {
    const enHtml = fs.readFileSync(path.join(ROOT, file), 'utf8');
    for (const locale of LOCALES) {
      let html = localizeContent(enHtml, DICTS[locale]);
      html = html.replace('<html lang="en"', `<html lang="${locale}"`);

      const title = localeTitle(file, locale);
      const desc = localeDesc(file, locale);
      html = replaceIfPresent(html, `<title>${TITLE_EN[file]}</title>`, `<title>${title}</title>`);
      html = replaceIfPresent(html, `content="${DESC_EN[file]}"`, `content="${desc}"`);
      html = replaceIfPresent(html, `content="${OG_TITLE_EN[file]}"`, `content="${title}"`);
      html = replaceIfPresent(html, `content="${OG_DESC_EN[file]}"`, `content="${desc}"`);
      // twitter:title/description are localized by rewriting their own tags —
      // explicitly, not by relying on their text happening to match
      // og:title/og:description (which the replaceIfPresent calls above key
      // off). This keeps them localized even if a page's Twitter copy ever
      // diverges textually from its OpenGraph copy.
      html = html.replace(/<meta name="twitter:title" content="[^"]*" \/>/, () => `<meta name="twitter:title" content="${title}" />`);
      html = html.replace(/<meta name="twitter:description" content="[^"]*" \/>/, () => `<meta name="twitter:description" content="${desc}" />`);
      html = localizeJsonLd(html, file, locale, title, desc);

      const canonical = canonicalFor(file, locale);
      html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`);
      html = html.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonical}" />`);

      html = rerootShellLocale(html, locale);

      const outDir = path.join(ROOT, locale);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, file), html);
    }
  }
  console.log(`locale shells — ${LOCALES.length} locales × ${Object.keys(PAGES).length} pages generated`);
}

augmentRootShells();
generateLocaleShells();
