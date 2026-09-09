export async function POST() {
  const res = Response.json({ ok: true })
  res.headers.set('Set-Cookie', 'renacer_admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0')
  return res
}
