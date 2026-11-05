/**
 * Punto único de medición del sitio. Un solo aviso de consentimiento y un solo detector de clics
 * en WhatsApp: cada clic se registra una vez y se reparte a cada plataforma (un evento por plataforma).
 *
 *   clic en a[href^="https://wa.me/"]
 *     → Meta:   Contact (si Meta está aceptado)
 *     → Google: dataLayer whatsapp_click + conversión de Google Ads (si hay etiqueta)
 *
 * Nada se envía sin "Aceptar". Nunca se envía el enlace, el número ni el texto del mensaje.
 */
import type { TrackingConfig } from '../../data/tracking'
import { readConsent, writeConsent, type Consent } from './consent'
import { enableMeta, disableMeta, metaWhatsappClick } from './meta'
import { enableGoogle, disableGoogle, googleWhatsappClick } from './google'
import { visitSource } from './source'

const DEDUPE_MS = 1500

export function initTracking(cfg: TrackingConfig, box: HTMLElement | null) {
  const pagePath = location.pathname.replace(/(\/index)?\.html$/, '').replace(/\/$/, '') || '/'
  const source = visitSource(pagePath)

  function apply(v: Consent) {
    if (v === 'granted') {
      if (cfg.metaPixelId) enableMeta(cfg.metaPixelId, pagePath)
      if (cfg.gtmId) enableGoogle(cfg.gtmId)
    } else {
      disableMeta()
      disableGoogle()
    }
  }

  // ---- Clic en WhatsApp (delegado: no modifica los botones ni sus enlaces) ----
  let lastClick = 0
  function onClick(e: MouseEvent) {
    if (e.type === 'auxclick' && e.button !== 1) return // solo clic con la rueda (abrir en pestaña)
    const a = (e.target as Element | null)?.closest?.('a[href^="https://wa.me/"]') as HTMLAnchorElement | null
    if (!a) return // sin consentimiento, meta/google no envían nada (cada uno guarda su estado)
    const now = Date.now()
    if (now - lastClick < DEDUPE_MS) return // doble toque o clic repetido: un solo evento
    lastClick = now

    let code = ''
    try {
      code = new URL(a.href).searchParams.get('text')?.match(/\[([A-Z0-9-]+)\]\s*$/)?.[1] ?? ''
    } catch {
      /* enlace no analizable: se envía sin código */
    }
    // Códigos de anuncio (p. ej. SVA-F3-WEB) no están en la lista: se usa la formación de la página
    const program = cfg.programs[code] ?? cfg.programs[cfg.pages[pagePath] ?? ''] ?? cfg.programs['WEB-GENERAL'] ?? { id: 'general', name: 'General' }
    const loc = a.closest<HTMLElement>('[data-wa-loc]')?.dataset.waLoc ?? (a.closest('header') ? 'encabezado' : a.closest('footer') ? 'pie' : 'contenido')

    metaWhatsappClick(code)
    googleWhatsappClick(
      {
        page_path: pagePath,
        program: program.id,
        program_name: program.name,
        cta_location: loc,
        wa_code: code,
        visit_source: source.source,
        visit_medium: source.medium,
        visit_campaign: source.campaign,
        landing_page: source.landing,
        event_date: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date()),
        device_type: matchMedia('(max-width: 767px)').matches ? 'movil' : 'escritorio',
      },
      cfg.adsWaSendTo,
    )
  }
  document.addEventListener('click', onClick, { capture: true })
  document.addEventListener('auxclick', onClick, { capture: true })

  // ---- Aviso de consentimiento ----
  if (!box) return
  function decide(v: Consent) {
    writeConsent(v)
    box!.hidden = true
    apply(v)
  }
  box.querySelectorAll<HTMLButtonElement>('[data-consent]').forEach((b) => {
    b.addEventListener('click', () => decide(b.dataset.consent as Consent))
  })
  // Enlace del pie para cambiar la decisión
  document.querySelectorAll('[data-consent-open]').forEach((el) => {
    el.addEventListener('click', () => {
      box.hidden = false
    })
  })

  const saved = readConsent()
  const start = () => {
    if (saved === 'granted') apply('granted')
    else if (saved !== 'denied') box.hidden = false
  }
  // Después de la carga, sin competir con el Hero ni los videos
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback
  const run = () => (idle ? idle(start, { timeout: 2500 }) : setTimeout(start, 1200))
  if (document.readyState === 'complete') run()
  else window.addEventListener('load', run, { once: true })
}
