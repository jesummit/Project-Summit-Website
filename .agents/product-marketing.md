# Product Marketing Context

**Document version:** v3
**Last updated:** 2026-08-04

> Shared context for every marketing skill. Everything here is sourced from the
> two repos (`Project-Summit-Website`, `Project-Summit-MVP`), not invented.
> **Read "Hard Constraints" before writing a single line of copy** — those are
> claims that are wrong in the shipped product, and a false one here becomes a
> support ticket or an App Store review problem.

---

## Hard Constraints (non-negotiable — verify before any claim)

| Constraint | Why | Source of truth |
|---|---|---|
| **There is no Apple Watch app in the shipped build.** Never imply a watch app, complication, or on-wrist surface. The watch is a **sensor**, read through Apple Health. | `FeatureFlags.watchAppEnabled` is `false` in Release and `Config/Release.xcconfig` strips `SummitWatch.app` from the IPA (staged rollout). | `ios/App/SummitSport/Helpers/FeatureFlags.swift:45-54`, ADR-2026-07-22 |
| **Apple Watch is not required.** Any wearable writing HRV/sleep to Apple Health works. The watch framing is an ICP filter, not a requirement. | `faq.q6` states this publicly. | `faq.html` |
| **Free tier = everything not behind one of the 17 `EntitlementGate` cases** — and that is a lot more than this doc used to claim (see "Free tier, verified" below). Never list a Premium feature as free, and never shrink the free list either: understating it throws away the product's strongest differentiator. | `gates(for:)` returns what a tier **unlocks**, so `case .free: return []` means Free unlocks none of the 17 gates — *not* that nothing is gated. Entitlement is the tier comparison in `SubscriptionManager.isEntitled`. | `Core/Subscriptions/EntitlementGate.swift:338-368`, `Core/Subscriptions/SubscriptionManager.swift:184-186` |
| **"Free forever" must stay visibly distinct from the 14-day Premium trial.** Never blur them. | Both exist; conflating them is the single most likely false claim. | `Features/Subscriptions/PaywallView.swift`, `free.note`, `faq.q12`/`q16` |
| **Never call the product "AI" or "a chatbot"** — and in blog/long-form use "the engine" / "the algorithm". The site's own hero simile ("a coach in the shape of an algorithm") is deliberate and allowed; a flat claim of "AI coach" is not. | Positioning is explicitly anti-chatbot; `faq.q2` answers this head-on. | `faq.q2`, `docs/blog.md`, `index.html` |
| **No `aggregateRating` in JSON-LD** while the on-page stars are placeholder. Fabricated review markup is a Google spam violation. | Ratings are a placeholder until real App Store reviews exist. | `Project-Summit-Website/CLAUDE.md` (SEO / social) |
| **Training-driven nutrition plan is roadmap, not shipped.** Only the race-day fueling planner exists. | Labeled "In development: not yet part of the App Store release" on the home page. | `index.html`, `roadmap.html` |
| **iOS only, iOS 26+.** Android is roadmap 2027. No web app. | `faq.q11`. | `faq.html` |

---

## Free tier, verified against the app (2026-08-05)

Audited directly in `Project-Summit-MVP` at MARKETING_VERSION 1.4.1, call site by
call site. This supersedes the narrower list this document carried until now,
which was **materially under-inclusive** — the site has been underselling the one
thing competitors cannot match.

**Free, confirmed ungated:**
- Daily recovery score, its detail screen and the **30-day recovery trend**
- Sleep score with the **full breakdown** and both sub-screens (stages, analysis) — the code itself calls this "the richest thing the free tier gets"
- **Recovery, Sleep and Load gauges** on Home and Lock Screen (the *workout* widget is Elite)
- The whole **Today** screen
- **Activity detail: header, route map, stats ledger, elevation profile** — the "what did I do" layer
- **Share cards** (deliberately free: it's an acquisition channel)
- **Strava, Hammerhead/Karoo and Apple Health** connections, and automatic activity import
- Creating events — races, camps, holidays
- The **Calendar** tab in degraded form: month grid with events, completed-day checks, the daily recovery dot
- The **plan silhouette**: session type · duration · training phase, on Today and in the Calendar day detail
- Four push notifications: new activity, morning recovery, low-recovery streak, integration health

**Premium (Pro):** the whole Training tab (CTL/ATL/TSB graphs, power, eFTP, MMP),
the Load detail sheet, the activity detail's HR / Power / Analysis panes, race
weather, and five notification types.
**Premium (Elite):** the actual prescription (structure, intervals, TSS/IF), the
weekly plan card, availability, workout export, race-day fuelling, the workout
widget.

**Traps — do not write these:**
- ❌ "You always see your rest days" — in the Calendar a Free rest day renders **locked** (ADR-2026-07-22 superseded the earlier decision).
- ❌ "Week 2 of base" — the silhouette carries the phase name only; week-in-phase isn't in the payload.
- ❌ Planned sessions visible on the Calendar **month grid** — those decorations are stripped; the silhouette appears only after selecting a day.
- ❌ A headline built on the free **Load number**. Its gating is clear (none) but whether it populates for a Free user in practice was not device-verified.
- ❌ "14-day trial" stated unconditionally — it's a StoreKit intro offer, per Apple ID, and gone once used.
- ❌ Anything about a Watch app. Still flagged off and stripped from the IPA.

## Product Overview

**One-liner:** A coach in the shape of an algorithm — adaptive cycling training that rewrites itself around your recovery and your real life.

**What it does:** Summit reads your rides (Strava), your recovery (HRV, resting HR, sleep via Apple HealthKit) and your available time, then produces a deterministic, explainable training plan. It tracks training load (CTL/ATL/TSB) and power (eFTP, CP2 power curve) live, adjusts intensity before you open the app, and pushes structured sessions out to your head unit. Every recommendation traces back to a codified sports-science rule — not a black box.

**Product category:** Adaptive cycling training platform / training-plan app. Customers search this shelf as "cycling training app", "adaptive training plan", "HRV recovery app", "TrainingPeaks alternative".

**Product type:** iOS consumer subscription app (B2C), iPhone, iOS 26+. Supabase backend, deterministic planning engine.

**Business model:** Freemium with three tiers, Apple IAP.
- **Free** — no gates. Recovery score, sleep score + breakdown, recovery trend, widgets. Not a trial.
- **Pro** — detailed training analysis: training load (CTL/ATL/TSB), power analysis (eFTP, W', CP2, power profile), per-activity detailed analysis, progression & calculator, race weather, plus eFTP / form-peak / race-day / weekly-recap notifications.
- **Elite** — full platform: adaptive training plans, adaptive peak form, workout export (ZWO/FIT + intervals.icu sync), race-day nutrition, nutrition recipes, shopping list, plan-today and availability notifications.
- **14-day free trial** on Premium, monthly and yearly billing.

**Pricing — CONFIRMED 2026-08-04** against the live App Store listing (ES storefront IAP list): **Pro €7.99/mo · €63.99/yr · Elite €14.99/mo · €119.99/yr**. Matches the local StoreKit config. Note the website still publishes no prices by design (`faq.q13` points to the app and the App Store) — confirming the figures does not mean putting them on the site.

**Distribution:** App Store, Apple ID `6754172654`. Website links carry the campaign query `?pt=128228195&ct=web&mt=8` — never drop it, it is the only way Apple attributes installs to the site.

---

## Target Audience

**Who:** The **serious amateur cyclist** — trains consistently, races occasionally, takes performance seriously, without a professional's budget or time. Consumer, self-serve; no buying committee.

**Primary use case:** "I know what I trained. I don't know what to do next, or why." Turning scattered data across 3–5 apps into one clear decision for tomorrow.

**Jobs to be done:**
- *Tell me what to do today* — a session that already accounts for how recovered I am and how much time I have.
- *Keep the plan alive when life breaks it* — sickness, travel, a missed session shouldn't invalidate the block.
- *Give me my recovery in a form I can act on* — not a raw HRV number, an interpreted score with the why.
- *Get me to my target event in form* — periodisation (base/build/peak/taper) around a real date.

**Qualifying signals (from the home page's own "Is this for you?"):** trains with a power meter and takes FTP seriously · already uses Strava · has outgrown generic plans · cares about recovery as much as volume · peaks for a target event · wants nutrition integrated rather than bolted on.

**Personas:** Not applicable — B2C, single decision-maker who is also the user and the payer.

---

## Problems & Pain Points

**Core problem:** Serious amateurs juggle three to five fitness apps. Each captures part of the picture — activities, health metrics, load, nutrition — and none synthesises it into a decision. You end up knowing what happened, not what to do.

**Why alternatives fall short:**
- **Static plans** (generic PDF/app training plans) assume a life you don't have; one sick week invalidates the block.
- **Analytics platforms** (TrainingPeaks, intervals.icu) show you a TSB chart and stop. Interpretation is your job.
- **Recovery wearables** (Whoop, Oura) score your recovery but know nothing about your training plan — the number never moves a session.
- **Head-unit ecosystems** (Garmin) adapt narrowly and stay inside their own hardware.

**What it costs them:** Wasted training weeks; peaking late or not at all; overtraining through a bad recovery window, or wasting a good one on an easy day. Plus a stack of subscriptions that don't talk to each other.

**Emotional tension:** Doubt. Training hard and not knowing whether it is the right hard. Staring at a chart you can't act on.

---

## Competitive Landscape

**Direct — adaptive/plan-generating training apps:** TrainerRoad (Adaptive Training), Xert, Join Cycling, Athletica. Falls short: mostly indoor/structured-first, weak or absent HRV-driven recovery input, and adaptation rarely accounts for *availability* — the "no window today" case.

**Secondary — analytics platforms:** TrainingPeaks, intervals.icu, Strava premium. Falls short: they describe, they don't decide. The athlete is still the coach.

**Secondary — recovery wearables:** Whoop, Oura, Garmin Body Battery. Falls short: a recovery score disconnected from any plan; nothing changes tomorrow's session. Also: they charge monthly for what Summit gives away free from the watch the user already owns.

**Indirect — a human coach:** Falls short on price and latency (a coach doesn't rewrite your week at 6am because you slept badly), but wins on judgment and accountability. This is the honest trade-off; don't pretend otherwise.

**Indirect — doing nothing / Strava + intuition:** The real default for most of the market. The competitor is inertia.

> Not yet validated by research. Confirm this landscape with the `competitor-profiling` skill before building any comparison page.

---

## Differentiation

**Key differentiators:**
- **Recovery moves the plan, both directions.** It eases the load when you're run down *and* pushes when you're primed, to catch good recovery windows. Most tools only ever brake.
- **Adapts to availability, not just physiology.** You tell it how much time you have; no window today means nothing breaks.
- **Deterministic and explainable.** Every recommendation traces to a codified sports-science rule and your real data. No LLM, no generative content, no black box.
- **Recovery + sleep are free, permanently.** The interpreted score from the wearable you already own, at no cost — not a trial.
- **One platform.** Load, recovery, power and nutrition in a single engine instead of five apps that don't talk.
- **Sessions leave the app.** Direct to Hammerhead Karoo, or via intervals.icu to Garmin, Zwift and MyWhoosh.

**Why customers choose us:** It is the only one that turns the recovery number into tomorrow's session, and survives a real life doing it.

---

## Objections

| Objection | Response |
|---|---|
| "Is this just another AI wrapper?" | No LLM, no chatbot, no generative content. A deterministic algorithmic system following codified sports-science rules — traceable, predictable, explainable. (`faq.q2`) |
| "Do I need an Apple Watch?" | No. Any wearable writing HRV/sleep to Apple Health works. Apple Watch currently gives the most consistent data, but it is not required. (`faq.q6`) |
| "I already pay for TrainingPeaks / Whoop / Strava." | Those describe; Summit decides. And the recovery layer that Whoop charges monthly for is Summit's free tier. |
| "Free tier is bait for a trial that expires." | It is not a trial. Recovery score, sleep score + breakdown, trend and widgets stay free for as long as you use the app. The 14-day trial is a separate thing, for Premium. |
| "Another app to add to my stack." | It replaces the synthesis layer across 3–5 apps; rides come in from Strava automatically and sessions go out to your head unit. |
| "Can I trust an algorithm with my training?" | Every recommendation traces to a specific rule and your own data — you can see the why. |
| "Is my health data safe?" | HRV, resting HR, sleep and body temp are read from HealthKit; export and full account deletion are available in-app. (`faq.q17`) |
| **"The data should be descriptive, not prescriptive — I listen to my body."** (research-sourced; no on-site answer exists yet) | Don't argue the number is smarter than the athlete. Summit shows *why*, so it can be knowingly overruled: every recommendation traces to a rule and your own data. The free tier gives the interpretation without demanding you obey it. |
| **"The score never matches how I actually feel."** (research-sourced; the single most trust-destroying failure in this category) | Explainability, not accuracy claims, is the answer: the sleep breakdown says what kind of night you had and what explains it, so a mismatch is inspectable instead of just wrong. |

**Anti-persona:** Casual/fitness riders with no power meter and no target event; runners, swimmers and triathletes (cycling-only today); Android users (roadmap 2027); anyone wanting a human coach with accountability; athletes wanting an indoor-first structured-workout library.

---

## Switching Dynamics (JTBD Four Forces)

**Push:** A block ruined by a week of illness or travel. Data in five apps and clarity in none. A TSB chart they can't act on. Paying monthly for a recovery score that never changes anything.

**Pull:** The plan rewrites itself. The recovery number finally moves a session. Recovery + sleep free from the watch they already own. Sessions land on the Karoo ready to ride.

**Habit:** Strava is where the ride "counts" socially. Years of history in TrainingPeaks. The comfort of a coach or a familiar spreadsheet.

**Anxiety:** "Will it understand my racing?" · "Do I lose my history?" (Strava history can be imported — `faq.q10`) · "Will it push me into injury?" · "Will it still be here in a year?" (solo founder, new app).

---

## Customer Language

**Words to use:** the engine · the algorithm · adaptive · training load · CTL / ATL / TSB · form · readiness · recovery score · eFTP · power curve · periodisation · base / build / peak / taper · serious amateur · Gran Fondo · structured session · the plan rewrites itself · explainable · deterministic.

**Words to avoid:** AI · AI-powered · chatbot · your AI coach (as a flat claim) · machine learning · black box · "smart" as a substitute for a mechanism · anything implying a Watch app, complication or on-wrist screen · "trial" applied to the free tier · Premium features described as free.

**Glossary:**

| Term | Meaning |
|---|---|
| CTL / ATL / TSB | Chronic load (fitness) / acute load (fatigue) / training stress balance (form). Premium (Pro). |
| eFTP | Continuously estimated functional threshold power via the CP2 model — no manual test. Premium (Pro). |
| Recovery score | Daily readiness from HRV, resting HR and sleep. **Free.** |
| Sleep score | `RecoveryDay.sleepScore` (0–100) — the canonical sleep score shown everywhere. **Free.** |
| Plan cascading | The engine rewriting the week after a missed/changed session while keeping the goal. Premium (Elite). |
| Free tier | Permanent, no-gate access to recovery + sleep + trend + widgets. Never a trial. |

**How they describe the problem (verbatim, proxy sources — see `research/voc-cycling-recovery-2026-08.md`):**
- "my recovery scores bear no resemblance to how I feel or perform. As a result I have decided to ditch whoop. I have lost all confidence in the system."
- "the sleep metrics can just ruin your day even if you're feeling fine."
- "Garmin gave me a sleep score of 84 last night despite waking up at least 4 times for the baby… but I don't really feel that good, so will take it easy despite what my watch says."
- "Workouts listed as optional, if not completed, get logged as red as missed workouts in Compliance."
- "There's also no flexibility at all… the app won't allow me to do that."
- "Doesn't adapt to you… it just starts you off with a PL 1 workout as if you've done 0 work before."
- "…what I've been doing that day and how I feel and not what AI thinks I need to do."
- "I would like one app that tracks across a few devices… It then can mesh all the info together to prepare an adaptive plan."
- "The price is steep at $30/mo…" · "Great tracking awful price."

**Phrases worth reusing in copy:** "ruin your day" · "bear no resemblance to how I feel" · "lost all confidence in the system" · "logged as red as missed workouts" · "doesn't adapt to you" · "not what AI thinks I need to do" · "descriptive, not prescriptive".

> **Still proxy, not first-party.** These are competitors' customers (App Store reviews + TrainerRoad forum, 2026-08), not Summit users. No Spanish or Catalan sources, and Reddit was unreachable. Treat as directional; replace as Summit accumulates its own reviews.

---

## Brand Voice

**Tone:** Serious, precise, understated. Confident without hype. Speaks to someone who already knows what TSB means.

**Style:** Direct and declarative. Short sentences. Concrete mechanisms over adjectives. States the trade-off instead of hiding it ("Not AI. Not a chatbot."). Technical terms used plainly, never explained condescendingly.

**Personality:** Rigorous · honest · opinionated · calm · athlete-first.

**Design principles that carry into copy:** (1) *Data to decisions* — if a number doesn't change what you do, it shouldn't be on the screen. (2) *Adapts to real life* — a plan that ignores sickness and travel is a wishlist. (3) *Serious, not complicated* — professional-grade science without needing a sports-science degree.

**Register:** English is the source language on the site; Spanish and Catalan are translations (`es/`, `ca/` generated at build; blog hand-translated).

---

## Proof Points

**Available today:**
- Live on the App Store (Apple ID `6754172654`), iOS 26+, free to download.
- Real integrations shipped: Strava (auto-import), Hammerhead Karoo (native direct-to-head-unit, v1.1), intervals.icu (→ Garmin, Zwift, MyWhoosh), Apple HealthKit.
- Deterministic engine — the traceability claim is a real architectural property, not marketing.
- Founder story: Jordi Espanyol, amateur cyclist and software developer in Barcelona; built it for his own Gran Fondo training problem.

**Missing — do not fabricate:**
- **No testimonials.** None exist yet.
- **No ratings/reviews** meaningful enough to cite; the on-page stars are a placeholder and the live rating badge only appears at ≥1 App Store rating.
- **No user-count, download or outcome metrics** cleared for publication.

> Until real reviews exist, proof has to come from mechanism and founder credibility, not social proof. Do not invent numbers, quotes or logos.

---

## Goals

**Business goal:** Installs. The app is newly launched and the constraint is discovery, not funnel optimisation.

**Key conversion action:** App Store download via a badge carrying `?pt=128228195&ct=web&mt=8`. Secondary: blog email capture (`/blog-subscribe` → `contacts` → Resend).

**Current metrics:** Not established here. PostHog covers the website only, and only for visitors who accepted cookies — treat it as a lower bound, not truth. App Store Connect campaign data needs 24h and ≥5 first-time downloads before `ct=web` reports at all. Get real baselines before setting targets.

---

## Changelog
*Newest first. One line per revision: what changed and why.*
- v3 (2026-08-04) — Premium pricing confirmed against the live App Store listing during the ASO audit (was flagged UNCONFIRMED since v1); no other section changed. Audit in `research/aso-audit-2026-08.md`.
- v2 (2026-08-03) — Filled Customer Language with verbatim from proxy VOC research (315 competitor App Store reviews + 54 TrainerRoad forum posts); added two research-sourced objections (score-vs-feel mismatch, "descriptive not prescriptive"). Evidence and its limits in `research/voc-cycling-recovery-2026-08.md`.
- v1 (2026-08-03) — Initial context, auto-drafted from both repos. Encodes the shipped-product hard constraints (no Watch app, free-tier scope, trial vs free, anti-"AI" framing) so downstream marketing skills stop generating claims the product can't back.
