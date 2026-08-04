# Outreach drafts — intervals.icu thread + press pitches

**Date:** 2026-08-04 · Ready to send. Every claim checked against `product-marketing.md` → Hard Constraints.

---

## 1 · intervals.icu — reply on the existing thread

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

## 2 · Press pitches

Three emails, one angle each. **Send individually, personally, no press release, no attachments, no CC.** Any hint of a mailshot and all three bin it.

**Before sending, have ready:** a handful of App Store promo codes (reviewers need them for Premium), a 60–90s screen recording of the adaptation happening, and the press assets. Offer, do not attach.

**Do not:** follow up more than once, after about ten days. Do not chase a second time — this is a small world and the reputational cost is durable.

### 2.1 — DC Rainmaker (Ray Maker)

*Angle: the free tier, aimed squarely at his recurring app-pricing comparisons.*

> **Subject:** Recovery + sleep scores, free forever — an odd pricing choice worth a look
>
> Ray,
>
> You run the pricing comparisons nobody else bothers to keep current, so this is aimed at you specifically.
>
> I build Project Summit, an iOS training app for self-coached endurance cyclists. The daily recovery score, the full sleep analysis and breakdown, the recovery trend and the widgets are **free permanently** — not a trial, not a teaser. It reads HRV, resting HR and sleep from Apple Health, so any wearable that writes there works; no hardware, no subscription.
>
> The reason I think it's worth a paragraph in one of your comparisons: this is the layer the recovery wearables charge a monthly subscription for, given away from the watch someone already owns. Premium exists — training load, power analysis, the adaptive plan — but it sits above that line, not on top of it.
>
> Happy to send promo codes if you want to poke at the paid side. If it's not interesting, no reply needed and no hard feelings.
>
> Jordi Espanyol — Barcelona, solo developer
> projectsummit.app

### 2.2 — GPLama (Shane Miller)

*Angle: deterministic and explainable, plus a demo that films well.*

> **Subject:** A training app that refuses to call itself AI — happy to be picked apart
>
> Shane,
>
> Everything in this category is bolting an LLM on and calling it coaching. I've gone the other way and I suspect that's more interesting to your audience than another AI announcement.
>
> Project Summit's engine is deterministic: same inputs, same output, and every recommendation traces back to a codified sports-science rule you can open up and read. No model, no chatbot, no generated text. When it moves today's session after a bad night, it will tell you exactly which rule fired and on which numbers.
>
> Films well, too: sleep badly, open the app, watch the hard session become an easy one, then open the reasoning behind it. Whole thing is about thirty seconds.
>
> It's an iOS app from one developer in Barcelona — I'm not going to pretend it's a big product. But it is genuinely built the opposite way to the rest of the category, and I'd rather you kicked the tyres on that claim than took my word for it. Promo codes on request.
>
> Jordi Espanyol
> projectsummit.app

### 2.3 — BikeRadar (Simon von Bromley, tech)

*Angle: inclusion in a roundup, which is the durable, rankable win.*

> **Subject:** For the training-apps roundup — free recovery + sleep, no subscription
>
> Simon,
>
> You keep BikeRadar's training-app roundups current, so a candidate for the next revision.
>
> Project Summit is an iOS app for self-coached endurance cyclists. What sets it apart from the others on that list: the daily recovery score and the full sleep analysis are **permanently free** — it reads HRV, resting HR and sleep from Apple Health, so any wearable that writes there works. Premium adds training load, power analysis and the adaptive plan, but the recovery layer never expires.
>
> It also pushes structured sessions out to a Hammerhead Karoo natively, or via intervals.icu to Garmin, Zwift and MyWhoosh, and imports from Strava automatically.
>
> Screenshots, a short demo and promo codes available if useful. iOS only, iOS 26+, solo developer — worth saying up front so it doesn't waste your time if that rules it out.
>
> Jordi Espanyol
> projectsummit.app

---

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
| Premium: training load, power, adaptive plan | Pro/Elite gate lists |

**Not claimed anywhere, deliberately:** any watchOS app or on-wrist surface, any user or download number, any rating, and "AI" as a description of the product.
