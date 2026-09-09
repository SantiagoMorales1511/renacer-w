// Login del panel administrativo interno (/admin/asistente, /admin/inscritos).
// El rol se determina EN EL BACKEND segun cual password coincide -- el
// frontend nunca decide ni envia el rol. La sesion es una cookie HttpOnly
// firmada con HMAC (ADMIN_SESSION_SECRET, solo en el servidor), no un JWT
// de terceros ni algo verificable/editable desde el navegador.

import crypto from 'node:crypto'

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8 // 8 horas

function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export async function POST(request: Request) {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET
  const adminPassword = process.env.ADMIN_PANEL_PASSWORD_ADMIN
  const assistantPassword = process.env.ADMIN_PANEL_PASSWORD_ASSISTANT

  if (!sessionSecret?.trim()) {
    return Response.json({ error: 'ADMIN_SESSION_SECRET no configurada en Vercel' }, { status: 500 })
  }
  if (!adminPassword?.trim()) {
    return Response.json({ error: 'ADMIN_PANEL_PASSWORD_ADMIN no configurada en Vercel' }, { status: 500 })
  }

  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Body JSON invalido' }, { status: 400 })
  }

  const password = (body.password ?? '').trim()
  if (!password) {
    return Response.json({ error: 'password es requerido' }, { status: 400 })
  }

  let role: 'ADMIN' | 'ASSISTANT' | null = null
  if (password === adminPassword) role = 'ADMIN'
  else if (assistantPassword?.trim() && password === assistantPassword) role = 'ASSISTANT'

  if (!role) {
    return Response.json({ error: 'Credenciales invalidas' }, { status: 401 })
  }

  const exp = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  const payload = Buffer.from(JSON.stringify({ role, exp })).toString('base64url')
  const signature = sign(payload, sessionSecret)
  const token = `${payload}.${signature}`

  const res = Response.json({ role })
  res.headers.set(
    'Set-Cookie',
    `renacer_admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}`
  )
  return res
}
