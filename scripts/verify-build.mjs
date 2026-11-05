// Verificaciones del sitio generado en dist/ (ejecutar después de `npm run build`).
// Uso: npm test
import { readFileSync, existsSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'

const dist = new URL('../dist/', import.meta.url)
const read = (p) => readFileSync(new URL(p, dist), 'utf8')
let failures = 0
const ok = (cond, msg) => {
  console.log(`${cond ? '✓' : '✗'} ${msg}`)
  if (!cond) failures++
}

const messages = {
  'WEB-SEX': 'Hola, vi la Formación en Sexualidad Consciente y Vínculos Afectivos en la página web de Renacer y quiero información para inscribirme. [WEB-SEX]',
  'WEB-BIO': 'Hola, vi el Máster en Biodescodificación en la web de Renacer y quiero información sobre los módulos e inscripciones. [WEB-BIO]',
  'WEB-CONST': 'Hola, vi la Formación en Constelaciones Familiares en la web de Renacer y quiero más información. [WEB-CONST]',
  'WEB-GENERAL': 'Hola, visité la página web de Renacer y quiero conocer sus formaciones. [WEB-GENERAL]',
}

const pages = {
  'index.html': 'WEB-GENERAL',
  'formaciones.html': 'WEB-GENERAL',
  'testimonios.html': 'WEB-GENERAL',
  'privacy.html': 'WEB-GENERAL',
  'biodescodificacion.html': 'WEB-BIO',
  'constelaciones-familiares.html': 'WEB-CONST',
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')

for (const [file, tag] of Object.entries(pages)) {
  ok(existsSync(new URL(file, dist)), `${file} existe`)
  const html = read(file)
  ok(/<title>[^<]{10,}<\/title>/.test(html), `${file}: <title>`)
  ok(/<meta name="description" content="[^"]{50,}"/.test(html), `${file}: meta description`)
  ok(/<link rel="canonical" href="https:\/\/renacer-ahora\.com[^"]*"/.test(html) && !/rel="canonical" href="[^"]*\.html"/.test(html) && !/og:url" content="[^"]*\.html"/.test(html), `${file}: canonical y og:url sin .html`)
  ok(/<meta property="og:image" content="https:\/\/renacer-ahora\.com\/_astro\/[^"]+\.jpg"/.test(html), `${file}: og:image absoluta`)
  ok(/<html lang="es-CO">/.test(html), `${file}: lang es-CO`)
  ok((html.match(/<h1[\s>]/g) || []).length === 1, `${file}: un solo <h1>`)

  const links = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]+)"/g)].map((m) => new URL(decode(m[1])))
  ok(links.length > 0, `${file}: ${links.length} enlaces de WhatsApp`)
  const wrong = links.filter((u) => u.pathname !== '/573123847771' || u.searchParams.get('text') !== messages[tag])
  ok(wrong.length === 0, `${file}: todos los WhatsApp → 573123847771 con mensaje [${tag}]`)

  const imgsNoAlt = [...html.matchAll(/<img(?![^>]*\balt[\s=>])[^>]*>/g)]
  ok(imgsNoAlt.length === 0, `${file}: todas las <img> tienen alt`)
  const imgsNoSize = [...html.matchAll(/<img(?![^>]*\bwidth=)[^>]*>/g)]
  ok(imgsNoSize.length === 0, `${file}: todas las <img> tienen width/height`)
}

// Sexualidad Consciente está oculta (docs/sexualidad-consciente-oculta.md): no se genera ni se enlaza
ok(!existsSync(new URL('sexualidad-consciente.html', dist)), 'Sexualidad: la página no se genera (oculta)')
ok(Object.keys(pages).every((f) => !/href="\/sexualidad-consciente"/.test(read(f)) && !read(f).includes('Sexualidad Consciente')), 'Sexualidad: ninguna página la enlaza ni la menciona')

// Constelaciones: nueva cohorte, datos visibles en el HTML inicial
const cons = read('constelaciones-familiares.html')
ok(cons.includes('28 de noviembre de 2026') && cons.includes('$300.000') && cons.includes('Cali, Ciudad Jardín'), 'Constelaciones: fecha de inicio, valor y lugar visibles')
const modTitles = ['Introducción a las Constelaciones Familiares', 'Dinámicas familiares', 'Los órdenes del amor', 'Compensación y reparación en el sistema', 'Órdenes de la abundancia', 'La figura materna', 'La figura del padre', 'La pareja', 'Salud, enfermedad y muerte', 'Empezar a constelar', 'Constelando y círculo de cierre']
ok(modTitles.every((t) => cons.includes(t)), 'Constelaciones: los 11 módulos del temario oficial')
ok((cons.match(/data-countdown data-target="2026-11-28T09:00:00-05:00"/g) || []).length === 2, 'Constelaciones: cuenta regresiva al 28 de noviembre, 9:00 a. m. (Colombia)')
ok((read('index.html').match(/data-countdown data-target="2026-11-28T09:00:00-05:00"/g) || []).length === 2, 'Home: cuenta regresiva en el Hero y en la banda de la nueva cohorte')
const lds = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => [JSON.parse(m[1])].flat())
const course = lds(cons).find((x) => x['@type'] === 'Course')
ok(course?.hasCourseInstance?.startDate === '2026-11-28' && course.offers.price === 300000, 'Constelaciones: datos estructurados Course con inicio 2026-11-28')
ok(lds(cons).some((x) => x['@type'] === 'BreadcrumbList') && lds(cons).some((x) => x['@type'] === 'FAQPage'), 'Constelaciones: migas de pan y preguntas frecuentes estructuradas')
ok(lds(read('index.html')).some((x) => x['@type'] === 'WebSite' && x.name === 'Renacer'), 'Home: datos estructurados WebSite "Renacer"')
const navHtml = read('index.html').slice(0, read('index.html').indexOf('<main'))
ok(navHtml.indexOf('href="/constelaciones-familiares"') > 0 && navHtml.indexOf('href="/constelaciones-familiares"') < navHtml.indexOf('href="/biodescodificacion"'), 'Menú: Constelaciones antes que Biodescodificación')

// Afirmaciones no respaldadas que no deben aparecer
const all = Object.keys(pages).map(read).join('\n').toLowerCase()
for (const claim of ['200 estudiantes', '+150', 'graduados', 'grupos reducidos', 'cupos limitados', 'últimos cupos', 'descuento']) {
  ok(!all.includes(claim), `sin la afirmación "${claim}"`)
}

// Videos: ninguno se descarga al abrir la página (solo data-*; el <video> del diálogo no tiene src)
for (const f of ['index.html', 'testimonios.html', 'constelaciones-familiares.html', 'biodescodificacion.html']) {
  const html = read(f)
  const eager = /<video[^>]*\ssrc=|<source[^>]*\.mp4/.test(html)
  ok(!eager, `${f}: ningún video con src en el HTML inicial (carga bajo demanda)`)
  const n = (html.match(/data-full="\/videos\/testimonio-[^"]+\.mp4"/g) || []).length
  ok(n > 0, `${f}: ${n} testimonios en video`)
}
ok((read('index.html').match(/<li[^>]*data-slide data-real="\d+" aria-roledescription/g) || []).length === 11, 'Home: carrusel con los 11 testimonios')
ok((read('index.html').match(/data-slide data-clone/g) || []).length === 6, 'Home: 3 copias visuales a cada lado para el carrusel circular')
ok(!/<section[^>]*data-carousel[\s\S]*?data-open[\s\S]*?<\/section>/.test(read('index.html')) && !/\sloop[\s>=]/.test(read('index.html')), 'Home: el carrusel no abre reproductor grande y sin loop')
// Ubicación de testimonios: Home = carrusel tras el Hero; formaciones = mini testimonios tras el Hero
const home = read('index.html')
const hCar = home.search(/<section[^>]*data-carousel/), hH1 = home.indexOf('<h1'), hSobre = home.indexOf('id="sobre"')
ok(hCar > hH1 && hCar < hSobre && (home.match(/<section[^>]*data-carousel/g) || []).length === 1, 'Home: un solo carrusel, inmediatamente después del Hero')
ok(!home.includes('class="ts ') && !home.includes('quienes han vivido Renacer') && !/class="(tc|ts)-time"/.test(home), 'Home: sin mini testimonios ni duración de videos')
ok((home.match(/id="tc-dialog"/g) || []).length === 0, 'Home: sin reproductor grande (todo ocurre en el carrusel)')
ok(!read('testimonios.html').includes('Todos los testimonios') && (read('testimonios.html').match(/<section[^>]*data-carousel/g) || []).length === 1 && !read('testimonios.html').includes('id="tc-dialog"'), '/testimonios: solo el carrusel (sin cuadrícula ni reproductor grande)')
for (const [f, nextId, cta] of [['biodescodificacion.html', 'id="intro"', 'experiencia de formación?'], ['constelaciones-familiares.html', 'id="intro"', 'Constelador Familiar?</span>']]) {
  const html = read(f)
  const strip = html.indexOf('Conoce la experiencia de estudiar en Renacer'), h1 = html.indexOf('<h1'), next = html.indexOf(nextId)
  ok(strip > h1 && strip < next, `${f}: mini testimonios después del Hero y antes del contenido`)
  const car = html.search(/<section[^>]*data-carousel/)
  ok(car > strip && car < html.lastIndexOf(cta), `${f}: carrusel completo abajo, antes del CTA final`)
  ok(!/class="(tc|ts)-time"/.test(html), `${f}: sin duración de los videos`)
  ok((html.match(/id="tc-dialog"/g) || []).length === 1 && (html.match(/class="ts-thumb/g) || []).length === 3, `${f}: 3 miniaturas y un único reproductor`)
  ok(html.lastIndexOf(cta) > car, `${f}: CTA final de WhatsApp conservado`)
}
const own = (f) => [...read(f).matchAll(/class="ts-thumb[^>]*data-program="([^"]+)"/g)].map((m) => m[1])
const bioSlides = [...read('biodescodificacion.html').matchAll(/data-slide [^>]*aria-label="\d+ de \d+: ([^"]+)"/g)].map((m) => m[1])
ok(['Marcela Rivera', 'Johana Valencia', 'Viviana'].every((n) => bioSlides.slice(1, 4).includes(n)), `Biodescodificación: el carrusel empieza con sus testimonios (${bioSlides.slice(1, 4).join(', ')})`)
ok(own('biodescodificacion.html').every((p) => p.includes('Biodescodificación')), 'Biodescodificación: miniaturas de estudiantes de Biodescodificación')
ok(own('constelaciones-familiares.html').every((p) => p.includes('Constelaciones')), 'Constelaciones: miniaturas de estudiantes de Constelaciones')
for (const f of ['index.html', 'biodescodificacion.html', 'testimonios.html']) {
  const html = read(f)
  ok(!/>\s*Ver con sonido\s*</.test(html) && !html.includes('data-sound '), `${f}: sin el botón duplicado "Ver con sonido"`)
}
ok((read('index.html').match(/Toca para activar el sonido/g) || []).length === 17 && (read('index.html').match(/class="tc-film"/g) || []).length === 17 && (read('index.html').match(/class="tc-smart"/g) || []).length === 17, 'Home: una indicación de sonido y una película por tarjeta (11 + 6 copias)')
for (const f of ['index.html', 'biodescodificacion.html', 'constelaciones-familiares.html', 'testimonios.html']) {
  const html = read(f)
  const first = html.match(/data-slide data-real="0" [^>]*aria-label="1 de \d+: ([^"]+)"/)?.[1]
  ok(first === 'Vany Osorio', `${f}: el carrusel empieza con Vany Osorio (${first})`)
}
ok(read('index.html').includes('Coach Ontológica') && read('index.html').includes('Shinrin Yoku'), 'Home: credenciales completas de Alba Elisa')
import { readdirSync } from 'node:fs'
for (const f of readdirSync(new URL('videos/', dist)).filter((x) => x.endsWith('.mp4'))) {
  const size = statSync(new URL(`videos/${f}`, dist)).size
  ok(size < 8 * 1024 * 1024, `videos/${f}: ${(size / 1048576).toFixed(1)} MB`)
}

// /privacy: el texto debe coincidir con la versión original (commit a51ce87)
const norm = (s) =>
  decode(s)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{' '\}/g, ' ')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
const oldTsx = execSync('git show a51ce87:src/App.tsx', { encoding: 'utf8' })
const oldBlock = oldTsx.slice(oldTsx.indexOf('function PrivacyPolicyPage'), oldTsx.indexOf('function FormacionConstelacionesPage'))
const oldText = norm(oldBlock.slice(oldBlock.indexOf('<h1'), oldBlock.lastIndexOf('</main>')))
const newHtml = read('privacy.html')
// La sección de Meta Pixel (id="meta-pixel") se añadió después; el texto original va antes de ella.
const metaIdx = newHtml.indexOf('<section id="meta-pixel"')
const newText = norm(newHtml.slice(newHtml.indexOf('<h1'), metaIdx > 0 ? metaIdx : newHtml.indexOf('</article>')))
  .replace(/^Política de Privacidad — Renacer AI Última actualización/, 'Política de Privacidad — Renacer AI Última actualización')
ok(oldText.replace(/\s/g, '') === newText.replace(/\s/g, ''), '/privacy: texto idéntico al original')
if (oldText.replace(/\s/g, '') !== newText.replace(/\s/g, '')) {
  console.log('  original:', oldText.slice(0, 300))
  console.log('  nuevo   :', newText.slice(0, 300))
}

ok(newHtml.includes('id="meta-pixel"') && newHtml.includes('Ley 1581'), '/privacy: sección de Meta Pixel presente')

// Admin y rutas técnicas
for (const a of ['whatsapp-connect', 'asistente', 'inscritos', 'anuncios']) {
  const html = read(`admin/${a}.html`)
  ok(html.includes('noindex') && html.includes('astro-island'), `/admin/${a}: noindex + componente React`)
}
ok(!existsSync(new URL('sitemap-index.xml', dist)) && !existsSync(new URL('sitemap-0.xml', dist)), 'un solo sitemap: /sitemap.xml')
const sitemap = read('sitemap.xml')
ok(sitemap.startsWith('<?xml') && sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'sitemap.xml: XML válido (urlset)')
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
ok(JSON.stringify(locs) === JSON.stringify(['https://renacer-ahora.com/', 'https://renacer-ahora.com/constelaciones-familiares', 'https://renacer-ahora.com/biodescodificacion', 'https://renacer-ahora.com/formaciones', 'https://renacer-ahora.com/testimonios', 'https://renacer-ahora.com/privacy']), `sitemap.xml: solo páginas públicas canónicas (${locs.length})`)
ok(locs.every((u) => { const f = u === 'https://renacer-ahora.com/' ? 'index.html' : u.split('/').pop() + '.html'; return read(f).includes(`<link rel="canonical" href="${u.replace(/\/$/, '')}"`) || read(f).includes(`<link rel="canonical" href="${u}"`) }), 'sitemap.xml: cada URL coincide con la canónica de su página')
ok(!sitemap.includes('404') && !sitemap.includes('admin'), 'sitemap.xml: sin 404 ni /admin')
ok(read('robots.txt').includes('Sitemap: https://renacer-ahora.com/sitemap.xml') && !read('robots.txt').includes('sitemap-index'), 'robots.txt apunta a /sitemap.xml')
ok(!sitemap.includes('/admin'), 'sitemap sin rutas /admin')
ok(['/biodescodificacion', '/constelaciones-familiares', '/formaciones', '/testimonios', '/privacy'].every((r) => sitemap.includes(`https://renacer-ahora.com${r}`)), 'sitemap con todas las páginas públicas')
ok(!sitemap.includes('sexualidad'), 'sitemap sin Sexualidad (oculta)')
ok(existsSync(new URL('robots.txt', dist)) && read('robots.txt').includes('Sitemap:'), 'robots.txt con sitemap')

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
const redirects = Object.fromEntries(vercel.redirects.map((r) => [r.source, r.destination]))
ok(redirects['/formacion/constelaciones'] === '/constelaciones-familiares' && redirects['/formacion/biodescodificacion'] === '/biodescodificacion', 'vercel.json: redirecciones de rutas antiguas')
ok(!vercel.rewrites, 'vercel.json: sin rewrites SPA')
const tmp = vercel.redirects.filter((r) => /sexualidad/.test(r.source))
ok(tmp.length === 3 && tmp.every((r) => r.destination === '/constelaciones-familiares' && r.statusCode === 307), 'vercel.json: Sexualidad → Constelaciones con redirección temporal (307)')

// Medición (docs/medicion.md): GTM solo después del consentimiento, cada botón de WhatsApp con su ubicación
ok(newHtml.includes('id="google-ads"') && newHtml.indexOf('id="google-ads"') > metaIdx, '/privacy: sección de Google Ads después del texto original')
for (const file of Object.keys(pages)) {
  const html = read(file)
  const cfgMatch = html.match(/<script type="application\/json" id="rn-tracking">([^<]+)<\/script>/)
  const cfg = cfgMatch ? JSON.parse(cfgMatch[1]) : null
  ok(cfg?.gtmId === 'GTM-MP6HRKCG', `${file}: configuración de medición con GTM-MP6HRKCG`)
  ok(!/<script[^>]+googletagmanager\.com/.test(html) && !html.includes('googletagmanager.com/ns.html'), `${file}: GTM no se carga antes del consentimiento`)
  ok(!html.includes('connect.facebook.net/en_US/fbevents.js"'), `${file}: Pixel no se carga antes del consentimiento`)
  ok((html.match(/id="rn-consent"/g) || []).length === 1 && html.includes('data-consent-open'), `${file}: un aviso de consentimiento + "Preferencias de seguimiento"`)
  const was = [...html.matchAll(/<a\b[^>]*href="https:\/\/wa\.me\/[^"]*"[^>]*>/g)].map((m) => m[0])
  ok(was.length > 0 && was.every((t) => /data-wa-loc="[a-z_]+"/.test(t)), `${file}: ${was.length} botones de WhatsApp con ubicación`)
  if (cfg) {
    ok(cfg.programs['WEB-CONST']?.id === 'constelaciones-familiares' && cfg.programs['WEB-BIO']?.id === 'biodescodificacion' && cfg.programs['WEB-GENERAL']?.id === 'general', `${file}: códigos de WhatsApp → formación`)
    ok(!JSON.stringify(cfg).includes('573123847771') && !JSON.stringify(cfg).includes('@'), `${file}: la configuración no contiene teléfono ni correo`)
  }
}
const ads = read('constelaciones-familiares.html').match(/"adsWaSendTo":"([^"]*)"/)?.[1]
ok(ads === 'AW-18556827974/7J0pCKGwsrIdEMbyypBF', `Google Ads: conversión «Clic en WhatsApp - Web» configurada (${ads || 'sin etiqueta'})`)

console.log(failures ? `\n${failures} verificación(es) fallaron` : '\nTodas las verificaciones pasaron')
process.exit(failures ? 1 : 0)
