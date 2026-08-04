# App Store listing copy — ready to paste

**Date:** 2026-08-04 · **App:** Project Summit (id 6754172654) · **Locales:** EN · ES · CA
**Source:** action plan in `research/aso-audit-2026-08.md`. Every claim checked against `product-marketing.md` → Hard Constraints.

All counts below were computed, not estimated. Title/subtitle/promo are counted in **characters**; the keyword field is counted in **UTF-8 bytes**, which is what Apple actually limits.

---

## Two Apple rules that shaped these choices

**Guideline 2.3.7 — no pricing in the app name or subtitle.** This is why "free" does **not** appear in any proposed title or subtitle, even though the free tier is the strongest hook we have. The wedge goes where offers legitimately belong: promotional text and screenshot captions.

**Guideline 2.3.7 — no trademarks or competitor names in the keyword field.** ⚠️ **This corrects the audit**, which listed `strava` and `karoo` as keyword candidates. Both are third-party trademarks and carry rejection risk even though Summit genuinely integrates with them. They are removed from every set below. Keep them in the description, where describing a real integration is fine.

**Apple indexes each word once** across title + subtitle + keyword field. Every set below was checked for overlap — there is none.

---

## 1 · Title — App Store Connect → App Information → Localizable

| Locale | Current | Proposed | Count |
|---|---|---|---|
| EN | `Project Summit: Cycling` | `Project Summit: Cycling Plan` | 28/30 |
| ES | `Project Summit: Ciclismo` | *unchanged* | 24/30 |
| CA | `Project Summit: Ciclisme` | *unchanged* | 24/30 |

**Why EN changes and ES/CA don't.** "Plan" is a high-intent head term and fits in the 7 spare characters. Spanish and Catalan have no equivalent that fits the 6 spare characters without mangling the phrasing — `Project Summit: Plan Ciclismo` fits but reads like a telegram. That slot is better spent in the keyword field, where `plan` / `pla` costs 5 bytes.

---

## 2 · Subtitle — same screen, 30 characters

| Locale | Current | Proposed | Count |
|---|---|---|---|
| EN | `Recovery, training, nutrition` | `HRV recovery, daily readiness` | 29/30 |
| ES | `Recuperación, carga, nutrición` | `Recuperación y sueño diarios` | 28/30 |
| CA | *(assumed)* `Recuperació, càrrega, nutrició` | `Recuperació i son diaris` | 24/30 |

**Why.** The current subtitles are a table of contents: three nouns, no promise. The proposals lead with the two terms that are simultaneously high-intent searches and the free tier's actual content — recovery and sleep/HRV. "Nutrition" and "training/carga" move to the keyword field, where single terms belong.

⚠️ The CA "current" value could not be verified — the lookup API does not expose subtitles. Check it in App Store Connect before overwriting.

**Alternative, mechanism-led** if you would rather differentiate than be found (verified counts):
- EN `Adapts to your HRV and time` — 27/30
- ES `Se adapta a tu VFC y tu tiempo` — 30/30
- CA `S'adapta a la teva VFC i temps` — 30/30

I recommend the keyword-led set: with 4 ratings, being found beats being distinctive.

---

## 3 · Promotional text — 170 chars, editable **without shipping a build**

This is the fastest win in the plan. The US slot currently repeats the description's first paragraph word for word.

**EN — 164/170**
```
Not an AI. Not a chatbot. A sports-science algorithm that makes the calls a real coach would. Your recovery and sleep scores stay free — the free tier, not a trial.
```

**ES — 164/170**
```
Ni IA ni chatbot: un algoritmo de ciencia del deporte que decide como lo haría un entrenador. Tu recuperación y tu sueño son gratis — el plan gratis, no una prueba.
```

**CA — 157/170**
```
Ni IA ni chatbot: un algoritme de ciència de l'esport que decideix com ho faria un entrenador. La teva recuperació i el teu son són gratis — no és cap prova.
```

**Why this text.** Two high-confidence VOC findings, stacked: the category is actively punishing AI-forward positioning (Theme 1), and subscription fatigue is the loudest complaint about the recovery wearables we compete with (Theme 5). "A real coach would" is not a claim to *be* a coach — it mirrors wording already live in the app's own description, and stays on the right side of the anti-AI framing.

---

## 4 · Keyword field — 100 **bytes**, comma-separated, **no spaces after commas**

A space costs a byte and buys nothing. Paste exactly as shown.

**EN — 84/100 bytes**
```
sleep,training,bike,ftp,power,interval,tss,ctl,tsb,endurance,cyclist,adaptive,gravel
```

**ES — 93/100 bytes**
```
entrenamiento,bici,ftp,potencia,intervalos,tss,fondo,resistencia,ciclista,vfc,plan,adaptativo
```

**CA — 87/100 bytes**
```
entrenament,bici,ftp,potencia,intervals,tss,fons,resistencia,ciclista,vfc,pla,adaptatiu
```

**Notes.** Accents are dropped in ES/CA (`potencia`, not `potència`) — each accented character costs 2 bytes instead of 1, and Apple's search normalises diacritics. Do **not** apply that trick to `ñ`: it is a distinct letter, not an accent, which is why `sueño` stays in the ES subtitle rather than being smuggled into keywords as `sueno`.

Before pasting, **read the field that is there now** — it is invisible from outside App Store Connect and may already contain terms worth keeping. These sets assume the proposed titles/subtitles above; if you keep the current subtitles instead, add `recovery`/`recuperacion` back in.

---

## 5 · Screenshot captions — first three only

~90% of visitors never scroll past the third screenshot, and captions have been indexed since June 2025. These three carry the whole story.

| # | EN | ES | CA |
|---|---|---|---|
| 1 | Your recovery and sleep. Free, forever. | Tu recuperación y tu sueño. Gratis, siempre. | La teva recuperació i el teu son. Gratis, sempre. |
| 2 | A bad night moves today's session. | Una mala noche mueve el entreno de hoy. | Una mala nit mou l'entrenament d'avui. |
| 3 | No window today? Nothing breaks. | ¿Hoy no hay hueco? No pasa nada. | Avui no hi ha estona? No passa res. |

⚠️ **Order matters for truthfulness.** Caption 1 scopes "free" explicitly to recovery and sleep, which is exactly what the free tier contains. Captions 2 and 3 describe the adaptive plan, which is **Elite**. Keep caption 1 first so the scope is set before the Premium behaviour is shown, and never reword caption 1 into a general "Summit is free".

---

## 6 · Preview video — 20–25s, no voiceover needed

Muted autoplay in search results; published lift is +20–40%. Shoot the mechanism, not a feature tour.

| Time | On screen | Caption burned in |
|---|---|---|
| 0–4s | Sleep score, a bad night, the breakdown explaining why | EN "You slept badly." · ES "Dormiste mal." · CA "Has dormit malament." |
| 4–10s | Today's card: the hard session visibly swapping to an easy one | "So today changed." · "Así que hoy ha cambiado." · "Així que avui ha canviat." |
| 10–16s | Availability set to zero, the week re-flowing around it | "No time today? Nothing breaks." · "¿Hoy no hay hueco? No pasa nada." · "Avui no hi ha estona? No passa res." |
| 16–22s | The rule behind the decision, traceable | "Every call traces to a rule." · "Cada decisión sale de una regla." · "Cada decisió surt d'una regla." |
| 22–25s | Logo + "Free recovery & sleep" | — |

**Do not show** an Apple Watch app, complication or any on-wrist Summit surface — there is none in the shipped build. Showing the watch as a *sensor* (worn, sleeping) is accurate and on-message.

---

## Order of execution

1. **Promotional text** — 10 minutes, three locales, no release. Do this first.
2. **Keyword field** — read what is there, then paste. 20 minutes.
3. **Title + subtitle** — 30 minutes. Note that these changes take effect at the next app version submission, unlike 1 and 2.
4. **Screenshot captions** — needs new image assets.
5. **Preview video** — 1–2 days.

Items 1 and 2 are live within hours. Everything here is worth less than fixing the free-tier review prompt, which is still the binding constraint on this listing.
