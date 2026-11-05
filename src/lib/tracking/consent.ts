/**
 * Consentimiento único para toda la medición (Meta y Google). La misma clave que usaba el
 * aviso anterior (rn_consent), así quien ya decidió no vuelve a ver el aviso.
 */
export type Consent = 'granted' | 'denied'
const KEY = 'rn_consent'

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

export function writeConsent(v: Consent) {
  try {
    localStorage.setItem(KEY, v)
  } catch {
    /* sin almacenamiento: se pregunta en cada visita */
  }
}

/** Borra cookies propias por nombre (con y sin dominio) */
export function clearCookies(names: string[]) {
  const host = location.hostname.replace(/^www\./, '')
  for (const name of names) {
    for (const d of ['', `; domain=${host}`, `; domain=.${host}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`
    }
  }
}
