/**
 * Origen de la visita (Google Ads, Meta, búsqueda orgánica, directo…), tomado de la página de entrada.
 * Se guarda durante la sesión una etiqueta general (p. ej. google / cpc / nombre-de-campaña),
 * nunca el identificador del clic (gclid, fbclid) ni datos personales.
 */
export interface VisitSource {
  source: string
  medium: string
  campaign: string
  landing: string
}

const KEY = 'rn_src'
const clean = (v: string | null | undefined) =>
  (v ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, '_')
    .slice(0, 60)

const internalReferrer = () => {
  try {
    return !!document.referrer && new URL(document.referrer).hostname.replace(/^www\./, '') === location.hostname.replace(/^www\./, '')
  } catch {
    return false
  }
}

function fromLanding(pagePath: string): VisitSource | null {
  const q = new URLSearchParams(location.search)
  const utm = { source: clean(q.get('utm_source')), medium: clean(q.get('utm_medium')), campaign: clean(q.get('utm_campaign')) }
  const googleAd = q.has('gclid') || q.has('gbraid') || q.has('wbraid')
  if (googleAd) return { source: utm.source || 'google', medium: utm.medium || 'cpc', campaign: utm.campaign, landing: pagePath }
  if (utm.source) return { ...utm, medium: utm.medium || '(not set)', landing: pagePath }
  if (q.has('fbclid')) return { source: 'facebook', medium: 'social', campaign: '', landing: pagePath }

  let host = ''
  try {
    host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''
  } catch {
    host = ''
  }
  if (host === location.hostname.replace(/^www\./, '')) return null // navegación interna: se conserva el origen guardado
  if (!host) return { source: '(direct)', medium: '(none)', campaign: '', landing: pagePath }
  const engine = host.match(/(^|\.)(google|bing|yahoo|duckduckgo|ecosia)\./)?.[2]
  if (engine) return { source: engine, medium: 'organic', campaign: '', landing: pagePath }
  const social = ['instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'whatsapp'].find((s) => host === `${s}.com` || host.endsWith(`.${s}.com`))
  if (social) return { source: social, medium: 'social', campaign: '', landing: pagePath }
  return { source: clean(host), medium: 'referral', campaign: '', landing: pagePath }
}

/** Calcula el origen al cargar cada página: una entrada nueva (anuncio, buscador) reemplaza la anterior */
export function visitSource(pagePath: string): VisitSource {
  const fresh = fromLanding(pagePath)
  let saved: VisitSource | null = null
  try {
    saved = JSON.parse(sessionStorage.getItem(KEY) || 'null')
  } catch {
    saved = null
  }
  // Navegación interna (aunque la dirección lleve el gclid de la entrada) o recarga sin origen: se mantiene el de la entrada
  const keepSaved = saved !== null && (fresh === null || fresh.source === '(direct)' || internalReferrer())
  if (keepSaved) return saved!
  const current = fresh ?? { source: '(direct)', medium: '(none)', campaign: '', landing: pagePath }
  try {
    sessionStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    /* sin almacenamiento: vale solo para esta página */
  }
  return current
}
