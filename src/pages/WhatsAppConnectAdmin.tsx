import { useEffect, useRef, useState } from 'react'

// Ruta administrativa NO enlazada públicamente. Aloja el flujo oficial de Meta
// "Embedded Signup" (v25.0 del Graph API / JS SDK) para conectar el número
// oficial de WhatsApp de Renacer en modo Coexistencia (WhatsApp Business App +
// Cloud API funcionando en paralelo sobre el mismo número).
//
// Seguridad:
// - El App ID es público por diseño del SDK de Facebook (no es secreto).
// - El App Secret NUNCA se usa ni se referencia en este archivo.
// - El intercambio del "code" por un token ocurre en el backend (api/whatsapp-embedded-signup-exchange.ts).
// - El token resultante se muestra UNA sola vez en pantalla para que el
//   administrador lo copie y lo pegue manualmente en la credencial de n8n.
//   No se envía a ningún chat, log ni almacenamiento persistente desde aquí.

const GRAPH_API_VERSION = 'v25.0'

// App ID de "Renacer Automation" — público por diseño del SDK de Facebook, no es secreto.
const WA_APP_ID = '1057632283566600'

// Se completa con el Configuration ID una vez creado en Meta App Dashboard
// (App Dashboard > Facebook Login for Business > Configurations). Tampoco es
// secreto, pero no existe todavía hasta que se cree manualmente en Meta.
const WA_EMBEDDED_SIGNUP_CONFIG_ID = '1392010019794916'

declare global {
  interface Window {
    FB?: {
      init: (params: {
        appId: string
        autoLogAppEvents: boolean
        xfbml: boolean
        version: string
      }) => void
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options: {
          config_id: string
          response_type: 'code'
          override_default_response_type: true
          extras?: Record<string, unknown>
        }
      ) => void
    }
    fbAsyncInit?: () => void
  }
}

interface FacebookLoginResponse {
  authResponse?: {
    code?: string
  }
  status?: string
}

interface EmbeddedSignupMessage {
  type: string
  event: 'FINISH' | 'FINISH_ONLY_WABA' | 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING' | 'CANCEL' | string
  data?: {
    phone_number_id?: string
    waba_id?: string
    business_id?: string
    current_step?: string
    error_message?: string
    error_code?: string | number
  }
}

type Step = 'locked' | 'idle' | 'sdk_loading' | 'ready' | 'signing_up' | 'exchanging' | 'done' | 'error'

export default function WhatsAppConnectAdmin() {
  const accessCode = import.meta.env.VITE_ADMIN_ACCESS_CODE as string | undefined
  const appId = WA_APP_ID
  const configId = WA_EMBEDDED_SIGNUP_CONFIG_ID || (import.meta.env.VITE_WA_EMBEDDED_SIGNUP_CONFIG_ID as string | undefined)

  const [unlocked, setUnlocked] = useState(!accessCode)
  const [passInput, setPassInput] = useState('')
  const [step, setStep] = useState<Step>(accessCode ? 'locked' : 'idle')
  const [log, setLog] = useState<string[]>([])
  const [signupData, setSignupData] = useState<EmbeddedSignupMessage['data'] | null>(null)
  const [exchangeResult, setExchangeResult] = useState<{
    access_token?: string
    token_type?: string
    error?: string
  } | null>(null)
  const sdkLoaded = useRef(false)

  const appendLog = (msg: string) => setLog((l) => [...l, `${new Date().toLocaleTimeString('es-CO')} — ${msg}`])

  useEffect(() => {
    if (!unlocked) return
    if (sdkLoaded.current) return
    sdkLoaded.current = true
    setStep('sdk_loading')

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        autoLogAppEvents: true,
        xfbml: true,
        version: GRAPH_API_VERSION,
      })
      appendLog(`SDK de Facebook inicializado (Graph API ${GRAPH_API_VERSION}).`)
      setStep('ready')
    }

    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/es_LA/sdk.js'
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    document.body.appendChild(script)

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return
      let parsed: EmbeddedSignupMessage
      try {
        parsed = JSON.parse(event.data)
      } catch {
        return
      }
      if (parsed.type !== 'WA_EMBEDDED_SIGNUP') return

      appendLog(`Evento de Embedded Signup: ${parsed.event} ${parsed.data?.current_step ? `(paso: ${parsed.data.current_step})` : ''}`)

      if (parsed.event === 'CANCEL') {
        if (parsed.data?.error_message) {
          appendLog(`Cancelado con error: ${parsed.data.error_message} (código ${parsed.data.error_code ?? 'desconocido'})`)
        } else {
          appendLog('Flujo cancelado o abandonado por el usuario.')
        }
        setStep('ready')
      }

      if (parsed.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING' || parsed.event === 'FINISH' || parsed.event === 'FINISH_ONLY_WABA') {
        setSignupData(parsed.data ?? null)
        appendLog(
          `Datos recibidos — WABA ID: ${parsed.data?.waba_id ?? 'N/D'}, Phone Number ID: ${parsed.data?.phone_number_id ?? 'N/D'}, Business ID: ${parsed.data?.business_id ?? 'N/D'}`
        )
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [unlocked, appId])

  const startSignup = () => {
    if (!window.FB) {
      appendLog('ERROR: el SDK de Facebook no está listo todavía.')
      return
    }
    if (!configId) {
      appendLog('ERROR: todavía falta el config_id de Embedded Signup (créalo en Meta App Dashboard y pégalo en el código o en VITE_WA_EMBEDDED_SIGNUP_CONFIG_ID).')
      return
    }
    setStep('signing_up')
    appendLog('Abriendo el flujo oficial de Embedded Signup de Meta...')

    window.FB.login(
      (response) => {
        const code = response.authResponse?.code
        if (!code) {
          appendLog('El login no devolvió un código de autorización. El flujo pudo haber sido cancelado.')
          setStep('ready')
          return
        }
        appendLog('Código de autorización recibido. Intercambiando en el backend (server-side)...')
        exchangeCode(code)
      },
      {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {} },
      }
    )
  }

  const exchangeCode = async (code: string) => {
    setStep('exchanging')
    try {
      const res = await fetch('/api/whatsapp-embedded-signup-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) {
        appendLog(`ERROR en el intercambio: ${data.error ?? res.statusText}`)
        setExchangeResult({ error: data.error ?? res.statusText })
        setStep('error')
        return
      }
      setExchangeResult(data)
      appendLog('Intercambio completado. Token generado — cópialo ahora, no se mostrará de nuevo.')
      setStep('done')
    } catch (err) {
      appendLog(`ERROR de red al intercambiar el código: ${String(err)}`)
      setStep('error')
    }
  }

  if (!unlocked) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="card-elevated p-6 shadow-xl rounded-2xl">
          <h1 className="text-xl font-semibold text-text mb-4">Acceso administrativo</h1>
          <input
            type="password"
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            placeholder="Código de acceso"
            className="w-full border rounded-lg px-3 py-2 mb-3"
          />
          <button
            onClick={() => {
              if (passInput === accessCode) {
                setUnlocked(true)
                setStep('idle')
              } else {
                appendLog('Código de acceso incorrecto.')
              }
            }}
            className="w-full bg-primary text-white rounded-lg px-3 py-2 font-medium hover:opacity-90"
          >
            Entrar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="card-elevated p-6 sm:p-8 shadow-xl rounded-2xl space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-text">Conectar WhatsApp Business App (Coexistencia)</h1>
          <p className="text-sm text-text-muted mt-2">
            Página administrativa interna. Este flujo conecta el número oficial de WhatsApp de Renacer a la
            Cloud API en modo <strong>Coexistencia</strong> — la app móvil de WhatsApp Business sigue funcionando
            con normalidad en paralelo.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
          <strong>Antes de continuar:</strong> este flujo, al completarse, conecta el número real
          +57 310 661 1810 a la plataforma. Solo úsalo cuando estés listo para ejecutar el onboarding real,
          después de haber revisado el procedimiento con el equipo técnico.
        </div>

        <div className="text-sm text-text-muted">
          Estado: <span className="font-mono">{step}</span>
        </div>

        <button
          onClick={startSignup}
          disabled={step !== 'ready'}
          className="w-full bg-primary text-white rounded-lg px-4 py-3 font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Iniciar Embedded Signup con Meta
        </button>

        {signupData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-900 space-y-1">
            <p><strong>WABA ID:</strong> {signupData.waba_id ?? 'N/D'}</p>
            <p><strong>Phone Number ID:</strong> {signupData.phone_number_id ?? 'N/D'}</p>
            <p><strong>Business ID:</strong> {signupData.business_id ?? 'N/D'}</p>
          </div>
        )}

        {exchangeResult?.access_token && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 space-y-2">
            <p className="font-semibold">Token generado — cópialo ahora y pégalo en n8n → Credentials → "Renacer WhatsApp Access Token". No se mostrará de nuevo.</p>
            <textarea
              readOnly
              value={exchangeResult.access_token}
              className="w-full border rounded-lg px-2 py-2 font-mono text-xs bg-white"
              rows={4}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
        )}

        {exchangeResult?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-900">
            {exchangeResult.error}
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-text mb-2">Registro de eventos</h2>
          <div className="bg-gray-50 border rounded-lg p-3 text-xs font-mono text-text-muted space-y-1 max-h-64 overflow-y-auto">
            {log.length === 0 && <p>Sin eventos todavía.</p>}
            {log.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
