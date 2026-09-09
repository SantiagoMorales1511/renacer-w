import { useEffect, useRef, useState } from 'react'
import AdminLoginGate, { adminLogout } from '../components/AdminLoginGate'

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

interface PendingItem {
  kind: 'HANDOFF' | 'HUMAN_TASK' | 'AGENT_QUESTION' | 'PROPOSAL'
  ref_id: string
  contact_name: string | null
  phone: string | null
  detail: string | null
  created_at: string
}

interface Proposal {
  id: string
  proposal_type: string
  proposed_payload: unknown
  reason: string | null
  status: string
  created_at: string
  contact_name: string | null
  phone: string | null
  program_name: string | null
  cohort_start: string | null
}

const KIND_LABELS: Record<PendingItem['kind'], string> = {
  HANDOFF: 'Handoff pendiente',
  HUMAN_TASK: 'Tarea pendiente',
  AGENT_QUESTION: 'Pregunta de la IA',
  PROPOSAL: 'Propuesta pendiente',
}

function AdminAsistenteContent({ role }: { role: 'ADMIN' | 'ASSISTANT' }) {
  const [tab, setTab] = useState<'chat' | 'pending' | 'proposals'>('chat')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingItem[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loadingPanel, setLoadingPanel] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text }])
    setSending(true)
    try {
      const res = await fetch('/api/admin-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_text: text, conversation_id: conversationId }),
      })
      const data = await res.json()
      if (data.conversation_id) setConversationId(data.conversation_id)
      setMessages((m) => [...m, { role: 'assistant', text: data.reply_text || data.error || 'Sin respuesta' }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'Error de red al enviar el mensaje.' }])
    }
    setSending(false)
  }

  const loadPending = async () => {
    setLoadingPanel(true)
    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PENDING_PANEL' }),
      })
      const data = await res.json()
      setPending(data.results || [])
    } catch {
      setPending([])
    }
    setLoadingPanel(false)
  }

  const loadProposals = async () => {
    setLoadingPanel(true)
    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PROPOSALS_LIST' }),
      })
      const data = await res.json()
      setProposals(data.results || [])
    } catch {
      setProposals([])
    }
    setLoadingPanel(false)
  }

  useEffect(() => {
    if (tab === 'pending') loadPending()
    if (tab === 'proposals') loadProposals()
  }, [tab])

  const resolveProposal = async (id: string, decision: 'APPROVE' | 'REJECT') => {
    await fetch('/api/admin-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'PROPOSAL_RESOLVE', proposal_id: id, decision }),
    })
    loadProposals()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-4 sm:px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-text">Asistente IA — Renacer Admin</h1>
          <p className="text-xs text-text-muted">Conectado como {role === 'ADMIN' ? 'Santiago (Admin)' : 'Clarena (Assistant)'}</p>
        </div>
        <button onClick={() => adminLogout()} className="text-xs text-text-muted hover:text-text">
          Cerrar sesión
        </button>
      </header>

      <nav className="flex gap-1 px-4 sm:px-6 pt-3 border-b bg-white">
        {(['chat', 'pending', 'proposals'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm rounded-t-lg ${tab === t ? 'bg-gray-50 font-medium text-text border border-b-0' : 'text-text-muted hover:text-text'}`}
          >
            {t === 'chat' ? 'Chat' : t === 'pending' ? 'Pendientes' : 'Propuestas'}
          </button>
        ))}
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {tab === 'chat' && (
          <div className="bg-white rounded-2xl shadow-sm border flex flex-col h-[70vh]">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-sm text-text-muted">Escribe algo como "¿cuántos inscritos hay para el 19?" o cuéntame información operativa.</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                      m.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-text'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe un mensaje..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={sending}
                className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-40"
              >
                Enviar
              </button>
            </div>
          </div>
        )}

        {tab === 'pending' && (
          <div className="space-y-3">
            {loadingPanel && <p className="text-sm text-text-muted">Cargando...</p>}
            {!loadingPanel && pending.length === 0 && <p className="text-sm text-text-muted">Sin pendientes.</p>}
            {pending.map((item) => (
              <div key={item.ref_id} className="bg-white rounded-xl border p-4 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-primary">{KIND_LABELS[item.kind]}</span>
                  <span className="text-xs text-text-muted">{new Date(item.created_at).toLocaleString('es-CO')}</span>
                </div>
                <p className="text-text">{item.contact_name || 'Sin nombre'} — {item.phone}</p>
                {item.detail && <p className="text-text-muted mt-1">{item.detail}</p>}
              </div>
            ))}
          </div>
        )}

        {tab === 'proposals' && (
          <div className="space-y-3">
            {loadingPanel && <p className="text-sm text-text-muted">Cargando...</p>}
            {!loadingPanel && proposals.length === 0 && <p className="text-sm text-text-muted">Sin propuestas pendientes.</p>}
            {proposals.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border p-4 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary">{p.proposal_type}</span>
                  <span className="text-xs text-text-muted">{new Date(p.created_at).toLocaleString('es-CO')}</span>
                </div>
                <p className="text-text">{p.contact_name || 'Sin nombre'} — {p.phone}</p>
                {p.program_name && <p className="text-text-muted">{p.program_name} {p.cohort_start ? `· ${p.cohort_start}` : ''}</p>}
                {p.reason && <p className="text-text-muted italic">"{p.reason}"</p>}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => resolveProposal(p.id, 'APPROVE')}
                    className="bg-green-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:opacity-90"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => resolveProposal(p.id, 'REJECT')}
                    className="bg-gray-200 text-text rounded-lg px-3 py-1.5 text-xs font-medium hover:opacity-90"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function AdminAsistentePage() {
  return <AdminLoginGate>{(role) => <AdminAsistenteContent role={role} />}</AdminLoginGate>
}
