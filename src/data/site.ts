export const site = {
  name: 'Centro de Formación Renacer',
  shortName: 'Renacer',
  url: 'https://renacer-ahora.com',
  city: 'Cali, Colombia',
  description:
    'Centro de formación y desarrollo humano en Cali, Colombia. Formaciones presenciales en Constelaciones Familiares, Terapia Sistémica y Biodescodificación.',
  whatsapp: {
    display: '+57 312 384 7771',
    international: '573123847771',
  },
  instagram: {
    handle: '@renacer.ahora',
    url: 'https://www.instagram.com/renacer.ahora/',
  },
  email: 'contactorenacer.co@gmail.com',
  /** Código de verificación de Google Search Console (etiqueta HTML). Vacío hasta tenerlo. */
  googleVerification: '',
} as const

export const nav = [
  { href: '/formaciones', label: 'Formaciones' },
  { href: '/constelaciones-familiares', label: 'Constelaciones' },
  { href: '/biodescodificacion', label: 'Biodescodificación' },
  { href: '/testimonios', label: 'Testimonios' },
] as const
