# Outreach drafts — intervals.icu thread + press pitches

**Date:** 2026-08-04 · Ready to send. Every claim checked against `product-marketing.md` → Hard Constraints.

---

## 1 · intervals.icu — reply on the existing thread

> **Published 2026-08-04.** Kept here as the reference for tone and for the cadence rules below, which are the part that still needs doing.

**Where:** the existing "Project Summit — adaptive, recovery-driven training plans (iOS)" topic in *External Projects*. **Reply to it, do not start a new topic** — the whole point is that the thread becomes a living log, and a second topic splits it.

Two things the original post left on the table, both used below: it listed **home-screen widgets as roadmap** when they shipped in v1.3, and it **never mentioned the free tier at all** — only the 14-day trial. Leading with "you asked, here it is" and then correcting the free-tier omission is a genuine update, not a re-announcement.

### Draft

> **v1.3 + v1.4 — widgets landed, and the sleep score got rebuilt**
>
> Following up on my own roadmap from this thread, since two of the three things I listed have shipped.
>
> **Widgets (v1.3).** Recovery, today's load and your next session on the Lock Screen and Home Screen. Also App Intents, so you can ask Siri or Spotlight for today's session (type · duration · TSS) or your readiness (recovery · sleep · load) without opening anything. Read-only, deliberately.
>
> **The sleep engine (v1.4).** This is the one I want feedback on. The old score compared your night against a generic ideal, which I'd come to think was the wrong question — a 6h45 night means something very different for me than for someone who habitually sleeps eight. So it now scores **against your own historical median** rather than an absolute target. The detail view shows the reasoning: where last night sits in your personal range, a sleep-debt chart, stages and rhythm.
>
> Recovery, sleep and load are also three separate cards now instead of one blended number, and the readings follow your trend over the past month rather than just this morning's value.
>
> **One thing I should have said in the first post:** the recovery score, the sleep score and its full breakdown, the recovery trend and the widgets are **free, permanently**. Not the trial — the free tier. I mentioned the 14-day trial originally and never mentioned this, which was daft, because it's the part most of you would actually use. If you already wear something that writes HRV and sleep to Apple Health, that's the whole thing, at no cost.
>
> Also fixed in v1.4, in case it bit anyone here: heart rate and HRV were being double-counted between Sleep and Recovery and distorting both scores; Karoo activities without a power meter could lose their HR, elevation, speed and cadence; and a second recovery reading in the morning could change your session for no real reason.
>
> Still nobody has answered the question I ended the first post with, so I'll ask it more concretely: **when the score disagrees with how you actually feel, what would make you trust the number over the feeling — or is that a lost cause?** I've seen enough people say the data should be descriptive, not prescriptive, that I'd rather build for that view than argue with it.
>
> Bug reports and "why doesn't it do X" still welcome here.

### Rules for this thread from here

- **Post every release.** That is the entire difference between this thread and the 15,000-view ones next door.
- **Reply within a day, always.** The neighbouring threads live on replies, not posts. The successful maker in that category mostly writes "thank you, I'll fix it" — responsiveness *is* the content.
- **Never post a bare link.** Every post should be readable and useful without clicking anything.
- Do **not** promise the watchOS app. It is still listed as roadmap in the original post, which is accurate — the shipped build has no watch app.

---

## 2 · Press pitches — v2

> **Revised 2026-08-04 after review.** The first drafts led with the free tier and never said what Summit *is*. That sells the price of a slice, not the product: a reviewer reads "free recovery score" and files it as another HRV app that shows a number, only cheaper. The differentiator is not the price, it is that **recovery moves the plan** — without that sentence, "free" means nothing, and it positions Summit as cheap rather than different. All three now lead with the product and land the free tier as the kicker.

**DC Rainmaker's contact page states he receives 200–300 emails a day** and asks explicitly: *"the shorter/more concise your message below – the more likely I'll be able to answer it."* The form is Name / Email / Subject / Message — plain text, so no formatting survives. Every draft below is written for that constraint: no bold, no bullets, under ~130 words.

**Send individually. No press release, no attachments, no CC.** Have App Store promo codes and a 30–60s screen recording ready to offer — never attach them unprompted.

**Follow up once, after about ten days. Never twice.**

### 2.1 — DC Rainmaker (via the contact form at dcrainmaker.com/contact)

*Angle: the two product claims a technical reviewer can test in an afternoon. Free tier as the closing oddity.*

> **Subject:** Training app that plans around the time you actually have
>
> Ray,
>
> Project Summit is an iOS training app for self-coached endurance cyclists. Two claims, both easy to disprove if I'm wrong.
>
> It plans around your availability, not just your physiology: you tell it how much time you actually have that day, and if today is zero the week reflows instead of breaking.
>
> And recovery moves the plan both ways. Most tools only brake — Summit also pushes when HRV and sleep say you're primed, so a good window gets used instead of wasted.
>
> The engine is deterministic: no LLM, and every session traces back to the rule and the numbers that produced it.
>
> Unusual commercially too — the daily recovery score and the full sleep analysis are permanently free, read from Apple Health.
>
> Promo codes on request. No reply needed if it's not for you.
>
> Jordi Espanyol — Barcelona, solo developer
> projectsummit.app

### 2.2 — GPLama (Shane Miller)

*Angle: built the opposite way to the category, with a demo that films in thirty seconds.*

> **Subject:** A training app built the opposite way to the rest — deterministic, no LLM
>
> Shane,
>
> Project Summit is an iOS training app for self-coached endurance cyclists. The category is bolting an LLM onto everything; I've gone the other way and I think that's the more interesting story.
>
> The engine is deterministic — same inputs, same output — and every session traces back to a codified sports-science rule you can open and read. When it drops today's intervals after a bad night, it tells you which rule fired and on which numbers.
>
> It also plans around your availability, not just your physiology: say you've got forty minutes and it replans; say you've got nothing and the week reflows.
>
> Films in about thirty seconds — sleep badly, open the app, watch the hard session turn easy, then open the reasoning behind it.
>
> Solo developer in Barcelona, so it's small. But it is genuinely built the opposite way to the rest, and I'd rather you tested that claim than took my word for it. Promo codes on request.
>
> Jordi Espanyol
> projectsummit.app

### 2.3 — BikeRadar (Simon von Bromley, tech)

*Angle: roundup inclusion, led by the thing that would differentiate it in the list.*

> **Subject:** For the training-apps roundup — a plan that adapts to the time you actually have
>
> Simon,
>
> You keep BikeRadar's training-app roundups current, so: a candidate for the next revision.
>
> Project Summit is an iOS app for self-coached endurance cyclists. What would set it apart in that list is that it adapts to two things, not one — your recovery, read from Apple Health, and the time you actually have. Tell it today is a write-off and the week reflows around it rather than logging you as non-compliant.
>
> It pushes structured sessions natively to a Hammerhead Karoo, or through intervals.icu to Garmin, Zwift and MyWhoosh, and imports from Strava automatically.
>
> The daily recovery score and full sleep analysis are permanently free; Premium adds training load, power analysis and the adaptive plan.
>
> iOS only, solo developer — worth saying up front in case that rules it out. Screenshots, a short demo and promo codes available.
>
> Jordi Espanyol
> projectsummit.app

### Expectation setting

These are long shots and should be treated as such. All three cover major hardware and established platforms; a solo iOS app with four ratings is not their usual subject. The reason to send them anyway is that it costs half an hour and the downside is silence. **Do not build a plan on a reply arriving** — the community work in Tier 1 and 2 of the discovery plan is the part that compounds regardless.

If nothing lands, the realistic next rung is smaller and warmer: Spanish-language cycling outlets, and the weekly news formats (The FIT File) where a release is easier to fit than a full review.

## Claims used, and where each is verified

| Claim | Source |
|---|---|
| Recovery, sleep + breakdown, trend, widgets are free permanently | `EntitlementGate.gates(for: .free)` returns `[]` |
| Any Apple Health-writing wearable works; no watch required | `faq.q6` |
| Deterministic, traceable, no LLM | `faq.q2` |
| Sleep score now relative to personal history; sleep debt, stages, rhythm | v1.4 release notes |
| The four v1.4 fixes quoted in the forum post | v1.4 release notes, verbatim |
| Widgets + App Intents in v1.3 | v1.3 release, roadmap page |
| Karoo native, intervals.icu distribution, Strava import | `index.html` integrations |
| Plans around stated availability; no window today means the week reflows | `index.html` "Adapts to your life" |
| Recovery moves the plan both ways — eases *and* pushes to catch good windows | `index.html` "It reads your recovery — both ways" |
| Premium: training load, power, adaptive plan | Pro/Elite gate lists |

**Not claimed anywhere, deliberately:** any watchOS app or on-wrist surface, any user or download number, any rating, and "AI" as a description of the product.
