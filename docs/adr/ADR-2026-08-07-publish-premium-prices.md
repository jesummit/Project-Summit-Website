# ADR-2026-08-07 — Publish the Premium prices, with the storefront caveat attached

Date: 2026-08-07
Status: **Accepted**
Supersedes: the "no prices on the site" policy recorded in
`ADR-2026-08-06-marketing-copy-is-a-product-claim.md` (the discarded option
"Claim Summit is cheaper", and the policy it rested on). The rest of
ADR-2026-08-06 — claims traceable to code, competitor facts dated and sourced,
checkers guarding duplicated claims — remains in force **unchanged**, and this
decision is written to satisfy it rather than to loosen it.

## Context

Until today the site published no Summit price anywhere, by policy. The
reasoning was sound on its own terms: Apple sets Premium pricing per storefront,
a figure written into the HTML is wrong in some country the day it ships, and
the App Store listing is the only source that is live and local. So
`pricing.html` shipped deliberately without figures, and the comparison cluster
repeated a variant of "Summit publishes no prices of its own" on every page.

What that policy actually cost, once the comparison cluster existed, was
visible in the pages themselves:

- **The listicle could not answer its own most-asked question.** The FAQ entry
  on `adaptive-cycling-training-apps.html` was literally headed "Is Summit
  cheaper than TrainerRoad or JOIN?" and answered "we do not publish Summit's
  price, so we cannot answer that and will not pretend to" — followed by six
  competitors' exact figures. A reader comparing seven products was handed
  everyone's number but ours.
- **We excluded ourselves from our own table.** `free-hrv-recovery-apps-iphone.html`
  tabulates eight iPhone apps by download price and exists to teach the
  difference between a free download and a free daily score. Summit — free to
  download, with a *permanently* free daily score — was absent, with the missing
  price given as the reason.
- **The price section conceded and then stopped.** "The price question,
  honestly" named Intervals.icu's free tier and Xert's $99.95 as "hard to beat
  and we are not going to try", with no figure of ours on the other side of the
  scale. The section was arguing one half of a comparison.
- **The one genuinely favourable like-for-like comparison on the site was
  unusable.** JOIN is €119.99/year, in euros, on its own pricing page. Summit
  Elite is €119.99/year. Same currency, same annual figure, and JOIN's readiness
  is self-reported while Summit's is measured off the wearable. That comparison
  needs no exchange rate, no hedge and no spin — and the policy made it
  unsayable.

The withheld number was also not protecting anyone. It is two taps away on the
App Store listing the page links to; the only person the policy inconvenienced
was the reader deciding whether to take the third tap.

## Decision

**Publish the euro figures, and attach the caveat to the number instead of
using it as a reason to withhold the number.**

The prices, from the in-app purchase list on the Spanish App Store listing,
checked 7 August 2026 (consumer prices, VAT included):

| Tier  | Monthly | Yearly  | Annual works out at |
|-------|---------|---------|---------------------|
| Free  | €0      | €0      | —                   |
| Pro   | €7.99   | €63.99  | €5.33 / month       |
| Elite | €14.99  | €119.99 | €10.00 / month      |

Three rules govern how they may be used.

### 1. A price never appears without its caveat

Every surface stating a Summit price carries the storefront caveat in the same
place — the storefront it was read from, the currency, that VAT is included,
the date it was checked, that Apple sets the price per country and it can
change, and that the App Store and the app show the live local price before
anything is charged — or links to `pricing.html`, where the caveat lives in
full. This is ADR-2026-08-06's "a qualifier belongs in the sentence it
qualifies" rule applied to a number: a caveat one paragraph away survives a
human reader and does not survive extraction by an answer engine, and these
figures are written to be quoted.

The figure is dated for the same reason every competitor figure on the site is
dated. Ours ages the same way theirs does, and a stale price should be visible
rather than silently wrong.

### 2. Euros are compared with euros

Our figures are in euros. Most competitor figures on the site are in US
dollars. No page implies an exchange rate, totals a mixed-currency stack into
one number, or writes "cheaper" across two currencies. Where both figures are
euros the comparison is made directly and without hedging — that is the JOIN
comparison, and it is now the anchor of the price section. Where the competitor
is priced in dollars, both figures are stated with the currency difference
named, and the conclusion is left to the reader.

The **stack argument** that ADR-2026-08-06 chose over a cheapness claim is not
replaced; it is completed. Measured recovery plus an adaptive plan is normally
two subscriptions — Whoop from $199/year plus TrainerRoad at $209.99/year,
roughly $409/year — for two of the three layers, with race-day fuelling in
neither. That arithmetic was already on the page. What it lacked was the number
on our side of it.

### 3. We do not claim to beat what we do not beat

Intervals.icu is free. Xert's annual is $99.95. Both remain stated as facts on
the pages, in the same words their vendors use, and neither is contested. A
false price claim on a page whose entire value is that its figures check out
would cost more than the sentence could ever earn. What changed is that we no
longer append our own endorsement to a competitor's price — the fact stays, the
verdict is the reader's.

## The second half: the comparison copy was too generous to be persuasive

Reviewing the cluster with a buyer's eye rather than an auditor's surfaced a
failure the previous ADR's rules did not prevent, because it is not a failure of
accuracy. **Every fact on those pages is correct, sourced and dated, and the
pages still read as a recommendation to buy something else.** The shape, not the
content, was wrong:

- Summit's own entries **opened on a limitation** and reached the strength
  several sentences later, while competitors' entries opened on what they do
  best.
- The pages **volunteered the competitor's closing argument**: "It is the best
  value on this page and it is not close"; "Those are hard to beat and we are
  not going to try"; on the HRV listicle, "your watch maker's own app almost
  certainly already shows you an equivalent daily figure at no extra cost".
  Each states a true fact and then adds our endorsement of it on top. The
  endorsement was never the honest part; it was editorialising in the
  competitor's favour.
- Summit's sections **ended on a weakness**, which is the position a reader
  remembers.
- Summit's "Best for:" lines were **drawn narrower than the truth**, while every
  competitor's was drawn at its real width.
- The **permanently free recovery and sleep tier** — the one thing no product on
  those pages matches — was under-played or missing from several entries.

The corrective is stated as a posture, not a licence: **lead with the claim and
qualify inside the same paragraph; state the competitor's fact without adding
our verdict to it; never close a Summit section on its limitation; describe the
largest set of readers Summit genuinely serves.** Everything ADR-2026-08-06
requires survives intact and was explicitly protected during the rewrite: every
"Where <competitor> wins" section stays, every figure keeps its source link and
checked date, "not documented" is never upgraded to a limitation, the
our-own-product disclosure stays, and Summit's real constraints — cycling-only,
iPhone-only, iOS 26+, no watch app, free tier is not the 14-day trial — are
stated as plainly as before.

Honesty is a constraint on what may be said. It was being applied as an
obligation to argue the other side, and those are not the same thing.

## Options considered and discarded

**Keep the policy and link harder to the App Store.** Rejected. The policy's
premise — that a withheld number protects the reader from a wrong one — does not
survive contact with a comparison page that prints six competitors' figures. The
reader does not read the absence as rigour; they read it as evasion, or they
leave to go find it.

**Publish a converted USD price alongside the euro one.** Rejected. Apple's
storefront prices are not an FX conversion of each other, so a computed dollar
figure would be a number no customer is ever charged — a fabricated claim of
exactly the kind ADR-2026-08-06 exists to prevent. Only figures read off a real
storefront are published, and the one storefront verified today is Spain.

**Publish a price table per storefront.** Rejected for now. It multiplies the
maintenance surface by every country Apple sells in, and each row ages
independently. One verified storefront, clearly labelled as that storefront, is
honest and checkable; twenty half-verified rows are neither.

**Add `aggregateRating` alongside the new `offers` markup.** Rejected, again and
for the same reason as in ADR-2026-08-06: there is no rating to publish, and
fabricated review markup is a Google spam violation. The live App Store rating
badge (`initRatingBadge()`) remains the only mechanism by which a rating ever
appears on this site.

**Rank Summit first in the listicles now that we have a price argument.**
Rejected, as it was on 2026-08-06, and the reasoning is unchanged. Summit stays
where it is in both lists, and the quick-answer boxes still send readers to
competitors where those genuinely suit them better. The fix to the copy was to
stop arguing *against* ourselves, not to start ranking dishonestly. A listicle
that puts its own product first for everything converts nobody.

**Drop the "Where <competitor> wins" sections while sharpening the tone.**
Rejected outright. Those sections are the reason the pages are credible enough
for the price comparison to land at all. Removing them to win a paragraph would
forfeit the asset that makes the whole cluster worth publishing.

## Consequences

- `pricing.html` can now rank for the query it was built for. A plans page with
  no figures cannot win "project summit price", and most directories that
  require a pricing page expect one.
- The price section of the adaptive-platform listicle argues a complete
  comparison instead of half of one, anchored by the JOIN like-for-like.
- Summit appears in its own free-HRV-apps table, which is the page best placed
  to explain the distinction between a free download and a permanently free
  daily score.
- **New maintenance surface, and it is the real cost of this decision.** Four
  figures now live in the HTML across three locales, plus the comparison
  cluster, plus JSON-LD. They are correct as of 7 August 2026 and Apple can
  change them without telling us. They carry their date so a stale figure is
  visible, and they need the same scheduled re-check the competitor facts need.
  A checker cannot verify them — no machine in this repo can read an App Store
  storefront — so this one stays a human obligation, which is precisely the
  category ADR-2026-08-06 warns is the weakest.
- The "no prices" sentence was repeated across the comparison cluster in three
  languages. That it took a sweep of six pages × three locales to reverse one
  policy sentence is itself evidence for that ADR's third rule: a claim
  duplicated by hand drifts by hand.
