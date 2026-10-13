import { site } from '../data/site'

/**
 * Mensajes prellenados por formación. El código entre corchetes permite
 * identificar en WhatsApp de qué página llegó cada conversación.
 */
export const waMessages = {
  sex: 'Hola, vi la Formación en Sexualidad Consciente y Vínculos Afectivos en la página web de Renacer y quiero información para inscribirme. [WEB-SEX]',
  bio: 'Hola, vi el Máster en Biodescodificación en la web de Renacer y quiero información sobre los módulos e inscripciones. [WEB-BIO]',
  const: 'Hola, vi la Formación en Constelaciones Familiares en la web de Renacer y quiero más información. [WEB-CONST]',
  general: 'Hola, visité la página web de Renacer y quiero conocer sus formaciones. [WEB-GENERAL]',
} as const

export type WaKey = keyof typeof waMessages

export function waLink(key: WaKey = 'general'): string {
  return `https://wa.me/${site.whatsapp.international}?text=${encodeURIComponent(waMessages[key])}`
}
