/**
 * Configuración de medición (Meta Pixel, Google Tag Manager, Google Ads).
 * Son identificadores públicos: aparecen en el HTML de cualquier sitio que los usa. No son claves.
 * Documentación: docs/medicion.md
 *
 * Cada valor puede sobrescribirse con una variable de entorno PUBLIC_* en Vercel.
 * Un valor con formato inválido se ignora (esa herramienta queda apagada).
 */
import { programs as visiblePrograms } from './programs'
import { waMessages, type WaKey } from '../lib/whatsapp'

const env = import.meta.env
function pick(value: string | undefined, fallback: string, format: RegExp): string {
  const v = (value ?? fallback).trim()
  return format.test(v) ? v : ''
}

const metaPixelId = pick(env.PUBLIC_META_PIXEL_ID, '', /^\d{10,20}$/)

/** Contenedor de Google Tag Manager creado desde Google Ads (contiene la etiqueta de Google AW-18556827974). */
const gtmId = pick(env.PUBLIC_GTM_ID, 'GTM-MP6HRKCG', /^GTM-[A-Z0-9]{4,12}$/)

/** Cuenta de Google Ads (destino de la etiqueta de Google que está dentro del contenedor). */
const googleAdsId = pick(env.PUBLIC_GOOGLE_ADS_ID, 'AW-18556827974', /^AW-\d{6,14}$/)

/**
 * Etiqueta de la acción de conversión "Clic en WhatsApp" (Google Ads → Objetivos → Conversiones).
 * Es la parte después de la barra en send_to: 'AW-18556827974/<etiqueta>'.
 * Vacía = no se envían conversiones a Google Ads (el evento whatsapp_click sí llega a la capa de datos).
 */
const GOOGLE_ADS_WA_LABEL = '' // ← pegar aquí la etiqueta cuando exista la acción en Google Ads
const googleAdsWaLabel = pick(env.PUBLIC_GOOGLE_ADS_WA_LABEL, GOOGLE_ADS_WA_LABEL, /^[A-Za-z0-9_-]{6,40}$/)

/**
 * Código del mensaje de WhatsApp ([WEB-CONST]) → formación. Se arma solo con las formaciones publicadas
 * (`programs` en programs.ts): una formación nueva u oculta entra o sale de aquí sin tocar este archivo.
 */
const codeOf = (key: WaKey) => waMessages[key].match(/\[([A-Z0-9-]+)\]\s*$/)?.[1] ?? ''
const programs: Record<string, { id: string; name: string }> = {}
const pages: Record<string, string> = {}
for (const p of visiblePrograms) {
  const id = p.slug.replace(/^\//, '')
  programs[codeOf(p.waKey)] = { id, name: p.name }
  pages[p.slug] = codeOf(p.waKey)
}
programs[codeOf('general')] = { id: 'general', name: 'General' }

export interface TrackingConfig {
  metaPixelId: string
  gtmId: string
  /** 'AW-xxxx/etiqueta' o '' */
  adsWaSendTo: string
  /** código de WhatsApp → formación */
  programs: typeof programs
  /** ruta de la página de una formación → su código (para enlaces con códigos de anuncio) */
  pages: typeof pages
}

export const tracking: TrackingConfig = {
  metaPixelId,
  gtmId,
  adsWaSendTo: googleAdsId && googleAdsWaLabel ? `${googleAdsId}/${googleAdsWaLabel}` : '',
  programs,
  pages,
}

/** Hay alguna herramienta de medición: se muestra el aviso de cookies y el botón "Preferencias de seguimiento" */
export const trackingOn = Boolean(tracking.metaPixelId || tracking.gtmId)
