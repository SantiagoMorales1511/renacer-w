// Verifica la sesion admin actual leyendo la cookie firmada. Nunca confia en
// nada enviado por el cliente salvo la cookie HttpOnly, verificada con HMAC
// server-side.

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

export function verifySession(request: Request): { role: 'ADMIN' | 'ASSISTANT' } | null {
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

  return { role: data.role }
}

export async function GET(request: Request) {
  const session = verifySession(request)
  if (!session) {
    return Response.json({ authenticated: false })
  }
  return Response.json({ authenticated: true, role: session.role })
}
