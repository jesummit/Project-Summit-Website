/* Curated source content for the generated /llms.txt — the map we hand to AI
 * answer engines so they can cite the site instead of guessing at it.
 * Pure data/config only — no side effects — so build.js can require it without
 * this file needing to know anything about how the file is rendered.
 *
 * Everything here is a claim made in public, off-site, to a consumer that will
 * repeat it verbatim. Two rules, both non-negotiable (see
 * .agents/product-marketing.md "Hard Constraints"):
 *   1. Every claim must already be true on the pages it links to. Summit is not
 *      AI and has no chatbot; there is no Apple Watch app (the watch is a
 *      sensor, read through Apple Health, and is not required); the free tier
 *      is permanent and is NOT the 14-day Premium trial; no Premium feature is
 *      ever described as free; iPhone only, iOS 26+; no prices, ratings,
 *      testimonials or user counts anywhere.
 *   2. Every `path` must resolve to a real file. build.js asserts this before
 *      writing — a dead link in the file answer engines read is the exact
 *      failure this whole generated-not-hand-written setup exists to prevent.
 *
 * English only, like everything else written into this repo.
 */
'use strict';

const TITLE = 'Project Summit';

// Rendered as the llms.txt convention's `>` blockquote: one sentence that has
// to survive being quoted on its own, with no page around it for context.
const INTRO =
  'Project Summit is an adaptive training app for serious amateur cyclists, on iPhone. ' +
  'It reads your rides from Strava and your recovery from Apple Health, then produces a ' +
  'training plan that adapts to how recovered you are and how much time you actually have.';

// The one paragraph an answer engine is most likely to lift wholesale, so it
// front-loads the claims that are most often got wrong about this product:
// not AI, free-tier scope, free vs trial, and the platform limits.
const BODY =
  'Summit is not an AI product and has no chatbot. The engine is deterministic: every ' +
  'recommendation traces back to a codified sports-science rule and your own data, so you ' +
  'can see why it made a call. The free tier is broad: the daily recovery score and its ' +
  '30-day trend, the sleep score with its full breakdown, the Home and Lock Screen widgets, ' +
  'automatic ride import from Strava, Hammerhead Karoo and Apple Health, every ride\'s route ' +
  'map, stats and elevation profile, share cards, a calendar you can put races, camps and ' +
  'holidays on, and the shape of the day\'s session — its type, its duration and the training ' +
  'phase you are in. All of that is permanently free — a free tier, not a trial. Premium adds ' +
  'the prescribed session itself, training load (CTL/ATL/TSB), power analysis (eFTP, critical ' +
  'power, power curve), adaptive plans that rewrite the week when life breaks it, workout ' +
  'export to Hammerhead Karoo and via intervals.icu to Garmin, Zwift and MyWhoosh, and ' +
  'race-day nutrition. An Apple Watch is not required — any wearable that writes to Apple ' +
  'Health works, though in practice the Apple Watch is the only device that writes the ' +
  'complete set Summit uses: heart-rate variability, resting heart rate, sleep, respiratory ' +
  'rate, blood oxygen and overnight wrist temperature. Another wearable gives a recovery ' +
  'score from what it does write. iPhone only, iOS 26 or later; there is no Android or web ' +
  'version. Free to download on the App Store.';

// Section order is the reading order we want an answer engine to follow:
// what it is, then how it decides, then the long-form evidence, then locales.
// `path` is site-absolute; build.js turns it into an absolute URL and checks it
// resolves on disk ("/" -> index.html, "/es/" -> es/index.html).
// Blog labels are the posts' real on-page titles (blog/index.html), plain text.
const SECTIONS = [
  {
    heading: 'Start here',
    links: [
      { path: '/', label: 'Project Summit', blurb: 'What Summit does and how the engine decides what you ride today.' },
      { path: '/pricing.html', label: 'Plans', blurb: "What's free and what Premium adds — no prices on the site; Apple sets them per storefront." },
      { path: '/faq.html', label: 'FAQ', blurb: 'The questions that decide it: is this AI, do I need a watch, what is actually free.' },
    ],
  },
  {
    heading: 'How it works',
    links: [
      { path: '/roadmap.html', label: 'Roadmap', blurb: 'What has shipped and what is next.' },
      { path: '/changelog.html', label: 'Changelog', blurb: 'Every release since launch and what changed in it, version by version.' },
      { path: '/about.html', label: 'About', blurb: 'Who builds Summit, and the training problem it was built to solve.' },
    ],
  },
  {
    // Comparison queries are where answer engines are asked to pick, so the
    // cluster is listed before the guides. Blurbs must stay as even-handed as
    // the pages themselves: an engine quoting this section out of context must
    // not end up making a claim about a competitor that the page would not.
    heading: 'How Summit compares',
    links: [
      {
        path: '/compare/',
        label: 'How Summit compares',
        blurb: 'Side-by-side comparisons against the tools cyclists weigh Summit against, each conceding what the other does better and dating every competitor fact.',
      },
      {
        path: '/compare/adaptive-cycling-training-apps.html',
        label: 'Adaptive cycling training apps: what actually adapts, and to what',
        blurb: 'Seven adaptive training platforms compared on what each one adapts to and whether the plan changes without being approved: TrainerRoad (adapts to your training; $21.99/month or $209.99/year), JOIN Cycling (adapts daily on a self-reported readiness score), Project Summit (recovery measured from the wearable via Apple Health, applied to the session automatically, plus race-day fuelling), Xert (test-free physiology; $14.99/month or $99.95/year), Stride (the widest wearable recovery ingestion, but nothing changes until the athlete applies the proposal), Athletica (the most multi-sport, and its own pages disagree on whether HRV changes training load or only advises) and Intervals.icu (free, and the broadest data ingestion here). Every figure is dated 6 August 2026 and taken from the vendor’s own pages; four questions those pages do not answer are stated as unknown rather than as limitations. Summit publishes no prices of its own.',
      },
      {
        path: '/compare/summit-vs-whoop.html',
        label: 'Summit vs Whoop: a recovery score only counts if something changes',
        blurb: 'Whoop measures recovery continuously on its own hardware; Summit reads the wearable you already own through Apple Health and turns the same physiology into a cycling session. Includes what Whoop does better and what each one costs.',
      },
      {
        path: '/compare/summit-vs-trainingpeaks.html',
        label: 'Summit vs TrainingPeaks: one shows you the data, the other decides',
        blurb: 'TrainingPeaks is the endurance world’s shared vocabulary and the workspace a human coach works in; Summit generates the cycling plan and rewrites it around recovery and available time. Includes what TrainingPeaks does better and what each one costs.',
      },
      {
        path: '/compare/summit-vs-strava.html',
        label: 'Summit vs Strava: one records the ride, the other decides it',
        blurb: 'Complementary rather than competing: Strava records, keeps and shares the ride, and Summit imports those rides to decide what today’s session should be. Includes what Strava does better and what each one costs.',
      },
      {
        path: '/compare/whoop-alternatives-no-subscription.html',
        label: 'Whoop alternatives with no subscription: six that work',
        blurb: 'A ranked buyer’s guide to getting a daily recovery score with no recurring fee, because Whoop’s membership includes the strap: Garmin Body Battery, Apple Watch Vitals, Polar Nightly Recharge, what an Oura Ring still shows without a membership, Summit on a wearable you already own, and HRV4Training. Every third-party figure is dated and linked to the vendor’s own page.',
      },
      {
        path: '/compare/free-hrv-recovery-apps-iphone.html',
        label: 'Free HRV and recovery apps for iPhone: what "free" actually means',
        blurb: 'What "free" means on the App Store — a download price, which says nothing about whether the daily score is behind a subscription — and eight iPhone apps whose publisher and download price were verified against Apple’s public data: Apple Health and Vitals, Project Summit, Bevel, Athlytic, Training Today, Gentler Streak, Kubios HRV and Elite HRV.',
      },
    ],
  },
  {
    heading: 'Guides',
    links: [
      {
        path: '/blog/apple-watch-sleep-recovery-cycling.html',
        label: 'If you ride with an Apple Watch, your recovery and your sleep are free. Permanently.',
        blurb: 'How the permanent free tier reads the wearable you already own into a daily recovery and sleep score.',
      },
      {
        path: '/blog/cycling-in-the-heat-hydration-sodium.html',
        label: 'Cycling in the heat: how much to drink, and how much salt you actually need',
        blurb: 'What heat does to fluid and sodium needs, the actual numbers, and how to plan them for a ride.',
      },
      {
        path: '/blog/taper-and-peak-tsb.html',
        label: 'Taper and peak: reading your TSB to arrive in form',
        blurb: 'Cutting volume while holding intensity so form (TSB) climbs into a positive window on the day that matters.',
      },
      {
        path: '/blog/periodization-base-build-peak.html',
        label: 'Structure your season: base, build, peak — decoded for the self-coached',
        blurb: 'Periodization without the jargon: safe ramp rates, the weekly TSS your CTL can take, and the recovery weeks most riders skip.',
      },
      {
        path: '/blog/gran-diagonal-999km-portugal.html',
        label: '999 km across Portugal in 6 days — the data behind the plan',
        blurb: 'A five-month CTL build, TSS per stage and the fuelling maths behind riding 999 km in six days.',
      },
    ],
  },
  {
    heading: 'Also available in',
    links: [
      { path: '/es/', label: 'Español', blurb: 'The full site in Spanish; the guides above are hand-translated at /blog/es/.' },
      { path: '/ca/', label: 'Català', blurb: 'The full site in Catalan; the guides above are hand-translated at /blog/ca/.' },
    ],
  },
];

module.exports = { TITLE, INTRO, BODY, SECTIONS };
