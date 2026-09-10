// Endpoint generico para /admin/inscritos y los paneles de Pendientes y
// Propuestas de /admin/asistente. Verifica la sesion server-side; el rol
// verificado (nunca uno enviado por el cliente) se reenvia a n8n junto con
// el secreto compartido.

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

const N8N_ADMIN_WEB_API_URL = 'https://n8n-production-a3a46.up.railway.app/webhook/renacer/admin-web-api'
const VALID_ACTIONS = [
  'ENROLLMENT_LIST',
  'PENDING_PANEL',
  'PROPOSALS_LIST',
  'PROPOSAL_RESOLVE',
  'AI_BLOCK_SET',
  'LEAD_AUTOMATION_TOGGLE',
  'AD_MAPPING_LIST',
  'AD_MAPPING_SET',
]

export async function POST(request: Request) {
  const session = verifySession(request)
  if (!session) {
    return Response.json({ error: 'No autenticado' }, { status: 401 })
  }

  const internalSecret = process.env.RENACER_INTERNAL_SECRET
  if (!internalSecret?.trim()) {
    return Response.json({ error: 'RENACER_INTERNAL_SECRET no configurada en Vercel' }, { status: 500 })
  }

  let body: {
    action?: string
    filters?: Record<string, string>
    proposal_id?: string
    decision?: 'APPROVE' | 'REJECT'
    staff_name?: string
    target_phone?: string
    target_name?: string
    ai_block_action?: 'BLOCK' | 'UNBLOCK'
    reason?: string
    lead_id?: string
    field?: 'commercial_followups_enabled' | 'operational_reminders_enabled'
    value?: boolean
    ad_source_id?: string
    ad_service_context?: 'BIODECODIFICATION_MASTER' | 'CONSTELLATIONS_TRAINING' | 'CONSTELLATION_EVENT' | null
    ad_active?: boolean
  }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Body JSON invalido' }, { status: 400 })
  }

  const action = (body.action ?? '').trim()
  if (!VALID_ACTIONS.includes(action)) {
    return Response.json({ error: `action invalida: ${action}` }, { status: 400 })
  }

  const res = await fetch(N8N_ADMIN_WEB_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Internal-Secret': internalSecret },
    body: JSON.stringify({
      caller_role: session.role,
      action,
      filters: body.filters || {},
      proposal_id: body.proposal_id || null,
      decision: body.decision || null,
      staff_name: body.staff_name || (session.role === 'ADMIN' ? 'Santiago' : 'Clarena'),
      target_phone: body.target_phone || null,
      target_name: body.target_name || null,
      ai_block_action: body.ai_block_action || null,
      reason: body.reason || null,
      lead_id: body.lead_id || null,
      field: body.field || null,
      value: typeof body.value === 'boolean' ? body.value : null,
      ad_source_id: body.ad_source_id || null,
      ad_service_context: body.ad_service_context ?? null,
      ad_active: typeof body.ad_active === 'boolean' ? body.ad_active : true,
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
    return Response.json({ error: 'No se pudo completar la operacion' }, { status: 502 })
  }

  return Response.json(data)
}
