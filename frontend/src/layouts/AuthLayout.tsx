
import type { ReactNode } from 'react'
import './auth-layout.css'

type AuthLayoutProps = {
  children: ReactNode
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-landscape" aria-hidden="true">
        <img
          src="/images/footer_login.png"
          alt=""
        />
      </div>

      <main className="auth-main">
        {children}
      </main>
    </div>
  )
}
