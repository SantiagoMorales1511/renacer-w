import { useEffect, useState, type ReactNode } from 'react'

type Role = 'ADMIN' | 'ASSISTANT'

interface AdminLoginGateProps {
  children: (role: Role) => ReactNode
}

// La proteccion real vive en el backend: cada request a /api/admin-* verifica
// una cookie HttpOnly firmada server-side. Este gate solo evita mostrar la
// UI a quien no tiene sesion — no es la barrera de seguridad en si.
export default function AdminLoginGate({ children }: AdminLoginGateProps) {
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'anonymous'>('checking')
  const [role, setRole] = useState<Role | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  const checkSession = async () => {
    try {
      const res = await fetch('/api/admin-session')
      const data = await res.json()
      if (data.authenticated) {
        setRole(data.role)
        setStatus('authenticated')
      } else {
        setStatus('anonymous')
      }
    } catch {
      setStatus('anonymous')
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoggingIn(true)
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Credenciales invalidas')
        setLoggingIn(false)
        return
      }
      setRole(data.role)
      setStatus('authenticated')
    } catch {
      setError('Error de red')
    }
    setLoggingIn(false)
  }

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-text-muted">Cargando...</p>
      </div>
    )
  }

  if (status === 'anonymous') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h1 className="text-lg font-semibold text-text">Renacer Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoFocus
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full bg-primary text-white rounded-lg px-3 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-40"
          >
            {loggingIn ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    )
  }

  return <>{children(role as Role)}</>
}

export async function adminLogout() {
  await fetch('/api/admin-logout', { method: 'POST' })
  window.location.reload()
}
