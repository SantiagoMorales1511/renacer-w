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
  'sexualidad-consciente.html': 'WEB-SEX',
  'biodescodificacion.html': 'WEB-BIO',
  'constelaciones-familiares.html': 'WEB-CONST',
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')

for (const [file, tag] of Object.entries(pages)) {
  ok(existsSync(new URL(file, dist)), `${file} existe`)
  const html = read(file)
  ok(/<title>[^<]{10,}<\/title>/.test(html), `${file}: <title>`)
  ok(/<meta name="description" content="[^"]{50,}"/.test(html), `${file}: meta description`)
  ok(/<link rel="canonical" href="https:\/\/renacer-ahora\.com[^"]*"/.test(html), `${file}: canonical`)
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

// Sexualidad: precio y fecha en el HTML inicial
const sex = read('sexualidad-consciente.html')
ok(sex.includes('$250.000') && /25 de octubre de 2026/.test(sex), 'Sexualidad: precio y fecha de inicio visibles')
ok(['Carolina Gutiérrez Gutiérrez', 'María Mercedes Osorio Silva', 'Máster en Sexología', 'Astrología Psicológica'].every((s) => sex.includes(s)), 'Sexualidad: facilitadoras y credenciales')

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
for (const [f, nextId] of [['sexualidad-consciente.html', 'id="que-es"'], ['biodescodificacion.html', 'id="intro"'], ['constelaciones-familiares.html', 'id="intro"']]) {
  const html = read(f)
  const strip = html.indexOf('Conoce la experiencia de estudiar en Renacer'), h1 = html.indexOf('<h1'), next = html.indexOf(nextId)
  ok(strip > h1 && strip < next, `${f}: mini testimonios después del Hero y antes del contenido`)
  const car = html.search(/<section[^>]*data-carousel/)
  ok(car > strip && car < html.indexOf('experiencia de formación?'), `${f}: carrusel completo abajo, antes del CTA final`)
  ok(!/class="(tc|ts)-time"/.test(html), `${f}: sin duración de los videos`)
  ok((html.match(/id="tc-dialog"/g) || []).length === 1 && (html.match(/class="ts-thumb/g) || []).length === 3, `${f}: 3 miniaturas y un único reproductor`)
  ok(html.indexOf('experiencia de formación?') > strip, `${f}: CTA final de WhatsApp conservado`)
}
const own = (f) => [...read(f).matchAll(/class="ts-thumb[^>]*data-program="([^"]+)"/g)].map((m) => m[1])
const bioSlides = [...read('biodescodificacion.html').matchAll(/data-slide [^>]*aria-label="\d+ de \d+: ([^"]+)"/g)].map((m) => m[1])
ok(['Marcela Rivera', 'Johana Valencia', 'Viviana'].every((n) => bioSlides.slice(1, 4).includes(n)), `Biodescodificación: el carrusel empieza con sus testimonios (${bioSlides.slice(1, 4).join(', ')})`)
ok(own('biodescodificacion.html').every((p) => p.includes('Biodescodificación')), 'Biodescodificación: miniaturas de estudiantes de Biodescodificación')
ok(own('constelaciones-familiares.html').every((p) => p.includes('Constelaciones')), 'Constelaciones: miniaturas de estudiantes de Constelaciones')
const sexHtml = read('sexualidad-consciente.html')
ok(sexHtml.includes('Testimonios de estudiantes de otras formaciones de Renacer') && own('sexualidad-consciente.html').every((p) => !p.includes('Sexualidad')), 'Sexualidad: experiencias de otras formaciones, identificadas')
for (const f of ['index.html', 'biodescodificacion.html', 'testimonios.html']) {
  const html = read(f)
  ok(!/>\s*Ver con sonido\s*</.test(html) && !html.includes('data-sound '), `${f}: sin el botón duplicado "Ver con sonido"`)
}
ok((read('index.html').match(/Toca para activar el sonido/g) || []).length === 17 && (read('index.html').match(/class="tc-film"/g) || []).length === 17 && (read('index.html').match(/class="tc-smart"/g) || []).length === 17, 'Home: una indicación de sonido y una película por tarjeta (11 + 6 copias)')
for (const f of ['index.html', 'sexualidad-consciente.html', 'biodescodificacion.html', 'constelaciones-familiares.html', 'testimonios.html']) {
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
const newText = norm(newHtml.slice(newHtml.indexOf('<h1'), newHtml.indexOf('</article>')))
  .replace(/^Política de Privacidad — Renacer AI Última actualización/, 'Política de Privacidad — Renacer AI Última actualización')
ok(oldText.replace(/\s/g, '') === newText.replace(/\s/g, ''), '/privacy: texto idéntico al original')
if (oldText.replace(/\s/g, '') !== newText.replace(/\s/g, '')) {
  console.log('  original:', oldText.slice(0, 300))
  console.log('  nuevo   :', newText.slice(0, 300))
}

// Admin y rutas técnicas
for (const a of ['whatsapp-connect', 'asistente', 'inscritos', 'anuncios']) {
  const html = read(`admin/${a}.html`)
  ok(html.includes('noindex') && html.includes('astro-island'), `/admin/${a}: noindex + componente React`)
}
const sitemap = read('sitemap-0.xml')
ok(!sitemap.includes('/admin'), 'sitemap sin rutas /admin')
ok(['/sexualidad-consciente', '/biodescodificacion', '/constelaciones-familiares', '/formaciones', '/testimonios', '/privacy'].every((r) => sitemap.includes(`https://renacer-ahora.com${r}`)), 'sitemap con todas las páginas públicas')
ok(existsSync(new URL('robots.txt', dist)) && read('robots.txt').includes('Sitemap:'), 'robots.txt con sitemap')

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
const redirects = Object.fromEntries(vercel.redirects.map((r) => [r.source, r.destination]))
ok(redirects['/formacion/constelaciones'] === '/constelaciones-familiares' && redirects['/formacion/biodescodificacion'] === '/biodescodificacion', 'vercel.json: redirecciones de rutas antiguas')
ok(!vercel.rewrites, 'vercel.json: sin rewrites SPA')

console.log(failures ? `\n${failures} verificación(es) fallaron` : '\nTodas las verificaciones pasaron')
process.exit(failures ? 1 : 0)
