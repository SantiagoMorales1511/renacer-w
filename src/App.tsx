import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { FaWhatsapp, FaInstagram } from 'react-icons/fa'
import { BrevoService } from './services/brevoService'

function Header() {
  return (
    <header className="border-b border-primary/20 bg-gradient-to-r from-primary/5 via-white to-accent/5 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <img
            src="/recursos/logos/logo%20png%202.png"
            alt="Logo Renacer"
            className="h-6 sm:h-8 w-auto object-contain"
            width={120}
            height={32}
            fetchPriority="high"
            decoding="async"
          />
          <span className="font-semibold text-sm sm:text-lg">Centro de Formación Renacer</span>
        </Link>
        <nav className="flex gap-2 sm:gap-4 text-xs sm:text-sm items-center">
          <Link to="/" className="hover:opacity-80">Inicio</Link>
          <a 
            href="https://www.instagram.com/renacer.ahora/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium transition-all duration-300 hover:opacity-90 hover:translate-y-[-1px] hover:shadow-[var(--shadow-large)]"
          >
            <FaInstagram className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Instagram</span>
          </a>
        </nav>
      </div>
    </header>
  )
}

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-4 border border-accent/20">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <span className="text-sm text-text-muted">⏰ Tiempo restante:</span>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1">
            <span className="text-xl sm:text-2xl font-bold text-primary">
              {timeLeft.days}
            </span>
            <span className="text-text-muted text-sm sm:text-lg">días</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl sm:text-2xl font-bold text-accent">
              {timeLeft.hours}
            </span>
            <span className="text-text-muted text-sm sm:text-lg">horas</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl sm:text-2xl font-bold text-primary">
              {timeLeft.minutes}
            </span>
            <span className="text-text-muted text-sm sm:text-lg">min</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl sm:text-2xl font-bold text-accent">
              {timeLeft.seconds}
            </span>
            <span className="text-text-muted text-sm sm:text-lg">seg</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function VideoTestimonio({
  videoFile,
  isActive,
  onActivate,
}: { videoFile: string; isActive: boolean; onActivate: () => void }) {
  const [error, setError] = useState(false)
  const [inView, setInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const src = `/recursos/testimonios/${encodeURIComponent(videoFile)}`
  const onActivateRef = useRef(onActivate)
  onActivateRef.current = onActivate

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setInView(true)
          onActivateRef.current()
        }
      },
      { threshold: 0.4, rootMargin: '0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isActive) v.play().catch(() => {})
    else v.pause()
  }, [isActive])

  if (error) {
    return (
      <div className="card-elevated shadow-xl rounded-2xl overflow-hidden bg-black flex items-center justify-center min-h-[200px] p-6 text-center">
        <p className="text-white/90 text-sm">
          Video no disponible. Los .mp4 del repo usan Git LFS: instala Git LFS y ejecuta <code className="bg-white/10 px-1 rounded">git lfs pull</code> en la raíz del proyecto.
        </p>
      </div>
    )
  }
  return (
    <div ref={containerRef} className="card-elevated shadow-xl rounded-2xl overflow-hidden bg-black flex justify-center">
      <div className="w-full max-w-[280px] aspect-[9/16] flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          preload="none"
          playsInline
          onError={() => setError(true)}
        >
          {inView && <source src={src} type="video/mp4" />}
          Tu navegador no soporta el elemento de video.
        </video>
      </div>
    </div>
  )
}

const TESTIMONIOS_VIDEOS = ['Captions_ABB03A.mp4', 'Captions_2FC1FC.mp4']

function TestimoniosSection() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  return (
    <section className="mt-16">
      <div className="text-center mb-8 sm:mb-12 animate-fade-in-up-delay">
        <h2 className="text-2xl sm:text-3xl font-semibold text-text mb-4">Testimonios de nuestros estudiantes graduados</h2>
        <p className="text-base sm:text-lg text-text-muted">Escucha las experiencias reales de transformación</p>
      </div>
      <div className="flex flex-col gap-8 max-w-2xl mx-auto">
        {TESTIMONIOS_VIDEOS.map((videoFile) => (
          <VideoTestimonio
            key={videoFile}
            videoFile={videoFile}
            isActive={activeVideo === videoFile}
            onActivate={() => setActiveVideo(videoFile)}
          />
        ))}
      </div>
    </section>
  )
}

function LeadCaptureModal({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (name: string, email: string) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      // Agregar contacto a Brevo
      await BrevoService.addContactToRenacerList(name, email)
      
      setSubmitStatus('success')
      
      // Mostrar mensaje de agradecimiento por 3 segundos antes de cerrar
      setTimeout(() => {
        onSubmit(name, email) // Llamar onSubmit solo cuando se cierre
        setName('')
        setEmail('')
        setSubmitStatus('idle')
        onClose()
      }, 3000)
      
    } catch (error: any) {
      console.error('Error agregando contacto a Brevo:', error)
      setSubmitStatus('error')
      
      // Mensajes de error más específicos
      let userMessage = 'Error al guardar tu información. Por favor intenta de nuevo.'
      
      if (error.message.includes('duplicate')) {
        userMessage = 'Este email ya está registrado. Te mantendremos informado sobre nuestros eventos.'
      } else if (error.message.includes('invalid email')) {
        userMessage = 'Por favor ingresa un email válido.'
      } else if (error.message.includes('API key')) {
        userMessage = 'Error de configuración. Por favor contacta al administrador.'
      } else if (error.message.includes('Brevo')) {
        userMessage = 'Error del servicio de email. Por favor intenta de nuevo en unos minutos.'
      }
      
      setErrorMessage(userMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-8 animate-fade-in-up mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
            {submitStatus === 'success' ? (
              <span className="text-white text-xl sm:text-2xl">✅</span>
            ) : submitStatus === 'error' ? (
              <span className="text-white text-xl sm:text-2xl">❌</span>
            ) : (
              <span className="text-white text-xl sm:text-2xl">📧</span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-text mb-2">
            {submitStatus === 'success' ? '¡Gracias por tu interés!' : 
             submitStatus === 'error' ? 'Oops, algo salió mal' : 
             '¡No te pierdas nada!'}
          </h3>
          <p className="text-text-muted">
            {submitStatus === 'success' ? `¡Hola ${name}! Tu información se guardó correctamente. Te mantendremos informado sobre nuestros próximos eventos, formaciones y contenido exclusivo. ¡Bienvenido a la comunidad Renacer!` :
             submitStatus === 'error' ? errorMessage :
             'Recibe información sobre nuestros próximos eventos, formaciones y contenido exclusivo.'}
          </p>
        </div>

        {submitStatus !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-flat w-full"
                placeholder="Tu nombre completo"
                required
                disabled={isSubmitting}
              />
            </div>
            
      <div>
              <label className="block text-sm font-medium text-text mb-2">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-flat w-full"
                placeholder="tu@email.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !email.trim()}
                className="w-full px-4 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Guardando...' : '¡Sí, quiero recibir info!'}
              </button>
            </div>
          </form>
        )}

        {submitStatus === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-3xl">🎉</span>
            </div>
            <p className="text-green-600 font-medium text-lg">¡Excelente! Ya formas parte de nuestra comunidad.</p>
            <p className="text-sm text-text-muted mt-2">Este popup se cerrará automáticamente en unos segundos...</p>
          </div>
        )}

        <p className="text-xs text-text-muted text-center mt-4">
          Respetamos tu privacidad. No compartimos tu información con terceros.
        </p>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-white/80 text-text-muted backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Renacer · Santiago de Cali, Colombia</div>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.instagram.com/renacer.ahora/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium transition-all duration-300 hover:opacity-90 hover:translate-y-[-1px] hover:shadow-[var(--shadow-large)]"
            >
              <FaInstagram className="w-5 h-5 shrink-0" />
              <span>Instagram</span>
            </a>
            <a 
              href="https://wa.me/message/IHT5EC6ZSBPIL1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-emerald-400 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all duration-300 hover:translate-y-[-1px] hover:shadow-[var(--shadow-large)]"
            >
              <FaWhatsapp className="w-5 h-5 shrink-0" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FormacionConstelacionesPage({ onOpenLeadModal }: { onOpenLeadModal?: () => void }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
              {/* Hero */}
              <section className="card-elevated p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 sm:gap-12 animate-fade-in-up shadow-xl rounded-2xl">
        <img
          src="/recursos/logos/logo%20png%202.png"
          alt="Logo Renacer"
          className="h-16 sm:h-20 w-auto object-contain"
          width={160}
          height={80}
          decoding="async"
        />
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-text mb-4 sm:mb-6">Formación en Constelaciones Familiares y Terapia Sistémica</h1>
          <p className="text-lg sm:text-xl text-text-muted leading-relaxed mb-6 sm:mb-8">Descubre nuestra formación en Constelaciones Familiares y Terapia Sistémica en el Centro de Formación Renacer. Ofrecemos un enfoque único para tu crecimiento personal y profesional.</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <a 
              href="https://wa.me/message/IHT5EC6ZSBPIL1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <button>Quiero más información</button>
            </a>
            <a 
              href="https://wa.me/message/IHT5EC6ZSBPIL1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg"
            >
              <FaWhatsapp className="w-5 h-5 shrink-0" />
              WhatsApp
            </a>
            <a 
              href="https://www.instagram.com/renacer.ahora/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg"
            >
              <FaInstagram className="w-5 h-5 shrink-0" />
              Instagram
            </a>
            <a href="#proximo-inicio" className="text-base text-primary hover:text-primary-light transition-colors font-medium">Ver próxima cohorte →</a>
          </div>
        </div>
      </section>

              {/* Próximo inicio - Banner destacado */}
              <section id="proximo-inicio" className="mt-16 card-elevated p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 shadow-lg rounded-2xl">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                  <div className="flex-1">
                    <p className="text-sm text-primary font-medium">Próxima cohorte</p>
                    <h2 className="text-xl font-semibold mt-1 text-text">7 de febrero de 2026</h2>
                    <ul className="mt-2 text-sm text-text-muted flex flex-wrap gap-x-4 gap-y-1">
                      <li className="flex items-center gap-1">📍 Ciudad Jardín – Cali</li>
                      <li className="flex items-center gap-1">🕘 9:00 am a 5:00 pm</li>
                    </ul>
                  </div>
                  <a 
                    href="https://wa.me/message/IHT5EC6ZSBPIL1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <button>Reserva tu cupo</button>
                  </a>
                </div>
              </section>

              {/* Por qué elegirnos */}
      <section className="mt-16 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div className="group overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-medium)]">
          <img src="/recursos/fotos/formacion.jpg" alt="Círculo de formación" className="w-full h-60 sm:h-80 object-cover transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" decoding="async" />
        </div>
        <div className="card-elevated p-6 sm:p-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-primary to-primary-light rounded-xl flex items-center justify-center">
              <span className="text-white text-xl sm:text-2xl">💫</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text">¿Por qué elegirnos?</h2>
          </div>
          <p className="text-lg sm:text-xl text-text-muted leading-relaxed">Porque no solo te formamos, te transformamos. En el Centro de Formación Renacer, creemos que sanar es recordar quién eres en tu esencia, liberar las cargas que no te pertenecen y reconectar con la vida desde un lugar más auténtico y amoroso.</p>
        </div>
      </section>

      {/* Formación vivencial */}
      <section className="mt-16 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div className="order-2 md:order-1 card-elevated p-6 sm:p-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-accent to-accent-light rounded-xl flex items-center justify-center">
              <span className="text-white text-xl sm:text-2xl">🌱</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text">Una formación completa y vivencial</h2>
          </div>
          <p className="text-lg sm:text-xl text-text-muted leading-relaxed">Durante 11 módulos, adquirirás herramientas prácticas para reconocer y liberar patrones heredados, comprender el movimiento de los sistemas familiares y acompañar a otros en su propio proceso de sanación.</p>
        </div>
        <div className="order-1 md:order-2 group overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-medium)]">
          <img src="/recursos/fotos/20250208_143018.jpg" alt="Proceso práctico" className="w-full h-60 sm:h-80 object-cover transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" decoding="async" />
        </div>
      </section>

      {/* Enfoque práctico */}
      <section className="mt-16 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div className="group overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-medium)]">
          <img src="/recursos/fotos/IMG_3985.jpg" alt="Sesión práctica" className="w-full h-60 sm:h-80 object-cover transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" decoding="async" />
        </div>
        <div className="card-elevated p-6 sm:p-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-primary to-primary-light rounded-xl flex items-center justify-center">
              <span className="text-white text-xl sm:text-2xl">🎯</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text">Enfoque práctico</h2>
          </div>
          <p className="text-lg sm:text-xl text-text-muted leading-relaxed">Nuestras formaciones son presenciales y prácticas, lo que te permite aplicar directamente lo aprendido y experimentar una transformación real en tu vida.</p>
        </div>
      </section>

      {/* Guía experta */}
      <section className="mt-16 card-elevated p-6 sm:p-10">
        <div className="flex flex-col md:flex-row gap-8 sm:gap-12 items-center">
          <div className="overflow-hidden rounded-xl border border-border w-full md:w-80 shadow-[var(--shadow-medium)]">
            <img src="/recursos/fotos/20250621_141628.jpg" alt="Alba Elisa Cerón" className="w-full h-60 sm:h-80 object-cover" loading="lazy" decoding="async" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-accent to-accent-light rounded-xl flex items-center justify-center">
                <span className="text-white text-xl sm:text-2xl">👩‍🏫</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-text">Guía experta</h2>
            </div>
            <p className="text-lg sm:text-xl text-text-muted leading-relaxed mb-6 sm:mb-8">Aprenderás de Alba Elisa Cerón, una consteladora y terapeuta experimentada, quien te guiará con su conocimiento y experiencia en cada paso del camino.</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
              <li className="card-flat p-3 sm:p-4 flex items-center gap-2 sm:gap-3">✨ Consteladora familiar</li>
              <li className="card-flat p-3 sm:p-4 flex items-center gap-2 sm:gap-3">🧠 Terapeuta y coach sistémica</li>
              <li className="card-flat p-3 sm:p-4 flex items-center gap-2 sm:gap-3">🔬 Biodescodificación</li>
              <li className="card-flat p-3 sm:p-4 flex items-center gap-2 sm:gap-3">💭 Bioneuroemoción</li>
              <li className="card-flat p-3 sm:p-4 flex items-center gap-2 sm:gap-3">🌲 Baño de bosque (Shinrin-Yoku)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Ambiente */}
      <section className="mt-16 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div className="order-2 md:order-1 card-elevated p-6 sm:p-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-primary to-primary-light rounded-xl flex items-center justify-center">
              <span className="text-white text-xl sm:text-2xl">🏠</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text">Ambiente acogedor</h2>
          </div>
          <p className="text-lg sm:text-xl text-text-muted leading-relaxed">A diferencia de otros centros, ofrecemos un ambiente cálido y armónico que facilita el aprendizaje y la transformación personal, haciendo que te sientas como en casa.</p>
        </div>
        <div className="order-1 md:order-2 group overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-medium)]">
          <img src="/recursos/fotos/IMG_3992.jpg" alt="Ambiente acogedor" className="w-full h-60 sm:h-80 object-cover transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" decoding="async" />
        </div>
      </section>

      {/* Próximo inicio */}
      <section id="proximo-inicio" className="mt-8 card-flat p-6">
        <h2 className="text-lg font-semibold">Próximo inicio</h2>
        <ul className="mt-2 text-sm text-text-muted grid sm:grid-cols-2 gap-x-6 gap-y-1">
          <li>📆 Fecha de inicio: 7 de febrero de 2026</li>
          <li>📍 Presencial – Ciudad Jardín – Cali</li>
          <li>🕘 9:00 am a 5:00 pm</li>
        </ul>
        <div className="mt-4">
          <a 
            href="https://wa.me/message/IHT5EC6ZSBPIL1" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <button className="hover:translate-y-[-1px] active:translate-y-[0]">Inscríbete</button>
        </a>
      </div>
      </section>

      {/* Sobre la formación */}
      <section className="mt-16 card-elevated p-6 sm:p-10">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-accent to-accent-light rounded-xl flex items-center justify-center">
            <span className="text-white text-xl sm:text-2xl">📋</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-text">Sobre la Formación</h2>
        </div>
        <dl className="grid sm:grid-cols-2 gap-4 sm:gap-6 text-sm sm:text-base">
          <div className="card-flat p-4 sm:p-6 hover:shadow-[var(--shadow-medium)] transition-all duration-200">
            <dt className="font-semibold text-primary mb-2 text-base sm:text-lg">Duración</dt>
            <dd className="text-text-muted">11 Módulos (1 módulo al mes)</dd>
          </div>
          <div className="card-flat p-4 sm:p-6 hover:shadow-[var(--shadow-medium)] transition-all duration-200">
            <dt className="font-semibold text-primary mb-2 text-base sm:text-lg">Modalidad</dt>
            <dd className="text-text-muted">Presencial en Cali</dd>
          </div>
          <div className="card-flat p-4 sm:p-6 hover:shadow-[var(--shadow-medium)] transition-all duration-200">
            <dt className="font-semibold text-primary mb-2 text-base sm:text-lg">Lugar</dt>
            <dd className="text-text-muted">Barrio Ciudad Jardín</dd>
          </div>
          <div className="card-flat p-4 sm:p-6 hover:shadow-[var(--shadow-medium)] transition-all duration-200">
            <dt className="font-semibold text-primary mb-2 text-base sm:text-lg">Valor por módulo</dt>
            <dd className="text-text-muted font-semibold text-accent text-lg sm:text-xl">$250.000</dd>
          </div>
          <div className="card-flat p-4 sm:p-6 hover:shadow-[var(--shadow-medium)] transition-all duration-200">
            <dt className="font-semibold text-primary mb-2 text-base sm:text-lg">Horario</dt>
            <dd className="text-text-muted">9:00 am a 5:00 pm</dd>
          </div>
        </dl>
      </section>

      {/* Suscripción a novedades */}
      {onOpenLeadModal && (
        <section className="mt-16 card-elevated p-10 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 shadow-xl rounded-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-xl sm:text-2xl">📧</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text mb-4">¿Te interesa esta formación?</h2>
            <p className="text-base sm:text-lg text-text-muted mb-6 sm:mb-8 max-w-2xl mx-auto">
              Mantente informado sobre fechas de inicio, descuentos especiales y contenido exclusivo de nuestras formaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={onOpenLeadModal}
                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-semibold text-base sm:text-lg hover:shadow-lg hover:translate-y-[-2px] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20"
              >
                📧 Recibir correos con novedades
              </button>
              <a 
                href="https://wa.me/message/IHT5EC6ZSBPIL1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 sm:px-8 sm:py-4 bg-emerald-400 hover:bg-emerald-500 text-white rounded-xl font-semibold text-base sm:text-lg hover:shadow-lg hover:translate-y-[-2px] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 flex items-center gap-2"
              >
                <FaWhatsapp className="w-5 h-5 shrink-0" />
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

function LandingPage({ onOpenLeadModal }: { onOpenLeadModal: () => void }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
              {/* Hero superior */}
              <section className="card-elevated p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 sm:gap-12 shadow-xl rounded-2xl">
        <img
          src="/recursos/logos/logo%20png%202.png"
          alt="Logo Renacer"
          className="h-16 sm:h-20 w-auto object-contain"
          width={160}
          height={80}
          decoding="async"
        />
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-text mb-4">Centro de Formación Renacer</h1>
          <p className="text-base sm:text-lg text-text-muted">Espacio de crecimiento personal y profesional en Santiago de Cali.</p>
        </div>
      </section>

              {/* Tarjetas de formaciones */}
              <section className="mt-10 grid md:grid-cols-2 gap-8">
                <Link to="/formacion/constelaciones" className="group block overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-[var(--shadow-medium)] transition-all duration-300 hover:shadow-[var(--shadow-large)] hover:border-primary/30">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src="/recursos/fotos/20250208_143018.jpg"
                      alt="Formación en Constelaciones Familiares y Terapia Sistémica"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="high"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
                  </div>
                  <div className="p-5 sm:p-6 bg-gradient-to-b from-primary/5 to-white">
                    <h3 className="text-text font-semibold text-lg sm:text-xl leading-snug mb-3">
                      Formación en Constelaciones Familiares y Terapia Sistémica
                    </h3>
                    <span className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all duration-200">
                      Ver contenido
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </Link>

                <Link to="/formacion/biodescodificacion" className="group block overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-[var(--shadow-medium)] transition-all duration-300 hover:shadow-[var(--shadow-large)] hover:border-primary/30">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <span className="absolute top-4 left-4 z-10 rounded-full bg-amber-100/95 px-3 py-1.5 text-xs font-medium text-amber-800 backdrop-blur-sm">
                      Empieza este mes
                    </span>
                    <span className="absolute top-4 right-4 z-10 rounded-full border border-primary/30 bg-white/90 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
                      <span className="hidden sm:inline">28 feb 2026</span>
                      <span className="sm:hidden">28 feb</span>
                    </span>
                    <img
                      src="/recursos/fotos/20250208_111336.jpg"
                      alt="Certificado en Biodescodificación"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-accent/20 via-transparent to-transparent" />
                  </div>
                  <div className="p-5 sm:p-6 bg-gradient-to-b from-accent/5 to-white">
                    <h3 className="text-text font-semibold text-lg sm:text-xl leading-snug mb-3">
                      Certificado en Biodescodificación
                    </h3>
                    <span className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all duration-200">
                      Ver contenido
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </Link>
              </section>

      {/* Testimonios: archivos en public/recursos/testimonios/ */}
      <TestimoniosSection />

      {/* Suscripción a novedades */}
      <section className="mt-16 card-elevated p-6 sm:p-10 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 shadow-xl rounded-2xl">
        <div className="text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <span className="text-white text-xl sm:text-2xl">📧</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-text mb-4">¿Quieres recibir nuestras novedades?</h2>
          <p className="text-base sm:text-lg text-text-muted mb-6 sm:mb-8 max-w-2xl mx-auto">
            Mantente al día con nuestros próximos eventos, formaciones, contenido exclusivo y ofertas especiales. 
            Únete a nuestra comunidad y no te pierdas ninguna oportunidad de crecimiento personal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <button 
              onClick={onOpenLeadModal}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-semibold text-base sm:text-lg hover:shadow-lg hover:translate-y-[-2px] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20"
            >
              📧 Recibir correos con novedades
            </button>
            <a 
              href="https://wa.me/message/IHT5EC6ZSBPIL1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 bg-emerald-400 hover:bg-emerald-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:translate-y-[-2px] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 flex items-center gap-2"
            >
              <FaWhatsapp className="w-5 h-5 shrink-0" />
              WhatsApp
            </a>
            <a 
              href="https://www.instagram.com/renacer.ahora/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:translate-y-[-2px] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20 flex items-center gap-2"
            >
              <FaInstagram className="w-5 h-5 shrink-0" />
              Instagram
            </a>
          </div>
          <p className="text-sm text-text-muted mt-4">
            Respetamos tu privacidad. No compartimos tu información con terceros.
          </p>
        </div>
      </section>
    </main>
  )
}

function FormacionBiodescodificacionPage({ onOpenLeadModal }: { onOpenLeadModal?: () => void }) {
  // Fecha objetivo: 28 de febrero de 2026 a las 9:00 AM
  const targetDate = new Date('2026-02-28T09:00:00')

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* Hero */}
      <section className="card-elevated p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 sm:gap-12 animate-fade-in-up shadow-xl rounded-2xl">
        <img
          src="/recursos/logos/logo%20png%202.png"
          alt="Logo Renacer"
          className="h-16 sm:h-20 w-auto object-contain"
          width={160}
          height={80}
          decoding="async"
        />
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-text mb-4 sm:mb-6">Certificado en Biodescodificación</h1>
          <p className="text-lg sm:text-xl text-text-muted leading-relaxed mb-6 sm:mb-8">Descubre nuestra formación en Biodescodificación en el Centro de Formación Renacer. Un programa presencial orientado a comprender el origen emocional de los síntomas y acompañar procesos de sanación con una mirada integral.</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <a 
              href="https://wa.me/message/IHT5EC6ZSBPIL1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <button>Quiero más información</button>
            </a>
            <a 
              href="https://wa.me/message/IHT5EC6ZSBPIL1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg"
            >
              <FaWhatsapp className="w-5 h-5 shrink-0" />
              WhatsApp
            </a>
            <a 
              href="https://www.instagram.com/renacer.ahora/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg"
            >
              <FaInstagram className="w-5 h-5 shrink-0" />
              Instagram
            </a>
            <a href="#proximo-inicio" className="text-base text-primary hover:text-primary-light transition-colors font-medium">Ver próxima cohorte →</a>
          </div>
        </div>
      </section>

      {/* Próximo inicio - Banner destacado */}
      <section id="proximo-inicio" className="mt-16 card-elevated p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 shadow-lg rounded-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="flex-1">
            <p className="text-sm text-primary font-medium">Próxima cohorte</p>
            <h2 className="text-xl font-semibold mt-1 text-text">Sábado, 28 de febrero 2026</h2>
            <ul className="mt-2 text-sm text-text-muted flex flex-wrap gap-x-4 gap-y-1">
              <li className="flex items-center gap-1">📍 Barrio Ciudad Jardín – Cali</li>
              <li className="flex items-center gap-1">🕘 9:00 am a 5:00 pm</li>
            </ul>
          </div>
          <a 
            href="https://wa.me/message/IHT5EC6ZSBPIL1" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <button>Reserva tu cupo</button>
          </a>
        </div>
      </section>

      {/* Contador regresivo */}
      <section className="mt-16">
        <CountdownTimer targetDate={targetDate} />
      </section>

      {/* Por qué elegirnos */}
      <section className="mt-16 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div className="group overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-medium)]">
          <img src="/recursos/fotos/20250208_093922.jpg" alt="Formación en Biodescodificación" className="w-full h-60 sm:h-80 object-cover transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" decoding="async" />
        </div>
        <div className="card-elevated p-6 sm:p-10 shadow-xl rounded-2xl">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-primary to-primary-light rounded-xl flex items-center justify-center">
              <span className="text-white text-xl sm:text-2xl">💫</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text">¿Por qué elegirnos?</h2>
          </div>
          <p className="text-lg sm:text-xl text-text-muted leading-relaxed">Porque no solo te formamos, te transformamos. En el Centro de Formación Renacer, creemos que la biodescodificación es una herramienta poderosa para comprender el lenguaje del cuerpo y liberar las emociones que se manifiestan como síntomas físicos.</p>
        </div>
      </section>

      {/* Formación completa */}
      <section className="mt-16 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div className="order-2 md:order-1 card-elevated p-6 sm:p-10 shadow-xl rounded-2xl">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-accent to-accent-light rounded-xl flex items-center justify-center">
              <span className="text-white text-xl sm:text-2xl">🌱</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text">Una formación completa y vivencial</h2>
          </div>
          <p className="text-lg sm:text-xl text-text-muted leading-relaxed">Durante 6 módulos, adquirirás herramientas prácticas para identificar conflictos emocionales, comprender la relación entre emociones y síntomas, y acompañar a otros en su proceso de sanación a través de la biodescodificación.</p>
        </div>
        <div className="order-1 md:order-2 group overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-medium)]">
          <img src="/recursos/fotos/IMG_2666.jpg" alt="Proceso de biodescodificación" className="w-full h-60 sm:h-80 object-cover transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" decoding="async" />
        </div>
      </section>

      {/* Enfoque práctico */}
      <section className="mt-16 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div className="group overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-medium)]">
          <img src="/recursos/fotos/IMG-20250706-WA0016.jpg" alt="Sesión práctica de biodescodificación" className="w-full h-60 sm:h-80 object-cover transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" decoding="async" />
        </div>
        <div className="card-elevated p-6 sm:p-10 shadow-xl rounded-2xl">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-primary to-primary-light rounded-xl flex items-center justify-center">
              <span className="text-white text-xl sm:text-2xl">🎯</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text">Enfoque práctico</h2>
          </div>
          <p className="text-lg sm:text-xl text-text-muted leading-relaxed">Nuestra formación es presencial y práctica, lo que te permite aplicar directamente las técnicas de biodescodificación y experimentar una transformación real en tu vida y en la de quienes acompañes.</p>
        </div>
      </section>

      {/* Guía experta */}
      <section className="mt-16 card-elevated p-6 sm:p-10 shadow-xl rounded-2xl">
        <div className="flex flex-col md:flex-row gap-8 sm:gap-12 items-center">
          <div className="overflow-hidden rounded-xl border border-border w-full md:w-80 shadow-[var(--shadow-medium)]">
            <img src="/recursos/fotos/20250621_141628.jpg" alt="Alba Elisa Cerón" className="w-full h-60 sm:h-80 object-cover" loading="lazy" decoding="async" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-accent to-accent-light rounded-xl flex items-center justify-center">
                <span className="text-white text-xl sm:text-2xl">👩‍🏫</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-text">Guía experta</h2>
            </div>
            <p className="text-xl text-text-muted leading-relaxed mb-8">Aprenderás de Alba Elisa Cerón, una especialista en biodescodificación y terapeuta experimentada, quien te guiará con su conocimiento y experiencia en cada paso del camino hacia la comprensión del lenguaje del cuerpo.</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
              <li className="card-flat p-3 sm:p-4 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">✨ Especialista en biodescodificación</li>
              <li className="card-flat p-3 sm:p-4 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">🧠 Terapeuta y coach sistémica</li>
              <li className="card-flat p-3 sm:p-4 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">🔬 Bioneuroemoción</li>
              <li className="card-flat p-3 sm:p-4 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">💭 Consteladora familiar</li>
              <li className="card-flat p-3 sm:p-4 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">🌲 Baño de bosque (Shinrin-Yoku)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Ambiente acogedor */}
      <section className="mt-16 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div className="order-2 md:order-1 card-elevated p-6 sm:p-10 shadow-xl rounded-2xl">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-primary to-primary-light rounded-xl flex items-center justify-center">
              <span className="text-white text-xl sm:text-2xl">🏠</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text">Ambiente acogedor</h2>
          </div>
          <p className="text-lg sm:text-xl text-text-muted leading-relaxed">A diferencia de otros centros, ofrecemos un ambiente cálido y armónico que facilita el aprendizaje y la transformación personal, haciendo que te sientas como en casa mientras exploras el fascinante mundo de la biodescodificación.</p>
        </div>
        <div className="order-1 md:order-2 group overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-medium)]">
          <img src="/recursos/fotos/20250208_093927.jpg" alt="Ambiente acogedor" className="w-full h-60 sm:h-80 object-cover transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" decoding="async" />
        </div>
      </section>

      {/* Sobre la formación */}
      <section className="mt-16 card-elevated p-6 sm:p-10 shadow-xl rounded-2xl">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="w-14 h-14 bg-gradient-to-r from-accent to-accent-light rounded-xl flex items-center justify-center">
            <span className="text-white text-2xl">📋</span>
          </div>
          <h2 className="text-3xl font-semibold text-text">Sobre la Formación</h2>
        </div>
        <dl className="grid sm:grid-cols-2 gap-4 sm:gap-6 text-sm sm:text-base">
          <div className="card-flat p-4 sm:p-6 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">
            <dt className="font-semibold text-primary mb-2 text-base sm:text-lg">Duración</dt>
            <dd className="text-text-muted">6 Módulos (1 módulo al mes)</dd>
          </div>
          <div className="card-flat p-4 sm:p-6 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">
            <dt className="font-semibold text-primary mb-2 text-base sm:text-lg">Modalidad</dt>
            <dd className="text-text-muted">Presencial en Cali</dd>
          </div>
          <div className="card-flat p-4 sm:p-6 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">
            <dt className="font-semibold text-primary mb-2 text-base sm:text-lg">Lugar</dt>
            <dd className="text-text-muted">Barrio Ciudad Jardín</dd>
          </div>
          <div className="card-flat p-4 sm:p-6 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">
            <dt className="font-semibold text-primary mb-2 text-base sm:text-lg">Valor total</dt>
            <dd className="text-text-muted font-semibold text-accent text-lg sm:text-xl">$300.000</dd>
          </div>
          <div className="card-flat p-4 sm:p-6 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">
            <dt className="font-semibold text-primary mb-2 text-base sm:text-lg">Horario</dt>
            <dd className="text-text-muted">9:00 am a 5:00 pm</dd>
          </div>
          <div className="card-flat p-4 sm:p-6 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">
            <dt className="font-semibold text-primary mb-2 text-base sm:text-lg">Fecha de inicio</dt>
            <dd className="text-text-muted font-semibold text-accent">Sábado, 28 de febrero 2026</dd>
          </div>
        </dl>
      </section>

      {/* Suscripción a novedades */}
      {onOpenLeadModal && (
        <section className="mt-16 card-elevated p-10 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 shadow-xl rounded-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-xl sm:text-2xl">📧</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text mb-4">¿Te interesa esta formación?</h2>
            <p className="text-base sm:text-lg text-text-muted mb-6 sm:mb-8 max-w-2xl mx-auto">
              Mantente informado sobre fechas de inicio, descuentos especiales y contenido exclusivo de nuestras formaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={onOpenLeadModal}
                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-semibold text-base sm:text-lg hover:shadow-lg hover:translate-y-[-2px] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20"
              >
                📧 Recibir correos con novedades
              </button>
              <a 
                href="https://wa.me/message/IHT5EC6ZSBPIL1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 sm:px-8 sm:py-4 bg-emerald-400 hover:bg-emerald-500 text-white rounded-xl font-semibold text-base sm:text-lg hover:shadow-lg hover:translate-y-[-2px] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 flex items-center gap-2"
              >
                <FaWhatsapp className="w-5 h-5 shrink-0" />
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}


export default function App() {
  const [showLeadModal, setShowLeadModal] = useState(false)

  useEffect(() => {
    // Verificar si ya se mostró el modal automáticamente en esta sesión
    const modalShown = localStorage.getItem('leadModalShown')
    if (modalShown) {
      return
    }

    // Mostrar el modal automáticamente después de 13 segundos (13000ms)
    const timer = setTimeout(() => {
      setShowLeadModal(true)
    }, 13000)

    return () => clearTimeout(timer)
  }, [])

  const handleLeadSubmit = (name: string, email: string) => {
    // Aquí puedes integrar con tu servicio de email marketing
    console.log('Lead capturado:', { name, email })
    
    // Marcar que el modal ya se mostró
    localStorage.setItem('leadModalShown', 'true')
  }

  const handleCloseModal = () => {
    setShowLeadModal(false)
    // No marcar como mostrado si solo se cierra, solo si se envía el formulario
  }

  const handleOpenModal = () => {
    setShowLeadModal(true)
    // No cambiar hasShownModal para permitir que se abra manualmente
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col text-text relative">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0 bg-contained">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/80 via-white to-emerald-50/60"></div>
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #a78bfa 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10 animate-pulse" style={{ animationDuration: '12s' }}></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-violet-100/25 via-transparent to-primary/10 animate-pulse" style={{ animationDelay: '3s', animationDuration: '15s' }}></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/15 via-transparent to-rose-50/20 animate-pulse" style={{ animationDelay: '6s', animationDuration: '18s' }}></div>
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-violet-200/15 to-primary/15 rounded-full blur-xl animate-drift" style={{ animationDelay: '5s' }}></div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-br from-accent/15 to-emerald-100/20 rounded-full blur-xl animate-float" style={{ animationDelay: '8s' }}></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-rose-100/12 to-pink-100/12 rounded-full blur-2xl animate-drift" style={{ animationDelay: '4s' }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage onOpenLeadModal={handleOpenModal} />} />
            <Route path="/formacion/constelaciones" element={<FormacionConstelacionesPage onOpenLeadModal={handleOpenModal} />} />
            <Route path="/formacion/biodescodificacion" element={<FormacionBiodescodificacionPage onOpenLeadModal={handleOpenModal} />} />
          </Routes>
          <Footer />
        </div>

        {/* Lead Capture Modal */}
        <LeadCaptureModal
          isOpen={showLeadModal}
          onClose={handleCloseModal}
          onSubmit={handleLeadSubmit}
        />
      </div>
    </BrowserRouter>
  )
}
