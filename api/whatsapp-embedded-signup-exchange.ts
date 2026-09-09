// Intercambio server-side del "code" de Embedded Signup por un token de acceso.
// El App Secret vive únicamente aquí (variable de entorno de Vercel, sin prefijo
// VITE_, nunca enviada al navegador). El token resultante se devuelve una sola
// vez a la sesión del administrador que inició el flujo; este endpoint no lo
// almacena ni lo registra en logs.
//
// IMPORTANTE: el import cross-directorio a src/shared/ rompe la función en
// runtime de Vercel (FUNCTION_INVOCATION_FAILED) aunque compile bien en local
// — el bundler de Vercel Functions no traza esa dependencia de forma fiable.
// Por eso estos valores están duplicados como literales aquí. Deben coincidir
// EXACTAMENTE con src/shared/whatsappEmbeddedSignup.ts si cambian.

const GRAPH_API_VERSION = 'v25.0'
const WA_APP_ID = '1057632283566600'
const WA_EMBEDDED_SIGNUP_REDIRECT_URI = 'https://renacer-ahora.com/admin/whatsapp-connect'

export async function POST(request: Request) {
  const appId = WA_APP_ID
  const appSecret = process.env.WA_APP_SECRET

  if (!appSecret?.trim()) {
    return Response.json({ error: 'WA_APP_SECRET no configurada en Vercel' }, { status: 500 })
  }

  let body: { code?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const code = (body.code ?? '').trim()
  if (!code) {
    return Response.json({ error: 'code es requerido' }, { status: 400 })
  }

  const url = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/oauth/access_token`)
  url.searchParams.set('client_id', appId)
  url.searchParams.set('client_secret', appSecret)
  url.searchParams.set('redirect_uri', WA_EMBEDDED_SIGNUP_REDIRECT_URI)
  url.searchParams.set('code', code)

  const res = await fetch(url.toString(), { method: 'GET' })
  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = {}
  }

  if (!res.ok) {
    const msg = (data as { error?: { message?: string } }).error?.message || res.statusText
    return Response.json({ error: `Meta: ${res.status} - ${msg}` }, { status: 502 })
  }

  const result = data as { access_token?: string; token_type?: string }
  if (!result.access_token) {
    return Response.json({ error: 'Meta no devolvió access_token' }, { status: 502 })
  }

  return Response.json({ access_token: result.access_token, token_type: result.token_type ?? 'bearer' })
}
