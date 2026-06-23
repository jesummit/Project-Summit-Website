#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * tools/posthog-dashboards.js
 *
 * Rebuilds the PostHog dashboard suite for the Project Summit Website project.
 *
 * Why this exists:
 *   The pre-launch suite was scoped around a waitlist funnel that has been
 *   removed. Several insights depend on legacy events that the redesigned site
 *   no longer emits. This script archives the old suite (5 dashboards) and
 *   creates the new one (4 dashboards) backed by the events the live site
 *   actually fires today.
 *
 * Usage:
 *   POSTHOG_API_KEY=phx_… node tools/posthog-dashboards.js [--apply]
 *   (without --apply it does a dry run)
 *
 * Region:
 *   EU (eu.posthog.com). The project id (184201) is hardcoded — change it if
 *   the project is migrated.
 */
'use strict';

const HOST = 'https://eu.posthog.com';
const PROJECT_ID = 184201;
const API_KEY = process.env.POSTHOG_API_KEY;
const APPLY = process.argv.includes('--apply');

if (!API_KEY) {
  console.error('POSTHOG_API_KEY env var is required');
  process.exit(1);
}

async function api(path, init = {}) {
  const res = await fetch(`${HOST}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} → ${path}\n${text}`);
  }
  return text ? JSON.parse(text) : null;
}

// --- helpers to build PostHog query nodes ---------------------------------

const dateRange = (days) => ({ date_from: `-${days}d` });

const trendsSeries = (event, props = []) => ({
  kind: 'EventsNode',
  event,
  name: event,
  math: 'total',
  properties: props,
});

const trends = (series, breakdown, days = 30, display = 'ActionsLineGraph') => ({
  kind: 'InsightVizNode',
  source: {
    kind: 'TrendsQuery',
    series,
    dateRange: dateRange(days),
    interval: 'day',
    trendsFilter: { display },
    breakdownFilter: breakdown ? { breakdown_type: 'event', breakdown: breakdown } : undefined,
  },
});

const trendsByPerson = (event, breakdown, days = 30) => ({
  kind: 'InsightVizNode',
  source: {
    kind: 'TrendsQuery',
    series: [{ kind: 'EventsNode', event, name: event, math: 'dau' }],
    dateRange: dateRange(days),
    interval: 'day',
    trendsFilter: { display: 'ActionsBarValue' },
    breakdownFilter: breakdown ? { breakdown_type: 'event', breakdown } : undefined,
  },
});

const funnel = (steps, days = 30) => ({
  kind: 'InsightVizNode',
  source: {
    kind: 'FunnelsQuery',
    series: steps.map((s) => ({
      kind: 'EventsNode',
      event: s.event,
      name: s.name || s.event,
      properties: s.properties || [],
    })),
    dateRange: dateRange(days),
    funnelsFilter: { funnelVizType: 'steps', funnelOrderType: 'ordered' },
  },
});

const hogql = (query) => ({
  kind: 'DataTableNode',
  source: { kind: 'HogQLQuery', query },
});

// --- new insight catalog --------------------------------------------------

const INSIGHTS = {
  // -------- Overview --------
  visitorsDaily: {
    name: 'Visitantes únicos / día',
    description: 'Unique visitors per day (DAU) over the last 30 days.',
    query: {
      kind: 'InsightVizNode',
      source: {
        kind: 'TrendsQuery',
        series: [{ kind: 'EventsNode', event: '$pageview', name: '$pageview', math: 'dau' }],
        dateRange: dateRange(30),
        interval: 'day',
        trendsFilter: { display: 'ActionsLineGraph' },
      },
    },
  },
  topPages: {
    name: 'Páginas más vistas',
    description: 'Top URLs ranked by pageviews (last 30 days).',
    query: hogql(
      `select properties.$pathname as path, count() as pageviews, count(distinct distinct_id) as uniques
       from events where event = '$pageview' and timestamp > now() - interval 30 day
       group by path order by pageviews desc limit 15`
    ),
  },
  countries: {
    name: 'Visitantes por país',
    description: 'Unique visitors by country (last 30 days).',
    query: hogql(
      `select properties.$geoip_country_name as country, count(distinct distinct_id) as uniques
       from events where event = '$pageview' and timestamp > now() - interval 30 day
       group by country order by uniques desc limit 20`
    ),
  },
  device: {
    name: 'Mobile vs Desktop',
    description: 'Device type split.',
    query: trendsByPerson('$pageview', '$device_type', 30),
  },
  language: {
    name: 'Idioma del navegador',
    description: 'Browser language at first pageview (proxy for incoming audience).',
    query: hogql(
      `select properties.$browser_language as lang, count(distinct distinct_id) as uniques
       from events where event = '$pageview' and timestamp > now() - interval 30 day
       group by lang order by uniques desc limit 15`
    ),
  },
  referrers: {
    name: 'Referring domains',
    description: 'Top inbound referrers (last 30 days).',
    query: hogql(
      `select coalesce(properties.$referring_domain, 'direct') as ref, count(distinct distinct_id) as uniques
       from events where event = '$pageview' and timestamp > now() - interval 30 day
       group by ref order by uniques desc limit 15`
    ),
  },
  utm: {
    name: 'UTM source breakdown',
    description: 'Tagged campaigns (utm_source) — flags untracked traffic when most rows are null.',
    query: hogql(
      `select coalesce(properties.utm_source, '(none)') as src, count(distinct distinct_id) as uniques
       from events where event = '$pageview' and timestamp > now() - interval 30 day
       group by src order by uniques desc limit 15`
    ),
  },
  bounceByPage: {
    name: 'Bounce rate por página',
    description: 'Share of sessions with a single pageview, per landing page.',
    query: hogql(
      `with s as (
         select properties.$session_id as sid,
                any(properties.$pathname) as landing,
                count() as views
         from events
         where event = '$pageview' and timestamp > now() - interval 30 day and properties.$session_id is not null
         group by sid
       )
       select landing as page, count() as sessions, sum(if(views = 1, 1, 0)) as bounced,
              round(sum(if(views = 1, 1, 0)) * 100.0 / count(), 1) as bounce_pct
       from s group by landing order by sessions desc limit 15`
    ),
  },

  // -------- App Store Conversion --------
  appstoreClicksTrend: {
    name: 'App Store CTA clicks (tendencia)',
    description: 'Daily volume of `appstore_cta_clicked` (the conversion KPI).',
    query: trends([trendsSeries('appstore_cta_clicked')], null, 30),
  },
  appstoreClicksBySource: {
    name: 'App Store CTA por surface',
    description: 'Breakdown of clicks by `source` (nav / hero / cta / thanks…).',
    query: trendsByPerson('appstore_cta_clicked', 'source', 30),
  },
  appstoreCtrBySurface: {
    name: 'CTR del CTA por surface',
    description: 'Click-through rate of each App Store CTA surface (clicks / impressions).',
    query: hogql(
      `with imp as (
         select properties.source as src, count() as impressions
         from events where event = 'appstore_cta_viewed' and timestamp > now() - interval 30 day
         group by src
       ),
       clk as (
         select properties.source as src, count() as clicks
         from events where event = 'appstore_cta_clicked' and timestamp > now() - interval 30 day
         group by src
       )
       select coalesce(imp.src, clk.src) as surface,
              imp.impressions as impressions,
              clk.clicks as clicks,
              round(coalesce(clk.clicks, 0) * 100.0 / nullIf(imp.impressions, 0), 2) as ctr_pct
       from imp full outer join clk on imp.src = clk.src
       order by impressions desc nulls last`
    ),
  },
  appstoreFunnel: {
    name: 'Funnel: pageview → CTA impression → CTA click',
    description: 'Home conversion path. Drop-off at each step indicates where attention is lost.',
    query: funnel(
      [
        { event: '$pageview', name: 'Visita home',
          properties: [{ key: '$pathname', value: ['/', '/index.html'], operator: 'exact', type: 'event' }] },
        { event: 'appstore_cta_viewed', name: 'Ve algún botón App Store' },
        { event: 'appstore_cta_clicked', name: 'Click al App Store' },
      ],
      30
    ),
  },
  appstoreClicksByLanguage: {
    name: 'App Store clicks por idioma del navegador',
    description: 'Which audience converts best.',
    query: trendsByPerson('appstore_cta_clicked', '$browser_language', 30),
  },
  appstoreClicksByDevice: {
    name: 'App Store clicks por dispositivo',
    description: 'Mobile vs desktop conversion split.',
    query: trendsByPerson('appstore_cta_clicked', '$device_type', 30),
  },
  appstoreClicksByPage: {
    name: 'App Store clicks por página de origen',
    description: 'Which landing pages drive conversions.',
    query: trendsByPerson('appstore_cta_clicked', '$pathname', 30),
  },
  appstoreClicksByReferrer: {
    name: 'App Store clicks por referrer',
    description: 'Attribution: which source closes the conversion.',
    query: trendsByPerson('appstore_cta_clicked', '$referring_domain', 30),
  },
  ratingBadgeImpact: {
    name: 'Impacto del rating badge en CTR',
    description: 'Sessions that saw the live rating badge vs not — compare downstream CTA click rate.',
    query: hogql(
      `with seen as (
         select distinct properties.$session_id as sid
         from events where event = 'rating_badge_shown' and timestamp > now() - interval 30 day
       ),
       sess as (
         select properties.$session_id as sid,
                max(if(event = 'appstore_cta_clicked', 1, 0)) as clicked
         from events where event in ('$pageview', 'appstore_cta_clicked') and timestamp > now() - interval 30 day
           and properties.$session_id is not null
         group by sid
       )
       select if(seen.sid is not null, 'rating_shown', 'no_rating') as cohort,
              count() as sessions, sum(clicked) as conversions,
              round(sum(clicked) * 100.0 / count(), 2) as ctr_pct
       from sess left join seen on sess.sid = seen.sid
       group by cohort order by ctr_pct desc`
    ),
  },

  // -------- UX & Content Engagement --------
  homeSectionFunnel: {
    name: 'Funnel home: hero → features → download',
    description: 'Section-by-section attention on the home page.',
    query: funnel(
      [
        { event: 'section_viewed', name: 'Hero',
          properties: [{ key: 'section', value: 'hero', operator: 'exact', type: 'event' }] },
        { event: 'section_viewed', name: 'Features',
          properties: [{ key: 'section', value: 'features', operator: 'exact', type: 'event' }] },
        { event: 'section_viewed', name: 'Download CTA',
          properties: [{ key: 'section', value: 'download', operator: 'exact', type: 'event' }] },
      ],
      30
    ),
  },
  sectionReach: {
    name: 'Alcance por sección (home)',
    description: 'How many sessions reach each home section.',
    query: trendsByPerson('section_viewed', 'section', 30),
  },
  scrollDistribution: {
    name: 'Distribución de scroll depth',
    description: 'How far visitors scroll, bucketed at 25/50/75/100.',
    query: trendsByPerson('scroll_depth', 'depth', 30),
  },
  scrollByPage: {
    name: 'Scroll ≥75% por página',
    description: 'Pages where visitors actually read.',
    query: hogql(
      `select properties.$pathname as page,
              count(distinct properties.$session_id) as sessions_75
       from events where event = 'scroll_depth' and toInt32OrNull(toString(properties.depth)) >= 75
         and timestamp > now() - interval 30 day
       group by page order by sessions_75 desc limit 10`
    ),
  },
  carousel: {
    name: 'Carrusel — navegación',
    description: 'Manual carousel usage (engagement signal).',
    query: trendsByPerson('carousel_navigated', 'direction', 30),
  },
  language_changed: {
    name: 'Idioma cambiado manualmente',
    description: 'How often visitors override the auto-detected language.',
    query: trendsByPerson('language_changed', 'language', 30),
  },
  theme_toggled: {
    name: 'Tema cambiado',
    description: 'Dark vs light toggle preference.',
    query: trendsByPerson('theme_toggled', 'theme', 30),
  },
  externalLinks: {
    name: 'Clicks externos por host',
    description: 'Outbound clicks (mailto, social, etc).',
    query: trendsByPerson('external_link_clicked', 'host', 30),
  },
  mobileMenu: {
    name: 'Uso del menú mobile',
    description: 'Frequency of hamburger opens — proxy for mobile nav exploration.',
    query: trends([trendsSeries('mobile_menu_opened')], null, 30),
  },
  rageDeadClicks: {
    name: 'Rage & dead clicks por página',
    description: 'UI friction signals.',
    query: hogql(
      `select event, properties.$pathname as page, count() as n
       from events where event in ('$rageclick', '$dead_click') and timestamp > now() - interval 30 day
       group by event, page order by n desc limit 20`
    ),
  },

  // -------- Health & Privacy --------
  optInRate: {
    name: 'Tasa de opt-in al banner de cookies',
    description: 'Visitors who accepted analytics / total visitors. KPI legal (GDPR).',
    query: hogql(
      `select
         (select count(distinct distinct_id) from events where event = '$opt_in' and timestamp > now() - interval 30 day) as opted_in,
         (select count(distinct distinct_id) from events where event = '$pageview' and timestamp > now() - interval 30 day) as visitors,
         round(
           (select count(distinct distinct_id) from events where event = '$opt_in' and timestamp > now() - interval 30 day) * 100.0
           / nullIf((select count(distinct distinct_id) from events where event = '$pageview' and timestamp > now() - interval 30 day), 0),
         2) as opt_in_rate_pct`
    ),
  },
  optInTrend: {
    name: 'Opt-ins por día',
    description: 'Daily volume of `$opt_in` events.',
    query: trends([trendsSeries('$opt_in')], null, 30),
  },
  webVitalsLCP: {
    name: 'Web Vitals — LCP p75 por página',
    description: 'Largest Contentful Paint, P75. Target: < 2500 ms.',
    query: hogql(
      `select properties.$pathname as page,
              count() as samples,
              round(quantile(0.5)(toFloat64OrNull(toString(properties.$web_vitals_LCP_value)))) as p50_ms,
              round(quantile(0.75)(toFloat64OrNull(toString(properties.$web_vitals_LCP_value)))) as p75_ms,
              round(quantile(0.95)(toFloat64OrNull(toString(properties.$web_vitals_LCP_value)))) as p95_ms
       from events where event = '$web_vitals' and timestamp > now() - interval 30 day
         and properties.$web_vitals_LCP_value is not null
       group by page order by samples desc limit 15`
    ),
  },
  webVitalsINP: {
    name: 'Web Vitals — INP p75 por página',
    description: 'Interaction to Next Paint, P75. Target: < 200 ms.',
    query: hogql(
      `select properties.$pathname as page,
              count() as samples,
              round(quantile(0.75)(toFloat64OrNull(toString(properties.$web_vitals_INP_value)))) as p75_ms
       from events where event = '$web_vitals' and timestamp > now() - interval 30 day
         and properties.$web_vitals_INP_value is not null
       group by page order by samples desc limit 15`
    ),
  },
  webVitalsCLS: {
    name: 'Web Vitals — CLS p75 por página',
    description: 'Cumulative Layout Shift, P75. Target: < 0.1.',
    query: hogql(
      `select properties.$pathname as page,
              count() as samples,
              round(quantile(0.75)(toFloat64OrNull(toString(properties.$web_vitals_CLS_value))), 3) as p75
       from events where event = '$web_vitals' and timestamp > now() - interval 30 day
         and properties.$web_vitals_CLS_value is not null
       group by page order by samples desc limit 15`
    ),
  },
  internalTraffic: {
    name: 'Tráfico interno marcado',
    description: 'Visits with is_internal=true — verify the dev-traffic flag is propagating.',
    query: hogql(
      `select coalesce(toString(properties.is_internal), '(unflagged)') as flag,
              count(distinct distinct_id) as uniques, count() as events
       from events where event = '$pageview' and timestamp > now() - interval 30 day
       group by flag order by events desc`
    ),
  },
  exceptions: {
    name: 'Errores JS',
    description: 'Autocaptured $exception events.',
    query: hogql(
      `select coalesce(properties.$exception_type, 'Unknown') as type,
              properties.$pathname as page, count() as n
       from events where event = '$exception' and timestamp > now() - interval 30 day
       group by type, page order by n desc limit 20`
    ),
  },
};

// --- new dashboard layout -------------------------------------------------

const DASHBOARDS = [
  {
    name: '🌐 Overview (v2)',
    description: 'Tráfico, audiencia, dispositivo, países, fuentes y bounce. Sustituye al Overview + My App Dashboard antiguos.',
    tags: ['v2', 'website'],
    tiles: [
      ['visitorsDaily', { x: 0, y: 0, w: 6, h: 5 }],
      ['topPages', { x: 6, y: 0, w: 6, h: 5 }],
      ['countries', { x: 0, y: 5, w: 6, h: 5 }],
      ['device', { x: 6, y: 5, w: 3, h: 5 }],
      ['language', { x: 9, y: 5, w: 3, h: 5 }],
      ['referrers', { x: 0, y: 10, w: 6, h: 5 }],
      ['utm', { x: 6, y: 10, w: 6, h: 5 }],
      ['bounceByPage', { x: 0, y: 15, w: 12, h: 5 }],
    ],
  },
  {
    name: '🎯 App Store Conversion (v2)',
    description: 'KPI principal post-lanzamiento: clics al App Store, CTR por surface, atribución y funnel.',
    tags: ['v2', 'conversion'],
    tiles: [
      ['appstoreClicksTrend', { x: 0, y: 0, w: 6, h: 5 }],
      ['appstoreFunnel', { x: 6, y: 0, w: 6, h: 5 }],
      ['appstoreClicksBySource', { x: 0, y: 5, w: 6, h: 5 }],
      ['appstoreCtrBySurface', { x: 6, y: 5, w: 6, h: 5 }],
      ['appstoreClicksByPage', { x: 0, y: 10, w: 6, h: 5 }],
      ['appstoreClicksByReferrer', { x: 6, y: 10, w: 6, h: 5 }],
      ['appstoreClicksByLanguage', { x: 0, y: 15, w: 6, h: 5 }],
      ['appstoreClicksByDevice', { x: 6, y: 15, w: 6, h: 5 }],
      ['ratingBadgeImpact', { x: 0, y: 20, w: 12, h: 5 }],
    ],
  },
  {
    name: '🎨 UX & Content Engagement (v2)',
    description: 'Profundidad de lectura, alcance de secciones, carrusel, idioma/tema y fricción UI.',
    tags: ['v2', 'engagement'],
    tiles: [
      ['homeSectionFunnel', { x: 0, y: 0, w: 12, h: 5 }],
      ['sectionReach', { x: 0, y: 5, w: 6, h: 5 }],
      ['scrollDistribution', { x: 6, y: 5, w: 6, h: 5 }],
      ['scrollByPage', { x: 0, y: 10, w: 6, h: 5 }],
      ['carousel', { x: 6, y: 10, w: 6, h: 5 }],
      ['language_changed', { x: 0, y: 15, w: 4, h: 5 }],
      ['theme_toggled', { x: 4, y: 15, w: 4, h: 5 }],
      ['mobileMenu', { x: 8, y: 15, w: 4, h: 5 }],
      ['externalLinks', { x: 0, y: 20, w: 6, h: 5 }],
      ['rageDeadClicks', { x: 6, y: 20, w: 6, h: 5 }],
    ],
  },
  {
    name: '🚨 Health & Privacy (v2)',
    description: 'Opt-in del banner, Web Vitals por página, errores JS y verificación del flag interno.',
    tags: ['v2', 'ops'],
    tiles: [
      ['optInRate', { x: 0, y: 0, w: 6, h: 5 }],
      ['optInTrend', { x: 6, y: 0, w: 6, h: 5 }],
      ['webVitalsLCP', { x: 0, y: 5, w: 6, h: 5 }],
      ['webVitalsINP', { x: 6, y: 5, w: 6, h: 5 }],
      ['webVitalsCLS', { x: 0, y: 10, w: 6, h: 5 }],
      ['internalTraffic', { x: 6, y: 10, w: 6, h: 5 }],
      ['exceptions', { x: 0, y: 15, w: 12, h: 5 }],
    ],
  },
];

// Old dashboard ids to archive (kept here so re-running is idempotent — already
// archived ones will just succeed again).
const OLD_DASHBOARD_IDS = [696083, 696205, 696203, 711817, 696204];

// --- main -----------------------------------------------------------------

async function archiveOld() {
  for (const id of OLD_DASHBOARD_IDS) {
    console.log(`  archiving dashboard ${id}…`);
    if (!APPLY) continue;
    await api(`/api/projects/${PROJECT_ID}/dashboards/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ deleted: true }),
    });
  }
}

async function createDashboard(spec) {
  console.log(`\nDashboard: ${spec.name}`);
  if (!APPLY) {
    spec.tiles.forEach(([key]) => console.log(`  · tile: ${INSIGHTS[key].name}`));
    return;
  }
  const dashboard = await api(`/api/projects/${PROJECT_ID}/dashboards/`, {
    method: 'POST',
    body: JSON.stringify({
      name: spec.name,
      description: spec.description,
      tags: spec.tags,
    }),
  });
  console.log(`  created id=${dashboard.id}`);

  for (const [key, layout] of spec.tiles) {
    const def = INSIGHTS[key];
    if (!def) throw new Error(`missing insight definition: ${key}`);
    const insight = await api(`/api/projects/${PROJECT_ID}/insights/`, {
      method: 'POST',
      body: JSON.stringify({
        name: def.name,
        description: def.description,
        query: def.query,
        dashboards: [dashboard.id],
      }),
    });
    console.log(`  · ${def.name} → insight ${insight.short_id}`);
  }
}

(async () => {
  console.log(APPLY ? 'APPLY mode — writing to PostHog' : 'DRY RUN — pass --apply to write');
  console.log(`Project ${PROJECT_ID} on ${HOST}\n`);
  console.log('Archiving legacy dashboards:');
  await archiveOld();
  for (const spec of DASHBOARDS) await createDashboard(spec);
  console.log('\nDone.');
})().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
