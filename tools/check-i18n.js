#!/usr/bin/env node
/* Fail if any data-i18n key used in the pages is missing from ES or CA in
   assets/js/i18n.js. Run by CI and locally (`npm run check`). */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const src = fs.readFileSync(path.join(ROOT, 'assets/js/i18n.js'), 'utf8');
function block(name, next) {
  const head = 'var ' + name + ' = ';
  const s = src.indexOf(head) + head.length;
  const e = src.indexOf(';\n\n  var ' + next, s);
  return JSON.parse(src.slice(s, e));
}
const ES = block('ES', 'CA');
const CA = block('CA', 'DICT');

const pages = ['index', 'roadmap', 'faq', 'about', 'ambassadors', 'terms', 'privacy-policy'];
let missing = 0;
pages.forEach((p) => {
  const html = fs.readFileSync(path.join(ROOT, p + '.html'), 'utf8');
  const keys = [...new Set([...html.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]))];
  keys.forEach((k) => {
    if (ES[k] == null) { console.error(`MISSING ES  ${p}  ${k}`); missing++; }
    if (CA[k] == null) { console.error(`MISSING CA  ${p}  ${k}`); missing++; }
  });
});

if (missing) { console.error(`\ni18n check failed: ${missing} missing translation(s).`); process.exit(1); }
console.log('i18n check OK — every data-i18n key has ES + CA.');
