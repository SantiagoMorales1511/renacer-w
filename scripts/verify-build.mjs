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
ok((read('index.html').match(/data-slide /g) || []).length === 11, 'Home: carrusel con los 11 testimonios')
// Orden de testimonios y bloques de prueba social
const slideNames = (html) => {
  const car = html.slice(html.indexOf('data-carousel'))
  return [...car.matchAll(/data-slide [^>]*aria-label="\d+ de \d+: ([^"]+)"/g)].map((m) => m[1])
}
const bioNames = slideNames(read('biodescodificacion.html'))
ok(bioNames.slice(0, 3).sort().join() === ['Johana Valencia', 'Marcela Rivera', 'Viviana'].sort().join() && bioNames.length === 11, `Biodescodificación: carrusel con sus 3 testimonios primero (${bioNames.slice(0, 3).join(', ')}) y luego los demás`)
const constNames = slideNames(read('constelaciones-familiares.html'))
ok(constNames.slice(0, 6).every((n) => ['Mauricio', 'Vany Osorio', 'Jaime Fernández Naranjo', 'Viviana', 'Laura', 'Alexis García'].includes(n)), 'Constelaciones: sus 6 testimonios primero')
for (const [f, title] of [['index.html', 'Conoce las experiencias de quienes han vivido Renacer'], ['sexualidad-consciente.html', 'Conoce la experiencia de estudiar en Renacer'], ['biodescodificacion.html', 'Conoce la experiencia de estudiar en Renacer'], ['constelaciones-familiares.html', 'Conoce la experiencia de estudiar en Renacer']]) {
  const html = read(f)
  const strip = html.indexOf(title), carousel = html.indexOf('data-carousel'), h1 = html.indexOf('<h1')
  ok(strip > h1 && strip < carousel, `${f}: bloque compacto de testimonios después del Hero y antes del carrusel`)
  ok(html.includes('Ver más experiencias'), `${f}: enlace "Ver más experiencias"`)
}
const sexHtml = read('sexualidad-consciente.html')
ok(sexHtml.includes('Testimonios de estudiantes de otras formaciones de Renacer') && !/data-program="Sexualidad/.test(sexHtml), 'Sexualidad: testimonios identificados como de otras formaciones, ninguno atribuido a Sexualidad')
for (const f of ['sexualidad-consciente.html', 'biodescodificacion.html', 'constelaciones-familiares.html']) {
  const html = read(f)
  const car = html.indexOf('data-carousel'), cta = html.indexOf('experiencia de formación?')
  ok(cta > car, `${f}: CTA "¿Te gustaría vivir tu propia experiencia de formación?" después del carrusel`)
}
ok(read('index.html').includes('Coach Ontológica') && read('index.html').includes('Shinrin Yoku'), 'Home: credenciales completas de Alba Elisa')
import { readdirSync } from 'node:fs'
for (const f of readdirSync(new URL('videos/', dist)).filter((x) => x.endsWith('.mp4'))) {
  const size = statSync(new URL(`videos/${f}`, dist)).size
  ok(size < 8 * 1024 * 1024, `videos/${f}: ${(size / 1048576).toFixed(1)} MB`)
}
for (const f of readdirSync(new URL('videos/previews/', dist))) {
  const size = statSync(new URL(`videos/previews/${f}`, dist)).size
  ok(size < 1024 * 1024, `videos/previews/${f}: ${(size / 1024).toFixed(0)} KB`)
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
