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
 * Blog pages live one level deep in blog/, and the comparison cluster likewise
 * in compare/. The partials use root-relative paths (index.html, assets/…), so
 * for those pages the injected shell is re-rooted with a "../" prefix (and
 * "../../" for their es/ca sub-directories). The page body itself is authored
 * with correct paths and is left untouched.
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
  'pricing.html': 'pricing',
  'about.html': 'about',
  'ambassadors.html': 'ambassadors',
  'changelog.html': 'changelog',
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
  'blog/apple-watch-sleep-recovery-cycling.html': 'blog',
  'blog/es/index.html': 'blog',
  'blog/es/gran-diagonal-999km-portugal.html': 'blog',
  'blog/es/periodization-base-build-peak.html': 'blog',
  'blog/es/taper-and-peak-tsb.html': 'blog',
  'blog/es/cycling-in-the-heat-hydration-sodium.html': 'blog',
  'blog/es/apple-watch-sleep-recovery-cycling.html': 'blog',
  'blog/ca/index.html': 'blog',
  'blog/ca/gran-diagonal-999km-portugal.html': 'blog',
  'blog/ca/periodization-base-build-peak.html': 'blog',
  'blog/ca/taper-and-peak-tsb.html': 'blog',
  'blog/ca/cycling-in-the-heat-hydration-sodium.html': 'blog',
  'blog/ca/apple-watch-sleep-recovery-cycling.html': 'blog',
};

// Comparison cluster (compare/). Structurally identical to BLOG_PAGES — long-form
// prose pages one directory deep, with hand-translated es/ca twins at their own
// URLs — so it rides the exact same processPages()/reroot() machinery. It is a
// SEPARATE map rather than more entries in BLOG_PAGES because the two clusters
// are different sections of the site (different URL root, different nav key,
// different docs) and tools/check-links.js globs them as separate directory
// sets; folding them together would make "the blog" mean two things.
//
// The 'compare' key lights up $$compare$$ in the header's "More" dropdown and
// mobile menu — the cluster earned a nav slot on 2026-08-06, once it had five
// pages. Before that it was footer-only and the token did not exist.
const COMPARE_PAGES = {
  'compare/index.html': 'compare',
  'compare/summit-vs-whoop.html': 'compare',
  'compare/summit-vs-trainingpeaks.html': 'compare',
  'compare/summit-vs-strava.html': 'compare',
  'compare/whoop-alternatives-no-subscription.html': 'compare',
  'compare/free-hrv-recovery-apps-iphone.html': 'compare',
  'compare/es/index.html': 'compare',
  'compare/es/summit-vs-whoop.html': 'compare',
  'compare/es/summit-vs-trainingpeaks.html': 'compare',
  'compare/es/summit-vs-strava.html': 'compare',
  'compare/es/whoop-alternatives-no-subscription.html': 'compare',
  'compare/es/free-hrv-recovery-apps-iphone.html': 'compare',
  'compare/ca/index.html': 'compare',
  'compare/ca/summit-vs-whoop.html': 'compare',
  'compare/ca/summit-vs-trainingpeaks.html': 'compare',
  'compare/ca/summit-vs-strava.html': 'compare',
  'compare/ca/whoop-alternatives-no-subscription.html': 'compare',
  'compare/ca/free-hrv-recovery-apps-iphone.html': 'compare',
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
processPages(COMPARE_PAGES);
const total = Object.keys(PAGES).length + Object.keys(BLOG_PAGES).length + Object.keys(COMPARE_PAGES).length;
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

// The site's public origin, with trailing slash. Single copy on purpose — the
// canonical/hreflang tags and the generated llms.txt must never disagree about
// where this site lives.
const ORIGIN = 'https://projectsummit.app/';
function canonicalFor(file, locale) {
  if (file === 'index.html') return locale ? ORIGIN + locale + '/' : ORIGIN;
  return locale ? ORIGIN + locale + '/' + file : ORIGIN + file;
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

// App screenshots carry the app's own UI text, so they're localized too:
// assets/screenshots/<locale>/<file>.webp overrides the flat
// assets/screenshots/<file>.webp for that locale. Only files that actually
// exist on disk are pointed at — a locale with no override directory keeps the
// flat fallback, so this is a no-op until captures are dropped in (and
// tools/check-links.js never sees a path that doesn't resolve).
//
// This is done at BUILD time and deliberately not at runtime: the hero's centre
// phone is the page's LCP image and carries fetchpriority="high", so swapping
// its src from JS would fetch the wrong-language capture first and then a
// second one — a doubled LCP plus a visible flash of the wrong language. The
// static file must ship the right src already.
//
// The matcher works off the basename and tolerates an already-localized path,
// so re-running resolves en/es/ca/<file> to the current locale instead of
// nesting — the build stays idempotent.
const SCREENSHOT_DIR = 'assets/screenshots';
function localizeScreenshots(html, locale) {
  const re = new RegExp('\\bsrc="' + SCREENSHOT_DIR + '/(?:(?:en|es|ca)/)?([^"/]+)"', 'g');
  return html.replace(re, (whole, base) => {
    const localized = SCREENSHOT_DIR + '/' + locale + '/' + base;
    return fs.existsSync(path.join(ROOT, localized))
      ? `src="${localized}"`
      : `src="${SCREENSHOT_DIR}/${base}"`;
  });
}

// ============================================================================
// Changelog: changelog.html (+ its es/ca twins) is a normal shell page whose
// #changelog-entries container is filled here, per locale, from
// tools/changelog-content.js.
//
// The release history deliberately does NOT live in assets/js/i18n.js: that
// dictionary is the site's UI strings, a bounded set every page shares, while
// this grows by one entry with every App Store release and is used on exactly
// one page. Same generated-from-a-data-module pattern as llms.txt above.
//
// Rendering is idempotent: the container's existing children are REPLACED (the
// closing </div> is found depth-aware, so the nested markup of a previous run
// doesn't confuse it), which is what lets `node build.js` twice be a no-op.
const { SECTION_LABELS, CLOSING, MONTHS, RELEASES } = require('./tools/changelog-content');
const CHANGELOG_FILE = 'changelog.html';
const CHANGELOG_ID = 'changelog-entries';

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// "2026-07-29" -> "29 July 2026" / "29 de julio de 2026" / "29 de juliol de
// 2026". Catalan elides the article before a vowel-initial month (d'agost).
function formatReleaseDate(iso, locale) {
  const [y, m, d] = iso.split('-').map(Number);
  const month = MONTHS[locale][m - 1];
  if (locale === 'en') return `${d} ${month} ${y}`;
  const article = (locale === 'ca' && /^[aeiouàèéíòóú]/i.test(month)) ? "d'" : 'de ';
  return `${d} ${article}${month} de ${y}`;
}

function renderChangelogEntries(locale) {
  const out = [];
  RELEASES.forEach((release, i) => {
    const anchor = 'v' + release.version.replace(/\./g, '-');
    out.push(`    <article class="release${i === 0 ? ' release--latest' : ''}" id="${anchor}">`);
    out.push('      <span class="release-dot" aria-hidden="true"></span>');
    out.push('      <div class="release-head">');
    out.push(`        <h2 class="release-version">${escapeHtml(release.version)}</h2>`);
    // Undated releases render with the version alone — no date is invented to
    // fill the slot (only 1.0 and 1.4.0 have a sourced release date).
    if (release.date) {
      out.push(`        <time class="release-date" datetime="${release.date}">${escapeHtml(formatReleaseDate(release.date, locale))}</time>`);
    }
    out.push('      </div>');

    const groups = release.groups[locale];
    if (!groups) throw new Error(`changelog: release ${release.version} has no "${locale}" copy`);
    for (const group of groups) {
      const label = SECTION_LABELS[group.section];
      if (!label) throw new Error(`changelog: release ${release.version} uses unknown section "${group.section}"`);
      out.push(`      <section class="release-group release-group--${group.section}">`);
      out.push(`        <h3 class="release-label">${escapeHtml(label[locale])}</h3>`);
      out.push('        <ul class="release-list">');
      for (const item of group.items) out.push(`          <li>${escapeHtml(item)}</li>`);
      out.push('        </ul>');
      out.push('      </section>');
    }

    if (release.closing) out.push(`      <p class="release-closing">${escapeHtml(CLOSING[locale])}</p>`);
    out.push('    </article>');
  });
  return out.join('\n');
}

function renderChangelog(html, locale) {
  const m = html.match(new RegExp('<div id="' + CHANGELOG_ID + '"[^>]*>'));
  if (!m) throw new Error(`changelog.html: no <div id="${CHANGELOG_ID}"> container to render into`);
  const openEnd = m.index + m[0].length;
  const close = findMatchingClose(html, openEnd, 'div');
  return html.slice(0, openEnd) + '\n' + renderChangelogEntries(locale) + '\n  ' + html.slice(close.start);
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
    // The root pages ARE the English variant, so they get the en/ overrides.
    html = localizeScreenshots(html, 'en');
    if (file === CHANGELOG_FILE) html = renderChangelog(html, 'en');

    if (html !== before) fs.writeFileSync(p, html);
  }
}

const SHELL_FILES = new Set(Object.keys(PAGES));
// Like reroot() above, but sibling shell pages (index.html, roadmap.html, …)
// stay as same-directory relative links (the es/ca copy sits next to them),
// while everything else (assets/, site.webmanifest, favicons) gets "../", and
// any blog link is redirected to that locale's copy of the same page.
function rerootShellLocale(html, locale) {
  return html.replace(/\b(href|src)="([^"]*)"/g, (whole, attr, val) => {
    if (/^(https?:|mailto:|tel:|data:|#|\/)/.test(val)) return whole;
    // The content clusters each keep one directory per locale (blog/, blog/es/,
    // blog/ca/ — and the same shape under compare/) with identical filenames, so
    // the locale segment is the only difference: a shell page linking
    // <cluster>/<page> must land on <cluster>/<locale>/<page>, never the English
    // original. Deliberately generic rather than a per-link special case — an
    // untranslated page would otherwise be linked in English from the es/ca
    // pages with nothing to catch it. If a translation is missing,
    // tools/check-links.js fails on the resulting path.
    const clusterPage = val.match(/^(blog|compare)\/(.+)$/);
    if (clusterPage) return `${attr}="../${clusterPage[1]}/${locale}/${clusterPage[2]}"`;
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

      // Before rerootShellLocale(), while the paths are still root-relative —
      // the "../" prefixing then applies to the localized path as usual.
      html = localizeScreenshots(html, locale);
      // Replaces the English entries this file inherited from the root page
      // with the same releases in `locale` (the changelog copy lives in
      // tools/changelog-content.js, not in the data-i18n dictionary, so
      // localizeContent() above leaves it untouched).
      if (file === CHANGELOG_FILE) html = renderChangelog(html, locale);
      html = rerootShellLocale(html, locale);

      const outDir = path.join(ROOT, locale);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, file), html);
    }
  }
  console.log(`locale shells — ${LOCALES.length} locales × ${Object.keys(PAGES).length} pages generated`);
}

// ============================================================================
// llms.txt: a curated map of the site for AI answer engines, so they can cite
// the real pages instead of paraphrasing whatever they happened to crawl.
//
// GENERATED, never hand-maintained — deliberately. A hand-kept file is a second
// copy of the product's claims sitting outside every check the pages get, and
// it drifts silently: the competitor we studied still advertises a 30-day trial
// in theirs while every page of their site says 14 days. Here the copy lives in
// tools/llms-content.js, the URLs are built from the same ORIGIN as the
// canonical tags, every linked path is asserted to exist on disk before a byte
// is written, and CI re-runs this build and fails if the committed llms.txt
// differs. Edit tools/llms-content.js and rebuild; don't touch llms.txt.
const { TITLE: LLMS_TITLE, INTRO: LLMS_INTRO, BODY: LLMS_BODY, SECTIONS: LLMS_SECTIONS } = require('./tools/llms-content');

// "/" -> index.html, "/es/" -> es/index.html, "/blog/x.html" -> blog/x.html.
function llmsLocalPath(sitePath) {
  if (!sitePath.startsWith('/')) throw new Error(`llms-content.js: path "${sitePath}" must start with "/"`);
  const rel = sitePath.slice(1);
  return rel === '' || rel.endsWith('/') ? rel + 'index.html' : rel;
}

function generateLlmsTxt() {
  const lines = ['# ' + LLMS_TITLE, '', '> ' + LLMS_INTRO, '', LLMS_BODY];

  for (const section of LLMS_SECTIONS) {
    lines.push('', '## ' + section.heading, '');
    for (const link of section.links) {
      // Assert before writing: a dead link in the file we hand to answer
      // engines is the whole failure mode this generator exists to prevent.
      const local = llmsLocalPath(link.path);
      if (!fs.existsSync(path.join(ROOT, local))) {
        throw new Error(`llms.txt: "${link.path}" (${link.label}) resolves to ${local}, which does not exist — fix the path in tools/llms-content.js`);
      }
      lines.push(`- [${link.label}](${ORIGIN + link.path.slice(1)}): ${link.blurb}`);
    }
  }

  fs.writeFileSync(path.join(ROOT, 'llms.txt'), lines.join('\n') + '\n');
  const count = LLMS_SECTIONS.reduce((n, s) => n + s.links.length, 0);
  console.log(`llms.txt — ${LLMS_SECTIONS.length} sections, ${count} links (all verified on disk)`);
}

augmentRootShells();
generateLocaleShells();
generateLlmsTxt();
