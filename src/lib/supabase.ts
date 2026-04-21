import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      '❌ Faltam as variáveis do Supabase!\n' +
      'Crie o arquivo .env.local na raiz do projeto com:\n' +
      'NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...'
    )
  }

  return createClient(url, key)
}

export const supabase = getSupabaseClient()

export type Agendamento = {
  id?: string
  nome_cliente: string
  telefone: string
  servico: string
  data: string
  horario: string
  barbeiro: string
  status?: 'pendente' | 'confirmado' | 'cancelado'
  created_at?: string
}

export const SERVICOS = [
  { id: 'corte', nome: 'Corte de Cabelo', duracao: 30, preco: 35 },
  { id: 'barba', nome: 'Barba', duracao: 20, preco: 25 },
  { id: 'corte_barba', nome: 'Corte + Barba', duracao: 50, preco: 55 },
  { id: 'pigmentacao', nome: 'Pigmentação', duracao: 60, preco: 80 },
  { id: 'sobrancelha', nome: 'Sobrancelha', duracao: 15, preco: 15 },
]

export const BARBEIROS = [
  { id: 'joao', nome: 'João Silva' },
  { id: 'pedro', nome: 'Pedro Santos' },
  { id: 'marcos', nome: 'Marcos Lima' },
]

export const HORARIOS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00'
]
