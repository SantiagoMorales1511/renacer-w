const BREVO_API_URL = 'https://api.brevo.com/v3'

export async function POST(request: Request) {
  const apiKey = process.env.BREVO_API_KEY
  const listId = process.env.BREVO_LIST_ID

  if (!apiKey?.trim()) {
    return Response.json(
      { error: 'BREVO_API_KEY no configurada en Vercel' },
      { status: 500 }
    )
  }
  if (!listId?.trim()) {
    return Response.json(
      { error: 'BREVO_LIST_ID no configurado en Vercel' },
      { status: 500 }
    )
  }

  let body: { name?: string; email?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const name = (body.name ?? '').trim()
  const email = (body.email ?? '').trim()
  if (!email) {
    return Response.json({ error: 'email es requerido' }, { status: 400 })
  }

  const contactData = {
    email: email.toLowerCase(),
    attributes: { NOMBRE_COMPLETO: name },
    listIds: [parseInt(listId, 10)],
    updateEnabled: true,
  }

  let res = await fetch(`${BREVO_API_URL}/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(contactData),
  })

  let text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = {}
  }

  if (!res.ok) {
    const msg = (data as { message?: string }).message || res.statusText
    if (res.status === 401) {
      return Response.json(
        { error: 'API key de Brevo inválida. Revisa BREVO_API_KEY en Vercel.' },
        { status: 500 }
      )
    }
    if ((res.status === 400 || res.status === 409) && (msg.includes('duplicate') || msg.includes('already exists'))) {
      res = await fetch(`${BREVO_API_URL}/contacts/${encodeURIComponent(email.toLowerCase())}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify(contactData),
      })
      text = await res.text()
      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        data = {}
      }
      if (res.ok) return Response.json(data)
    }
    return Response.json(
      { error: `Brevo: ${res.status} - ${msg}` },
      { status: 502 }
    )
  }

  return Response.json(data)
}
