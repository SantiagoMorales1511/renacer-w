export const site = {
  name: 'Centro de Formación Renacer',
  shortName: 'Renacer',
  url: 'https://renacer-ahora.com',
  city: 'Cali, Colombia',
  description:
    'Centro de formación y desarrollo humano en Cali, Colombia. Formaciones presenciales en Constelaciones Familiares, Biodescodificación y Sexualidad Consciente.',
  whatsapp: {
    display: '+57 312 384 7771',
    international: '573123847771',
  },
  instagram: {
    handle: '@renacer.ahora',
    url: 'https://www.instagram.com/renacer.ahora/',
  },
  email: 'contactorenacer.co@gmail.com',
} as const

export const nav = [
  { href: '/formaciones', label: 'Formaciones' },
  { href: '/sexualidad-consciente', label: 'Sexualidad Consciente' },
  { href: '/biodescodificacion', label: 'Biodescodificación' },
  { href: '/constelaciones-familiares', label: 'Constelaciones' },
  { href: '/testimonios', label: 'Testimonios' },
] as const
