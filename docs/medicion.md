# Medición: Google Ads, Google Tag Manager y Meta Pixel

Última revisión: 4 de noviembre de 2026.

## Qué hay instalado

| Herramienta | ID | Dónde se configura | Estado |
|---|---|---|---|
| Meta Pixel | `PUBLIC_META_PIXEL_ID` (variable de entorno en Vercel) | Vercel → Settings → Environment Variables | Activo |
| Google Tag Manager | `GTM-MP6HRKCG` | `src/data/tracking.ts` (o `PUBLIC_GTM_ID`) | Activo |
| Etiqueta de Google Ads | `AW-18556827974` (dentro del contenedor) | tagmanager.google.com / Google Ads | Activa |
| Conversión «Clic en WhatsApp» de Google Ads | etiqueta `AW-18556827974/…` | `src/data/tracking.ts` → `GOOGLE_ADS_WA_LABEL` (o `PUBLIC_GOOGLE_ADS_WA_LABEL`) | **Pendiente**: falta crear la acción en Google Ads |
| Google Analytics 4 | — | — | No existe |

`GTM-MP6HRKCG` es un **contenedor de Google Tag Manager**, no un ID de conversión. Lo creó Google Ads; su versión publicada (v1)
contiene solo la etiqueta de Google de la cuenta `AW-18556827974`, con eventos automáticos y la recopilación automática
de datos proporcionados por el usuario (conversiones avanzadas) activada. Sin la etiqueta de la acción de conversión no
se registra ninguna conversión.

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

## Activar la conversión de Google Ads

1. En Google Ads, crear la acción (ver «Pasos en Google Ads» abajo) y copiar la **etiqueta de conversión**.
2. Pegarla en `GOOGLE_ADS_WA_LABEL` de `src/data/tracking.ts` (por defecto vacío), o crear `PUBLIC_GOOGLE_ADS_WA_LABEL` en
   Vercel. Ejemplo: `send_to: 'AW-18556827974/AbC-D_efG12hIjk'` → la etiqueta es `AbC-D_efG12hIjk`.
3. `npm run build && npm test` → «Google Ads: conversión de WhatsApp configurada».
4. Publicar y comprobar en Google Ads → Objetivos → Conversiones que la acción pase a «Registrando conversiones».

**Evitar el doble conteo.** La conversión se envía desde el código. No crear además, para el mismo clic:
- una etiqueta «Seguimiento de conversiones de Google Ads» en GTM,
- ni una conversión automática de Google Ads por «clics en enlaces» o «URL contiene wa.me».

Si Google Ads ya creó alguna conversión automática de clics o de visitas a páginas, se marca como **secundaria**,
para que no cuente como cliente potencial.

### Pasos en Google Ads (requieren la cuenta)

Objetivos → Conversiones → Resumen → **+ Crear acción de conversión** → Sitio web → escribir `renacer-ahora.com` →
Analizar → **Agregar una acción de conversión manualmente**:

| Campo | Valor |
|---|---|
| Objetivo y acción | **Contacto** |
| Nombre | `Clic en WhatsApp – Web` |
| Valor | **No usar un valor** (un clic no es una venta) |
| Recuento | **Una** (una conversión por clic en el anuncio, aunque la persona pulse varias veces) |
| Período de conversión | 30 días |
| Atribución | Basada en datos (recomendada) |

Guardar → configurar la etiqueta → **Usar Google Tag Manager** → copiar el **ID de conversión** (debe ser
`18556827974`) y la **etiqueta de conversión**.

**Conversiones avanzadas:** el contenedor tiene activa la recopilación automática de datos proporcionados por el usuario.
El sitio no tiene formularios y en las pruebas las conversiones no llevaron datos personales. Aun así, como la web
muestra el correo y el WhatsApp de Renacer, conviene desactivarla en Google Ads → Objetivos → Configuración →
Conversiones avanzadas, o excluir el pie de página desde la configuración de la etiqueta de Google.

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
- **Oficiales:**
  - [Tag Assistant](https://tagassistant.google.com) (modo Vista previa de GTM, con la cuenta) → aceptar cookies →
    pulsar un botón: debe aparecer `whatsapp_click` y la conversión de Google Ads una sola vez.
  - Google Ads → Conversiones → diagnóstico de la acción.
  - Meta → Administrador de eventos → Probar eventos.

## Privacidad

`/privacy` tiene dos secciones añadidas después del texto original: `#meta-pixel` y `#google-ads`. Si cambia qué se
mide, actualizar la sección correspondiente.
