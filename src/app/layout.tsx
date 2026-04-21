import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agendamento Online | Barbearia Dom',
  description: 'Agende seu horário de forma rápida e fácil. Sem fila, sem espera.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
