/**
 * Google Tag Manager (contenedor creado desde Google Ads) con Modo de consentimiento.
 *
 * - El contenedor se descarga solo después de "Aceptar" (como el Pixel de Meta). Por eso se inserta
 *   con el fragmento oficial de GTM desde aquí y no en el <head>; se omite el <noscript> porque
 *   no puede respetar el consentimiento.
 * - Antes de cargarlo se declara el consentimiento: medición sí, anuncios personalizados (remarketing) no.
 * - whatsapp_click va a la capa de datos (dataLayer) para GTM y GA4. La conversión de Google Ads se
 *   envía desde aquí solo si hay etiqueta configurada (src/data/tracking.ts): no crear además una
 *   etiqueta de conversión en GTM ni una conversión automática por clics, o se contaría doble.
 */
import { clearCookies } from './consent'

type Gtag = (...args: unknown[]) => void
const w = window as unknown as { dataLayer?: unknown[]; gtag?: Gtag }

let loaded = false
let allowed = false

function gtag(..._args: unknown[]) {
  // GTM espera el objeto `arguments`, no un arreglo
  // eslint-disable-next-line prefer-rest-params
  ;(w.dataLayer = w.dataLayer || []).push(arguments)
}

const GRANTED = { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied', analytics_storage: 'granted' }
const DENIED = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' }

export function enableGoogle(gtmId: string) {
  allowed = true
  w.dataLayer = w.dataLayer || []
  if (!w.gtag) w.gtag = gtag
  if (!loaded) gtag('consent', 'default', DENIED)
  gtag('consent', 'update', GRANTED)
  if (loaded) return
  loaded = true
  // Fragmento oficial de Google Tag Manager
  w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
  document.head.appendChild(s)
}

export function disableGoogle() {
  allowed = false
  if (loaded) gtag('consent', 'update', DENIED)
  clearCookies(['_gcl_au', '_gcl_aw', '_gcl_gb', '_gcl_gs', '_gcl_dc', '_gcl_ls', '_ga'])
}

export interface WaEvent {
  page_path: string
  program: string
  program_name: string
  cta_location: string
  wa_code: string
  visit_source: string
  visit_medium: string
  visit_campaign: string
  landing_page: string
  event_date: string
  device_type: string
}

export function googleWhatsappClick(e: WaEvent, adsSendTo: string) {
  if (!allowed || !w.dataLayer) return
  w.dataLayer.push({ event: 'whatsapp_click', ...e })
  if (adsSendTo) gtag('event', 'conversion', { send_to: adsSendTo })
}
