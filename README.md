# ✂️ Sistema de Agendamento para Barbearia

> Micro-SaaS feito com Next.js + Supabase + Tailwind CSS

---

## 🚀 Como rodar no seu computador

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados (Supabase - GRÁTIS)

1. Acesse https://supabase.com e crie uma conta gratuita
2. Crie um novo projeto
3. Vá em **SQL Editor** e cole o conteúdo do arquivo `supabase-schema.sql`
4. Execute o SQL
5. Vá em **Settings > API** e copie a URL e a anon key

### 3. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Abra o `.env.local` e preencha com seus dados do Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_NOME_BARBEARIA=Barbearia Dom
NEXT_PUBLIC_TELEFONE_BARBEARIA=(38) 99999-0000
```

### 4. Rodar o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🎨 Personalização

### Trocar nome da barbearia

No arquivo `.env.local`:

```
NEXT_PUBLIC_NOME_BARBEARIA=Nome da Sua Barbearia
```

### Adicionar/remover serviços

Edite o arquivo `src/lib/supabase.ts`:

```ts
export const SERVICOS = [
  { id: "corte", nome: "Corte de Cabelo", duracao: 30, preco: 35 },
  // Adicione mais aqui...
];
```

### Adicionar/remover barbeiros

No mesmo arquivo:

```ts
export const BARBEIROS = [
  { id: "joao", nome: "João Silva" },
  // Adicione mais aqui...
];
```

### Trocar horários disponíveis

```ts
export const HORARIOS = [
  "08:00",
  "08:30",
  "09:00",
  // Edite conforme o horário da barbearia
];
```

---

## 📦 Deploy (publicar online - GRÁTIS)

### Vercel (recomendado)

1. Acesse https://vercel.com e crie uma conta
2. Conecte com seu GitHub e faça upload do projeto
3. Configure as variáveis de ambiente no painel da Vercel
4. Deploy automático!

---

## 💰 Como monetizar

- **Plano Básico**: R$ 79/mês — 1 barbeiro
- **Plano Pro**: R$ 149/mês — vários barbeiros + relatórios
- **10 clientes** no plano básico = **R$ 790/mês** de renda passiva

### Próximas funcionalidades para agregar valor:

- [ ] Painel admin para o dono ver agendamentos
- [ ] Notificação por WhatsApp (API Z-API ou WPPConnect)
- [ ] Relatórios de faturamento
- [ ] Sistema de fidelidade
- [ ] Pagamento online
- [ ] Múltiplas barbearias (multitenancy)

---

## 🛠 Stack técnica

- **Frontend**: Next.js 14 + React + TypeScript
- **Estilo**: Tailwind CSS
- **Banco de dados**: Supabase (PostgreSQL)
- **Deploy**: Vercel
- **Fontes**: Playfair Display + DM Sans

---

Construído com 💛 para ser simples, bonito e rentável.
