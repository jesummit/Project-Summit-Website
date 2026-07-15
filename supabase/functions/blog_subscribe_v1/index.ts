// blog_subscribe_v1 — public email capture for the marketing blog.
// ---------------------------------------------------------------------------
// REVIEW BEFORE DEPLOY. This function is committed as reviewable source; it is
// NOT deployed by this PR. Deploy with:
//     supabase functions deploy blog_subscribe_v1 --no-verify-jwt
// and confirm the env/secrets already used by your other email functions:
//     SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY
//
// What it does (single opt-in, GDPR-valid with the explicit consent checkbox on
// the form + one-click unsubscribe): upserts the visitor into the existing
// `contacts` table, records a `contact_events` row, and emails the lead magnet
// via Resend. It mirrors the shape of the existing Tally→contacts flow.
//
// Hardening notes:
//  - verify_jwt is false (public form post); the honeypot + email/consent checks
//    are the first line, Cloudflare rate-limiting the second (add a rule on
//    /functions/v1/blog_subscribe_v1 like the one on /ingest).
//  - Uses the service-role key (bypasses RLS) — never expose this key client-side.
//  - To upgrade to double opt-in: insert with email_subscribed=false + a token,
//    send a confirm link, and flip the flag from a confirm endpoint.
// ---------------------------------------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

// Where the lead magnet lives. Create this file (or route) before going live.
const MAGNET_URL = "https://projectsummit.app/assets/downloads/summit-season-template.pdf";
const FROM = "Jordi · Summit <jordi@projectsummit.app>";

// Only allow the production site to call this from the browser.
const ALLOWED_ORIGINS = new Set([
  "https://projectsummit.app",
  "https://www.projectsummit.app",
]);

// Map the article slug to a contact_source enum value that already exists.
// (Add a generic 'blog' value to the enum if/when you want finer attribution —
//  see supabase/migrations/20260715090000_blog_source.sql.)
function sourceFor(article: string): string {
  if (article === "gran-diagonal") return "gran_diagonal";
  return "other";
}

function lang(v: unknown): "es" | "en" | "ca" {
  return v === "en" || v === "ca" ? v : v === "es" ? "es" : "en";
}

function corsHeaders(origin: string | null): HeadersInit {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://projectsummit.app";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function magnetEmail(l: "es" | "en" | "ca") {
  const subject = l === "es"
    ? "Tu plantilla de temporada (y la hoja de nutrición de la Gran Diagonal)"
    : l === "ca"
    ? "La teva plantilla de temporada (i el full de nutrició de la Gran Diagonal)"
    : "Your season template (and the Gran Diagonal fueling sheet)";
  const body = l === "es"
    ? `<p>Gracias por suscribirte.</p><p>Aquí tienes la plantilla de planificación de temporada (rampa de CTL + base/build/peak) y la hoja de nutrición:</p><p><a href="${MAGNET_URL}">Descargar la plantilla →</a></p><p>Te escribiré de vez en cuando con notas de entrenamiento basadas en datos. Puedes darte de baja cuando quieras.</p><p>— Jordi · Project Summit</p>`
    : l === "ca"
    ? `<p>Gràcies per subscriure't.</p><p>Aquí tens la plantilla de planificació de temporada (rampa de CTL + base/build/peak) i el full de nutrició:</p><p><a href="${MAGNET_URL}">Descarregar la plantilla →</a></p><p>T'escriuré de tant en tant amb notes d'entrenament basades en dades. Et pots donar de baixa quan vulguis.</p><p>— Jordi · Project Summit</p>`
    : `<p>Thanks for subscribing.</p><p>Here's the season-planning template (CTL ramp + base/build/peak) and the fueling sheet:</p><p><a href="${MAGNET_URL}">Download the template →</a></p><p>I'll send the occasional data-driven training note. Unsubscribe anytime.</p><p>— Jordi · Project Summit</p>`;
  return { subject, html: body };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: cors });

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "bad_json" }), { status: 400, headers: { ...cors, "content-type": "application/json" } });
  }

  // Honeypot: bots fill hidden fields. Pretend success, do nothing.
  if (typeof payload.website === "string" && payload.website.length > 0) {
    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "content-type": "application/json" } });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  const consent = payload.consent === true;
  const article = String(payload.article ?? "blog");
  const l = lang(payload.lang);

  if (!EMAIL_RE.test(email) || !consent) {
    return new Response(JSON.stringify({ ok: false, error: "invalid" }), { status: 422, headers: { ...cors, "content-type": "application/json" } });
  }

  const db = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const tag = `blog:${article}`;

  // Upsert the contact without clobbering an existing richer record.
  const { data: existing } = await db.from("contacts").select("id, tags, email_subscribed, email_unsubscribed_at").eq("email", email).maybeSingle();

  let contactId: string;
  if (existing) {
    contactId = existing.id as string;
    const tags: string[] = Array.isArray(existing.tags) ? existing.tags as string[] : [];
    if (!tags.includes(tag)) tags.push(tag);
    // Re-subscribe only if they never explicitly unsubscribed.
    const patch: Record<string, unknown> = { tags, updated_at: new Date().toISOString() };
    if (!existing.email_unsubscribed_at) patch.email_subscribed = true;
    await db.from("contacts").update(patch).eq("id", contactId);
  } else {
    const { data: inserted, error: insErr } = await db.from("contacts").insert({
      email,
      language: l,
      source: sourceFor(article),
      status: "lead",
      email_subscribed: true,
      tags: ["blog", tag],
    }).select("id").single();
    if (insErr || !inserted) {
      return new Response(JSON.stringify({ ok: false, error: "db" }), { status: 500, headers: { ...cors, "content-type": "application/json" } });
    }
    contactId = inserted.id as string;
  }

  // Ledger the signup (existing enum value 'tagged').
  await db.from("contact_events").insert({
    contact_id: contactId,
    event_type: "tagged",
    metadata: { via: "blog_signup", article, magnet: payload.magnet ?? null },
  });

  // Send the lead magnet via Resend.
  let resendId: string | null = null;
  try {
    const mail = magnetEmail(l);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: FROM, to: email, subject: mail.subject, html: mail.html }),
    });
    if (res.ok) {
      const j = await res.json().catch(() => ({}));
      resendId = (j && j.id) ? String(j.id) : null;
      await db.from("email_sends").insert({ contact_id: contactId, resend_email_id: resendId, sent_at: new Date().toISOString() });
      await db.from("contact_events").insert({ contact_id: contactId, event_type: "email_sent", metadata: { kind: "blog_magnet", article } });
    }
  } catch (_e) {
    // Non-fatal: the contact is captured; the magnet email can be retried.
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "content-type": "application/json" } });
});
