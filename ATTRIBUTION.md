# Trazabilidad y atribución de tráfico (PostHog)

Guía operativa para atribuir correctamente el tráfico web a los clics al App
Store. Complementa la instrumentación de `analytics.js` / `app.js` y los
dashboards de `tools/posthog-dashboards.js`.

## 1. Cómo funciona la atribución de extremo a extremo

1. **Etiquetas UTM en los enlaces externos** (Instagram bio, posts, Facebook,
   newsletter…). Estos enlaces viven *fuera* del repo — hay que pegarlos
   manualmente en cada plataforma usando las URLs de la tabla de abajo.
2. PostHog solo se inicializa cuando el visitante acepta el banner de cookies
   (`consent.js` — lazy-init, opt-in real). A partir de ahí captura
   automáticamente `utm_source/medium/campaign/content/term`,
   `$referring_domain` y el referrer inicial en el primer pageview.
3. El resto del recorrido se sigue por evento propio: `appstore_cta_viewed`
   (impresión de un botón de App Store) y `appstore_cta_clicked` (clic, con
   `source`: `nav`, `hero`, `cta`, `about`, `faq`, `roadmap`, `thanks`…) son
   los eventos terminales medibles. No hay backend propio ni redirección
   externa que confirme la conversión real — la instalación ocurre en la App
   Store, fuera de nuestro alcance.

> ⚠️ Sin UTM, el tráfico social entra como `l.instagram.com` / `$direct` y
> **no se puede saber qué publicación concreta convierte**. Y sin opt-in al
> banner de cookies no se captura nada en absoluto (PostHog nunca se carga si
> el visitante rechaza o no decide).

## 2. URLs listas para usar

Base del sitio: `https://projectsummit.app/`

| Dónde se pega | URL con UTM |
|---|---|
| Instagram — bio | `https://projectsummit.app/?utm_source=instagram&utm_medium=social&utm_campaign=bio` |
| Instagram — stories | `https://projectsummit.app/?utm_source=instagram&utm_medium=social&utm_campaign=story` |
| Instagram — post concreto | `https://projectsummit.app/?utm_source=instagram&utm_medium=social&utm_campaign=launch&utm_content=post_2026_05_29` |
| Facebook — página | `https://projectsummit.app/?utm_source=facebook&utm_medium=social&utm_campaign=bio` |
| Reddit / foros | `https://projectsummit.app/?utm_source=reddit&utm_medium=community&utm_campaign=launch` |
| Newsletter / email | `https://projectsummit.app/?utm_source=newsletter&utm_medium=email&utm_campaign=launch` |
| Embajadores (link a compartir) | `https://projectsummit.app/?utm_source=ambassador&utm_medium=referral&utm_campaign=ambassadors&utm_content=NOMBRE` |

### Convención de nombres (mantener consistencia)

- `utm_source`: la plataforma — `instagram`, `facebook`, `reddit`, `newsletter`, `ambassador`.
- `utm_medium`: el tipo — `social`, `email`, `referral`, `community`, `cpc` (pago).
- `utm_campaign`: la iniciativa — `bio`, `launch`, `summer_2026`…
- `utm_content`: para distinguir variantes (post concreto, A/B, nombre de embajador).

Usa **siempre minúsculas y guiones bajos** — PostHog distingue mayúsculas.

## 3. Marcar tráfico interno / de pruebas

Para que tus propias visitas (y las de tu equipo) no contaminen los datos:

- Visita cualquier página con **`?internal=1`** una vez en cada navegador/dispositivo
  propio. Queda guardado en `localStorage` y añade `is_internal: true` a todos los
  eventos de ese navegador.
- Para revertirlo: visita con **`?internal=0`**.
- En PostHog, el filtro **"internal & test accounts"** ya excluye `is_internal = true`
  (configurado por defecto en el proyecto), además de la cohorte de test existente.

## 4. Bucle de conversión real (App Store)

El embudo medible hoy es:

```
$pageview  →  appstore_cta_viewed  →  appstore_cta_clicked
 (visita)        (ve un botón)          (clic real)
```

- El objetivo terminal medible es el **clic al badge de App Store**
  (`appstore_cta_clicked`) — no hay forma de rastrear nada después de que el
  visitante salta a `apps.apple.com`.
- Cada superficie manda su propio `source` (`nav`, `nav_mobile`, `hero`, `cta`,
  `about`, `faq`, `roadmap`, `thanks`), lo que permite comparar CTR por
  ubicación del botón.
- El dashboard **🎯 App Store Conversion (v2)** (generado por
  `POSTHOG_API_KEY=… node tools/posthog-dashboards.js --apply`) es la fuente
  de la verdad: tendencia de clics, CTR por surface (impresiones vs. clics),
  funnel `pageview → impresión → clic`, y desglose por idioma, dispositivo,
  página y referrer.

> Nota histórica: antes del lanzamiento en la App Store, este documento
> describía un funnel de waitlist con Tally (`waitlist_cta_clicked` →
> `waitlist_completed`, con `thanks.html` como confirmación del registro). Ese
> formulario ya no existe — el sitio enlaza directo a la ficha de la App
> Store. `thanks.html` sigue en el repo pero **no está enlazada desde ninguna
> página**; es un remanente sin tráfico, no parte del flujo de conversión
> actual. El dashboard de la era waitlist fue archivado (ver la cabecera de
> `tools/posthog-dashboards.js`).
