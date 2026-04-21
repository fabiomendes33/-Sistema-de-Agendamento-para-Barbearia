import { NextRequest, NextResponse } from 'next/server'
import { supabase, Agendamento } from '@/lib/supabase'

// GET - buscar agendamentos de uma data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const data = searchParams.get('data')
  const barbeiro = searchParams.get('barbeiro')

  if (!data) {
    return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 })
  }

  let query = supabase
    .from('agendamentos')
    .select('horario, barbeiro')
    .eq('data', data)
    .neq('status', 'cancelado')

  if (barbeiro) {
    query = query.eq('barbeiro', barbeiro)
  }

  const { data: agendamentos, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ agendamentos })
}

// POST - criar novo agendamento
export async function POST(request: NextRequest) {
  try {
    const body: Agendamento = await request.json()

    // Validação básica
    if (!body.nome_cliente || !body.telefone || !body.servico || !body.data || !body.horario || !body.barbeiro) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    // Verificar se horário já está ocupado
    const { data: existente } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('data', body.data)
      .eq('horario', body.horario)
      .eq('barbeiro', body.barbeiro)
      .neq('status', 'cancelado')
      .single()

    if (existente) {
      return NextResponse.json({ error: 'Horário já ocupado. Escolha outro.' }, { status: 409 })
    }

    const { data: agendamento, error } = await supabase
      .from('agendamentos')
      .insert([{ ...body, status: 'pendente' }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ agendamento, mensagem: 'Agendamento realizado com sucesso!' })
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
