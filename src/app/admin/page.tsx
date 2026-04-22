'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, SERVICOS, BARBEIROS } from '@/lib/supabase'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Scissors, Calendar, Clock, User, Phone,
  CheckCircle, XCircle, RefreshCw, LogOut,
  TrendingUp, Users, DollarSign, AlertCircle,
  ChevronDown, Filter
} from 'lucide-react'

const SENHA_ADMIN = '1234' // Troque para uma senha sua!

type Agendamento = {
  id: string
  nome_cliente: string
  telefone: string
  servico: string
  data: string
  horario: string
  barbeiro: string
  status: 'pendente' | 'confirmado' | 'cancelado'
  created_at: string
}

export default function AdminPage() {
  const [logado, setLogado] = useState(false)
  const [senha, setSenha] = useState('')
  const [erroSenha, setErroSenha] = useState(false)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(false)
  const [filtroData, setFiltroData] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [filtroBarbeiro, setFiltroBarbeiro] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [atualizando, setAtualizando] = useState<string | null>(null)

  const fetchAgendamentos = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('agendamentos')
        .select('*')
        .eq('data', filtroData)
        .order('horario', { ascending: true })

      if (filtroBarbeiro !== 'todos') query = query.eq('barbeiro', filtroBarbeiro)
      if (filtroStatus !== 'todos') query = query.eq('status', filtroStatus)

      const { data, error } = await query
      if (!error && data) setAgendamentos(data)
    } finally {
      setLoading(false)
    }
  }, [filtroData, filtroBarbeiro, filtroStatus])

  useEffect(() => {
    if (logado) fetchAgendamentos()
  }, [logado, fetchAgendamentos])

  async function atualizarStatus(id: string, novoStatus: 'confirmado' | 'cancelado') {
    setAtualizando(id)
    try {
      await supabase.from('agendamentos').update({ status: novoStatus }).eq('id', id)
      setAgendamentos(prev =>
        prev.map(a => a.id === id ? { ...a, status: novoStatus } : a)
      )
    } finally {
      setAtualizando(null)
    }
  }

  function login() {
    if (senha === SENHA_ADMIN) {
      setLogado(true)
      setErroSenha(false)
    } else {
      setErroSenha(true)
    }
  }

  // Estatísticas do dia
  const total = agendamentos.length
  const confirmados = agendamentos.filter(a => a.status === 'confirmado').length
  const pendentes = agendamentos.filter(a => a.status === 'pendente').length
  const cancelados = agendamentos.filter(a => a.status === 'cancelado').length
  const faturamento = agendamentos
    .filter(a => a.status !== 'cancelado')
    .reduce((acc, a) => {
      const servico = SERVICOS.find(s => s.id === a.servico)
      return acc + (servico?.preco || 0)
    }, 0)

  const labelData = () => {
    const d = parseISO(filtroData)
    if (isToday(d)) return 'Hoje'
    if (isTomorrow(d)) return 'Amanhã'
    return format(d, "dd 'de' MMMM", { locale: ptBR })
  }

  if (!logado) {
    return (
      <div className="min-h-screen bg-barber-black bg-texture flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-barber-gold to-amber-700 flex items-center justify-center mx-auto mb-4">
              <Scissors size={28} className="text-barber-black" />
            </div>
            <h1 className="font-display text-3xl font-bold text-barber-white">Painel Admin</h1>
            <p className="text-gray-500 text-sm mt-2">
              {process.env.NEXT_PUBLIC_NOME_BARBEARIA || 'Barbearia Dom'}
            </p>
          </div>

          <div className="card-dark rounded-2xl p-6">
            <label className="text-xs uppercase tracking-widest text-barber-gold/60 mb-2 block">
              Senha de acesso
            </label>
            <input
              type="password"
              value={senha}
              onChange={e => { setSenha(e.target.value); setErroSenha(false) }}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="••••••"
              className="input-barber w-full px-4 py-3.5 rounded-xl text-sm mb-4"
              autoFocus
            />
            {erroSenha && (
              <p className="text-red-400 text-xs mb-3 flex items-center gap-1">
                <AlertCircle size={12} /> Senha incorreta
              </p>
            )}
            <button onClick={login} className="btn-gold w-full py-3.5 rounded-xl font-semibold">
              Entrar
            </button>
          </div>

          <p className="text-center text-xs text-gray-600 mt-4">
            Senha padrão: <span className="text-barber-gold">1234</span> — troque no código
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-barber-black bg-texture">
      {/* Header */}
      <header className="border-b border-barber-gold/10 px-4 py-4 sticky top-0 bg-barber-black/95 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-barber-gold to-amber-700 flex items-center justify-center">
              <Scissors size={16} className="text-barber-black" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-barber-white leading-none">
                Painel do Dono
              </h1>
              <p className="text-xs text-barber-gold/50 mt-0.5">
                {process.env.NEXT_PUBLIC_NOME_BARBEARIA || 'Barbearia Dom'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAgendamentos}
              className="p-2 rounded-lg border border-barber-steel text-gray-400 hover:text-barber-gold hover:border-barber-gold/40 transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setLogado(false)}
              className="p-2 rounded-lg border border-barber-steel text-gray-400 hover:text-red-400 hover:border-red-400/40 transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<Users size={18} />} label="Total" value={total} color="gold" />
          <StatCard icon={<CheckCircle size={18} />} label="Confirmados" value={confirmados} color="green" />
          <StatCard icon={<Clock size={18} />} label="Pendentes" value={pendentes} color="yellow" />
          <StatCard icon={<DollarSign size={18} />} label="Faturamento" value={`R$${faturamento}`} color="gold" />
        </div>

        {/* Filtros */}
        <div className="card-dark rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} className="text-barber-gold" />
            <span className="text-xs uppercase tracking-widest text-barber-gold/60">Filtros</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Data</label>
              <input
                type="date"
                value={filtroData}
                onChange={e => setFiltroData(e.target.value)}
                className="input-barber w-full px-3 py-2.5 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Barbeiro</label>
              <div className="relative">
                <select
                  value={filtroBarbeiro}
                  onChange={e => setFiltroBarbeiro(e.target.value)}
                  className="input-barber w-full px-3 py-2.5 rounded-lg text-sm appearance-none pr-8"
                >
                  <option value="todos">Todos</option>
                  {BARBEIROS.map(b => (
                    <option key={b.id} value={b.id}>{b.nome}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <div className="relative">
                <select
                  value={filtroStatus}
                  onChange={e => setFiltroStatus(e.target.value)}
                  className="input-barber w-full px-3 py-2.5 rounded-lg text-sm appearance-none pr-8"
                >
                  <option value="todos">Todos</option>
                  <option value="pendente">Pendentes</option>
                  <option value="confirmado">Confirmados</option>
                  <option value="cancelado">Cancelados</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de agendamentos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-barber-white flex items-center gap-2">
              <Calendar size={18} className="text-barber-gold" />
              {labelData()}
            </h2>
            <span className="text-xs text-gray-500">{total} agendamento{total !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-barber-gold/30 border-t-barber-gold rounded-full animate-spin" />
            </div>
          ) : agendamentos.length === 0 ? (
            <div className="card-dark rounded-2xl p-12 text-center">
              <Calendar size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum agendamento encontrado</p>
              <p className="text-gray-600 text-sm mt-1">Tente mudar os filtros</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agendamentos.map((ag, i) => {
                const servico = SERVICOS.find(s => s.id === ag.servico)
                const barbeiro = BARBEIROS.find(b => b.id === ag.barbeiro)
                const telefoneLink = `https://wa.me/55${ag.telefone.replace(/\D/g, '')}`

                return (
                  <div
                    key={ag.id}
                    className={`card-dark rounded-2xl p-4 animate-fade-up border-l-4 ${
                      ag.status === 'confirmado' ? 'border-l-green-500' :
                      ag.status === 'cancelado' ? 'border-l-red-500' :
                      'border-l-barber-gold'
                    }`}
                    style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards', opacity: 0 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Info principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-barber-gold font-bold text-lg font-display">
                            {ag.horario}
                          </span>
                          <StatusBadge status={ag.status} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          <InfoRow icon={<User size={12} />} value={ag.nome_cliente} />
                          <InfoRow icon={<Phone size={12} />} value={ag.telefone} link={telefoneLink} />
                          <InfoRow icon={<Scissors size={12} />} value={servico?.nome || ag.servico} extra={`R$${servico?.preco}`} />
                          <InfoRow icon={<Clock size={12} />} value={barbeiro?.nome || ag.barbeiro} />
                        </div>
                      </div>

                      {/* Ações */}
                      {ag.status === 'pendente' && (
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => atualizarStatus(ag.id, 'confirmado')}
                            disabled={atualizando === ag.id}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-all disabled:opacity-50"
                          >
                            <CheckCircle size={13} />
                            Confirmar
                          </button>
                          <button
                            onClick={() => atualizarStatus(ag.id, 'cancelado')}
                            disabled={atualizando === ag.id}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
                          >
                            <XCircle size={13} />
                            Cancelar
                          </button>
                        </div>
                      )}

                      {ag.status === 'confirmado' && (
                        <button
                          onClick={() => atualizarStatus(ag.id, 'cancelado')}
                          disabled={atualizando === ag.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all disabled:opacity-50 flex-shrink-0"
                        >
                          <XCircle size={13} />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Resumo do dia */}
        {agendamentos.length > 0 && (
          <div className="card-dark rounded-2xl p-5 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-barber-gold" />
              <h3 className="font-display font-bold text-barber-white">Resumo do dia</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold font-display text-green-400">{confirmados}</p>
                <p className="text-xs text-gray-500 mt-1">Confirmados</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-barber-gold">{pendentes}</p>
                <p className="text-xs text-gray-500 mt-1">Pendentes</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-barber-white">R${faturamento}</p>
                <p className="text-xs text-gray-500 mt-1">Previsão</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: number | string
  color: 'gold' | 'green' | 'yellow'
}) {
  const colors = {
    gold: 'text-barber-gold',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
  }
  return (
    <div className="card-dark rounded-xl p-4">
      <div className={`${colors[color]} mb-2`}>{icon}</div>
      <p className={`text-xl font-bold font-display ${colors[color]}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    pendente: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    confirmado: 'bg-green-400/10 text-green-400 border-green-400/20',
    cancelado: 'bg-red-400/10 text-red-400 border-red-400/20',
  }[status] || ''

  const labels = { pendente: 'Pendente', confirmado: 'Confirmado', cancelado: 'Cancelado' }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${config}`}>
      {labels[status as keyof typeof labels]}
    </span>
  )
}

function InfoRow({ icon, value, extra, link }: {
  icon: React.ReactNode
  value: string
  extra?: string
  link?: string
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-400">
      <span className="text-gray-600 flex-shrink-0">{icon}</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="hover:text-green-400 transition-colors truncate">
          {value}
        </a>
      ) : (
        <span className="truncate">{value}</span>
      )}
      {extra && <span className="text-barber-gold font-medium flex-shrink-0">{extra}</span>}
    </div>
  )
}
