# RFC: Blog content backlog (SEO pillar posts)
Date: 2026-07-21
Author: Growth / SEO

## Problem
The `/blog/` Journal is a first-party SEO + email-capture channel, but only **2
articles** are published while `blog/index.html`'s own "What this journal covers"
grid advertises **6 pillars** — so **4 pillars are visibly empty** ("More soon" /
"Coming soon"). At the same time, the earlier SEO audit found real, un-targeted
head/mid keyword gaps (CTL/ATL/TSB, HRV/recovery, FTP/eFTP, race fueling,
Karoo-specific), and several `faq.html` questions map 1:1 to informational search
intent with no dedicated indexable page behind them.

This RFC registers a prioritized backlog so posts get written against a plan
(pillars + keyword gaps + internal-link mesh), not ad hoc.

## Constraints (non-negotiable, from `docs/blog.md` + observed template)
- **English-first.** ES/CA are **native rewrites at separate URLs** (`blog/es/`,
  `blog/ca/`) with reciprocal `hreflang` — **never machine translations** of the
  same article (duplicate-content risk + they read non-native).
- **Voice:** always "the engine" / "the algorithm" / "sport-science maths".
  **Never "AI" or "coach"** (except the site's own "coach in the shape of an
  algorithm" positioning line, used deliberately).
- **Audience:** the data-literate, self-coached serious amateur (intervals.icu /
  r/Velo / TrainerRoad crowd).
- **Format:** ~1,800–2,300 words; the established post template (kicker, title +
  dek, stat-strip, `app-figure` inline-SVG chart with an explicit
  illustrative-vs-real-data figcaption, mid-article + end email-capture, app CTA,
  `BlogPosting` + `BreadcrumbList` JSON-LD, "Read next" block, `← All articles`).
- **Accuracy:** training-science claims specific to how Summit works must be
  grounded in the MVP repo's ADR/RFCs, not invented.
- **Magnet:** currently one lead magnet (`data-magnet="season-template"`),
  segmented by `data-article`. New per-pillar magnets are optional (see Open
  questions).

## Decision: the backlog

Each post is scored for a "double win" — it should (a) fill an advertised pillar,
(b) close a real keyword gap, (c) reuse the `app-figure`/template (low production
friction), and (d) strengthen the internal-link mesh.

### Tier 1 — Do first (pre-committed or foundational)
| ID | Working title | Primary keyword / intent | Pillar | Why first |
|----|----|----|----|----|
| **A** | Taper & peak: reading your TSB to arrive in form | "cycling taper", "TSB for racing", "peak form" | Peak on the day | The periodization post **already forward-links** this ("its own article — the 'peak on the day' thread"). Completes the base→build→peak→**taper** arc; reuses the PMC chart. Lowest friction. |
| **B** | HRV for cyclists: RMSSD, resting HR & readiness without the woo | "HRV cycling", "RMSSD", "resting heart rate training", "readiness" | Recover with data | Flagship product feature (HRV-driven recovery) with **zero** content today; large keyword gap. Candidate for a new "readiness" magnet. |
| **C** | How to read your PMC: CTL, ATL & TSB explained | "CTL vs ATL vs TSB", "training stress balance explained" | Know your numbers | The canonical explainer other posts cite; upgrades the "CTL, ATL & TSB — explained" Read-next link (today points at `faq.html`). Frame as *reading the PMC* to avoid overlap with the periodization post. |

### Tier 2 — High value, more effort or narrower
| ID | Working title | Primary keyword / intent | Pillar |
|----|----|----|----|
| **D** | Find your FTP without a test (eFTP / Critical Power / CP2) | "FTP test", "how to find FTP", "eFTP" | Know your numbers |
| **E** | Fueling by the numbers: carbs per hour & training your gut | "carbs per hour cycling", "gut training", "race fueling" | Fuel by the numbers |
| **F** | Heart-rate zones: training seriously without a power meter | "heart rate training zones cycling", "train without power meter" | (transversal) |

### Tier 3 — Bottom-funnel / niche (higher conversion)
| ID | Working title | Primary keyword / intent | Notes |
|----|----|----|----|
| **G** | The best training app for Hammerhead Karoo | "best training app Karoo", "Karoo structured workouts" | Summit's direct-sync differentiator; low-competition, commercial intent |
| **H** | W′ and W′bal: pacing your anaerobic tank | "W prime balance", "critical power pacing" | Advanced "Know your numbers"; low volume, on-brand for the ICP |
| **I** | What to do when you miss a session (plan cascading) | "missed training session", "adaptive training plan" | FAQ Q3 + product differentiator |

## Recommended sequence
**A → B → C** first: A is pre-committed and lowest-friction; B is the biggest
flagship-feature keyword gap; C is the foundational explainer the rest cite (and
it improves every post's Read-next). Then Tier 2, then Tier 3 opportunistically.

## Acceptance criteria (Definition of Done, per post)
- [ ] EN published at `blog/<slug>.html`; ES/CA **native rewrites** at
      `blog/es/<slug>.html` and `blog/ca/<slug>.html` (not translations).
- [ ] Matches the post template (kicker/title/dek/stat-strip/`app-figure`/
      email-capture ×2/app CTA/Read-next/`← All articles`).
- [ ] `<title>` ≤ 60, meta description ≤ 160; canonical + hreflang (en/es/ca/
      x-default); OG + Twitter; `BlogPosting` + `BreadcrumbList` JSON-LD with
      `wordCount`, `inLanguage`, author `@id` → `about.html#jordi`.
- [ ] Any Summit-specific mechanic cited is grounded in an MVP ADR/RFC.
- [ ] Added to `blog/index.html` (featured list + pillar status flips to "Live"),
      to `sitemap.xml` (en/es/ca with hreflang), and to the Read-next mesh.
- [ ] `npm run check` passes; blog internal links verified by hand.

## Open questions / risks
- **Per-pillar magnets?** All posts currently funnel to the one season-template
  PDF. B (readiness checklist) and E (fueling sheet — already inside the current
  magnet) could justify dedicated magnets; deferred until conversion data exists.
- **ES/CA cadence:** rewrites are more effort than translations; acceptable per
  the English-first policy, but sets the pace at which trilingual coverage lands.
- **Pillar honesty:** F and B touch features not yet shipped (HR-only zones,
  parts of recovery) — posts stay educational and must not promise unshipped
  behavior.
