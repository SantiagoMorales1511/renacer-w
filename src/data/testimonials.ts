import type { ImageMetadata } from 'astro'
import posterMauricio from '../assets/posters/testimonio-mauricio-constelaciones.jpg'
import posterVany from '../assets/posters/testimonio-estudiante-constelaciones.jpg'

export interface VideoTestimonial {
  id: string
  name: string
  program: string
  /** Frase breve tomada de los subtítulos del propio video */
  quote: string
  src: string
  poster: ImageMetadata
  duration: string
}

// Solo testimonios reales. El programa se toma de lo que dice cada video.
export const videoTestimonials: VideoTestimonial[] = [
  {
    id: 'mauricio',
    name: 'Mauricio',
    program: 'Formación en Constelaciones Familiares y Terapia Sistémica',
    quote: 'Ha sido un proceso, como su nombre lo dice, de renacimiento, de encontrarme conmigo mismo.',
    src: '/videos/testimonio-mauricio-constelaciones.mp4',
    poster: posterMauricio,
    duration: '0:26',
  },
  {
    id: 'vany',
    name: 'Vany Osorio',
    program: 'Formación en Constelaciones Familiares',
    quote: '…porque fue un trabajo personal y que impactó mucho en mí.',
    src: '/videos/testimonio-estudiante-constelaciones.mp4',
    poster: posterVany,
    duration: '0:34',
  },
]
