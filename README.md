# Centro de Formación Renacer — renacer-ahora.com

Sitio oficial de Renacer (Cali, Colombia).

## Stack

- **Astro 5** (salida estática) + **TypeScript** + **Tailwind CSS 3**
- **React** solo en los paneles internos `/admin/*` (islas `client:only`)
- Imágenes con `astro:assets` (AVIF/WebP responsivas), fuentes autoalojadas (Manrope + Cormorant Garamond)
- Funciones serverless de Vercel en `api/` (sesión admin, datos, chat, Brevo, WhatsApp Embedded Signup)

## Estructura

```
src/data/          programas, facilitadoras, FAQs, testimonios, datos del sitio
src/lib/whatsapp.ts  enlaces wa.me con mensaje por formación ([WEB-SEX], [WEB-BIO], [WEB-CONST], [WEB-GENERAL])
src/pages/         /, /formaciones, /sexualidad-consciente, /biodescodificacion,
                   /constelaciones-familiares, /testimonios, /privacy, /admin/*
src/react-admin/   paneles internos (sin cambios funcionales)
api/               funciones de Vercel (no modificar rutas: las usan integraciones activas)
public/videos/     testimonios optimizados (los originales están fuera del repo)
```

Para cambiar fechas, precios o módulos edita `src/data/programs.ts`.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # astro check + build
npm test           # verificaciones sobre dist/ (SEO, WhatsApp, /privacy, redirecciones)
```

Las rutas `/api/*` solo funcionan en Vercel (o con `vercel dev`).

## Notas

- `/privacy` contiene la política de Renacer AI usada por integraciones de Google; no cambiar su texto.
- Redirecciones 301 de rutas antiguas en `vercel.json`.
