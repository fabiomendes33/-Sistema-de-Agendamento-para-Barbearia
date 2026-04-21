'use client'

import { useState, useEffect } from 'react'
import { SERVICOS, BARBEIROS, HORARIOS } from '@/lib/supabase'
import { format, addDays, isSunday, isToday, isPast, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Scissors, Clock, User, Calendar, CheckCircle, ChevronRight, Phone, Star } from 'lucide-react'

type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
  servico: string
  barbeiro: string
  data: Date | null
  horario: string
  nome_cliente: string
  telefone: string
}

export default function BarbeariaPage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>({
    servico: '',
    barbeiro: '',
    data: null,
    horario: '',
    nome_cliente: '',
    telefone: '',
  })
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Gerar próximos 14 dias (exceto domingo)
  const diasDisponiveis = Array.from({ length: 21 }, (_, i) => addDays(new Date(), i + 1))
    .filter(d => !isSunday(d))
    .slice(0, 14)

  // Buscar horários ocupados quando data/barbeiro mudar
  useEffect(() => {
    if (form.data && form.barbeiro) {
      fetchHorariosOcupados()
    }
  }, [form.data, form.barbeiro])

  async function fetchHorariosOcupados() {
    if (!form.data || !form.barbeiro) return
    try {
      const dataStr = format(form.data, 'yyyy-MM-dd')
      const res = await fetch(`/api/agendamentos?data=${dataStr}&barbeiro=${form.barbeiro}`)
      const json = await res.json()
      setHorariosOcupados(json.agendamentos?.map((a: { horario: string }) => a.horario) || [])
    } catch {
      setHorariosOcupados([])
    }
  }

  async function confirmarAgendamento() {
    if (!form.data) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_cliente: form.nome_cliente,
          telefone: form.telefone,
          servico: form.servico,
          data: format(form.data, 'yyyy-MM-dd'),
          horario: form.horario,
          barbeiro: form.barbeiro,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setSuccess(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao agendar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const servicoSelecionado = SERVICOS.find(s => s.id === form.servico)
  const barbeiroSelecionado = BARBEIROS.find(b => b.id === form.barbeiro)

  const steps = [
    { num: 1, label: 'Serviço' },
    { num: 2, label: 'Barbeiro' },
    { num: 3, label: 'Data & Hora' },
    { num: 4, label: 'Seus Dados' },
    { num: 5, label: 'Confirmar' },
  ]

  if (success) {
    return <SuccessScreen form={form} servico={servicoSelecionado} barbeiro={barbeiroSelecionado} onNew={() => { setSuccess(false); setStep(1); setForm({ servico: '', barbeiro: '', data: null, horario: '', nome_cliente: '', telefone: '' }) }} />
  }

  return (
    <div className="min-h-screen bg-barber-black bg-texture">
      {/* Header */}
      <header className="border-b border-barber-gold/10 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-barber-gold to-amber-700 flex items-center justify-center">
              <Scissors size={18} className="text-barber-black" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-none text-barber-white">
                {process.env.NEXT_PUBLIC_NOME_BARBEARIA || 'Barbearia Dom'}
              </h1>
              <p className="text-xs text-barber-gold/60 mt-0.5">Agendamento Online</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={12} className="fill-barber-gold text-barber-gold" />
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-10 animate-fade-up" style={{animationFillMode:'forwards'}}>
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step === s.num ? 'step-active' :
                  step > s.num ? 'step-done' : 'step-pending'
                }`}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className={`text-[10px] font-medium hidden sm:block ${step >= s.num ? 'text-barber-gold' : 'text-gray-600'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-8 sm:w-16 mx-1 mb-4 transition-all duration-500 ${step > s.num ? 'bg-barber-gold' : 'bg-gray-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Escolher serviço */}
        {step === 1 && (
          <div className="animate-fade-up" style={{animationFillMode:'forwards'}}>
            <h2 className="font-display text-3xl font-bold mb-2 gold-line">
              Qual serviço?
            </h2>
            <p className="text-gray-500 text-sm mb-8 mt-4">Escolha o serviço que deseja realizar</p>
            <div className="grid gap-3">
              {SERVICOS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => { setForm(f => ({ ...f, servico: s.id })); setStep(2) }}
                  className={`card-dark rounded-xl p-5 text-left flex items-center justify-between group animate-fade-up`}
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards', opacity: 0 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-barber-steel flex items-center justify-center group-hover:bg-barber-gold/20 transition-colors">
                      <Scissors size={18} className="text-barber-gold" />
                    </div>
                    <div>
                      <p className="font-semibold text-barber-white">{s.nome}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {s.duracao} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-barber-gold font-bold text-lg">R$ {s.preco}</span>
                    <ChevronRight size={18} className="text-gray-600 group-hover:text-barber-gold transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Escolher barbeiro */}
        {step === 2 && (
          <div className="animate-fade-up" style={{animationFillMode:'forwards'}}>
            <button onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-barber-gold mb-6 flex items-center gap-1 transition-colors">
              ← Voltar
            </button>
            <h2 className="font-display text-3xl font-bold mb-2 gold-line">
              Escolha o barbeiro
            </h2>
            <p className="text-gray-500 text-sm mb-8 mt-4">Com quem prefere ser atendido?</p>
            <div className="grid gap-3">
              {BARBEIROS.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => { setForm(f => ({ ...f, barbeiro: b.id })); setStep(3) }}
                  className={`card-dark rounded-xl p-5 text-left flex items-center justify-between group animate-fade-up`}
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards', opacity: 0 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-barber-steel to-barber-charcoal border border-barber-gold/20 flex items-center justify-center text-lg font-bold text-barber-gold">
                      {b.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-barber-white">{b.nome}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={10} className="fill-barber-gold text-barber-gold" />)}
                        <span className="text-xs text-gray-500 ml-1">5.0</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-600 group-hover:text-barber-gold transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Data e hora */}
        {step === 3 && (
          <div className="animate-fade-up" style={{animationFillMode:'forwards'}}>
            <button onClick={() => setStep(2)} className="text-xs text-gray-500 hover:text-barber-gold mb-6 flex items-center gap-1 transition-colors">
              ← Voltar
            </button>
            <h2 className="font-display text-3xl font-bold mb-2 gold-line">
              Quando?
            </h2>
            <p className="text-gray-500 text-sm mb-8 mt-4">Escolha a data e o horário</p>

            {/* Seleção de data */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-barber-gold/60 mb-3 flex items-center gap-2">
                <Calendar size={12} /> Data
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {diasDisponiveis.map((dia, i) => (
                  <button
                    key={i}
                    onClick={() => setForm(f => ({ ...f, data: dia, horario: '' }))}
                    className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl border transition-all duration-200 min-w-[60px] ${
                      form.data && format(form.data, 'yyyy-MM-dd') === format(dia, 'yyyy-MM-dd')
                        ? 'bg-gradient-to-b from-barber-gold to-amber-700 border-transparent text-barber-black'
                        : 'border-barber-steel text-gray-400 hover:border-barber-gold/40'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-medium">
                      {format(dia, 'EEE', { locale: ptBR })}
                    </span>
                    <span className="text-xl font-bold font-display">{format(dia, 'd')}</span>
                    <span className="text-[10px]">{format(dia, 'MMM', { locale: ptBR })}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Seleção de horário */}
            {form.data && (
              <div className="animate-fade-in" style={{animationFillMode:'forwards'}}>
                <p className="text-xs uppercase tracking-widest text-barber-gold/60 mb-3 flex items-center gap-2">
                  <Clock size={12} /> Horário disponível
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {HORARIOS.map((h) => {
                    const ocupado = horariosOcupados.includes(h)
                    return (
                      <button
                        key={h}
                        onClick={() => !ocupado && setForm(f => ({ ...f, horario: h }))}
                        disabled={ocupado}
                        className={`horario-btn rounded-lg py-2.5 text-sm font-medium ${form.horario === h ? 'selected' : ''}`}
                      >
                        {h}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {form.data && form.horario && (
              <button
                onClick={() => setStep(4)}
                className="btn-gold w-full mt-8 py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight size={18} />
              </button>
            )}
          </div>
        )}

        {/* Step 4: Dados pessoais */}
        {step === 4 && (
          <div className="animate-fade-up" style={{animationFillMode:'forwards'}}>
            <button onClick={() => setStep(3)} className="text-xs text-gray-500 hover:text-barber-gold mb-6 flex items-center gap-1 transition-colors">
              ← Voltar
            </button>
            <h2 className="font-display text-3xl font-bold mb-2 gold-line">
              Seus dados
            </h2>
            <p className="text-gray-500 text-sm mb-8 mt-4">Para confirmarmos seu agendamento</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-barber-gold/60 mb-2 flex items-center gap-2">
                  <User size={12} /> Nome completo
                </label>
                <input
                  type="text"
                  value={form.nome_cliente}
                  onChange={e => setForm(f => ({ ...f, nome_cliente: e.target.value }))}
                  placeholder="Seu nome"
                  className="input-barber w-full px-4 py-3.5 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-barber-gold/60 mb-2 flex items-center gap-2">
                  <Phone size={12} /> WhatsApp
                </label>
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                  placeholder="(00) 99999-0000"
                  className="input-barber w-full px-4 py-3.5 rounded-xl text-sm"
                />
              </div>
            </div>

            <button
              onClick={() => form.nome_cliente && form.telefone && setStep(5)}
              disabled={!form.nome_cliente || !form.telefone}
              className="btn-gold w-full mt-8 py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Revisar agendamento <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 5: Confirmação */}
        {step === 5 && (
          <div className="animate-fade-up" style={{animationFillMode:'forwards'}}>
            <button onClick={() => setStep(4)} className="text-xs text-gray-500 hover:text-barber-gold mb-6 flex items-center gap-1 transition-colors">
              ← Voltar
            </button>
            <h2 className="font-display text-3xl font-bold mb-2 gold-line">
              Confirmar
            </h2>
            <p className="text-gray-500 text-sm mb-8 mt-4">Revise os dados antes de finalizar</p>

            <div className="card-dark rounded-2xl p-6 space-y-4 mb-6">
              <SummaryRow icon={<Scissors size={15} />} label="Serviço" value={servicoSelecionado?.nome || ''} extra={`R$ ${servicoSelecionado?.preco}`} />
              <div className="h-px bg-barber-steel" />
              <SummaryRow icon={<User size={15} />} label="Barbeiro" value={barbeiroSelecionado?.nome || ''} />
              <div className="h-px bg-barber-steel" />
              <SummaryRow icon={<Calendar size={15} />} label="Data" value={form.data ? format(form.data, "EEEE, d 'de' MMMM", { locale: ptBR }) : ''} />
              <div className="h-px bg-barber-steel" />
              <SummaryRow icon={<Clock size={15} />} label="Horário" value={form.horario} extra={`${servicoSelecionado?.duracao} min`} />
              <div className="h-px bg-barber-steel" />
              <SummaryRow icon={<User size={15} />} label="Nome" value={form.nome_cliente} />
              <div className="h-px bg-barber-steel" />
              <SummaryRow icon={<Phone size={15} />} label="WhatsApp" value={form.telefone} />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <button
              onClick={confirmarAgendamento}
              disabled={loading}
              className="btn-gold w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-barber-black/30 border-t-barber-black rounded-full animate-spin" />
                  Confirmando...
                </span>
              ) : (
                <>
                  <CheckCircle size={18} /> Confirmar Agendamento
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

function SummaryRow({ icon, label, value, extra }: { icon: React.ReactNode, label: string, value: string, extra?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-right">
        <span className="text-barber-white text-sm font-medium capitalize">{value}</span>
        {extra && <span className="text-barber-gold text-xs ml-2">{extra}</span>}
      </div>
    </div>
  )
}

function SuccessScreen({ form, servico, barbeiro, onNew }: { 
  form: FormData, 
  servico: typeof SERVICOS[0] | undefined,
  barbeiro: typeof BARBEIROS[0] | undefined,
  onNew: () => void 
}) {
  return (
    <div className="min-h-screen bg-barber-black bg-texture flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-barber-gold to-amber-700 flex items-center justify-center mx-auto mb-6 animate-fade-up" style={{animationFillMode:'forwards'}}>
          <CheckCircle size={36} className="text-barber-black" />
        </div>

        <h2 className="font-display text-4xl font-bold mb-3 animate-fade-up animate-delay-100" style={{animationFillMode:'forwards'}}>
          Agendado!
        </h2>
        <p className="text-gray-500 mb-8 animate-fade-up animate-delay-200" style={{animationFillMode:'forwards'}}>
          Até lá, {form.nome_cliente.split(' ')[0]}! Seu horário está reservado.
        </p>

        <div className="card-dark rounded-2xl p-6 text-left space-y-3 mb-8 animate-fade-up animate-delay-300" style={{animationFillMode:'forwards'}}>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Serviço</span>
            <span className="text-barber-white font-medium">{servico?.nome}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Barbeiro</span>
            <span className="text-barber-white font-medium">{barbeiro?.nome}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Data</span>
            <span className="text-barber-white font-medium capitalize">
              {form.data ? format(form.data, "d 'de' MMMM", { locale: ptBR }) : ''}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Horário</span>
            <span className="text-barber-gold font-bold text-lg">{form.horario}</span>
          </div>
        </div>

        <p className="text-xs text-gray-600 mb-6 animate-fade-up animate-delay-400" style={{animationFillMode:'forwards'}}>
          Cancelamentos com até 2h de antecedência pelo WhatsApp
        </p>

        <button
          onClick={onNew}
          className="btn-gold w-full py-4 rounded-xl font-semibold animate-fade-up animate-delay-500"
          style={{animationFillMode:'forwards'}}
        >
          Fazer novo agendamento
        </button>
      </div>
    </div>
  )
}
