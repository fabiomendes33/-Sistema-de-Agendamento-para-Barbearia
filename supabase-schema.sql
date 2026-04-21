-- Execute este SQL no Supabase SQL Editor
-- Acesse: https://app.supabase.com -> seu projeto -> SQL Editor

CREATE TABLE agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_cliente TEXT NOT NULL,
  telefone TEXT NOT NULL,
  servico TEXT NOT NULL,
  data DATE NOT NULL,
  horario TEXT NOT NULL,
  barbeiro TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permite leitura e escrita pública (para o MVP)
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir insert público" ON agendamentos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir select público" ON agendamentos
  FOR SELECT USING (true);

CREATE POLICY "Permitir update público" ON agendamentos
  FOR UPDATE USING (true);
