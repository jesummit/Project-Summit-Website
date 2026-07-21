#!/usr/bin/env node
/* Catches a specific silent-drift risk introduced by build.js's locale-shell
 * generator: TITLE_EN/DESC_EN/OG_TITLE_EN/OG_DESC_EN (tools/i18n-meta.js) are
 * hand-kept copies of each page's real <title>/meta/OG/Twitter text, and
 * FAQ_KEYS is a hand-kept copy of the order faq.html's JSON-LD lists its
 * questions in. If a page's copy changes without updating the matching
 * entry, build.js's es/ca generator quietly stops localizing that field (or
 * misaligns FAQ answers) instead of failing — this check makes that loud.
 * Run by CI and locally (`npm run check`). */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { TITLE_EN, DESC_EN, OG_TITLE_EN, OG_DESC_EN, FAQ_KEYS } = require('./i18n-meta');

let problems = 0;
const fail = (msg) => { console.error('DRIFT  ' + msg); problems++; };

for (const file of Object.keys(TITLE_EN)) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (!html.includes(`<title>${TITLE_EN[file]}</title>`)) {
    fail(`${file}: TITLE_EN in tools/i18n-meta.js no longer matches the page's <title>`);
  }
  if (DESC_EN[file] && !html.includes(`content="${DESC_EN[file]}"`)) {
    fail(`${file}: DESC_EN in tools/i18n-meta.js no longer matches the page's meta description`);
  }
  if (OG_TITLE_EN[file] && !html.includes(`content="${OG_TITLE_EN[file]}"`)) {
    fail(`${file}: OG_TITLE_EN in tools/i18n-meta.js no longer matches og:title/twitter:title`);
  }
  if (OG_DESC_EN[file] && !html.includes(`content="${OG_DESC_EN[file]}"`)) {
    fail(`${file}: OG_DESC_EN in tools/i18n-meta.js no longer matches og:description/twitter:description`);
  }
}

// Extract the visible answer text for a faq.<key>.a block (strip tags +
// normalise whitespace) so the FAQPage JSON-LD answer can be checked against
// the on-page copy Google will compare it to.
function faqVisibleAnswer(html, key) {
  const marker = `data-i18n="${key}.a">`;
  const i = html.indexOf(marker);
  if (i < 0) return null;
  const start = i + marker.length;
  let depth = 1, j = start;
  const re = /<\/?div\b[^>]*>/g; re.lastIndex = start;
  let m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith('</')) { depth--; if (depth === 0) { j = m.index; break; } }
    else depth++;
  }
  return html.slice(start, j).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&')
             .replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

// FAQ_KEYS must match faq.html's own hand-authored FAQPage question order.
const faqHtml = fs.readFileSync(path.join(ROOT, 'faq.html'), 'utf8');
const ldMatch = faqHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
const faqNode = ldMatch && JSON.parse(ldMatch[1])['@graph'].find((n) => n['@type'] === 'FAQPage');
if (!faqNode) {
  fail('faq.html: no FAQPage JSON-LD found to cross-check FAQ_KEYS against');
} else if (faqNode.mainEntity.length !== FAQ_KEYS.length) {
  fail(`faq.html: FAQPage lists ${faqNode.mainEntity.length} questions but FAQ_KEYS (tools/i18n-meta.js) has ${FAQ_KEYS.length} — update FAQ_KEYS`);
} else {
  faqNode.mainEntity.forEach((q, i) => {
    const key = FAQ_KEYS[i];
    const m = faqHtml.match(new RegExp(`data-i18n="${key}\\.q">([^<]*)`));
    if (!m) { fail(`faq.html: no data-i18n="${key}.q" element found for FAQ_KEYS[${i}]`); return; }
    if (m[1] !== q.name) {
      fail(`faq.html: FAQ_KEYS[${i}] ('${key}') is question "${m[1]}", but the JSON-LD at position ${i} is "${q.name}" — reorder FAQ_KEYS in tools/i18n-meta.js to match`);
    }
    // The JSON-LD answer text must match the visible <details> answer verbatim,
    // or Google flags the FAQPage markup as not matching on-page content.
    const ans = q.acceptedAnswer && q.acceptedAnswer.text;
    const vis = faqVisibleAnswer(faqHtml, key);
    if (vis == null) {
      fail(`faq.html: no data-i18n="${key}.a" answer element found for FAQ_KEYS[${i}]`);
    } else if (ans !== vis) {
      fail(`faq.html: FAQPage answer for '${key}' does not match the visible answer text — re-sync the JSON-LD acceptedAnswer to the on-page <details> copy`);
    }
  });
}

if (problems) { console.error(`\nmeta/FAQ sync check failed: ${problems} drift(s).`); process.exit(1); }
console.log('meta/FAQ sync check OK — tools/i18n-meta.js matches the live HTML.');
