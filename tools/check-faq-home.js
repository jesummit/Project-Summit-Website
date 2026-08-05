#!/usr/bin/env node
/* The home page's FAQ block (#faq-home) repeats a subset of faq.html's
   questions and answers verbatim, reusing the same data-i18n keys. That
   duplication drifts asymmetrically and silently: edit an answer in faq.html
   and the ES/CA copies follow (both pages read the same dictionary), while the
   ENGLISH text on the home page — which lives inline in the markup — quietly
   keeps saying the old thing. Nothing else catches it: check-i18n only asks
   whether a key has translations, and check-meta-sync only guards faq.html's
   own JSON-LD.

   Several of the duplicated answers are Hard Constraint surfaces (what the free
   tier includes, whether an Apple Watch is required, whether this is an "AI"
   app), so a stale copy is a false product claim, not a typo.

   Run by CI and locally (`npm run check`). */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
// Indentation differs between the two pages (the home block nests deeper), and
// it carries no meaning here — compare the text, not the layout.
const norm = (s) => s.replace(/\s+/g, ' ').trim();

// faq.html is the source of truth: it holds all 16 and owns the FAQPage JSON-LD.
function extract(html) {
  const out = {};
  for (const m of html.matchAll(/data-i18n="(faq\.q\d+\.q)">(.*?)<\/span>/gs)) out[m[1]] = norm(m[2]);
  // No faq-answer contains a nested <div>, so a lazy match to </div> is exact.
  for (const m of html.matchAll(/<div class="faq-answer" data-i18n="(faq\.q\d+\.a)">(.*?)<\/div>/gs)) out[m[1]] = norm(m[2]);
  return out;
}

const source = extract(read('faq.html'));
const home = extract(read('index.html'));
const keys = Object.keys(home).sort();

if (!keys.length) {
  console.log('faq-home check OK — index.html carries no FAQ block, nothing to compare.');
  process.exit(0);
}

let problems = 0;
for (const key of keys) {
  if (!(key in source)) {
    console.error(`MISSING     index.html uses ${key}, which faq.html does not define`);
    problems++;
  } else if (source[key] !== home[key]) {
    console.error(`DRIFTED     ${key} differs between faq.html and index.html`);
    console.error(`  faq.html   ${source[key]}`);
    console.error(`  index.html ${home[key]}`);
    problems++;
  }
}

if (problems) {
  console.error(`\nfaq-home check failed: ${problems} entr${problems === 1 ? 'y' : 'ies'} out of sync.`);
  console.error('Copy the text from faq.html into index.html verbatim — faq.html is the source of truth.');
  process.exit(1);
}
console.log(`faq-home check OK — ${keys.length / 2} question(s) on the home page match faq.html verbatim.`);
