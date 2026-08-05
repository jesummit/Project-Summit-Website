/* Curated source content for the generated /changelog.html (+ its es/ and ca/
 * twins). Pure data/config only — no side effects — so build.js can require it
 * without this file needing to know anything about how the page is rendered.
 *
 * WHY THIS FILE AND NOT assets/js/i18n.js: i18n.js is the dictionary for the
 * site's UI strings — a fixed, bounded set that every page shares. The release
 * history is neither: it grows by one entry with every App Store release and
 * none of it is reused anywhere. Putting it in i18n.js would turn the UI
 * dictionary into an ever-growing archive of transient copy. Same reasoning,
 * same shape and same generator pattern as tools/llms-content.js.
 *
 * Everything here is a public product claim, so the same rules apply as
 * everywhere else on the site (see CLAUDE.md "Free-tier copy"):
 *   - Never the words AI, chatbot or machine learning. The subject is "the
 *     engine".
 *   - Never imply an Apple Watch app, a complication or an on-wrist screen.
 *     The watch is a sensor, read through Apple Health.
 *   - Free-tier statements must stay exactly as strong as the release notes
 *     they came from — no generalising, and tier names (Pro / Elite) stay.
 *   - No prices, ratings, testimonials or user counts.
 *
 * SOURCE: the App Store release notes, written by the owner in Spanish. The
 * 1.4.0 English is Apple's published English text for that release, verbatim;
 * 1.1.0–1.3.0 English and all Catalan are translations of the Spanish. When a
 * new version ships, add a release object at the TOP of RELEASES (newest
 * first) and rebuild — nothing else needs touching.
 *
 * DATES: `date` is an ISO string and is OPTIONAL. Only 1.0 (App Store
 * releaseDate) and 1.4.0 have a sourced date; the rest are rendered with the
 * version alone rather than with a date invented to fill the slot. Omit the
 * field entirely when the real date isn't known — do not guess.
 *
 * File comments and identifiers are English, like everything else written into
 * this repo; the release copy itself is the site copy exception.
 */
'use strict';

// The three section labels a release can group its bullets under. Held here
// rather than repeated inside every release so the wording can't drift between
// versions (build.js looks up release group `section` values in this map).
const SECTION_LABELS = {
  new:      { en: 'New',      es: 'Novedades', ca: 'Novetats' },
  improved: { en: 'Improved', es: 'Mejoras',   ca: 'Millores' },
  fixed:    { en: 'Fixed',    es: 'Corregido', ca: 'Corregit' },
};

// Every release note ends on this line. It is rendered as a closing sentence,
// not as a bullet — it's the catch-all, not a change anyone shipped.
// `closing: true` on a release opts it in.
const CLOSING = {
  en: 'Other minor fixes and stability improvements.',
  es: 'Otras correcciones menores y mejoras de estabilidad.',
  ca: "Altres correccions menors i millores d'estabilitat.",
};

// Month names for the rendered date line (build.js composes "22 June 2026" /
// "22 de junio de 2026" / "22 de juny de 2026" from the ISO date).
const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  ca: ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'],
};

// Newest first — the page renders them in exactly this order.
const RELEASES = [
  {
    version: '1.4.0',
    date: '2026-07-29',
    closing: true,
    groups: {
      en: [
        {
          section: 'new',
          items: [
            'New sleep scoring engine, with an expanded detail view: comparison against your historical median, a sleep debt chart, stages and rhythm.',
            "Recovery, Sleep and Load are now three separate cards in Today. The Recovery detail shows where today's value falls within your personal range, and coach insights read your trend over the past month, not just today's value.",
            'New optional notifications, each with its own toggle in Settings: disconnected integration, fitness improvement, race reminder, weekly summary, and an ease-off alert after several days of low recovery.',
          ],
        },
        {
          section: 'fixed',
          items: [
            'A double count of heart rate and HRV between Sleep and Recovery was distorting both scores.',
            'Elevation, power or HR data was missing on some activities due to a caching issue.',
            'Karoo activities without a power meter could lose the rest of their data (HR, elevation, speed, cadence).',
            'A second recovery measurement in the morning could change your workout for no real reason.',
            'A planned workout could change its duration or intensity on the same day.',
          ],
        },
      ],
      es: [
        {
          section: 'new',
          items: [
            'Nuevo motor de puntuación del sueño, con un detalle ampliado: comparación con tu mediana histórica, gráfico de deuda de sueño, fases y ritmo.',
            'Recuperación, Sueño y Carga ahora son tres tarjetas independientes en Hoy. El detalle de Recuperación muestra dónde cae tu dato de hoy dentro de tu rango personal, y las valoraciones del coach leen tu tendencia del último mes, no solo el dato del día.',
            'Nuevas notificaciones opcionales, cada una con su interruptor en Ajustes: integración desconectada, mejora de forma, recordatorio de carrera, resumen semanal y aviso de bajar el ritmo tras varios días de baja recuperación.',
          ],
        },
        {
          section: 'fixed',
          items: [
            'Un doble conteo de frecuencia cardíaca y HRV entre Sueño y Recuperación distorsionaba ambas puntuaciones.',
            'Faltaban datos de elevación, potencia o FC en algunas actividades por un fallo de caché.',
            'Las actividades de Karoo sin medidor de potencia podían perder el resto de sus datos (FC, elevación, velocidad, cadencia).',
            'Una segunda medición de recuperación por la mañana podía cambiar tu entrenamiento sin motivo real.',
            'Un entrenamiento planificado podía cambiar de duración o intensidad el mismo día.',
          ],
        },
      ],
      ca: [
        {
          section: 'new',
          items: [
            'Nou motor de puntuació del son, amb un detall ampliat: comparació amb la teva mediana històrica, gràfic de deute de son, fases i ritme.',
            "Recuperació, Son i Càrrega ara són tres targetes independents a Avui. El detall de Recuperació mostra on cau la teva dada d'avui dins del teu rang personal, i les valoracions del coach llegeixen la teva tendència de l'últim mes, no només la dada del dia.",
            "Noves notificacions opcionals, cadascuna amb el seu interruptor a Ajustos: integració desconnectada, millora de forma, recordatori de cursa, resum setmanal i avís d'abaixar el ritme després de diversos dies de baixa recuperació.",
          ],
        },
        {
          section: 'fixed',
          items: [
            'Un doble recompte de freqüència cardíaca i HRV entre Son i Recuperació distorsionava totes dues puntuacions.',
            "Faltaven dades d'elevació, potència o FC en algunes activitats per un error de memòria cau.",
            'Les activitats de Karoo sense mesurador de potència podien perdre la resta de les seves dades (FC, elevació, velocitat, cadència).',
            'Una segona mesura de recuperació al matí podia canviar el teu entrenament sense motiu real.',
            'Un entrenament planificat podia canviar de durada o intensitat el mateix dia.',
          ],
        },
      ],
    },
  },

  {
    version: '1.3.0',
    closing: true,
    groups: {
      en: [
        {
          section: 'new',
          items: [
            'Completely redesigned onboarding: more visual and faster, with what Summit is for from the very first screen, and the option to enter your FTP if you want to.',
            'A new power-record notification: when you beat your all-time best on any of the 16 durations on your power curve, we let you know.',
            'Free users now see the outline of their plan (the type, duration and phase of each session), as a preview of the full planning.',
          ],
        },
        {
          section: 'fixed',
          items: [
            'The “Structure” list in the workout detail showed the wrong zone or intensity on single-rep blocks.',
            'The Analysis panel could come up empty when you opened an activity.',
            'Karoo activities without power were saved without their charts.',
            "The monthly calendar could show a workout that didn't exist on days with no availability.",
            'Contradictory messages in Today during a rest day inside a taper.',
            'The CP model curve could run outside the chart on the Power tab.',
          ],
        },
      ],
      es: [
        {
          section: 'new',
          items: [
            'Onboarding completamente rediseñado: más visual y rápido, con la propuesta de valor de Summit desde el primer momento y la posibilidad de introducir tu FTP de forma opcional.',
            'Nueva notificación de récord de potencia: cuando superas tu mejor marca histórica en cualquiera de las 16 duraciones de tu curva, te avisamos.',
            'Los usuarios Free ahora ven la silueta de su plan (tipo, duración y fase de cada sesión), como anticipo de la planificación completa.',
          ],
        },
        {
          section: 'fixed',
          items: [
            'La lista “Estructura” del detalle de entreno mostraba zona o intensidad incorrecta en bloques de una sola repetición.',
            'El panel de Análisis podía quedarse vacío al abrir una actividad.',
            'Actividades de Karoo sin potencia se guardaban sin sus gráficas.',
            'El calendario mensual podía mostrar un entreno inexistente en días sin disponibilidad.',
            'Mensajes contradictorios en Hoy durante un día de descanso dentro de un taper.',
            'La curva del modelo CP podía salirse del gráfico en la pestaña de Potencia.',
          ],
        },
      ],
      ca: [
        {
          section: 'new',
          items: [
            "Onboarding completament redissenyat: més visual i ràpid, amb la proposta de valor de Summit des del primer moment i la possibilitat d'introduir el teu FTP de manera opcional.",
            "Nova notificació de rècord de potència: quan superes la teva millor marca històrica en qualsevol de les 16 durades de la teva corba, t'avisem.",
            'Els usuaris Free ara veuen la silueta del seu pla (tipus, durada i fase de cada sessió), com a avançament de la planificació completa.',
          ],
        },
        {
          section: 'fixed',
          items: [
            "La llista “Estructura” del detall d'entreno mostrava una zona o intensitat incorrecta en blocs d'una sola repetició.",
            "El panell d'Anàlisi podia quedar-se buit en obrir una activitat.",
            'Les activitats de Karoo sense potència es desaven sense els seus gràfics.',
            'El calendari mensual podia mostrar un entreno inexistent en dies sense disponibilitat.',
            "Missatges contradictoris a Avui durant un dia de descans dins d'un taper.",
            'La corba del model CP podia sortir-se del gràfic a la pestanya de Potència.',
          ],
        },
      ],
    },
  },

  {
    version: '1.2.0',
    closing: true,
    groups: {
      en: [
        {
          section: 'new',
          items: [
            'Redesigned activity detail: tabbed navigation (Summary, HR, Power, Analysis), a route map in the header, and a visual comparison of planned versus executed, rep by rep, with your historical power curve as the reference.',
            'Revamped special-event card (races, training camps, holidays): a weather forecast per stage (with heat warnings at ≥30°C and extreme heat at ≥35°C) and your race nutrition plan, with more context in the countdown and in the progress of multi-day events.',
            'A new execution analysis based on the real laps recorded by your device, and more reliable for it: your easy rides and recovery spins now get an analysis too, not just interval sessions.',
            'The Calendar now clearly distinguishes when you completed the workout, when you did part of it, and when you rode freely on a day with a workout scheduled.',
            'A new share-card style with your route traced on it, a cover photo on outdoor rides, and a route thumbnail on the activity cards.',
            'Wider free access: the route, the stats and the elevation in the activity detail are now visible without a subscription; heart rate, power and analysis stay in Pro or Elite.',
            "When you complete the workout for a special event (your target race, for instance), you'll see a single combined card with the real result.",
          ],
        },
        {
          section: 'improved',
          items: [
            'A smoother, faster Calendar, with no flicker when moving between months and days.',
            "Usability improvements, including a more realistic anaerobic battery (W'bal) reading on long rides, cleaner elevation, power and HR charts, and an optional notice when a new version is available.",
          ],
        },
        {
          section: 'fixed',
          items: [
            'Creating a special event, or certain plan settings, could wrongly erase the record of a workout you had already completed.',
            "A free ride on a day with a workout scheduled could show an interval breakdown you hadn't actually done.",
            "Today's workout could still show as pending even after you had completed it.",
            "The execution chart (planned vs. completed) and the interval detail didn't appear on some Strava and Karoo activities.",
            'A planned workout could disappear from the Calendar when you logged another, unrelated activity.',
          ],
        },
      ],
      es: [
        {
          section: 'new',
          items: [
            'Detalle de actividad rediseñado: navegación por pestañas (Resumen, FC, Potencia, Análisis), mapa de ruta en la cabecera y comparación visual entre lo planificado y lo ejecutado, repetición a repetición, con tu curva de potencia histórica como referencia.',
            'Tarjeta de eventos especiales (carreras, campus, vacaciones) renovada: pronóstico del tiempo por etapa (con avisos de calor ≥30°C y extremo ≥35°C) y tu plan de nutrición de carrera, con más contexto en la cuenta atrás y el progreso de eventos de varios días.',
            'Nuevo análisis de ejecución basado en las vueltas (laps) reales de tu dispositivo, más fiable: ahora tus rodajes suaves y salidas de recuperación también reciben análisis, no solo los entrenamientos de series.',
            'El Calendario distingue con claridad cuándo cumpliste el entrenamiento, cuándo lo hiciste en parte y cuándo saliste libre en un día con entreno programado.',
            'Nuevo estilo de tarjeta para compartir con el trazado de tu ruta, foto de portada en salidas al aire libre, y miniatura de ruta en las tarjetas de actividad.',
            'Acceso gratuito ampliado: ruta, estadísticas y elevación del detalle de actividad ya son visibles sin suscripción; frecuencia cardíaca, potencia y análisis siguen en Pro o Elite.',
            'Al completar el entrenamiento de un evento especial (como tu carrera objetivo), verás una única tarjeta combinada con el resultado real.',
          ],
        },
        {
          section: 'improved',
          items: [
            'Calendario más fluido y rápido, sin parpadeos al navegar entre meses y días.',
            "Mejoras de experiencia de uso, incluyendo un indicador de batería anaeróbica (W'bal) más realista en salidas largas, gráficos de elevación, potencia y FC más limpios, y aviso opcional cuando hay una nueva versión disponible.",
          ],
        },
        {
          section: 'fixed',
          items: [
            'Crear un evento especial o ciertos ajustes del plan podían borrar por error el registro de un entrenamiento ya completado.',
            'Una salida libre en un día con entreno programado podía mostrar un desglose de series que en realidad no hiciste.',
            'El entreno de hoy podía seguir mostrándose como pendiente aunque ya lo hubieras completado.',
            'El gráfico de ejecución (planificado vs. realizado) y el detalle de intervalos no aparecían en algunas actividades de Strava y Karoo.',
            'Un entrenamiento planificado podía desaparecer del Calendario al registrar otra actividad no relacionada.',
          ],
        },
      ],
      ca: [
        {
          section: 'new',
          items: [
            "Detall d'activitat redissenyat: navegació per pestanyes (Resum, FC, Potència, Anàlisi), mapa de ruta a la capçalera i comparació visual entre el que estava planificat i el que has executat, repetició a repetició, amb la teva corba de potència històrica com a referència.",
            "Targeta d'esdeveniments especials (curses, campus, vacances) renovada: previsió del temps per etapa (amb avisos de calor ≥30°C i extrem ≥35°C) i el teu pla de nutrició de cursa, amb més context al compte enrere i al progrés dels esdeveniments de diversos dies.",
            "Nova anàlisi d'execució basada en les voltes (laps) reals del teu dispositiu, més fiable: ara els teus rodatges suaus i les sortides de recuperació també reben anàlisi, no només els entrenaments de sèries.",
            "El Calendari distingeix amb claredat quan vas complir l'entrenament, quan el vas fer en part i quan vas sortir lliure en un dia amb entreno programat.",
            "Nou estil de targeta per compartir amb el traçat de la teva ruta, foto de portada a les sortides a l'aire lliure, i miniatura de ruta a les targetes d'activitat.",
            "Accés gratuït ampliat: la ruta, les estadístiques i l'elevació del detall d'activitat ja són visibles sense subscripció; la freqüència cardíaca, la potència i l'anàlisi continuen a Pro o Elite.",
            "En completar l'entrenament d'un esdeveniment especial (com la teva cursa objectiu), veuràs una única targeta combinada amb el resultat real.",
          ],
        },
        {
          section: 'improved',
          items: [
            'Calendari més fluid i ràpid, sense parpelleigs en navegar entre mesos i dies.',
            "Millores d'experiència d'ús, incloent-hi un indicador de bateria anaeròbica (W'bal) més realista en sortides llargues, gràfics d'elevació, potència i FC més nets, i avís opcional quan hi ha una nova versió disponible.",
          ],
        },
        {
          section: 'fixed',
          items: [
            "Crear un esdeveniment especial o certs ajustos del pla podien esborrar per error el registre d'un entrenament ja completat.",
            'Una sortida lliure en un dia amb entreno programat podia mostrar un desglossament de sèries que en realitat no havies fet.',
            "L'entreno d'avui podia continuar mostrant-se com a pendent encara que ja l'haguessis completat.",
            "El gràfic d'execució (planificat vs. realitzat) i el detall d'intervals no apareixien en algunes activitats de Strava i Karoo.",
            'Un entrenament planificat podia desaparèixer del Calendari en registrar una altra activitat no relacionada.',
          ],
        },
      ],
    },
  },

  {
    version: '1.1.0',
    closing: true,
    groups: {
      en: [
        {
          section: 'new',
          items: [
            'Automatic sync with Hammerhead Karoo: your activities import themselves once you connect the device, every activity shows where it came from (Strava or Karoo), and your power curve and personal records stay consistent whatever the source.',
            "Workouts exported to your device now include descriptions and instructions in Spanish or Catalan, following your phone's language.",
          ],
        },
        {
          section: 'improved',
          items: [
            'A clearer Premium free trial: you now see the exact date your free access runs until, before anything is charged.',
            'The weekly availability button has moved to the Calendar, next to add event, so you can edit it from where you can see the weeks it affects.',
            'A clearer, simpler confidence indicator for your estimated FTP (eFTP).',
          ],
        },
        {
          section: 'fixed',
          items: [
            "Activities that didn't show up in the day's calendar even though their dot did.",
            'A blank activity detail when data from one of the sensors was missing.',
            'Missing elevation profiles on older activities.',
            'Incorrect power zones when exporting workouts to Karoo or intervals.icu.',
            "When you didn't do the key workout, an alternative plan sometimes wasn't generated for the next day.",
          ],
        },
      ],
      es: [
        {
          section: 'new',
          items: [
            'Sincronización automática con Hammerhead Karoo: tus actividades se importan solas al conectar el dispositivo, ves el origen (Strava/Karoo) en cada actividad, y tu curva de potencia y récords personales son consistentes vengan de donde vengan.',
            'Los entrenamientos exportados a tu dispositivo ahora incluyen descripciones e instrucciones en español o catalán según el idioma de tu móvil.',
          ],
        },
        {
          section: 'improved',
          items: [
            'Prueba gratuita de Premium más clara: ahora se indica la fecha exacta hasta la que tienes acceso gratis antes del cobro.',
            'El botón de disponibilidad semanal se ha movido a Calendario, junto a añadir evento, para editarla desde donde ves las semanas afectadas.',
            'Indicador de confianza del FTP estimado (eFTP) más claro y sencillo.',
          ],
        },
        {
          section: 'fixed',
          items: [
            'Actividades que no aparecían en el calendario del día aunque el punto sí se mostraba.',
            'Detalle de actividad en blanco cuando faltaban datos de algún sensor.',
            'Perfiles de elevación ausentes en actividades antiguas.',
            'Zonas de potencia incorrectas al exportar entrenamientos a Karoo o intervals.icu.',
            'Cuando no hacías el entrenamiento clave, a veces no se generaba un plan alternativo al día siguiente.',
          ],
        },
      ],
      ca: [
        {
          section: 'new',
          items: [
            "Sincronització automàtica amb Hammerhead Karoo: les teves activitats s'importen soles en connectar el dispositiu, veus l'origen (Strava/Karoo) a cada activitat, i la teva corba de potència i els teus rècords personals són consistents vinguin d'on vinguin.",
            "Els entrenaments exportats al teu dispositiu ara inclouen descripcions i instruccions en castellà o català segons l'idioma del teu mòbil.",
          ],
        },
        {
          section: 'improved',
          items: [
            "Prova gratuïta de Premium més clara: ara s'indica la data exacta fins a la qual tens accés gratuït abans del cobrament.",
            "El botó de disponibilitat setmanal s'ha mogut al Calendari, al costat d'afegir esdeveniment, per editar-la des d'on veus les setmanes afectades.",
            "Indicador de confiança de l'FTP estimat (eFTP) més clar i senzill.",
          ],
        },
        {
          section: 'fixed',
          items: [
            'Activitats que no apareixien al calendari del dia encara que el punt sí que es mostrava.',
            "Detall d'activitat en blanc quan faltaven dades d'algun sensor.",
            "Perfils d'elevació absents en activitats antigues.",
            'Zones de potència incorrectes en exportar entrenaments a Karoo o intervals.icu.',
            "Quan no feies l'entrenament clau, de vegades no es generava un pla alternatiu l'endemà.",
          ],
        },
      ],
    },
  },

  {
    // The launch. Deliberately two lines: the App Store release date and the
    // free tier are the only facts sourced for it — no feature list was
    // reconstructed after the fact.
    version: '1.0',
    date: '2026-06-22',
    groups: {
      en: [
        {
          section: 'new',
          items: [
            'Summit is on the App Store.',
            'The daily recovery score and your sleep analysis are free from day one — a free tier, not a trial.',
          ],
        },
      ],
      es: [
        {
          section: 'new',
          items: [
            'Summit ya está en la App Store.',
            'La puntuación de recuperación diaria y tu análisis del sueño son gratis desde el primer día — un nivel gratuito, no una prueba.',
          ],
        },
      ],
      ca: [
        {
          section: 'new',
          items: [
            "Summit ja és a l'App Store.",
            "La puntuació de recuperació diària i la teva anàlisi del son són gratis des del primer dia — un nivell gratuït, no una prova.",
          ],
        },
      ],
    },
  },
];

module.exports = { SECTION_LABELS, CLOSING, MONTHS, RELEASES };
