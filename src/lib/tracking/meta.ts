/**
 * Meta Pixel. Mismo comportamiento que antes de unificar la medición:
 * PageView en todas las páginas, ViewContent en /constelaciones-familiares y Contact por clic en WhatsApp.
 * Sin autoConfig (no lee formularios ni textos de botones) y sin advanced matching.
 */
import { clearCookies } from './consent'

type Fbq = ((...a: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue: unknown[]; loaded: boolean; version: string; push: unknown }
const w = window as unknown as { fbq?: Fbq; _fbq?: Fbq }

let loaded = false
let allowed = false

export const newEventId = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

export function enableMeta(id: string, pagePath: string) {
  allowed = true
  if (loaded) return
  loaded = true
  if (!w.fbq) {
    const n = function (...args: unknown[]) {
      n.callMethod ? n.callMethod(...args) : n.queue.push(args)
    } as Fbq
    w.fbq = n
    if (!w._fbq) w._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []
    const s = document.createElement('script')
    s.async = true
    s.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(s)
  }
  const fbq = w.fbq!
  fbq('set', 'autoConfig', false, id)
  fbq('init', id)
  fbq('track', 'PageView', {}, { eventID: newEventId('pv') })
  if (pagePath === '/constelaciones-familiares') {
    fbq(
      'track',
      'ViewContent',
      { content_name: 'Formación en Constelaciones Familiares y Terapia Sistémica', content_category: 'Formación', content_type: 'product' },
      { eventID: newEventId('vc') },
    )
  }
}

export function disableMeta() {
  allowed = false
  clearCookies(['_fbp', '_fbc'])
}

/** Contact: un clic en un botón de WhatsApp (no una conversación). Mismos parámetros de siempre. */
export function metaWhatsappClick(waCode: string) {
  if (!allowed || !w.fbq) return
  w.fbq('track', 'Contact', { content_name: 'Clic a WhatsApp', content_category: 'Formación', source: 'web_whatsapp', wa_code: waCode }, { eventID: newEventId('ct') })
}
