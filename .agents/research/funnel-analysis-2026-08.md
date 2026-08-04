# Acquisition reality check — real PostHog data

**Date:** 2026-08-04 · **Source:** PostHog project 184201, last 90 days · **Status:** first time this data has been looked at

Everything below is measured, not modelled. Read the caveats before quoting any number — several of them invert the obvious reading.

---

## Caveats that change how these numbers read

1. **PostHog only fires after cookie consent.** Real traffic is higher than every figure here by an unknown factor. Treat all visitor counts as a **lower bound**, and never compare them to a competitor's public numbers.
2. **`/privacy-policy.html` has 101 unique visitors — 2nd most visited page on the site.** That is not marketing traffic. Apple requires a privacy-policy URL on the App Store listing, so most of those are people already on the listing. A large share of "direct" traffic is the same thing. **The real front door is ~160 visitors in 90 days, not 247.**
3. **`Application Installed` first appears on 2026-07-19 with a spike of 45 that week**, against 9 website visitors. That is the app's analytics going live, not an acquisition event — existing users fire it on first run after updating. **Do not read it as 45 new installs.**
4. Instrumentation for `appstore_cta_viewed` starts 2026-06-22. Any "% of visitors who saw a CTA" computed over the full 90 days is wrong.

---

## The website funnel

| Stage | Unique people, 90 days |
|---|---|
| Pageview (consented) | 247 — of which ~160 reach the actual home page |
| Saw an App Store CTA | 33 |
| Clicked through to the App Store | 14 |
| Blog email signup | **3** (all on 15–16 July; nothing since) |

**The CTA is not the problem.** 14 of 33 clicked — a 42% click-through. That is a healthy rate. The problem is that only 33 people were there to see it.

## Traffic is collapsing, and that is the headline

Weekly unique visitors:

| Week | 05-18 | 05-25 | 06-01 | 06-08 | 06-15 | 06-22 | 06-29 | 07-06 | 07-13 | 07-20 | 07-27 | 08-03 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Visitors | 33 | 42 | 44 | **53** | 16 | 22 | 12 | 21 | 16 | 9 | 10 | **2** |

Peak was 53/week in early June — *before* the app launched. It is now 2. The site has no acquisition engine running: no ads, no publishing cadence, no directory presence, no outbound. Traffic decayed to whatever Instagram happens to push.

## Where the traffic comes from

| Source | People | Read |
|---|---|---|
| Direct / none | 169 | Inflated by App Store → privacy-policy taps and by Instagram bio links that drop the referrer |
| **l.instagram.com** | **46** | The only channel that is actually working |
| tally.so | 13 | Residue of the retired waitlist |
| **intervals.icu** + forum | **8** | Unprompted community referral — nobody asked for this |
| **www.google.com** | **6** | Organic search over 90 days |
| Facebook (all) | 7 | Marginal |

**Google sent 6 visitors in 90 days.** The SEO machinery is built — per-locale URLs, hreflang, JSON-LD, sitemap, canonical tags — and it is ranking for nothing. That is the single biggest gap between effort spent and reach obtained.

The `intervals.icu` referrals are the most interesting line in the table: 8 people arrived from a community nobody marketed to, which says the integration communities are a live channel that has never been worked.

## Content is not yet a channel

Best-performing blog post: **4 unique readers in 90 days**. The ES translations out-read the English originals, consistent with an Instagram-driven Spanish audience. The generated `es/` and `ca/` shells drew 3 and 1 visitors respectively.

The content and i18n infrastructure is sound. It has nothing pointing at it: no backlinks, no distribution, no cadence.

## The in-app funnel, for context

| Stage | People |
|---|---|
| Onboarding step viewed | 29 |
| Signup started | 22 |
| Signup completed | 14 |
| Paywall viewed | 20 |
| **Trial started** | **1** |
| Weekly plan viewed | 2 |

Signup completes at 64%, which is fine. **20 paywall views produced 1 trial.** And only 2 people have ever seen a weekly plan — the product's core artefact. Small numbers, but the direction is clear: this is an activation problem, downstream of everything in this document, and it is not a marketing fix.

---

# What to do about reach

Ranked by expected reach per hour of work, given the evidence above.

### 1. Comparison pages — because directories are blocked until they exist

My first instinct was directory submissions: free backlinks, exactly the authority the SEO machinery is missing. Running the readiness check killed that ordering. Directories are the *source* of link equity and need a *destination* that converts — submitting first wastes the one-time first-submission advantage on a homepage.

**Readiness assessment against the standard gate:**

| Requirement | Summit |
|---|---|
| Publicly accessible, privacy + terms live | ✅ |
| Single H1 per page, sequential hierarchy | ✅ verified on all 6 content pages |
| `Organization` / `SoftwareApplication` / `FAQPage` JSON-LD | ✅ on all 7 shell pages |
| Logo assets (PNG, square, favicon) | ✅ — but **no SVG** |
| 5–8 real screenshots | ✅ |
| 60–90s demo video | ❌ — same gap as ASO item B5 |
| **3–5 competitor alternative pages** | ❌ **hard block** |
| **3–5 use-case pages** | ❌ **hard block** |
| Pricing page | ❌ — see below |
| 20 users who could leave a review | ❌ — 14 signups, 4 ratings |

**The pricing-page item is a genuine conflict, not an oversight.** Most Tier 1 directories require one, and the site deliberately publishes no prices (`faq.q13` points to the app and the App Store). That was a considered decision, so it needs a decision to reverse — a minimal "what's free vs Premium" page without figures would satisfy most directories while keeping the numbers off the site. Your call, not mine to make.

**So build the destinations first.** `/alternatives/whoop`, `/alternatives/trainingpeaks`, `/alternatives/trainerroad` — the highest commercial intent in the category, and the one type of page that could give Google something to rank. The VOC research already supplies the arguments and the customer's own words, and the honest "when to choose them over us" sections are exactly what AI engines cite.

Then submit to directories, and only to shelves an iOS consumer app actually belongs on.

### 1b. Directory submissions — after the pages exist

Most of the standard catalog is the wrong shelf: G2, Capterra, TAAFT, MCP and no-code registries are for B2B SaaS and AI tools, not a consumer cycling app. Forcing a listing into the wrong category gets it rejected by moderators and burns the first submission.

What genuinely fits: Product Hunt (the anchor — 3 weeks of prep, ask for feedback and never for upvotes), AlternativeTo, and cycling/endurance-specific roundups and app directories. That is a short list, and it is worth doing properly rather than broadly.

### 2. Work the communities that are already sending traffic

`intervals.icu` sent 8 visitors with zero effort. The TrainerRoad forum was, in the VOC research, the richest source of ICP language on the internet. These are places where the ICP is already discussing exactly the problem Summit solves.

This is participation, not posting links — `social`'s listening playbook plus `community-marketing`. Slow, but it is the channel with proven organic pull.

### 3. Give Google something to rank for

Six visitors in 90 days is not a ranking problem, it is an inventory problem: five posts and no cadence cannot rank for anything. The comparison pages in item 1 are half the answer; the other half is **`content-strategy` + `ai-seo`** — a topic cluster around sleep, recovery and training decisions, written to be cited by AI answers as well as ranked, on a cadence rather than in one burst.

Before investing here, **check Google Search Console**. Six visitors is consistent with both "indexed but not ranking" and "barely indexed", and those need opposite responses.

### 4. Double down on Instagram, since it is the one thing working

46 of the identifiable visitors. The `social` skill covers format and cadence. Note the audience is Spanish-speaking — the ES blog out-reads the English one.

### 5. Fix the measurement blind spot

Two cheap fixes worth doing before spending effort on any channel:
- The **`/thanks.html`** page still draws 11 visitors from the retired Tally waitlist. Dead path.
- **Blog email capture is effectively dead** — 3 signups ever, none since 16 July. Either the offer is not visible or the flow broke. Worth 20 minutes to verify manually, because it is the only owned audience the site can build.

### Not recommended yet

**Paid ads.** With 2 visitors a week and 1 trial from 20 paywall views, buying traffic would pour spend into a funnel that has not been shown to convert. Fix activation and earn some organic reach first.

---

## What this data cannot tell us

- **True traffic volume** — consent gating means everything here is a floor.
- **Whether the site is indexed at all.** Google Search Console is not connected to this analysis; 6 visitors is consistent with both "indexed and not ranking" and "barely indexed". Check GSC before investing in content.
- **App Store impression → install conversion**, which lives in App Store Connect, not PostHog.
- **Why trials do not start.** 20 paywall views is too small a sample to diagnose, and the answer is in the app, not the site.
