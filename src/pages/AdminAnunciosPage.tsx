import { useEffect, useState } from 'react'
import AdminLoginGate, { adminLogout } from '../components/AdminLoginGate'

type ServiceContext = 'BIODECODIFICATION_MASTER' | 'CONSTELLATIONS_TRAINING' | 'CONSTELLATION_EVENT'

interface AdMapping {
  id: string
  source_id: string
  source_url: string | null
  service_context: ServiceContext | null
  active: boolean
  first_seen_at: string
  last_seen_at: string
  notes: string | null
}

const PROGRAM_LABELS: Record<ServiceContext, string> = {
  BIODECODIFICATION_MASTER: 'Máster en Biodescodificación',
  CONSTELLATIONS_TRAINING: 'Formación en Constelaciones Familiares y Terapia Sistémica',
  CONSTELLATION_EVENT: 'Jornada de Constelaciones Familiares',
}

function AdminAnunciosContent({ role }: { role: 'ADMIN' | 'ASSISTANT' }) {
  const [rows, setRows] = useState<AdMapping[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'AD_MAPPING_LIST' }),
      })
      const data = await res.json()
      setRows(data.results || [])
    } catch {
      setRows([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const setProgram = async (sourceId: string, value: ServiceContext | '') => {
    const newValue = value === '' ? null : value
    const prevRows = rows
    setRows((prev) => prev.map((r) => (r.source_id === sourceId ? { ...r, service_context: newValue } : r)))
    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'AD_MAPPING_SET', ad_source_id: sourceId, ad_service_context: newValue, ad_active: true }),
      })
      if (!res.ok) throw new Error('failed')
    } catch {
      setRows(prevRows)
    }
  }

  const total = rows.length
  const unmapped = rows.filter((r) => !r.service_context).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-4 sm:px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-text">Anuncios — Renacer Admin</h1>
          <p className="text-xs text-text-muted">Conectado como {role === 'ADMIN' ? 'Santiago (Admin)' : 'Clarena (Assistant)'}</p>
        </div>
        <button onClick={() => adminLogout()} className="text-xs text-text-muted hover:text-text">
          Cerrar sesión
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Anuncios detectados', value: total },
            { label: 'Sin asignar', value: unmapped },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border p-4">
              <p className="text-2xl font-semibold text-text">{stat.value}</p>
              <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-text-muted">
          Cada vez que llega un mensaje de WhatsApp originado por un anuncio (Click-to-WhatsApp), su sourceId queda
          registrado aquí automáticamente. Asígnale un programa para que el asistente responda directo sobre ese
          programa desde el primer mensaje, sin preguntar.
        </p>

        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-text-muted text-xs">
                <th className="px-3 py-2">Source ID</th>
                <th className="px-3 py-2">Anuncio</th>
                <th className="px-3 py-2">Programa asignado</th>
                <th className="px-3 py-2">Primera vez</th>
                <th className="px-3 py-2">Última vez</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-text-muted">Cargando...</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-text-muted">Todavía no ha llegado ningún anuncio.</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.source_id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-xs">{r.source_id}</td>
                  <td className="px-3 py-2">
                    {r.source_url ? (
                      <a href={r.source_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">
                        Ver anuncio
                      </a>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={r.service_context ?? ''}
                      onChange={(e) => setProgram(r.source_id, e.target.value as ServiceContext | '')}
                      className={`border rounded-lg px-2 py-1 text-xs ${r.service_context ? 'bg-green-50' : 'bg-amber-50'}`}
                    >
                      <option value="">Sin asignar</option>
                      <option value="BIODECODIFICATION_MASTER">{PROGRAM_LABELS.BIODECODIFICATION_MASTER}</option>
                      <option value="CONSTELLATIONS_TRAINING">{PROGRAM_LABELS.CONSTELLATIONS_TRAINING}</option>
                      <option value="CONSTELLATION_EVENT">{PROGRAM_LABELS.CONSTELLATION_EVENT}</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-xs text-text-muted">{new Date(r.first_seen_at).toLocaleDateString('es-CO')}</td>
                  <td className="px-3 py-2 text-xs text-text-muted">{new Date(r.last_seen_at).toLocaleDateString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export default function AdminAnunciosPage() {
  return <AdminLoginGate>{(role) => <AdminAnunciosContent role={role} />}</AdminLoginGate>
}
