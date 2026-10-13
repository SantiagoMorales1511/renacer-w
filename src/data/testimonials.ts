import type { ImageMetadata } from 'astro'
import type { Program } from './programs'

import pMauricio from '../assets/posters/testimonio-mauricio-constelaciones.jpg'
import pVany from '../assets/posters/testimonio-estudiante-constelaciones.jpg'
import pViviana from '../assets/posters/testimonio-viviana.jpg'
import pLaura from '../assets/posters/testimonio-laura.jpg'
import pClara from '../assets/posters/testimonio-clara-elisa-duque.jpg'
import pMarcela from '../assets/posters/testimonio-marcela-rivera.jpg'
import pAlexis from '../assets/posters/testimonio-alexis-garcia.jpg'
import pJaime from '../assets/posters/testimonio-jaime-fernandez.jpg'
import pLorena from '../assets/posters/testimonio-lorena.jpg'
import pErika from '../assets/posters/testimonio-erika-gonzalez.jpg'
import pJohana from '../assets/posters/testimonio-johana-valencia.jpg'

type ProgramKey = Program['key']

export interface VideoTestimonial {
  id: string
  /** Nombre tal como la persona lo dice en el video */
  name: string
  /** Formaciones que la persona menciona en el video (vacío = no lo dice) */
  programs: ProgramKey[]
  /** Video completo, solo se descarga cuando el visitante lo abre */
  src: string
  poster: ImageMetadata
  /** Duración real del video completo (m:ss) */
  duration: string
}

const programLabels: Record<ProgramKey, string> = {
  const: 'Constelaciones Familiares',
  bio: 'Biodescodificación',
  sex: 'Sexualidad Consciente',
}

export const programLabel = (t: VideoTestimonial) =>
  t.programs.length ? t.programs.map((k) => programLabels[k]).join(' · ') : 'Estudiante de Renacer'

const v = (slug: string) => ({ src: `/videos/testimonio-${slug}.mp4` })

// Atribución tomada de lo que cada persona dice en su video (subtítulos originales).
// Publicación autorizada por Renacer (12 oct 2026).
export const videoTestimonials: VideoTestimonial[] = [
  { id: 'mauricio', name: 'Mauricio', programs: ['const'], ...v('mauricio-constelaciones'), poster: pMauricio, duration: '0:25' },
  { id: 'marcela', name: 'Marcela Rivera', programs: ['bio'], ...v('marcela-rivera'), poster: pMarcela, duration: '0:34' },
  { id: 'lorena', name: 'Lorena', programs: [], ...v('lorena'), poster: pLorena, duration: '0:16' },
  { id: 'vany', name: 'Vany Osorio', programs: ['const'], ...v('estudiante-constelaciones'), poster: pVany, duration: '0:33' },
  { id: 'johana', name: 'Johana Valencia', programs: ['bio'], ...v('johana-valencia'), poster: pJohana, duration: '0:29' },
  { id: 'erika', name: 'Erika González', programs: [], ...v('erika-gonzalez'), poster: pErika, duration: '0:16' },
  { id: 'jaime', name: 'Jaime Fernández Naranjo', programs: ['const'], ...v('jaime-fernandez'), poster: pJaime, duration: '0:41' },
  { id: 'viviana', name: 'Viviana', programs: ['const', 'bio'], ...v('viviana'), poster: pViviana, duration: '0:27' },
  { id: 'laura', name: 'Laura', programs: ['const'], ...v('laura'), poster: pLaura, duration: '0:14' },
  { id: 'clara', name: 'Clara Elisa Duque', programs: [], ...v('clara-elisa-duque'), poster: pClara, duration: '0:18' },
  { id: 'alexis', name: 'Alexis García', programs: ['const'], ...v('alexis-garcia'), poster: pAlexis, duration: '0:32' },
]

/** Testimonios de una formación (solo con atribución confirmada) o todos. */
export function testimonialsFor(key?: ProgramKey): VideoTestimonial[] {
  return key ? videoTestimonials.filter((t) => t.programs.includes(key)) : videoTestimonials
}

/**
 * Orden para el carrusel de una formación: primero quienes mencionan esa
 * formación y después el resto de experiencias de Renacer (cada tarjeta
 * muestra la formación que la persona cursó).
 */
export function testimonialsFirstFor(key: ProgramKey): VideoTestimonial[] {
  const own = testimonialsFor(key)
  return [...own, ...videoTestimonials.filter((t) => !own.includes(t))]
}

const byId = (ids: string[]) => ids.map((id) => videoTestimonials.find((t) => t.id === id)!).filter(Boolean)

/** 3 miniaturas para los bloques compactos junto al Hero. */
export const featured = {
  home: byId(['marcela', 'alexis', 'johana']),
  bio: byId(['marcela', 'johana', 'viviana']),
  const: byId(['mauricio', 'alexis', 'jaime']),
  // Sexualidad aún no inicia: experiencias de otras formaciones, identificadas como tales.
  sex: byId(['mauricio', 'marcela', 'laura']),
} satisfies Record<string, VideoTestimonial[]>
