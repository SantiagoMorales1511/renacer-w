// Chat de /admin/asistente. Verifica la sesion server-side, resuelve la
// identidad (telefono) segun el rol YA VERIFICADO (nunca segun algo enviado
// por el cliente), y reenvia al mismo nucleo de asistente interno que usa
// WhatsApp Admin (RENACER - Web Admin Chat), autenticado con un secreto
// compartido que solo vive en variables de entorno del servidor.

import crypto from 'node:crypto'

function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

function verifySession(request: Request): { role: 'ADMIN' | 'ASSISTANT' } | null {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET
  if (!sessionSecret?.trim()) return null

  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/renacer_admin_session=([^;]+)/)
  if (!match) return null

  const token = match[1]
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, signature] = parts

  const expectedSig = sign(payload, sessionSecret)
  if (!timingSafeEqual(signature, expectedSig)) return null

  let data: { role?: string; exp?: number }
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }

  if (!data.role || (data.role !== 'ADMIN' && data.role !== 'ASSISTANT')) return null
  if (!data.exp || Date.now() > data.exp) return null

  return { role: data.role as 'ADMIN' | 'ASSISTANT' }
}

const N8N_WEB_ADMIN_CHAT_URL = 'https://n8n-production-a3a46.up.railway.app/webhook/renacer/web-admin-chat'

export async function POST(request: Request) {
  const session = verifySession(request)
  if (!session) {
    return Response.json({ error: 'No autenticado' }, { status: 401 })
  }

  const internalSecret = process.env.RENACER_INTERNAL_SECRET
  if (!internalSecret?.trim()) {
    return Response.json({ error: 'RENACER_INTERNAL_SECRET no configurada en Vercel' }, { status: 500 })
  }

  const identityPhone =
    session.role === 'ADMIN' ? process.env.ADMIN_WEB_IDENTITY_PHONE : process.env.ASSISTANT_WEB_IDENTITY_PHONE
  if (!identityPhone?.trim()) {
    return Response.json({ error: `Falta configurar el telefono de identidad para el rol ${session.role}` }, { status: 500 })
  }

  let body: { message_text?: string; conversation_id?: string | null }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Body JSON invalido' }, { status: 400 })
  }

  const messageText = (body.message_text ?? '').trim()
  if (!messageText) {
    return Response.json({ error: 'message_text es requerido' }, { status: 400 })
  }

  const res = await fetch(N8N_WEB_ADMIN_CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Internal-Secret': internalSecret },
    body: JSON.stringify({
      phone: identityPhone,
      message_text: messageText,
      conversation_id: body.conversation_id || null,
      sender_name: session.role === 'ADMIN' ? 'Santiago' : 'Clarena',
    }),
  })

  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = {}
  }

  if (!res.ok) {
    return Response.json({ error: 'No se pudo procesar el mensaje' }, { status: 502 })
  }

  return Response.json(data)
}
