import type { ImageMetadata } from 'astro'
import type { WaKey } from '../lib/whatsapp'
import { people, type Person } from './people'
import imgSex from '../assets/photos/grupo-alegria.jpg'
import imgBio from '../assets/photos/practica-parejas.jpg'
import imgConst from '../assets/photos/hilos-sistema.jpg'

export interface Module {
  n: number
  title: string
  /** ISO yyyy-mm-dd, solo cuando la fecha está confirmada */
  date?: string
  facilitator?: string
  topics?: string[]
  note?: string
}

export interface Program {
  key: 'sex' | 'bio' | 'const'
  slug: string
  name: string
  shortName: string
  status: 'abierta' | 'en-curso'
  statusLabel: string
  summary: string
  modulesCount: number
  frequency: string
  schedule: string
  venue: string
  modality: string
  pricePerModule: number
  startLabel: string
  facilitators: Person[]
  modules: Module[]
  image: ImageMetadata
  imageAlt: string
  waKey: WaKey
}

export const formatCOP = (n: number) => `$${n.toLocaleString('es-CO')}`

const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export function formatDate(iso: string, opts: { weekday?: boolean; year?: boolean } = {}) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  const wd = weekdays[date.getUTCDay()]
  return `${opts.weekday ? `${wd} ` : ''}${d} de ${months[m - 1]}${opts.year === false ? '' : ` de ${y}`}`
}

export function shortDate(iso: string) {
  const [, m, d] = iso.split('-').map(Number)
  return { day: String(d), month: months[m - 1].slice(0, 3) }
}

export const sexualidad: Program = {
  key: 'sex',
  slug: '/sexualidad-consciente',
  name: 'Formación en Sexualidad Consciente y Vínculos Afectivos',
  shortName: 'Sexualidad Consciente',
  status: 'abierta',
  statusLabel: 'Inscripciones abiertas',
  summary:
    'Una formación educativa en sexología integrativa que articula lo biológico, lo psicológico, lo sistémico y lo vincular para comprender el deseo, el cuerpo y los vínculos con una mirada consciente y ética.',
  modulesCount: 6,
  frequency: 'Un domingo al mes',
  schedule: '9:00 a. m. – 5:00 p. m.',
  venue: 'Ciudad Jardín, Cali',
  modality: 'Presencial',
  pricePerModule: 250000,
  startLabel: 'Inicia el domingo 25 de octubre de 2026',
  facilitators: [people.mercedes, people.carolina],
  image: imgSex,
  imageAlt: 'Grupo de estudiantes de Renacer sonriendo durante un encuentro presencial',
  waKey: 'sex',
  modules: [
    {
      n: 1,
      title: 'Sexualidad consciente: sexualidad y sexología',
      date: '2026-10-25',
      facilitator: 'Carolina Gutiérrez Gutiérrez',
      topics: [
        'Introducción a la sexología educativa',
        'Salud sexual y derechos sexuales y reproductivos',
        'Mitos, tabúes y condicionamiento social y cultural',
        'Respuesta sexual humana y anatomía del deseo',
        'Deseo espontáneo y reactivo; factores de inhibición y activación',
      ],
    },
    {
      n: 2,
      title: 'El cuerpo hereda: raíces sistémicas de nuestra sexualidad',
      date: '2026-11-22',
      facilitator: 'María Mercedes Osorio Silva',
      topics: [
        'El cuerpo como territorio de pertenencia',
        'Historia familiar alrededor del cuerpo, el amor, el deseo y la pareja',
        'Vínculo, apego e intimidad',
        'Lealtades invisibles, mensajes, silencios y mandatos familiares',
        'Diferenciar lo heredado, lo aprendido y lo elegido',
      ],
    },
    {
      n: 3,
      title: 'Vínculos que nos habitan: amor, apego y deseo',
      date: '2026-12-20',
      facilitator: 'Carolina Gutiérrez Gutiérrez',
      topics: [
        'Construcción del mapa del amor',
        'Psicología del enamoramiento, el afecto y la atracción',
        'Transición hacia la intimidad madura',
        'Estilos de apego y heridas emocionales de la infancia',
        'Elección de pareja y dinámica erótica y afectiva',
      ],
    },
    {
      n: 4,
      title: 'La alquimia del femenino y del masculino',
      date: '2027-01-17',
      facilitator: 'María Mercedes Osorio Silva',
      topics: [
        'Principios femenino y masculino; polaridades internas',
        'Yin–Yang, Anima–Animus, Shiva–Shakti',
        'Arquetipos femeninos y masculinos: dones y sombras',
        'Deseo, placer, intimidad y erotismo consciente',
        'Vulnerabilidad, confianza, entrega e integración interior',
      ],
    },
    {
      n: 5,
      title: 'El arte de habitar el placer: mapa erótico, comunicación y deseo',
      date: '2027-02-14',
      facilitator: 'Carolina Gutiérrez Gutiérrez',
      topics: [
        'Derecho al placer e inteligencia erótica',
        'Exploración del mapa erótico',
        'Comunicación erótica asertiva: necesidades, límites y fantasías',
        'Consentimiento, acuerdos y discrepancia de deseo',
        'Dificultades sexuales frecuentes desde un abordaje educativo',
      ],
    },
    {
      n: 6,
      title: 'Astrología y sexualidad consciente',
      date: '2027-03-14',
      facilitator: 'María Mercedes Osorio Silva',
      topics: [
        'Astrología psicológica y simbólica con mirada sistémica',
        'La carta natal como mapa simbólico de autoexploración',
        'Amor, deseo, apego, intimidad y placer en la carta',
        'Patrones vinculares y familiares',
        'Método Psico Cosmo Linaje',
      ],
      note: 'Lectura simbólica y de autoexploración; no es una evaluación psicológica basada en evidencia.',
    },
  ],
}

export const biodescodificacion: Program = {
  key: 'bio',
  slug: '/biodescodificacion',
  name: 'Máster en Biodescodificación',
  shortName: 'Biodescodificación',
  status: 'en-curso',
  statusLabel: 'En curso desde septiembre de 2026',
  summary:
    'Doce módulos para comprender y acompañar procesos familiares y emocionales desde una mirada sistémica y profesional, con práctica guiada en cada encuentro.',
  modulesCount: 12,
  frequency: 'Un módulo al mes',
  schedule: '9:00 a. m. – 5:00 p. m.',
  venue: 'Hotel La Esperanza, Ciudad Jardín, Cali',
  modality: 'Presencial',
  pricePerModule: 300000,
  startLabel: 'Cohorte en curso desde septiembre de 2026',
  facilitators: [people.alba],
  image: imgBio,
  imageAlt: 'Estudiantes de Renacer realizando un ejercicio práctico en parejas',
  waKey: 'bio',
  modules: [
    'Fundamentos Biológicos de la Biodescodificación',
    'Epigenética',
    'Las Cinco Leyes Biológicas de Hamer',
    'Sentido Biológico de la Enfermedad',
    'Inconsciente Familiar y Memorias Transgeneracionales',
    'Raíles Emocionales o Anclas',
    'Aplicación y Práctica por Sistemas Biológicos',
    'Enfermedades y Abordaje desde la Biodescodificación I',
    'Enfermedades y Abordaje desde la Biodescodificación II',
    'Enfermedades y Abordaje desde la Biodescodificación III',
    'Práctica Avanzada y Casos',
    'Consolidación y Cierre',
  ].map((title, i) => ({ n: i + 1, title })),
}

export const constelaciones: Program = {
  key: 'const',
  slug: '/constelaciones-familiares',
  name: 'Formación en Constelaciones Familiares y Terapia Sistémica',
  shortName: 'Constelaciones Familiares',
  status: 'en-curso',
  statusLabel: 'En curso desde agosto de 2026',
  summary:
    'Una formación vivencial para aprender a mirar los vínculos, las lealtades y los patrones que se repiten en la historia familiar, con herramientas sistémicas para la vida personal y el acompañamiento.',
  modulesCount: 11,
  frequency: 'Un sábado al mes',
  schedule: '9:00 a. m. – 5:00 p. m.',
  venue: 'Cali',
  modality: 'Presencial',
  pricePerModule: 300000,
  startLabel: 'Cohorte en curso desde el 15 de agosto de 2026',
  facilitators: [people.alba],
  image: imgConst,
  imageAlt: 'Ejercicio sistémico grupal con hilos rojos que conectan a los participantes',
  waKey: 'const',
  modules: [],
}

export const programs = [sexualidad, biodescodificacion, constelaciones]
