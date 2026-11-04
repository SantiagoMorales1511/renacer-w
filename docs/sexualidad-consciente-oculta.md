# Formación en Sexualidad Consciente — oculta

**Estado:** oculta desde el 4 de noviembre de 2026.
**Motivo:** la formación principal pasó a ser la nueva cohorte de Constelaciones Familiares (inicia el 28 de noviembre de 2026). Sexualidad Consciente puede volver a abrirse con un grupo nuevo en el futuro, por eso no se borró nada.

La última versión del sitio con la formación visible está marcada con la etiqueta de Git **`sexualidad-visible`**:

```bash
git show sexualidad-visible --stat
git diff sexualidad-visible -- src/pages/index.astro   # ver cómo estaba el Home
```

## Qué está oculto y dónde quedó

| Pieza | Estado actual |
|---|---|
| Página `/sexualidad-consciente` | Archivo intacto en `src/pages/_sexualidad-consciente.astro`. El `_` hace que Astro no la publique. |
| Dirección `/sexualidad-consciente` (y `/sexualidad`, `/formacion/sexualidad`) | Redirección **temporal (307)** a `/constelaciones-familiares` en `vercel.json`. |
| Datos (módulos, fechas, precio, facilitadoras) | Se conservan en `src/data/programs.ts` (objeto `sexualidad`), pero no están en la lista `programs`. |
| Facilitadoras | `people.mercedes` y `people.carolina` siguen en `src/data/people.ts`. |
| Preguntas frecuentes | `sexFaqs` en `src/data/faqs.ts`. |
| Mini testimonios | `featured.sex` en `src/data/testimonials.ts`. |
| Mensaje de WhatsApp `[WEB-SEX]` | Sigue en `src/lib/whatsapp.ts`. |
| Atribución de anuncios (`utm_content` → código en WhatsApp) | `src/components/WaAttribution.astro` sigue cargado, pero solo actúa sobre enlaces `[WEB-SEX]`, así que hoy no cambia nada. |
| Meta Pixel `ViewContent` | Se movió a `/constelaciones-familiares` (`src/components/MetaPixel.astro`). La frase de `/privacy` se actualizó para que coincida. |
| Menú, Home, Formaciones, pie de página, sitemap | Ya no la muestran. |

> **Anuncios:** si había campañas de Meta apuntando a `/sexualidad-consciente`, ahora llevan a Constelaciones. Revisa en el Administrador de anuncios y pausa o cambia esas campañas.

## Cómo volver a mostrarla

1. Actualiza fechas, módulos, precio y facilitadoras de la nueva cohorte en `src/data/programs.ts` (objeto `sexualidad`) y las preguntas en `sexFaqs`.
2. Renombra `src/pages/_sexualidad-consciente.astro` → `src/pages/sexualidad-consciente.astro` y revisa los textos con fechas escritas a mano (Hero, calendario, CTA, `stickyWa`).
3. Agrégala a `programs` en `src/data/programs.ts` y al menú `nav` en `src/data/site.ts` (y a `site.description` si debe mencionarse).
4. En `vercel.json` quita la redirección `/sexualidad-consciente` y vuelve a apuntar `/sexualidad` y `/formacion/sexualidad` a `/sexualidad-consciente`.
5. Si debe ser la formación destacada: tarjeta del Hero y banda "Nueva cohorte" en `src/pages/index.astro` (ver la etiqueta `sexualidad-visible`).
6. Meta Pixel: si `ViewContent` debe medir Sexualidad, cambia la ruta en `MetaPixel.astro` **y** la frase correspondiente en `src/pages/privacy.astro`.
7. En `scripts/verify-build.mjs` vuelve a añadir `sexualidad-consciente.html` a `pages` (`WEB-SEX`) y quita las verificaciones "Sexualidad oculta".
8. `npm run build && npm test`.
