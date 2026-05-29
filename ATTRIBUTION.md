# Trazabilidad y atribución de tráfico (PostHog)

Guía operativa para atribuir correctamente el tráfico web y las conversiones de
la waitlist. Complementa la instrumentación de `analytics.js`.

## 1. Cómo funciona la atribución de extremo a extremo

1. **Etiquetas UTM en los enlaces externos** (Instagram bio, posts, Facebook,
   newsletter…). Estos enlaces viven *fuera* del repo — hay que pegarlos
   manualmente en cada plataforma usando las URLs de la tabla de abajo.
2. PostHog captura automáticamente `utm_source/medium/campaign/content/term`,
   `$referring_domain` y el referrer inicial en el primer pageview.
3. `analytics.js` **reenvía** esos UTM (y `gclid`/`fbclid`) a los enlaces del
   formulario de Tally, de modo que la atribución sobrevive al salto
   website → Tally y se conserva en la conversión.

> ⚠️ Sin UTM, todo el tráfico social entra como `l.instagram.com` /
> `$direct` y **no se puede saber qué publicación concreta convierte**.

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

## 4. Bucle de conversión real (implementado ✅)

El embudo completo ya está cerrado:

```
$pageview  →  waitlist_cta_clicked  →  waitlist_completed
 (visita)        (clic en el CTA)        (registro real)
```

- **Clic en CTA** → evento `waitlist_cta_clicked` (con `source`: `hero_section`,
  `nav`, `footer`, etc.). *Antes se llamaba `waitlist_signup`.*
- **Registro completado** → Tally redirige tras el envío a
  `https://projectsummit.app/thanks.html`, que dispara
  `posthog.capture('waitlist_completed')` (una vez por sesión). Solo quien
  finaliza el formulario aterriza ahí.

El dashboard **🎯 Waitlist Conversion** ya refleja este embudo de 3 pasos, más
"Waitlist completados (tendencia)" y "…por source de campaña".

> Nota: la atribución se conserva porque el visitante vuelve al mismo dominio en
> el mismo navegador (cookie de PostHog intacta). Para que el desglose por
> campaña en `waitlist_completed` tenga datos, conviene que Tally **conserve los
> parámetros de query** en la redirección (Settings → After submission).

### Transición a producción (post-Tally)

Cuando se sustituya el formulario por enlaces a la App Store / Play Store, el
patrón se recicla: el evento terminal medible pasa a ser el clic de descarga
`app_store_clicked { store, source }` (no se puede rastrear después de salir
hacia Apple/Google), y `thanks.html` queda obsoleta.
