
import '../../styles/auth-card.css'
import type { ReactNode } from 'react'

type AuthCardProps = {
  children: ReactNode
  variant?: 'login' | 'email' | 'new-password' | 'confirmation'
}

export default function AuthCard({
  children,
  variant = 'login',
}: AuthCardProps) {
  return (
    <section className={`auth-card auth-card--${variant}`}>
      {children}
    </section>
  )
}
