import { useEffect, useState } from 'react'
import AdminLoginGate, { adminLogout } from '../components/AdminLoginGate'

interface Enrollment {
  lead_id: string
  contact_id: string
  full_name: string | null
  phone: string
  program_slug: string
  program_name: string
  cohort_id: string | null
  cohort_start: string | null
  registration_status: string
  payment_status: string
  whatsapp_group_status: string
  registered_at: string
  source: string | null
  ai_enabled: boolean
  commercial_followups_enabled: boolean
  operational_reminders_enabled: boolean
  next_followup_at: string | null
  next_followup_type: string | null
}

function todayBogota(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' }).format(new Date())
}

function AdminInscritosContent({ role }: { role: 'ADMIN' | 'ASSISTANT' }) {
  const [rows, setRows] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [programFilter, setProgramFilter] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ENROLLMENT_LIST',
          filters: {
            search: search || undefined,
            payment_status: paymentFilter || undefined,
            whatsapp_group_status: groupFilter || undefined,
            program_slug: programFilter || undefined,
          },
        }),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleField = async (leadId: string, field: 'commercial_followups_enabled' | 'operational_reminders_enabled', value: boolean) => {
    setRows((prev) => prev.map((r) => (r.lead_id === leadId ? { ...r, [field]: value } : r)))
    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LEAD_AUTOMATION_TOGGLE', lead_id: leadId, field, value }),
      })
      if (!res.ok) throw new Error('failed')
    } catch {
      setRows((prev) => prev.map((r) => (r.lead_id === leadId ? { ...r, [field]: !value } : r)))
    }
  }

  const toggleAiBlock = async (phone: string, name: string | null, currentlyEnabled: boolean) => {
    const action = currentlyEnabled ? 'BLOCK' : 'UNBLOCK'
    setRows((prev) => prev.map((r) => (r.phone === phone ? { ...r, ai_enabled: !currentlyEnabled } : r)))
    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'AI_BLOCK_SET',
          target_phone: phone,
          target_name: name || '',
          ai_block_action: action,
          reason: action === 'BLOCK' ? 'Bloqueado desde panel Inscritos' : 'Desbloqueado desde panel Inscritos',
        }),
      })
      if (!res.ok) throw new Error('failed')
    } catch {
      setRows((prev) => prev.map((r) => (r.phone === phone ? { ...r, ai_enabled: currentlyEnabled } : r)))
    }
  }

  const today = todayBogota()
  const total = rows.length
  const pendingPayment = rows.filter((r) => r.payment_status !== 'CONFIRMED').length
  const pendingGroup = rows.filter((r) => r.whatsapp_group_status === 'PENDING').length
  const enrolledToday = rows.filter((r) => r.registered_at && r.registered_at.slice(0, 10) === today).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-4 sm:px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-text">Inscritos — Renacer Admin</h1>
          <p className="text-xs text-text-muted">Conectado como {role === 'ADMIN' ? 'Santiago (Admin)' : 'Clarena (Assistant)'}</p>
        </div>
        <button onClick={() => adminLogout()} className="text-xs text-text-muted hover:text-text">
          Cerrar sesión
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total inscritos', value: total },
            { label: 'Pendientes de pago', value: pendingPayment },
            { label: 'Pendientes de grupo', value: pendingGroup },
            { label: 'Inscritos hoy', value: enrolledToday },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border p-4">
              <p className="text-2xl font-semibold text-text">{stat.value}</p>
              <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs text-text-muted mb-1">Buscar</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nombre o teléfono"
              className="border rounded-lg px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Programa</label>
            <input value={programFilter} onChange={(e) => setProgramFilter(e.target.value)} placeholder="slug"
              className="border rounded-lg px-2 py-1.5 text-sm w-32" />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Pago</label>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="border rounded-lg px-2 py-1.5 text-sm">
              <option value="">Todos</option>
              <option value="UNKNOWN">Desconocido</option>
              <option value="PENDING">Pendiente</option>
              <option value="CONFIRMED">Confirmado</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Grupo WhatsApp</label>
            <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="border rounded-lg px-2 py-1.5 text-sm">
              <option value="">Todos</option>
              <option value="PENDING">Pendiente</option>
              <option value="ADDED">Agregado</option>
              <option value="NOT_APPLICABLE">No aplica</option>
            </select>
          </div>
          <button onClick={load} className="bg-primary text-white rounded-lg px-4 py-1.5 text-sm font-medium hover:opacity-90">
            Filtrar
          </button>
        </div>

        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-text-muted text-xs">
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Teléfono</th>
                <th className="px-3 py-2">Programa</th>
                <th className="px-3 py-2">Cohorte</th>
                <th className="px-3 py-2">Inscripción</th>
                <th className="px-3 py-2">Pago</th>
                <th className="px-3 py-2">Grupo WA</th>
                <th className="px-3 py-2">Automatización</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-text-muted">Cargando...</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-text-muted">Sin inscritos con estos filtros.</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.lead_id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-2">{r.full_name || '—'}</td>
                  <td className="px-3 py-2">{r.phone}</td>
                  <td className="px-3 py-2">{r.program_name}</td>
                  <td className="px-3 py-2">{r.cohort_start || '—'}</td>
                  <td className="px-3 py-2">{r.registered_at ? new Date(r.registered_at).toLocaleDateString('es-CO') : '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.payment_status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {r.payment_status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.whatsapp_group_status === 'ADDED' ? 'bg-green-100 text-green-700' : r.whatsapp_group_status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                      {r.whatsapp_group_status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => toggleField(r.lead_id, 'commercial_followups_enabled', !r.commercial_followups_enabled)}
                        className={`text-xs px-2 py-0.5 rounded-full w-fit ${r.commercial_followups_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                        title="Seguimientos comerciales"
                      >
                        Comercial {r.commercial_followups_enabled ? 'ON' : 'OFF'}
                      </button>
                      <button
                        onClick={() => toggleField(r.lead_id, 'operational_reminders_enabled', !r.operational_reminders_enabled)}
                        className={`text-xs px-2 py-0.5 rounded-full w-fit ${r.operational_reminders_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                        title="Recordatorios operativos"
                      >
                        Recordatorios {r.operational_reminders_enabled ? 'ON' : 'OFF'}
                      </button>
                      <button
                        onClick={() => toggleAiBlock(r.phone, r.full_name, r.ai_enabled)}
                        className={`text-xs px-2 py-0.5 rounded-full w-fit ${r.ai_enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        title="IA conversacional"
                      >
                        IA {r.ai_enabled ? 'ON' : 'OFF'}
                      </button>
                      {r.next_followup_at && (
                        <span className="text-[10px] text-text-muted">
                          Próximo: {new Date(r.next_followup_at).toLocaleDateString('es-CO')} ({r.next_followup_type})
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export default function AdminInscritosPage() {
  return <AdminLoginGate>{(role) => <AdminInscritosContent role={role} />}</AdminLoginGate>
}
