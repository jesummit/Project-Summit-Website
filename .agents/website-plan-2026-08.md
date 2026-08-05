# Website Plan — projectsummit.app

**Date:** 2026-08-05 · **Status:** proposal, nothing implemented
**Inputs:** `.agents/product-marketing.md` v3 (Hard Constraints) ·
`research/competitor-stride-2026-08.md` · `research/funnel-analysis-2026-08.md` ·
`research/aso-audit-2026-08.md` · live render of the site at 1440×900 and 390×844

Everything below is ordered **simplest first**. Levels are about *implementation cost
and blast radius*, not importance — the highest-value item on the list (L4-01, the
comparison cluster) sits in the middle, and several one-hour fixes at the top matter
more than anything in L5.

Each item carries: **effort**, **files**, **constraint** (the Hard Constraint it must be
written against, where one applies), and **depends on** where relevant.

> **The one-line diagnosis.** The site is well built and well designed — the design
> system, i18n, privacy posture and build tooling are all above the standard of the
> category. It has two problems, and neither is a design problem: **nobody arrives**
> (6 Google visitors in 90 days, no comparison/query-matching surface at all), and **the
> few who do arrive meet placeholder proof** (five hardcoded stars, Spanish screenshots
> on the English page). Fix the credibility leaks first because they're cheap; then
> spend the real effort on arrival.

---

## Level 0 — Corrections (under an hour each, do these first)

These are not improvements. They are things currently wrong on a live page.

### L0-01 · Remove the hardcoded five-star rows ⚠️
`app.js renderStars()` unconditionally paints **five filled stars** into `#stars-prod`
(directly beside the App Store badge in the hero) and `#stars-cta` (final CTA). There is
no rating behind them. Rendered at 1440px, the hero reads as *★★★★★ Available now ·
iPhone* — a five-star rating claim to any visitor, and to any screenshot of the page.

We already refuse to put `aggregateRating` in JSON-LD for exactly this reason. Painting
the same claim in pixels instead of markup is the same claim.

Replace with the availability text alone until `initRatingBadge()` has a real App Store
rating to show — that mechanism already exists and already hides itself below 1 rating.

- **Effort:** 20 min · **Files:** `assets/js/app.js` (drop `renderStars`), `index.html`
  (two `<span class="stars">`), `assets/css/summit.css` (retire `.stars`)
- **Constraint:** *no fabricated review markup / ratings are placeholder*

### L0-02 · The English page ships Spanish app screenshots
Every hero phone and every carousel frame is a Spanish build: *"Martes. work done."*,
*"Todoterreno."*, *RECUPERACIÓN*, *Descarga pre-carrera*, *MÉTRICAS DE SALUD*. The
English homepage is the canonical URL, the one Google indexes and the one `x-default`
points at. An English-speaking visitor sees a product that appears not to be in English.

Short term: shoot the EN set and swap by language the same way `updateBadges()` already
swaps App Store artwork by language and surface. Long term this is L3-03.

- **Effort:** 30 min of code once the EN captures exist (the capture itself is app-side
  work, not website work) · **Files:** `assets/screenshots/`, `assets/js/app.js`
- **Note:** the carousel frames also show a **"COACH · APPLE INTELLIGENCE"** label. That
  is the app's own UI, not site copy, so it isn't a site fix — but it sits directly
  under a headline that says *"Not AI. Not a chatbot."* Worth a decision in the app
  repo about which frames we choose to show.
- **Constraint:** *never call the product AI*

### L0-03 · Cookie banner covers the product shot on first paint
At both 1440×900 and 390×844 the consent banner lands on top of the hero phones — the
first impression of the product is a dialog over it. On mobile it obscures the entire
device mockup.

Delay it (2–3 s or first scroll) and, on mobile, dock it to the bottom edge as a compact
bar rather than a floating card over content. No consent-logic change; nothing is
captured before acceptance either way.

- **Effort:** 45 min · **Files:** `assets/js/consent.js`, `assets/css/summit.css`

### L0-04 · `robots.txt` — allow answer engines explicitly
Four lines today. Stride's is a strategy document: explicit `Allow` for GPTBot,
OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended.

Default-allow already permits them, but explicit rules are what these crawlers'
operators document, and it costs one file.

Their companion move — `Disallow` for AhrefsBot/SemrushBot — is **not** recommended for
us: at our size, being visible in competitors' link tools is worth more than the
secrecy, and it's how prospective partners and directories find sites.

- **Effort:** 15 min · **Files:** `robots.txt`

### L0-05 · Retire the version number in the features eyebrow
`WHAT'S IN V1.4` goes stale the moment v1.5 ships, on a page nobody re-audits. Either
make it generic or point it at the changelog once L2-04 exists.

- **Effort:** 10 min · **Files:** `index.html`, `assets/js/i18n.js` · **Depends on:** L2-04 (optional)

---

## Level 1 — Quick wins (half a day each)

### L1-01 · `llms.txt`
A curated map for answer engines: one paragraph of what Summit is, then grouped links
(Start here / How it works / Free tier / Guides / Compare). Stride's is 4 KB and is
visibly written to be quoted.

Ours has an angle theirs does not: it can state the free tier and the *deterministic,
non-LLM* mechanism in the exact words we want an assistant to repeat.

**Generate it, don't hand-write it.** Their own `llms.txt` says "30-day free trial" while
every page says 14 days — hand-maintained parallel copy drifts. Emit it from `build.js`
and gate it in `npm run check`.

- **Effort:** 3 h · **Files:** `llms.txt` (generated), `build.js`, `tools/check-llms.js`, `package.json`
- **Constraint:** *free tier is not a trial; no AI framing*

### L1-02 · Homepage FAQ block
Our single best objection-handling copy (`faq.q2` on "is this an AI wrapper", `q12`/`q16`
on free-vs-trial, `q6` on the Watch) lives on a page most visitors never reach. Stride
answers *"How is Stride different from TrainingPeaks or TrainerRoad?"* **on the
homepage**, at the decision point.

6–8 questions, reusing existing `faq.*` i18n keys so ES/CA come free. Add `FAQPage`
JSON-LD to `index.html` — text must stay verbatim with the visible copy, same rule as
`faq.html` today.

- **Effort:** 4 h · **Files:** `index.html`, `assets/js/i18n.js`, `tools/i18n-meta.js`
- **Constraint:** *free-tier scope exact; no Watch app implied*

### L1-03 · "From download to first plan" — four steps
The homepage explains *how the engine thinks* and never *what happens after you tap
Download*. Stride gives this a whole section, and it answers the "another app in my
stack" objection our own context doc lists.

Four steps: download → connect Strava + allow Health → tell it your week and your target
event → it plans, and rewrites when the week breaks. Reuses the existing numbered-card
pattern from the features grid.

- **Effort:** 4 h · **Files:** `index.html`, `assets/js/i18n.js`, `assets/css/summit.css`
- **Constraint:** *no Watch app; Apple Watch not required*

### L1-04 · Sticky App Store CTA on mobile
On a 390×844 screen the badge sits ~500 px down and leaves the viewport immediately.
Measured behaviour says the CTA converts when seen (14 of 33 clicked, 42%) — the problem
is exposure, and this is the cheapest exposure we can buy.

A slim bottom bar on mobile only, appearing after the hero scrolls past. Must not
collide with L0-03's docked consent bar — build them together.

- **Effort:** 3 h · **Files:** `partials/footer.html` or `index.html`, `summit.css`, `app.js` (keep the `?pt=…&ct=web&mt=8` campaign query and a distinct `data-source`)

### L1-05 · Human-support line
Stride converts "tiny team" into "a human answers, no bots, no ticket queues". We carry
the same weakness with none of the upside, and our own switching research lists *"will it
still be here in a year?"* as a live anxiety for a solo-founder app.

One short block near the final CTA — only if the response-time promise is one we'll keep.

- **Effort:** 2 h · **Files:** `index.html`, `assets/js/i18n.js`

---

## Level 2 — New sections and pages on existing infrastructure

### L2-01 · Feature grid needs a visual anchor
The `#features` grid is six text cards — no icon, no chart, no screenshot. It's the
longest unbroken wall of prose on the page, and it's where a skimmer decides.

Not a redesign: one small visual per card inside the existing card frame. The strongest
option is a **real fragment of app UI** (a TSB curve, a power curve, a recovery ring)
cropped from the screenshots we already ship — proof and decoration in one asset. Keep
them monochrome-plus-accent so the editorial restraint survives.

- **Effort:** 1 day + asset prep · **Files:** `index.html`, `summit.css`, `assets/img/`
- **Depends on:** L0-02 (use EN captures)

### L2-02 · Named training blocks as countable inventory
Every Stride plan card carries an author and three numbers — *4 weeks · 3 h/week ·
162 TS/week*. It turns "a plan" into something you can count. Our equivalent claim,
"advanced periodisation", is an adjective.

Show the blocks the engine actually builds — Base 12 weeks, Build 6 weeks, Peak 4 weeks,
Taper — with duration and weekly-hours range. Fits `index.html` or `pricing.html`.

- **Effort:** 1 day · **Files:** `pricing.html` or `index.html`, `i18n.js`
- **Constraint:** *only blocks the shipped engine actually builds; Elite-gated, so label the tier*

### L2-03 · Section rhythm and scroll pacing
The homepage is 7,671 px tall at 1440 and nearly every section is the same recipe:
mono eyebrow → serif headline → grid, on the same `--bg`. It reads calm and uniform;
by section five it reads *undifferentiated*.

Cheap fixes inside the existing token system, no rebrand:
- alternate `--bg` / `--bg-soft` per section so boundaries are felt
- vary block width — the eight-item "Is this for you?" list and the six-card grid share
  one rhythm and shouldn't
- give `#free` (the strongest differentiator on the page) a distinct treatment; today it
  is styled like everything around it
- **Never hardcode hex** — tokens only, so dark mode survives (`CLAUDE.md`)

- **Effort:** 1–2 days · **Files:** `summit.css`, `index.html`

### L2-04 · `/changelog.html`
Stride publishes a monthly changelog, grouped New / Improved / Fixed, and leans on it in
their FAQ. It does three jobs: indexable fresh content, proof the product is alive, and
the direct answer to the longevity anxiety.

We ship real versions (v1.4.0, 2026-07-29) and publish none of it. Build it as a normal
shell page so header/footer/i18n/hreflang come free; seed from v1.0→v1.4 release notes;
add to `PAGES` in `build.js`, `sitemap.xml`, and `tools/i18n-meta.js`.

- **Effort:** 1 day + seed content · **Files:** `changelog.html`, `build.js`,
  `tools/i18n-meta.js`, `sitemap.xml`, `partials/footer.html`
- **Constraint:** *describe only what shipped — a changelog listing roadmap items is worse than no changelog*

### L2-05 · Per-page OG images
Every page shares one `og-image.png`. We're already ahead of Stride here (theirs is a
bare `logo.png` in the social-card slot), and per-page cards would extend it — the
homepage, the blog index and each post deserve distinct previews given that Instagram is
our only working channel.

- **Effort:** 1 day for a template + generation · **Files:** `assets/img/og/`, per-page meta, `build.js`

---

## Level 3 — Content and asset production (weeks, mostly not code)

### L3-01 · Event-guide content track, ES/CA first ⭐
Stride's highest-intent content is event-targeted: *La Marmotte training and power-pacing
guide*, *Ironman 70.3 bike pacing by power*. Someone searching "Quebrantahuesos power
pacing" is exactly our ICP, in buying season.

**This is our single strongest asymmetric play.** Stride's site is English-only. Our
measured traffic is Instagram-driven and Spanish-speaking. Quebrantahuesos, La Marxa
Cerdanya, La Mussara, Sea Otter Girona, La Traka — in Spanish and Catalan, a lane an
English-only competitor cannot enter without rebuilding their site.

Note the deviation from `docs/blog.md`: the blog is English-first with hand-translated
ES/CA. For event guides, drafting **ES-first** is the right call and should be an
explicit, documented exception rather than a silent one.

- **Effort:** 6–8 h/post, target 2/month · **Constraint:** *"the engine"/"the algorithm", never AI*

### L3-02 · Testimonial pipeline via `ambassadors.html` ⭐
Stride runs 8 named testimonials — and notably, none are elite. They're time-crunched
amateurs, the ICP mirrored back at the reader.

We have **zero**, and the Hard Constraints correctly forbid inventing any. The fix is a
pipeline, not copy: the ambassadors page already exists as a recruitment surface — add a
consented "how do you use it" step, and a short interview format on the blog.

Target: 3 named quotes with role and photo by end of Q3. Until they exist, proof comes
from mechanism and founder credibility. **Do not shortcut this one.**

- **Effort:** ongoing · **Constraint:** *no testimonials exist — do not fabricate*

### L3-03 · English (and Catalan) app screenshot sets
The permanent fix behind L0-02. A full EN capture set for hero and carousel, swapped by
language like the App Store badges already are.

The same shoot produces the **App Store preview video** flagged as missing in
`aso-audit-2026-08.md` (Visual Assets scored 6/10 on its absence) and the demo video in
L4-03 — one production, three deliverables.

- **Effort:** 2–3 days including capture · **Depends on:** app-side work

---

## Level 4 — Structural additions (the growth engine)

### L4-01 · Comparison cluster ⭐⭐ — the highest-value item on this list
13 comparison pages for them, **zero** for us, and Google sends us 6 visitors a quarter.
The SEO machinery is already built — per-locale URLs, hreflang, JSON-LD, canonical,
sitemap. It is ranking for nothing because there is no page matching a query anyone types.

**Do not clone their list.** They compete on "AI planning"; we compete on a permanent free
recovery tier and a deterministic engine. Pick the axis we win on:

1. `summit-vs-whoop` — *"they charge monthly for what your watch already measures"*. Our
   strongest single argument, and their VOC quotes ("lost all confidence in the system")
   are already collected in `voc-cycling-recovery-2026-08.md`.
2. `whoop-alternatives-no-subscription` — category listicle, same wedge
3. `free-hrv-recovery-apps-iphone` — pure free-tier query
4. `summit-vs-trainingpeaks` — "they describe, we decide"
5. `summit-vs-strava` — highest-volume query in the category

Steal their **template**, which is genuinely good:
concede the competitor's strength first → "In short" box → at-a-glance table **with
dated, sourced competitor pricing** → argued H2s → an honest **"Where X wins"** section →
FAQ with `FAQPage` schema → CTA → related links. The honesty section is what makes the
rest believable; their listicle ranks Intervals.icu *above themselves* on "best free".

Build in English under `/compare/`; `build.js` generates ES/CA. Extend
`tools/check-links.js` to cover the new directory.

- **Effort:** 3–4 h/page + ~1 day of build/route plumbing
- **Constraint:** *free-tier scope exact · no `aggregateRating` · competitor prices dated and sourced · no AI claim*
- **Honest risk:** they have 13 pages, press backlinks from Rouleur and 220 Triathlon, and
  a pro-cyclist founder. We will not outrank them on "best AI cycling app" and shouldn't
  try. The free-tier and Whoop-alternative queries are winnable; the head-on AI queries
  are not.

### L4-02 · Blog into `tools/check-links.js`
`CLAUDE.md` says blog internal links are verified **by hand**. That was tolerable at 5
posts. With L3-01 and L4-01 the content surface roughly triples, and hand-verification
will quietly stop happening.

Pure hygiene, and it should land *before* the content work, not after.

- **Effort:** half a day · **Files:** `tools/check-links.js`

### L4-03 · Demo video
A 30–45 s screen capture as a second, colder CTA beside the App Store badge — Stride runs
exactly this pairing ("Watch Demo" / "Start Free Trial"). Also fills the missing App Store
preview video.

Must be self-hosted, not YouTube-embedded: the CSP is enforced `'self'` and a third-party
embed would be silently blocked unless the policy is widened first (`CLAUDE.md`).

- **Effort:** 2–3 days · **Depends on:** L3-03 · **Constraint:** *CSP is enforced — widen before embedding anything*

---

## Level 5 — Large projects (only with evidence)

### L5-01 · Docs / knowledge hub
Stride's ~44 `/docs` pages host their entire comparison cluster and most of their
long-tail. It is the biggest single reason their sitemap has 72 URLs to our 12.

Real cost: a docs IA, a nav, per-page i18n, and a maintenance burden that grows with the
app. **Do not start this until L4-01 proves the cluster ranks.** If comparison pages
don't rank, docs pages won't either, and we'd have built a wing nobody enters.

- **Effort:** weeks · **Depends on:** L4-01 with measured results

### L5-02 · Reconsider the "no figures" pricing page
`pricing.html` deliberately carries no numbers because Apple sets prices per storefront —
a good reason, and Stride does the same thing (their prices render client-side; the
static HTML ships an empty `—`).

But the ASO audit confirmed the real figures, and "what does it cost" is a top query in
any purchase decision. A middle path: publish the ES/EUR figures explicitly labelled as
the Spanish storefront, with the App Store as the authority for every other market.

**Flagging as a decision, not a recommendation** — it means committing to keeping figures
in sync, which is exactly what the current policy exists to avoid.

- **Effort:** 1 day + an ongoing sync obligation · **Constraint:** *free tier must stay visibly distinct from the 14-day Premium trial*

### L5-03 · Retire the runtime `data-i18n` DOM swap
`CLAUDE.md` already names this as a known gap: since per-locale URLs shipped, the runtime
`SummitLang` swap only exists for the pre-redirect preview flash. Removing it would cut
JS, delete a class of locale-mismatch bugs, and simplify every page.

Pure refactor, zero marketing value, meaningful maintenance value — schedule it when the
content surface is stable, not during a content push.

- **Effort:** 2–3 days · **Constraint:** *verify no DOM-swap consumer remains before removing*

---

## Suggested sequence

| Phase | Items | Rationale |
|---|---|---|
| **Week 1** | L0-01 → L0-05, L4-02 | Stop the credibility leaks; get link checking in place *before* the content surface grows |
| **Weeks 2–3** | L1-01 … L1-05, L2-04 | Everything cheap that raises conversion or crawlability on pages we already have |
| **Weeks 3–8** | **L4-01**, then L3-01 continuously | The only work that changes how many people arrive |
| **Parallel, ongoing** | L3-02, L3-03 | Slow-burn assets; both unblock later items |
| **After L4-01 has data** | L2-01, L2-03, L2-05, L4-03 | Polish and conversion work, once there is traffic for it to act on |
| **Deferred** | L5-01 … L5-03 | Needs evidence (L5-01) or a decision (L5-02) or calm (L5-03) |

**If only one thing gets built: L4-01.** Everything in L0–L2 improves a page that ~160
people reach per quarter. Only the comparison cluster and the event-guide track change
that denominator.

---

## What this plan deliberately does not propose

- **Adopting AI positioning.** Forbidden by the Hard Constraints, and our own VOC research
  shows the category is punishing it right now. Stride wins *despite* the AI framing, on
  founder palmarès and paid distribution we don't have.
- **A redesign.** The design is good — editorial, restrained, a coherent token system,
  working dark mode, self-hosted fonts, real hreflang. Every design item here is targeted
  (L0-03, L2-01, L2-03, L2-05). Nothing on this list justifies a rebrand.
- **Converging on a trial-first offer.** The permanent free tier is the one structural
  advantage we hold over Stride. Matching their 14-day trial would trade it away.
- **Any invented proof** — testimonials, ratings, `aggregateRating`, user counts, logos.
