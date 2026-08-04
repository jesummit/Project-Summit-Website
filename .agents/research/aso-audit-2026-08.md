# ASO Audit — Project Summit (App Store, id 6754172654)

**Date:** 2026-08-04 · **Store:** Apple App Store · **Brand tier:** Challenger (4 ratings) → scored strictly against best practice.

Data pulled live from the iTunes lookup API and the ES/US listing pages on 2026-08-04. Version 1.4.0, last updated 2026-07-29.

## Listing as it stands

| Field | ES storefront | US storefront |
|---|---|---|
| Title | `Project Summit: Ciclismo` (24/30) | `Project Summit: Cycling` (23/30) |
| Subtitle | `Recuperación, carga, nutrición` (29/30) | `Recovery, training, nutrition` (29/30) |
| Promotional text | The anti-AI paragraph | The 360 km founder story — **duplicates the description's own opening** |
| Ratings | 5.0 avg, **4 ratings** | **0 — "not enough ratings to display"** |
| Screenshots | 10 iPhone, 0 iPad | same |
| Preview video | **None** | **None** |
| Category | Health & Fitness (primary) · Sports (secondary) | same |
| Localizations | EN, ES, CA | same |
| Min iOS | **26.0** | same |
| Price | Free · Pro €7.99/mo · €63.99/yr · Elite €14.99/mo · €119.99/yr | same |

## Score: 52/100 — Grade C

| # | Dimension | Weight | Score | Why |
|---|---|---|---|---|
| 1 | Title & Subtitle | 20% | 6/10 | Subtitle well packed (29/30); title spends 14 chars on an unknown brand and leaves 7 unused |
| 2 | Description | 15% | 6/10 | Strong narrative, but the US promo slot is wasted duplicating the description opening |
| 3 | Visual Assets | 25% | 6/10 | Full 10 screenshots, but **no preview video** |
| 4 | Ratings & Reviews | 20% | 2/10 | 4 ratings ES, 0 US. The single biggest conversion drag |
| 5 | Metadata & Freshness | 10% | 7/10 | Updated 6 days ago, 3 locales matching the site; iOS 26 floor caps reach |
| 6 | Conversion Signals | 10% | 5/10 | IAP transparent, but the free-tier wedge is invisible above the fold |

---

## Top 3 quick wins (<1 hour each, no release needed)

**1. Replace the US promotional text.** It currently repeats the description's first paragraph word for word, so the first thing a US visitor reads is said twice. Promotional text is editable without shipping a build. Use the anti-AI line the ES listing already uses — the VOC research (`voc-cycling-recovery-2026-08.md`, Theme 1, high confidence) shows this category is actively punishing AI-forward positioning right now, in reviews of TrainerRoad and WHOOP. Suggested (163/170):

> Not an AI. Not a chatbot. A sports-science algorithm that makes the calls a real coach would: periodisation, polarised training, training load. Your recovery and sleep stay free.

**2. Put the free-forever wedge into screenshot 1's caption.** Screenshot captions have been indexed since June 2025, and ~90% of users never scroll past the third screenshot. Subscription fatigue is a high-confidence VOC theme ("Great tracking awful price", "$30/mo is steep"), and free recovery + sleep is the answer to it — yet nothing above the fold says so today.

**3. ~~Fix the stale version claim on the website.~~ Done 2026-08-04.** The site advertised "What's in v1.1" while the App Store was on 1.4.0, and `roadmap.html` stopped at v1.3 labelled "current release" — v1.4 was absent from the repo entirely. Since v1.4 rebuilt the *sleep score*, the strongest free-tier asset, the gap was a missing story rather than a stale number. Fixed: v1.4 block added to the roadmap in EN/ES/CA, v1.3 demoted to shipped, eyebrow updated, and the three-versions-old "New in v1.1" badge removed from the Karoo card. The v1.1 references inside the roadmap timeline are historical and correctly left alone.

---

## Detailed findings

### Ratings are the binding constraint — and the mechanism is not the problem

The app asks for reviews correctly: `ReviewRequestManager` uses the modern `RequestReviewAction` (not the deprecated `SKStoreReviewController`), gated at 3+ days since install, 3+ value moments, 120 days between prompts — well inside Apple's 3-per-365-days limit. That is a well-built implementation.

**But both value-moment sources sit behind Premium surfaces:**

| Trigger | Location | Requires |
|---|---|---|
| Completing today's planned workout | `TodayView.swift:250` | An adaptive plan → **Elite** |
| Post-activity training-load refresh | `TrainingView.swift:560`, asked at `:175` on the Form tab | Training load → **Pro** (`TrainingView.swift:86` shows `LockedFeatureView` to free users) |

A free user — the tier the entire marketing wedge is built to attract — never accumulates a value moment, and so is never asked to rate. That is what explains 4 ratings on a listing live since June.

**CONFIRMED on device by the owner, 2026-08-04:** in free mode there is no value moment and no review prompt. This is a defect, not a hypothesis — the free tier, which is the top of the entire funnel, can never be asked to rate the app.

**Fix — IMPLEMENTED 2026-08-04 in `Project-Summit-MVP`.** The approach: register a value moment on a free-tier moment of real value. The natural candidates are opening the sleep breakdown — which v1.4 just rebuilt, and which is the free tier's strongest asset — or the third consecutive morning of viewing the recovery score. Both are moments where the free user has actually received what they came for. The existing eligibility gating (3 days, 3 value moments, 120 days between prompts) needs no change; only the accumulation sites do.

### Title: 7 unused characters, brand-heavy for an unknown app

`Project Summit: Cycling` spends 14 of 23 characters on a brand nobody is searching for yet. Apple indexes title + subtitle + the hidden keyword field, each word once.

Options (US):
- `Project Summit: Cycling Plan` — 28 chars, adds the high-intent head term "plan"
- `Project Summit: Bike Training` — 29 chars, adds "bike" + "training"

Do **not** add "coach" to the title: it collides with the deliberate anti-"coach"/anti-"AI" framing (`faq.q2`, repo `CLAUDE.md`).

### Subtitle: a feature list, not a differentiator

`Recovery, training, nutrition` (29/30) reads as a table of contents. If the title takes "Plan" or "Training", the subtitle must not repeat it — Apple indexes each word once, so a repeat wastes the slot.

Options (US, assuming title takes "Plan"):
- `HRV recovery & sleep, free` — 26 chars, leads with the wedge
- `Adapts to your HRV and time` — 27 chars, leads with the mechanism

### Keyword field — cannot be audited from outside

The 100-**byte** keyword field is invisible outside App Store Connect. Check that it does not repeat any word already in the title or subtitle, and that it is comma-separated with no spaces. Candidate terms not currently visible anywhere in the listing: `ftp`, `power`, `interval`, `gravel`, `granfondo`, `tss`, `periodization`, `readiness`.

> **Correction (2026-08-04):** an earlier version of this line also suggested `strava` and `karoo`. Both are third-party trademarks, and App Review guideline 2.3.7 treats trademarks in the keyword field as keyword stuffing — a rejection risk even though the integrations are real. Keep those names in the description, not the keyword field. Final per-locale sets are in `../aso-listing-copy-2026-08.md`.

### No preview video

Apple autoplays previews muted in search results; the published benchmark range is +20–40% conversion. For a Challenger with almost no social proof, a 15–30s video is the highest-leverage visual asset available. The adaptation story — bad night → plan changes by itself — is inherently visual and is the differentiator VOC research says the market wants.

### iOS 26.0 minimum caps the reachable market

Every device that has not moved to iOS 26 simply cannot install Summit, and the listing shows "Requires iOS 26.0". This is a product decision with a direct ASO cost, and it is worth a deliberate re-decision rather than inheriting it: each major version dropped widens the installable base. Out of scope for the listing itself — flagged for the roadmap.

### Category

Health & Fitness (primary) is where the direct competitors live, and is brutally competitive; Sports (secondary) is thinner. With 4 ratings, top-chart placement in either is out of reach for now, so this is not worth changing yet — revisit once ratings are in the hundreds.

---

## Priority action plan

| # | Action | Effort | Impact | Needs a release? |
|---|---|---|---|---|
| 1 | Replace US promotional text with the anti-AI line | 10 min | High | No |
| 2 | Free-forever wedge into screenshot 1 caption | 1–2 h | High | No (screenshots only) |
| 3 | ~~Verify, then fix, the free-tier review prompt~~ **Done 2026-08-04 — confirmed and implemented.** Ratings should now start accruing from free users | — | **Highest** | Shipped |
| 4 | Fix v1.1 → v1.4 on the website | 15 min | Medium | No |
| 5 | Retitle + resubtitle with keyword coverage | 30 min | Medium-High | No |
| 6 | Audit the keyword field for repeats in App Store Connect | 20 min | Medium | No |
| 7 | Produce a 15–30s preview video | 1–2 days | High | No |
| 8 | Re-decide the iOS 26 floor | Roadmap call | High | Yes |

## What could not be assessed

- **Search volume and keyword difficulty** — needs a paid ASO tool (AppTweak, Sensor Tower).
- **Actual keyword field contents** — App Store Connect only.
- **Screenshot caption text and visual quality** — the images were not rendered in this pass; only their count was verified.
- **Current ranking for any term**, and conversion rate from impression to install — App Store Connect Analytics.
