import type { ReactNode } from 'react'
import AppNavbar from '../components/layout/AppNavbar'
import AppFooter from '../components/layout/AppFooter'

type AppLayoutProps = {
  children: ReactNode
  userName?: string
}

export default function AppLayout({
  children,
  userName,
}: AppLayoutProps) {
  return (
    <div className="app-layout">
      <AppNavbar userName={userName} />

      <main className="app-main">
        {children}
      </main>

      <AppFooter />
    </div>
  )
}