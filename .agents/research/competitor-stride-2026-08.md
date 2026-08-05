# Stride (stride.is) — Competitor Profile & Website Teardown

**Date:** 2026-08-05 · **Depth:** deep profile · **Method:** full static scrape of
`stride.is` (homepage, `/docs/comparisons/*`, `/blog`, `/changelog`, `robots.txt`,
`sitemap.xml`, `llms.txt`) + press search. Raw HTML kept out of the repo; every claim
below is traceable to a URL listed in *Raw sources*.

> **Scope note.** This is a *website* teardown, not a product teardown. The question
> being answered is: **what does stride.is do better than projectsummit.app at turning
> a visitor into an install**, and which of those moves we can copy without breaking
> the Hard Constraints in `.agents/product-marketing.md`.
>
> Stride is an **AI-first** product. A large part of what makes their site work is
> positioning we are explicitly forbidden from adopting. The recommendations below are
> deliberately restricted to the **structural** wins — the ones that are independent of
> the AI framing.

---

## At a glance

| | **Stride** | **Project Summit** |
|---|---|---|
| Tagline | "Train smarter, go faster — industry-leading AI training software for athletes, coaches and teams" | "A coach in the shape of an algorithm." |
| Positioning | AI-native training partner | Deterministic, explainable adaptive engine (explicitly *not* AI) |
| Sports | Cycling, running, triathlon, swim, strength | Cycling only |
| Platforms | Web + iOS + Android | iOS 26+ only |
| Founded / launched | Announced Nov 2025 (Rouleur Live), Stride Technology Ltd, London | Launched 2026 |
| Founders | Alex Dowsett (6× British TT champion, ex-UCI Hour Record, 2× GT stage winner), James Millard (pro cyclist / WorldTour-consulting coach), Alex Barlow (SWE, data science) | Jordi Espanyol (solo founder) |
| Free tier | **None for athletes** — 14-day trial only. Free for *coaches* | **Permanent free tier** (recovery + sleep + trend + widgets) |
| Price | ~£12/mo (press); **not published on the site** — rendered client-side | Not published by design; Pro €7.99/mo · Elite €14.99/mo in-app |
| Indexable pages (sitemap) | **72** | **36 URLs = 12 unique pages × 3 locales** |
| Comparison / "alternatives" pages | **13** | **0** |
| Product docs pages | **~44** | **0** |
| Blog posts | 13 (Oct 2025 → Jun 2026, ~1.5/month) | 5 |
| Named testimonials on site | **8** | 0 |
| Public changelog | **Yes**, monthly, New/Improved/Fixed | No (roadmap only) |
| `llms.txt` | **Yes**, curated | No |
| Locales | **1** (en-GB) | **3** (EN/ES/CA, hreflang, per-locale URLs) |
| Live chat | Intercom, "no bots, no ticket queues" | Email only |

---

## 1. Positioning & messaging (verbatim)

**Hero:** `TRAIN SMARTER / GO FASTER` → *"Industry-leading AI Training Software for
Athletes, Coaches and Teams."*

**Category claim:** *"The first AI-native training platform built to think like a
world-class coach, every day, for every athlete."*

**Three pillars, labelled as eyebrow + headline + one paragraph:**

| Eyebrow | Headline | Promise |
|---|---|---|
| STRIDE AI | Stride AI | *"Stride can adapt when life happens… turning training into an ongoing conversation, one that knows your past, understands your present, and prepares you for what's next."* |
| DATA ANALYSIS | WorldTour Analytics | *"Access the same performance analytics used by professional cycling teams. Power curves, matches burned, cornering speed and more."* |
| AI GENERATED | Structured Workouts | *"Shorten a session, add more intervals, simulate a road race. Anything you can imagine."* |

**What is actually strong here, stripped of the AI:**

1. **"WorldTour Analytics" is an authority transfer, not a feature name.** It borrows
   the credibility of pro cycling and attaches it to a metric list. We describe the same
   class of metric ("CTL / ATL / TSB — real time") without ever borrowing authority from
   anywhere.
2. **Every pillar is written as a capability the reader can picture themselves using**
   ("shorten a session", "simulate a road race"), not as a system property.
3. **The founder quote does the heavy lifting:** *"We built the platform we wished we
   had during our pro careers. Every feature comes from real experience at the highest
   level." – Alex Dowsett, 6× British TT Champion.* This is the single highest-value
   element on their page and it is a **credibility claim, not a product claim**.

---

## 2. Homepage structure — section by section, against ours

| # | Stride section | Purpose | Do we have it? |
|---|---|---|---|
| 1 | Sticky banner: "Start Your 14 Day Free Trial Today" | Offer, always visible | ❌ |
| 2 | Hero + dual CTA (**Watch Demo** / **Start Free Trial**) | Two temperatures of intent | ⚠️ single CTA (badge) |
| 3 | Interactive AI prompt demo ("Gran Fondo in 8 weeks. What's my best shot?") | Product-in-motion above the fold | ⚠️ static phone mockups |
| 4 | 3 pillars | Mechanism | ✅ ("How it thinks") |
| 5 | **"Up and Running in 4 Steps"** | Kills onboarding anxiety | ❌ |
| 6 | App Store + "Get Started on Web" badges | Conversion | ✅ (App Store only) |
| 7 | **Training plans carousel — "by Alex Dowsett", 4 wks / 3h per week / 162 TS** | Concrete, credentialed inventory | ❌ |
| 8 | **8 named testimonials** with role/context | Social proof | ❌ (none exist — see §7) |
| 9 | **Founder wall** — 3 co-founders + credentials | Authority | ⚠️ `about.html`, one level away |
| 10 | Pricing (2 tiers, feature list, coaches free) | Offer clarity | ⚠️ `pricing.html`, deliberately no figures |
| 11 | **"Fast Chat Support — no bots, no ticket queues"** | Trust / solo-founder anxiety | ❌ |
| 12 | **FAQ — 9 questions, incl. "How is Stride different from TrainingPeaks or TrainerRoad?"** | Objection handling at decision point | ❌ on home (`faq.html` is one level away) |
| 13 | Final CTA + latest articles | Conversion + freshness | ⚠️ CTA yes, articles no |

**The four gaps that matter most, in order:**

- **§5 "Up and Running in 4 Steps."** Our home page explains *how the engine thinks*
  but never *what happens after you tap Download*. Stride spends a whole section on it:
  sign up → connect devices → add goals and events → use it. Cheap to write, directly
  addresses the "another app to add to my stack" objection already in our context doc.
- **§12 FAQ on the homepage.** Their FAQ names TrainingPeaks and TrainerRoad **on the
  homepage** and answers the difference in two sentences. Our `faq.q2` answers the
  equivalent objection ("is this just another AI wrapper?") beautifully — and hides it
  on a separate page that almost nobody reaches.
- **§7 Plans carousel.** Every card carries an author and three numbers (weeks, h/week,
  TS/week). It makes an abstract promise ("a plan") into countable inventory. Our
  equivalent asset — periodisation blocks built around a target date — is described in
  prose only.
- **§11 Support block.** One paragraph that converts a weakness (tiny team) into a
  promise (a human answers). We carry the same weakness with none of the upside; the
  "will it still be here in a year?" anxiety in our own context doc is unanswered on
  the site.

---

## 3. The real machine: 13 comparison pages under `/docs/comparisons/`

This is the single biggest structural difference between the two sites, and it is the
part worth copying.

**What exists:**

- 8 head-to-heads: `stride-vs-trainingpeaks`, `-garmin-connect`, `-strava`,
  `-trainerroad`, `-intervals-icu`, `-xert`, `-join`, `-strava-mcp-server`
- 1 hub: `stride-vs-alternatives`
- 4 category listicles: `best-ai-cycling-apps`, `best-trainingpeaks-alternatives`,
  `best-ai-triathlon-training-apps`, `best-apps-whoop-oura-training`

**The head-to-head template** (from `stride-vs-trainingpeaks`, ~1,400 words):

1. Opening paragraph that **concedes the competitor's strength first** ("TrainingPeaks
   is the language of endurance coaching… it earned its place as the incumbent")
2. 💡 **"In short"** callout — the answer in two sentences, for skimmers and for LLMs
3. **At-a-glance table**, 8 rows, including a **Price** row with the competitor's real
   figures (`Premium $19.95/mo or $134.99/yr; WKO5 +$169`)
4. 4 argued sections, each a single claim as an H2 ("Recovery it can see but won't act on")
5. **"Where TrainingPeaks wins"** — a genuinely fair section. This is what makes the
   other 1,200 words believable.
6. CTA
7. **FAQ, 5 questions** — shipped with `FAQPage` JSON-LD
8. Related articles + a "Was this helpful? Entries reviewed weekly" feedback widget

**The listicle template** (`best-trainingpeaks-alternatives`): first sentence answers
the query outright, then a 💡 **"Quick answer"** box, then a ranked 1–5 with a **"Best
for:"** line each — *and it ranks a competitor (Intervals.icu) above itself on "best
free"*. Each entry links to the matching head-to-head. That internal linking is what
turns 13 pages into a cluster instead of 13 orphans.

**Schema per comparison page:** `Article` + `BreadcrumbList` + `FAQPage`.
Site-wide: `Organization` (with `founder: Alex Dowsett`) + `WebSite` +
`SoftwareApplication`.

**We have zero pages of this type.** Per `funnel-analysis-2026-08.md`, Google sent us
**6 visitors in 90 days** against fully-built SEO machinery. The machinery is not the
problem; there is nothing on the site that matches a query anyone types.

---

## 4. Answer-engine optimisation — they are ahead of nearly everyone

Their `robots.txt` is a strategy document:

```
# --- AI assistants / answer engines (explicitly welcomed so Stride can be cited) ---
User-agent: GPTBot        Allow: /
User-agent: ClaudeBot     Allow: /
User-agent: PerplexityBot Allow: /
User-agent: Google-Extended / Applebot-Extended  Allow: /

# --- Block aggressive SEO scrapers ---
User-agent: AhrefsBot / SemrushBot / DotBot / MJ12bot  Disallow: /
```

Plus a curated **`/llms.txt`** (4 KB): a one-paragraph product definition, then
hand-picked links grouped as *Start here / Documentation / How Stride compares /
Training concepts / Optional*.

Two deliberate decisions worth noting:

- **Maximum visibility to answer engines, zero visibility to competitor SEO tools.**
  Blocking Ahrefs/Semrush means their keyword and backlink profile is invisible to
  rivals — including to this analysis. (It also means a share of link-building
  outreach never finds them; they've decided that trade is worth it.)
- **`llms.txt` is written to be quoted.** The comparison pages' "In short" and "Quick
  answer" boxes are the same idea applied at page level: pre-chewed, citable answers.

Our `robots.txt` is four lines (`Allow: /` + sitemap). We have no `llms.txt`.

---

## 5. Content: two tracks, both high-intent

| Track | Examples | Query intent |
|---|---|---|
| **Training-science explainers** | *Why FTP is no longer enough and CP is king* · *What is W′ Prime* · *The Durability Problem* · *Endurance metrics glossary* | Informational, evergreen, ranks for the vocabulary their ICP already searches |
| **Event-specific pacing guides** | *La Marmotte: Training and Power-Pacing Guide* · *Ironman 70.3 Bike Pacing by Power* · *How to Train for Long Climbs When You Live Somewhere Flat* | **High-intent, dated, seasonal** — someone searching "La Marmotte power pacing" is exactly the ICP, in buying season |
| (plus) **Feature releases** | *Meet AI Insights* · *Introducing Matches* · *Introducing Power Zone Analysis* | Product-alive signal, reused on the homepage |

Cadence ≈ 1.5 posts/month sustained for 9 months. Our blog: 5 posts, and the best one
drew **4 unique readers in 90 days**.

The **event-guide track is the most copyable and the most underrated**: it needs no AI
positioning, no testimonials, no new product surface — only a rider who knows the event.

---

## 6. Public changelog as a marketing surface

`/changelog` is monthly, grouped **New / Improved / Fixed**, written in plain language,
with real detail ("Fixed running pace targets that were calculated from FTP instead of
threshold pace", "Corrected W′ and FTP over-estimation for very strong riders"). Their
homepage FAQ leans on it: *"we ship lots of things, every week and take your suggestions
to heart."*

It does three jobs at once: fresh indexable content, proof the product is alive, and a
direct answer to the "will this still exist in a year?" anxiety — the exact anxiety our
own context doc lists for a solo-founder app.

We ship real versions (v1.4.0, updated 2026-07-29 per the ASO audit) and publish none of
it. Our `roadmap.html` says what is *coming*; nothing says what *shipped*.

---

## 7. Social proof — and the honest constraint

Stride runs **8 named testimonials** with role/context ("Eva Nedelkova — Hill Climber &
Founding Stride Member", "Dennis Knuist — Ultra Cyclist from the Netherlands"). Note the
selection: none of them are elite. They are time-crunched amateurs, which is the ICP
mirroring the reader back at themselves. The two strongest quotes are about *life fitting
around training*, not about power numbers.

They stack four more layers on top:

- Three co-founders with verifiable palmarès
- **Team EF Coaching** partnership (EF Pro Cycling), June 2026 — "Foundations"
- Plans authored "by Alex Dowsett" on every card
- Earned media at launch: **Rouleur**, **220 Triathlon**, road.cc

**We cannot copy the top three layers.** Per the Hard Constraints: no testimonials
exist, no ratings are citable, no `aggregateRating` in JSON-LD, no invented numbers,
quotes or logos. What we *can* do is build the pipeline that produces layer one — see
P1-6.

---

## 8. Offer & pricing mechanics

- **Athletes:** paid only, **14-day free trial**, "no restrictions". Prices are rendered
  client-side (Stripe); the static HTML ships an empty `—` and an Annual toggle. Press
  reports ~£12/mo.
- **Teams & Coaches: free.** "Athletes pay their own subscriptions." A clean PLG loop —
  every coach onboarded is a distribution channel for athlete subscriptions.
- **Inconsistency worth knowing:** the site says **14 days** everywhere; their own
  `llms.txt` says **"A 30-day free trial is available."** Answer engines are reading the
  30-day number. Sloppy — and a reminder that if we ship an `llms.txt`, it needs to be in
  the `npm run check` gate like everything else.

**Where our offer is structurally stronger:** they have **no free tier for athletes**.
Ours is permanent and covers exactly the layer their target reader is most anxious about
(recovery + sleep). Our copy already frames this correctly ("Not a 14-day trial. It's the
free tier."). Against Stride specifically, that line is the wedge — and it is currently
only visible to someone who scrolls our homepage, never to someone searching.

---

## 9. Where we are already ahead (do not regress these)

| | Us | Stride |
|---|---|---|
| Locales | EN/ES/CA, real per-locale URLs + hreflang + x-default | **en-GB only** |
| Permanent free tier | Yes, no gate | No (trial only) |
| OG image | Designed 1200×630 card | **`logo.png`** — a logo, in a social card slot |
| Homepage `FAQPage` schema | `faq.html` has 15 questions marked up | Homepage FAQ has **no** FAQPage schema (their comparison pages do) |
| Privacy posture | Self-hosted fonts, enforced CSP, opt-in consent, PostHog proxied | Google Ads gtag + Intercom, third-party by default |
| Install attribution | App Store campaign token `?pt=…&ct=web&mt=8` | App Store link, no campaign token visible |

The i18n asymmetry is the important one. Our measured traffic is Instagram-driven and
Spanish-speaking, and Stride is competing for the same Instagram-ad attention **with an
English-only site**. Spanish and Catalan event content is a lane they cannot enter
without rebuilding their site.

---

## 10. What NOT to copy

1. **The AI framing.** Non-negotiable (`product-marketing.md`, Hard Constraints). Also
   strategically wrong for us: our own VOC research shows this category is actively
   punishing AI-forward positioning right now. Stride is winning *despite* it, on
   founder credibility and paid distribution we don't have.
2. **Any testimonial, rating, logo or number we don't have.** Including
   `aggregateRating`.
3. **Their trial-first offer.** Our free tier is the differentiator; converging on
   "14-day trial" would throw away the one thing we have that they don't.
4. **Claiming coverage we lack** (multi-sport, Android, web app, coach tooling).
5. **Their `llms.txt`/site inconsistency.** Whatever we publish for answer engines must
   be generated or checked, not hand-maintained in parallel.

---

## 11. Recommendations, ranked

Effort is calendar-hours for one person. "Constraint" names the Hard Constraint each
item must be written against.

### P0 — this week, high leverage, near-zero risk

| # | Action | Effort | Why now |
|---|---|---|---|
| **P0-1** | **`llms.txt` + AI-crawler-explicit `robots.txt`.** Curated links in EN, with ES/CA alternates named. Add a `tools/check-llms.js` to `npm run check` so it can't drift. | 2–3 h | Cheapest reach we can buy. Our site is already clean, fast and structured — it is *citable*; nothing currently invites the citation. |
| **P0-2** | **Homepage FAQ block, 6–8 questions**, reusing already-translated `faq.*` keys, naming TrainingPeaks / Whoop / Strava. Add `FAQPage` schema to `index.html`. | 3–4 h | Our best objection-handling copy (`faq.q2`, `q12`, `q16`) exists and is one click away from the decision point. Constraint: free-tier scope, no AI claim. |
| **P0-3** | **"From download to your first plan" — 4 steps** on the homepage, between `#free` and `#features`. | 2 h | Directly answers "another app to add to my stack". Constraint: no Watch app implied; step 2 is "connect Strava + allow Health". |
| **P0-4** | **`/changelog.html`** (shell page, i18n keys, in sitemap), seeded from v1.0→v1.4 release notes. | 4–5 h | Fresh content + the answer to the solo-founder anxiety. Constraint: describe only what shipped. |

### P1 — next 4–6 weeks, the actual growth engine

| # | Action | Effort | Why |
|---|---|---|---|
| **P1-5** | **Comparison cluster, 5 pages to start.** Not a clone of Stride's list — pick the axis where our free tier wins: `summit-vs-whoop`, `summit-vs-trainingpeaks`, `summit-vs-strava`, `free-hrv-recovery-apps-iphone`, `whoop-alternatives-no-subscription`. Use their template: concede first → "In short" box → table → argued H2s → **"Where X wins"** → FAQ + `FAQPage` schema → CTA. Build them in EN and let `build.js` generate ES/CA. | 3–4 h/page | The one thing that turns 6 Google visitors/90 days into a channel. Constraints: free-tier scope must be exact; competitor prices must be dated and sourced; no `aggregateRating`. |
| **P1-6** | **Testimonial pipeline via `ambassadors.html`.** We already run an ambassadors page — add a consented "tell us how you use it" step and a `blog/` interview format. Target: 3 named quotes with role + photo by end of Q3. | ongoing | The only Hard-Constraint-safe route to the layer Stride is strongest on. Do not shortcut it. |
| **P1-7** | **Event-guide content track, ES/CA-first.** Quebrantahuesos, Marxa Cerdanya, La Mussara, Traka, Gran Fondo Sea Otter. Power pacing + fuelling + recovery-window planning. | 6–8 h/post | Highest-intent queries in the category, in **the two languages Stride cannot serve**, aimed at the audience our Instagram traffic already is. |
| **P1-8** | **Named plans/blocks as countable inventory** on the homepage or `pricing.html` — "Base 12 weeks · 6 h/week", "Peak 4 weeks · target date". | 3 h | Turns "advanced periodisation" from an adjective into something a reader can count. Constraint: only blocks the shipped engine actually builds. |

### P2 — worth doing, lower urgency

| # | Action |
|---|---|
| **P2-9** | **30–45 s demo video** on the homepage ("Watch Demo" as a second, colder CTA). The same asset fixes the missing App Store preview video flagged in `aso-audit-2026-08.md` — one production, two channels. |
| **P2-10** | **Support/contact block on the homepage** — turn the solo-founder weakness into "a human answers, usually same day", if that promise is one we can keep. |
| **P2-11** | **Docs / knowledge hub.** Stride's ~44 docs pages carry their whole comparison cluster and half their long-tail. Big investment; only start it once P1-5 proves the cluster ranks. |
| **P2-12** | **Per-page OG images.** Ours is already better than theirs; per-page cards would extend the lead on social/IG link previews. |

**If only one thing gets done: P1-5.** Everything else improves a page that ~160 people
reach per quarter. The comparison cluster is the only item on this list that changes how
many people arrive.

---

## Raw sources

All fetched 2026-08-05:

- `https://stride.is/` — homepage (static HTML; prices render client-side)
- `https://stride.is/robots.txt` · `https://stride.is/llms.txt` · `https://stride.is/sitemap.xml` (72 URLs)
- `https://stride.is/docs/comparisons/stride-vs-trainingpeaks` — head-to-head template
- `https://stride.is/docs/comparisons/best-trainingpeaks-alternatives` — listicle template
- `https://stride.is/blog` · `https://stride.is/changelog`
- Press: Rouleur, *Meet Stride, Alex Dowsett's new AI-powered app*; 220 Triathlon,
  *Alex Dowsett launches new cycling and endurance training platform* (£12/mo, launched
  from the Zwift stage at Rouleur Live, Nov 2025)
- Internal cross-reference: `.agents/product-marketing.md` v3,
  `.agents/research/funnel-analysis-2026-08.md`, `.agents/research/aso-audit-2026-08.md`

**Not obtainable:** backlink profile, ranked keywords and organic traffic estimates —
Stride blocks AhrefsBot and SemrushBot at `robots.txt`, and no DataForSEO/Firecrawl MCP
is connected to this session. Every SEO comparison above is therefore **structural**
(page counts, schema, internal linking, crawl directives), not volumetric. Treat the
"who ranks for what" question as open.
