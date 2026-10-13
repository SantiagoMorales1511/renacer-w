import type { ImageMetadata } from 'astro'
import alba from '../assets/photos/alba-elisa.jpg'
import mercedes from '../assets/photos/maria-mercedes-osorio.jpg'
import carolina from '../assets/photos/carolina-gutierrez.jpg'

export interface Person {
  name: string
  role?: string
  credentials: string[]
  photo: ImageMetadata
  /** object-position para recortes verticales */
  focus?: string
}

export const people = {
  alba: {
    name: 'Alba Elisa Cerón Gómez',
    role: 'Directora y fundadora de Renacer',
    credentials: [
      'Consteladora Familiar y Empresarial',
      'Terapeuta Sistémica',
      'Coach Sistémica',
      'Coach Ontológica',
      'Especialista en Biodescodificación, Bioneuroemoción y Shinrin Yoku',
    ],
    photo: alba,
    focus: '50% 30%',
  },
  mercedes: {
    name: 'María Mercedes Osorio Silva',
    credentials: [
      'Psicóloga Clínica',
      'Terapeuta de Parejas',
      'Terapeuta Transgeneracional',
      'Terapeuta Sistémica',
      'Bioneuroemoción',
      'Astrología Psicológica',
    ],
    photo: mercedes,
    focus: '50% 25%',
  },
  carolina: {
    name: 'Carolina Gutiérrez Gutiérrez',
    credentials: ['Psicóloga', 'Máster en Sexología', 'Terapeuta de Parejas', 'Facilitadora en Sanación de Útero'],
    photo: carolina,
    focus: '50% 30%',
  },
} satisfies Record<string, Person>
