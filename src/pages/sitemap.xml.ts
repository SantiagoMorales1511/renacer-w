import type { APIRoute } from 'astro'
import { site } from '../data/site'

/**
 * Sitemap único del sitio, en /sitemap.xml (es el que se envía en Google Search Console).
 * Se arma con las páginas reales de src/pages: excluye /admin, la 404, las páginas ocultas
 * (archivos que empiezan por "_", p. ej. Sexualidad Consciente) y este mismo archivo.
 * Las redirecciones de vercel.json no son páginas y nunca aparecen aquí.
 */
const pages = Object.keys(import.meta.glob('./*.astro'))
  .map((f) => f.slice(2, -'.astro'.length))
  .filter((name) => !name.startsWith('_') && name !== '404')

// Orden: Inicio, formaciones y luego el resto
const order = ['index', 'constelaciones-familiares', 'biodescodificacion', 'formaciones', 'testimonios']
pages.sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99))

const lastmod = new Date().toISOString().slice(0, 10)

export const GET: APIRoute = () => {
  const urls = pages
    .map((name) => `  <url>\n    <loc>${name === 'index' ? site.url + '/' : `${site.url}/${name}`}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
