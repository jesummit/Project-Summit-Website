# ADR-2026-08-06 — Marketing copy is a product claim, and the build verifies it

Date: 2026-08-06
Status: **Accepted**
Related: `.agents/product-marketing.md` (Hard Constraints, and the "Free tier,
verified against the app" section this ADR produced),
`.agents/research/competitor-stride-2026-08.md` (the teardown that started it),
`.agents/website-plan-2026-08.md` (the plan it executed), `docs/blog.md`.

## Context

A competitor teardown of stride.is was commissioned to find what their site does
better than ours. It found the expected structural gaps — 13 comparison pages to
our zero, a curated `llms.txt`, a public changelog — and building those exposed
something the teardown was not looking for: **several of this site's own claims
about its own product were wrong**, and nothing in the repo could have caught
them.

Concretely, live on the domain at the start of the session:

- The hero and the final CTA rendered **five filled stars** beside the App Store
  badge, with no rating behind them. The repo already refused `aggregateRating`
  in JSON-LD on the grounds that fabricated review markup is a spam violation;
  the same claim was being made in pixels.
- The free tier was described as four things. An audit of the iOS app found it is
  **materially broader** — the site was underselling the one thing competitors
  have no answer to.
- Widening it exposed the inverse error: `pricing.html` sold activity
  **elevation** as a Pro feature. It is free. One word overselling Pro and
  underselling Free simultaneously.
- "Any wearable that writes to Apple Health works" appeared in ~24 places.
  Technically true; misleading in practice, because
  `Core/HealthKit/HealthKitTypes.swift` reads `appleSleepingWristTemperature`,
  which only an Apple Watch writes.
- `pricing.html` promised a 14-day trial unconditionally. It is a StoreKit
  introductory offer, per Apple ID, consumed once used.
- The first comparison page conceded the Performance Management Chart to
  TrainingPeaks as something Summit lacks. `Models/TrainingLoadModels.swift`
  defines ATL, CTL and TSB. We were giving away ground we hold.
- The same page claimed Summit "works alongside a coach". There is no
  coach-facing surface in the app at all.

None of these was caught by review, because there was nothing to review them
*against*. The checkers verified structure — i18n coverage, link resolution,
title/meta sync — and said nothing about whether a sentence was true.

## Decision

**A claim about the product is treated as a product artifact, not as copy.** It
must be traceable to either the app's source or a dated third-party page, and
where a machine can check it, a machine does.

Three rules follow.

### 1. A claim about Summit is traceable to code

`.agents/product-marketing.md` is the single source of truth for what may be
said, and its claims carry `file:line` citations into `Project-Summit-MVP`. When
the doc and the code disagree, the code wins and the doc is corrected — as it
was here, in both directions.

The polarity trap that produced the original under-claim is recorded explicitly,
because it inverts the whole answer and is easy to re-derive backwards:
`EntitlementGate.gates(for:)` returns the gates a tier **unlocks**, so
`case .free: return []` means Free unlocks none of the 17 gates — *not* that
nothing is gated. Entitlement is the tier comparison in
`SubscriptionManager.isEntitled` (`:184-186`).

### 2. A claim about a competitor carries its source and its date

Every figure links to that company's own page and states when it was checked.
If a fact cannot be sourced from the vendor, it is published as **"not
documented"** — never as a limitation. Absence of evidence is not evidence of
absence, and the comparison cluster says so on the page.

A competitor link is verified **by the title of the page it resolves to**, not by
its status code. This is not pedantry: during this session `xert.app` was found
to be a crypto-payments company, and a link to Stride was written pointing at
`stridetech.io`, a marketing personalisation platform by Dazetta. Both return
200. Stride is `stride.is`.

Private competitive research must not be used to argue against a competitor. The
Stride teardown in `.agents/research/` exists for our planning; the page about
Stride was built only from what Stride publishes publicly, dated like everyone
else's.

### 3. Where a claim is duplicated, a checker guards the duplication

Two new gates, both born from a real drift surface created in this session:

- **`tools/check-faq-home.js`** — the home page repeats eight of `faq.html`'s
  answers verbatim, sharing their i18n keys. That drifts *asymmetrically*: edit
  an answer in `faq.html` and ES/CA follow, because both pages read the
  dictionary, while the English on the home page silently keeps the old text.
  Several of those answers are Hard Constraint surfaces, so a stale copy is a
  false product claim, not a typo.
- **`tools/check-screenshots.js`** — a locale screenshot directory must be
  complete. A half-filled one ships a page mixing two languages, which is worse
  than a consistent fallback and invisible without a gate.

`tools/check-meta-sync.js` was also added to `verify.yml`: `package.json`
included it and `CLAUDE.md` claimed CI enforced it, but the workflow never ran
it. A documented gate that does not run is worse than no gate.

## Options considered and discarded

**Put the changelog and the comparison prose in `assets/js/i18n.js`.** Rejected.
That dictionary is the site's bounded UI strings; release notes grow with every
version and comparison pages are 1,200 words of argued prose. The changelog
follows the `llms.txt` pattern instead — data in `tools/changelog-content.js`,
rendered per locale by `build.js`. The comparison cluster follows the blog
pattern — hand-written English with hand-translated twins — because **nobody can
review prose inside a string literal**.

**Hand-write `llms.txt`.** Rejected. It is a second copy of the product's claims
living outside every check the pages get, and it drifts silently: the competitor
we studied still advertises a 30-day trial in theirs while every page of their
site says 14 days. It is generated, and the build asserts every linked path
resolves before writing.

**Swap screenshots by language at runtime, like the App Store badges.**
Rejected. The hero's centre phone is the LCP image and carries
`fetchpriority="high"`; a JS `src` swap would fetch the wrong-language capture
first and then a second one — a doubled LCP plus a visible flash. Substitution is
build-time, and only for files that exist on disk, so `check-links.js` never sees
a dead path and the pipeline stays inert until captures land.

**Duplicate the `FAQPage` schema onto the home page.** Rejected, reversing what
the plan proposed. `faq.html` already publishes that entity for all 16 questions
and `check-meta-sync.js` guards it verbatim; a second copy of the same Q&A on
another URL duplicates the entity and doubles the drift surface with only half of
it guarded. The visible block ships; the entity stays where it is.

**Claim Summit is cheaper.** Rejected on the evidence. Against the adaptive-
platform set, Summit Elite's annual price is identical to JOIN's, higher than
Xert's, and vastly higher than Intervals.icu's free tier. The site publishes no
Summit prices by policy, so the reader could not verify the claim even if it were
true. The pages use the **stack** comparison instead — measured recovery plus an
adaptive plan means two subscriptions today, and the arithmetic is the reader's
to do.

**Rank Summit first in the listicles.** Rejected. It is entry 3 of 6 in one and
3 of 7 in the other, and the quick-answer boxes send readers to competitors when
those genuinely suit them better. A listicle that ranks its own product first for
everything converts nobody and would have cost the credibility the head-to-head
pages were built to earn.

**Use two verified facts that would have landed.** Rejected as punching down:
Xert's iOS app has not shipped since November 2021, and Stride has 13 App Store
ratings with an iOS 26.1 floor. Both are true and Apple-sourced. On pages whose
entire value is honesty, tone is load-bearing.

**Relax `check-screenshots.js` to unblock CI.** Rejected. The gate fired on a
real partial locale set. A checker that is loosened the first time it says no was
never a checker.

## Consequences

- The site can now make a **stronger** free-tier claim than before, because the
  claim is now the true one. That tier is the differentiator against every
  competitor studied, and it had been undersold since launch.
- Five gates run in CI instead of three. Link-checker coverage went from 25 files
  to 67, and the checker itself was corrected twice — it resolved root-absolute
  paths relative to the page (30 false positives on a URL that returns 200 in
  production) and scanned references inside HTML comments (9 phantom failures
  that would have kept CI red until an unrelated asset existed). Both bugs made
  the gate *wrong*, not strict.
- `rerootShellLocale()` is now generic over content clusters. It localized
  `blog/` links for the es/ca shells but knew nothing about `compare/`, so a
  Spanish visitor would have landed on the English hub with a translation sitting
  beside it.
- `CLAUDE.md` was itself asserting the "any wearable works" equivalence as
  verified truth. A future session would have reintroduced the error from project
  instructions. Documentation that seeds claims is subject to the same rule as
  the claims.
- Comparison pages are written to be quoted. A caveat one paragraph away from its
  claim survives a human reader and does not survive extraction by an answer
  engine, so qualifiers belong in the sentence they qualify.

## Debt

- **English app screenshots.** The canonical home page — the `x-default` target —
  still serves Spanish app UI. The pipeline is built and inert; it activates on
  `npm run build` once a complete set lands in `assets/screenshots/en/`. Handled
  outside this session.
- **`check-meta-sync.js` does not cover the compare cluster** (root shell pages
  only), so a `<title>`/OG drift on a comparison page fails silently.
- **`wordCount` in the compare pages' `Article` JSON-LD** was already inconsistent
  with any single counting method before this session; deltas were preserved
  rather than the figures re-derived.
- **Whoop's pricing could not be re-verified** on 2026-08-06 — `whoop.com`
  returns 403 to automated fetches. The figures carry their 2026-08-05 date and
  point at whoop.com as the authority.
- **Competitor facts age.** Every page states the date it was checked; the
  cluster needs a scheduled re-check, and the pages are dated so that a stale one
  is visible rather than silently wrong.
