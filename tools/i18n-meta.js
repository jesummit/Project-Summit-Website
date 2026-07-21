/* Shared data for build.js's locale-shell generator AND
 * tools/check-meta-sync.js. Pure data/config only — no side effects — so it
 * can be required by the read-only checker without triggering a build.
 *
 * These are copies of English strings that live in the actual page HTML
 * (<title>, meta description, og:/twitter: tags) and of the order faq.html's
 * hand-authored FAQPage JSON-LD lists its questions in. If a page's copy
 * changes without updating the matching entry here, the build silently stops
 * localizing that field — tools/check-meta-sync.js (run by `npm run check`)
 * exists specifically to catch that drift instead of letting it pass quietly.
 */
'use strict';

// <title>/description are composed from copy that's already translated and
// reviewed elsewhere on the page (nav labels, the page's own "sub" line, or a
// dedicated translated meta key) — not new marketing copy invented at build
// time. `descKey: null` means no reviewed translation exists yet, so the
// English description is kept as-is until real translated copy is written.
const META = {
  'index.html':          { navKey: null,             descKey: 'hero.prod.sub' },
  'roadmap.html':        { navKey: 'nav.roadmap',     descKey: 'roadmap.sub' },
  'faq.html':            { navKey: 'nav.faq',         descKey: 'faq.sub', stripDesc: true },
  'about.html':          { navKey: 'nav.about',       descKey: 'about.sub' },
  'ambassadors.html':    { navKey: 'nav.ambassadors', descKey: 'amb.sub' },
  'terms.html':          { navKey: 'nav.terms',       descKey: 'terms.metadesc' },
  'privacy-policy.html': { navKey: 'nav.privacy',     descKey: 'privacy.metadesc' },
};
const TITLE_EN = {
  'index.html': 'Project Summit — Adaptive Cycling Training App for iOS',
  'roadmap.html': 'Roadmap — Project Summit',
  'faq.html': 'FAQ — Project Summit',
  'about.html': 'About — Project Summit',
  'ambassadors.html': 'Ambassadors — Project Summit',
  'terms.html': 'Terms of Service — Project Summit',
  'privacy-policy.html': 'Privacy Policy — Project Summit',
};
const DESC_EN = {
  'index.html': 'An adaptive iOS training platform for serious cyclists. Summit reads your recovery and schedule, then rewrites your plan like a coach would. On the App Store.',
  'roadmap.html': "What's built, what's coming, and where Project Summit is headed.",
  'faq.html': 'Frequent questions about Summit — the adaptive cycling training app.',
  'about.html': "Why Jordi Espanyol built Summit — and the problem it's solving for serious amateur cyclists.",
  'ambassadors.html': "Ride with Summit. Share it with your community. We're looking for cyclists who train seriously and love talking about it.",
  'terms.html': 'Project Summit Terms of Service. Simple, clear, and fair.',
  'privacy-policy.html': 'Privacy Policy for Project Summit — the adaptive iOS cycling training platform. Learn how we collect, use, and protect your personal data.',
};
// index.html's <title> differs from its og:title/twitter:title (a punchier
// tagline); every other page reuses the same string in all four spots.
const OG_TITLE_EN = Object.assign({}, TITLE_EN, { 'index.html': 'Summit — A plan that adapts to your body and your life' });
const OG_DESC_EN = Object.assign({}, DESC_EN, { 'index.html': 'Deterministic sport science, not a chatbot. Reads your recovery, rewrites your week. Now on the App Store, iOS.' });

// Matches the order the FAQPage Question/Answer pairs were hand-authored in
// faq.html's JSON-LD (which follows the page's category order, not numeric
// key order — q15 sits between q8 and q9). Keep in sync if faq.html's
// mainEntity list is reordered — check-meta-sync.js verifies this.
const FAQ_KEYS = ['faq.q1', 'faq.q2', 'faq.q3', 'faq.q4', 'faq.q5', 'faq.q6', 'faq.q7', 'faq.q8', 'faq.q15', 'faq.q9', 'faq.q10', 'faq.q11', 'faq.q12', 'faq.q13', 'faq.q14'];

module.exports = { META, TITLE_EN, DESC_EN, OG_TITLE_EN, OG_DESC_EN, FAQ_KEYS };
