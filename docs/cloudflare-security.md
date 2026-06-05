# Cloudflare security hardening — copy/paste guide

Project Summit is static HTML on **GitHub Pages**, proxied through **Cloudflare**
(`projectsummit.app`). GitHub Pages can't set response headers, so the security
headers below are applied at **Cloudflare** (Rules → Transform Rules → *Modify
Response Header*, or via a Worker). Nothing here changes the repo; apply it in
the Cloudflare dashboard.

> Context: the site self-hosts its fonts and flag icons and proxies PostHog
> through `projectsummit.app/ingest`, so **everything loads same-origin** — which
> lets the CSP be strict (`'self'`). No third-party script/style/font origins are
> needed, and Subresource Integrity is no longer relevant (nothing is hot-linked).

---

## 1. Response security headers

Add these as static response headers (Transform Rule → *Set static* for each, or
one Worker that appends them). Apply to all hostnames / all paths.

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `DENY` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Content-Security-Policy` | *(see below — keep on one line)* |

### CSP

```
default-src 'self'; script-src 'self' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

Notes:
- `'unsafe-inline'` is required because the pages use inline `<script>` (the
  PostHog snippet, the theme bootstrap) and inline `style="…"` attributes. To
  remove it for **scripts**, switch to hashed inline scripts (`'sha256-…'`) — the
  PostHog snippet is identical on every page, the theme bootstrap differs on
  `thanks.html`/`404.html`. Inline **style** attributes can't be hashed, so
  `style-src 'unsafe-inline'` stays unless those few attributes are refactored.
- `blob:` / `worker-src blob:` are included so PostHog **session replay** keeps
  working (rrweb uses a blob worker). Drop them if replay is off.
- `connect-src 'self'` works because PostHog is proxied at `/ingest`. If you ever
  stop proxying, add the PostHog hosts here.
- Validate after enabling: open the site, check the console for CSP violations,
  and confirm PostHog still ingests (Network tab → `/ingest`).

### Optional Worker variant
If you prefer code over Transform Rules, the existing `infra/cloudflare-worker.js`
(the `/ingest` proxy) can be extended, **or** add a separate Worker on
`projectsummit.app/*` that wraps `fetch` and appends the headers above to the
response. Transform Rules are simpler and recommended.

---

## 2. Cloudflare dashboard toggles

- **SSL/TLS → Overview:** Full (**strict**).
- **SSL/TLS → Edge Certificates:** *Always Use HTTPS* ✔, *Automatic HTTPS
  Rewrites* ✔, *Minimum TLS Version* 1.2, **HSTS** ✔ (matches the header above).
- **DNS:** enable **DNSSEC**.
- **Security → Bots:** *Bot Fight Mode* ✔.
- (DDoS protection is on by default.)

---

## 3. Rate-limit the analytics proxy (`/ingest`)

The Worker forwards `/ingest/*` to PostHog. Rate-limit it so it can't be abused.

**Security → WAF → Rate limiting rules:**
- Match: `URI Path starts with "/ingest"`
- Rate: e.g. **200 requests / 1 minute** per **client IP**
- Action: *Managed Challenge* (or Block)

Tune the threshold to real traffic — PostHog batches events, and heatmaps/replay
can be chatty, so start generous and tighten using the analytics in WAF.

---

## 4. Email authentication (you send mail via Cloudflare)

These are **DNS records** at the apex / `_dmarc`. They stop spoofing of
`@projectsummit.app` and improve deliverability. Replace placeholders with the
values from your sending provider (ESP).

**SPF** (TXT at `@`) — list every service that sends on your behalf, one `include`
each, keep total DNS lookups ≤ 10:
```
v=spf1 include:<your-esp-spf-include> ~all
```

**DKIM** — enable DKIM in the ESP and publish the record they give you
(usually `CNAME` or `TXT` at `<selector>._domainkey.projectsummit.app`).

**DMARC** (TXT at `_dmarc`) — start in monitor mode, then tighten:
```
v=DMARC1; p=none; rua=mailto:dmarc@projectsummit.app; ruf=mailto:dmarc@projectsummit.app; fo=1; adkim=s; aspf=s
```
After a couple of weeks of clean aggregate reports (`rua`), move `p=none` →
`p=quarantine`, then `p=reject`.

**BIMI** (optional, after DMARC is at quarantine/reject) — shows your logo in
Gmail/Apple Mail. TXT at `default._bimi`:
```
v=BIMI1; l=https://projectsummit.app/assets/img/bimi-logo.svg; a=https://projectsummit.app/assets/img/bimi-vmc.pem
```
Requirements: a **square SVG** in the *SVG Tiny Portable/Secure* profile (the
current `SummitLogo-Mail.png` is PNG — a dedicated SVG is needed), and a **VMC**
(Verified Mark Certificate, paid) for Gmail/Apple to actually render it.

**Optional (inbound):** `MTA-STS` + `TLS-RPT` if you also receive mail and want to
enforce TLS for incoming messages.

---

## 5. What the repo already does (no action needed)

- Self-hosted fonts + flag icons → no third-party origins, strict CSP possible,
  no SRI needed, no Google Fonts GDPR exposure.
- PostHog is **opt-in** (cookie-consent banner; `opt_out_capturing_by_default`),
  proxied via `/ingest`.
- `robots.txt` + `sitemap.xml`; legal pages and `thanks.html` are `noindex`.
