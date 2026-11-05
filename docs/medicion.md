# Medición: Google Ads, Google Tag Manager y Meta Pixel

Última revisión: 5 de noviembre de 2026.

## Qué hay instalado

| Herramienta | ID | Dónde se configura | Estado |
|---|---|---|---|
| Meta Pixel | `PUBLIC_META_PIXEL_ID` (variable de entorno en Vercel) | Vercel → Settings → Environment Variables | Activo |
| Google Tag Manager | `GTM-MP6HRKCG` | `src/data/tracking.ts` (o `PUBLIC_GTM_ID`) | Activo |
| Etiqueta de Google Ads | `AW-18556827974` (dentro del contenedor) | tagmanager.google.com / Google Ads | Activa |
| Conversión «Clic en WhatsApp - Web» de Google Ads | `AW-18556827974/7J0pCKGwsrIdEMbyypBF` | `src/data/tracking.ts` → `GOOGLE_ADS_WA_LABEL` (o `PUBLIC_GOOGLE_ADS_WA_LABEL`) | Activa desde el 5 nov 2026 (Contacto · recuento «Una» · principal · conversiones avanzadas desactivadas) |
| Google Analytics 4 | — | — | No existe |

`GTM-MP6HRKCG` es un **contenedor de Google Tag Manager**, no un ID de conversión. Lo creó Google Ads; su versión publicada (v1)
contiene solo la etiqueta de Google de la cuenta `AW-18556827974`, con eventos automáticos y la opción de recopilación
automática de datos proporcionados por el usuario. **No tiene** etiqueta «Seguimiento de conversiones de Google Ads» ni
«Vinculación de conversiones», y no las necesita (ver «Conversión de Google Ads»). Revisado el 5 nov 2026: sigue en la
versión 1.

Los IDs son públicos (salen en el HTML), no son claves. Si un valor tiene formato inválido, esa herramienta queda apagada.

## Cómo funciona

```
src/data/tracking.ts         IDs + mapa código de WhatsApp → formación (se arma solo desde programs.ts)
src/components/Tracking.astro  aviso de cookies (mismo texto y diseño) + configuración en <script type="application/json" id="rn-tracking">
src/lib/tracking/index.ts    consentimiento + detector único de clics en WhatsApp → reparte a cada plataforma
src/lib/tracking/consent.ts  localStorage rn_consent (granted / denied)
src/lib/tracking/meta.ts     Meta Pixel: PageView, ViewContent (/constelaciones-familiares), Contact
src/lib/tracking/google.ts   GTM + Modo de consentimiento + whatsapp_click + conversión de Google Ads
src/lib/tracking/source.ts   origen de la visita (sessionStorage rn_src)
```

1. **Consentimiento primero.** Nada de Google ni de Meta se descarga hasta que la persona pulsa «Aceptar». «Rechazar»
   o cambiar la decisión en «Preferencias de seguimiento» (pie de página) detiene los envíos y borra las cookies
   `_gcl_*`, `_ga`, `_fbp` y `_fbc`.
2. **GTM.** Al aceptar se declara el Modo de consentimiento (`default` denegado → `update`: `ad_storage`,
   `ad_user_data` y `analytics_storage` concedidos; `ad_personalization` **denegado**, es decir, sin remarketing) y se
   inserta el fragmento oficial de GTM. El `<noscript>` de GTM se omite a propósito, porque no puede respetar el
   consentimiento.
3. **Un detector, un evento por plataforma.** Un único escucha de clics (`click` y clic con la rueda) en
   `a[href^="https://wa.me/"]` con anti-duplicado de 1,5 s (doble toque). Cada clic produce, como máximo:
   - Meta: `Contact` (mismos parámetros de siempre: `content_name`, `content_category`, `source`, `wa_code`).
   - Google: `dataLayer.push({ event: 'whatsapp_click', … })`, y la conversión de Google Ads
     (`gtag('event', 'conversion', { send_to })`) **solo** si hay etiqueta configurada.
4. **Los enlaces no se tocan.** El detector lee el código del mensaje (`[WEB-CONST]`) del enlace. Nunca envía el
   enlace, el número, el texto del mensaje ni el `gclid`/`fbclid`.

## Evento `whatsapp_click`

| Parámetro | Ejemplo | Qué es |
|---|---|---|
| `page_path` | `/constelaciones-familiares` | Página del clic (sin `.html`) |
| `program` | `constelaciones-familiares` · `biodescodificacion` · `general` | Formación de interés (por el código del mensaje; `general` cuando no se puede determinar) |
| `program_name` | `Formación en Constelaciones Familiares y Terapia Sistémica` | Nombre de la formación |
| `cta_location` | `hero` | Ubicación del botón (tabla de abajo) |
| `wa_code` | `WEB-CONST` | Código del mensaje de WhatsApp |
| `visit_source` / `visit_medium` / `visit_campaign` | `google` / `cpc` / `constelaciones_busqueda` | Origen de la visita (página de entrada) |
| `landing_page` | `/constelaciones-familiares` | Página por la que entró a la web |
| `event_date` | `2026-11-28` | Fecha del clic, hora de Colombia |
| `device_type` | `movil` · `escritorio` | Por ancho de pantalla (< 768 px = móvil) |

**Origen de la visita:** con `gclid`, `gbraid` o `wbraid` → `google / cpc`; con `utm_*` → esos valores; con `fbclid` →
`facebook / social`; si no, el sitio de procedencia (`google / organic`, `instagram / social`, `(direct) / (none)`…).
Se recalcula en cada entrada nueva y se conserva durante la sesión al navegar por el sitio.

**Ubicaciones (`data-wa-loc`):**

| Valor | Dónde |
|---|---|
| `encabezado` | Botón del encabezado (computador y tablet) |
| `menu_movil` | Botón dentro del menú del celular |
| `barra_movil` | Barra fija inferior del celular (páginas de formación) |
| `hero` | Botón principal de la parte superior de la página |
| `temario` | Junto al temario |
| `proximo_inicio` | Franja «Próximo inicio» (Constelaciones) |
| `nueva_cohorte` | Franja «Nueva cohorte» (Inicio) |
| `jornadas` | «Preguntar fechas» de jornadas (Formaciones) |
| `cta_final` | Franja final de llamado a la acción |
| `pie_boton` / `pie_contacto` | Pie de página: botón y número |

Un enlace de WhatsApp sin `data-wa-loc` se registra igual, como `encabezado`, `pie` o `contenido`. `npm test` falla si
un botón nuevo no tiene ubicación.

## Tres métricas distintas (no mezclarlas)

| Métrica | Qué significa | Dónde se ve |
|---|---|---|
| **Clic en WhatsApp** (`whatsapp_click`, conversión «Clic en WhatsApp – Web» de Google Ads, `Contact` de Meta) | Alguien pulsó un botón. **No** garantiza que haya escrito. | Google Ads → Conversiones · Meta → Administrador de eventos |
| **Conversación iniciada** | Llegó un mensaje de WhatsApp con el código `[WEB-CONST]`, `[WEB-BIO]`, `[WEB-GENERAL]`… | WhatsApp Business (conteo manual por código) |
| **Inscripción** | La persona se inscribió o pagó. | Panel `/admin/inscritos` |

Nunca se marca una visita a una página como cliente potencial: las conversiones de Google Ads son solo clics en WhatsApp.

## Conversión de Google Ads

**Cómo se envía.** Al hacer clic en WhatsApp (con consentimiento), el código ejecuta
`gtag('event', 'conversion', { send_to: 'AW-18556827974/7J0pCKGwsrIdEMbyypBF' })`. La etiqueta de Google que ya está en el
contenedor (`AW-18556827974`) recibe ese comando y lo envía a Google Ads. **No hay que crear nada en GTM.**

**Por qué el contenedor no necesita más etiquetas:**
- **Seguimiento de conversiones de Google Ads:** no. La conversión ya sale desde el código. Si además se crea esta etiqueta
  en GTM (por ejemplo, con el activador `whatsapp_click`), cada clic contaría **dos veces**.
- **Vinculación de conversiones (Conversion Linker):** no. La etiqueta de Google ya hace esa función. Comprobado en
  navegador: al llegar con `?gclid=`, crea la cookie `_gcl_aw`, y la conversión enviada en otra página lleva el `gclid`
  (parámetro `gclaw`). La etiqueta de vinculación solo hace falta con etiquetas de conversión de GTM sin etiqueta de Google.

**Alternativa (no usar a la vez):** si algún día se prefiere manejar la conversión desde GTM, se crea allí la etiqueta
«Seguimiento de conversiones de Google Ads» (ID `18556827974`, etiqueta `7J0pCKGwsrIdEMbyypBF`, activador «Evento
personalizado» = `whatsapp_click`) y **en el mismo momento** se vacía `GOOGLE_ADS_WA_LABEL` en `src/data/tracking.ts`.

**Atribución al anuncio mientras se navega:**
- Con cookies aceptadas en la página de llegada, la etiqueta guarda el clic del anuncio en `_gcl_aw` (90 días).
- Si la persona navega **antes** de responder al aviso, el `gclid`/`gbraid`/`wbraid` de la página de entrada se añade a
  los enlaces internos al pulsarlos (como el «url passthrough» de Google). No se guarda en el dispositivo. Así, si acepta
  en otra página, la conversión se atribuye igual. Si rechaza, deja de añadirse. Los enlaces de WhatsApp no se tocan.
- El origen de la visita (`visit_source`, `landing_page`) se conserva en la navegación interna aunque la dirección lleve
  el `gclid`.

**Evitar el doble conteo.** No crear, para el mismo clic:
- una etiqueta «Seguimiento de conversiones de Google Ads» en GTM,
- una conversión automática de Google Ads por «clics en enlaces» o «URL contiene wa.me»,
- ni una conversión importada de GA4 por `whatsapp_click`.

Si Google Ads ya creó alguna conversión automática de clics o de visitas a páginas, se marca como **secundaria**,
para que no cuente como cliente potencial. Con el recuento «Una», varios clics en WhatsApp después de un mismo clic en el
anuncio cuentan como una sola conversión.

### Configuración usada en Google Ads

| Campo | Valor |
|---|---|
| Nombre | `Clic en WhatsApp - Web` |
| Categoría | **Contacto** |
| Valor | Sin valor (un clic no es una venta) |
| Recuento | **Una** |
| Optimización | Principal |
| Configuración de etiqueta | «Usar Google Tag Manager» → ID `18556827974`, etiqueta `7J0pCKGwsrIdEMbyypBF` |

Para cambiar la etiqueta: `GOOGLE_ADS_WA_LABEL` en `src/data/tracking.ts` (o `PUBLIC_GOOGLE_ADS_WA_LABEL` en Vercel) →
`npm run build && npm test` → publicar.

**Conversiones avanzadas:** desactivadas en la acción de conversión. La configuración de la etiqueta de Google publicada
todavía marca la recopilación automática de datos proporcionados por el usuario. En las pruebas del 5 nov 2026 las
conversiones no llevaron datos personales (ni `em`, ni correo, ni teléfono). Para cerrarlo del todo, desactivar también
«Datos proporcionados por el usuario» en la configuración de la etiqueta de Google (Google Ads → Herramientas →
Administrador de datos → Etiqueta de Google → Administrar → Configuración).

## Google Analytics 4 (opcional, más adelante)

Para ver los clics por ubicación, formación y origen en informes, se puede crear una propiedad GA4 y conectarla en GTM:

1. Etiqueta «Etiqueta de Google» con el ID `G-…`.
2. Etiqueta «Evento de GA4» `whatsapp_click`, con activador «Evento personalizado» = `whatsapp_click` y los parámetros
   de la tabla, como variables de la capa de datos.
3. En GA4, registrar esos parámetros como dimensiones personalizadas y marcar `whatsapp_click` como evento clave.

No enviar a Google Ads la conversión importada de GA4 si la conversión directa de arriba ya está activa (doble conteo).

## Nueva formación (reutilizable)

1. `src/lib/whatsapp.ts`: añadir el mensaje con su código, por ejemplo `[WEB-XYZ]`.
2. `src/data/programs.ts`: crear el programa con ese `waKey` y añadirlo a `programs`. La medición lo reconoce sola.
3. A cada botón nuevo de WhatsApp en la página, añadir `data-wa-loc="…"`. Los componentes compartidos ya lo llevan.
4. Para medir la visita a esa página en Meta con `ViewContent`, añadir la ruta en `src/lib/tracking/meta.ts` y
   actualizar la frase de `/privacy`.
5. En Google Ads, la misma acción «Clic en WhatsApp – Web» sirve para todas las formaciones. Las campañas ya separan
   los resultados. Si se necesita una acción por formación, se crea otra y se envía según `program` en
   `src/lib/tracking/google.ts`.

## Pruebas

- `npm test`:
  - GTM y Pixel no se cargan antes del consentimiento,
  - cada botón tiene su ubicación,
  - la configuración no contiene teléfono ni correo,
  - la sección de Google existe en `/privacy`,
  - estado de la etiqueta de conversión.
- **Navegador:** con un clic en WhatsApp, `dataLayer.filter(e => e.event === 'whatsapp_click')` en la consola.
- **Oficiales (requieren la cuenta de Google):**
  - [Tag Assistant](https://tagassistant.google.com) → «Add domain» → `https://renacer-ahora.com/constelaciones-familiares`
    → se abre la web en una ventana nueva → **aceptar cookies** (sin aceptar no se carga nada) → pulsar un botón de
    WhatsApp. En Tag Assistant: debe aparecer **un** `whatsapp_click` y, en la etiqueta `AW-18556827974`, **un** evento
    `conversion` con la etiqueta `7J0pCKGwsrIdEMbyypBF`.
  - Google Ads → Objetivos → Conversiones → «Clic en WhatsApp - Web»: el estado pasa de «Sin verificar» a
    «Sin conversiones recientes» o «Registrando conversiones» (puede tardar hasta 24 h). Solo cuentan los clics de
    personas que llegaron desde un anuncio; las pruebas sin clic en anuncio no suman conversiones.
  - Meta → Administrador de eventos → Probar eventos.

## Privacidad

`/privacy` tiene dos secciones añadidas después del texto original: `#meta-pixel` y `#google-ads`. Si cambia qué se
mide, actualizar la sección correspondiente.
