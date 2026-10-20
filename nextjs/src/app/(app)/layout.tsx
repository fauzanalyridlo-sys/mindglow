import type { ReactNode } from 'react'

import AppNavbar from '@/components/layout/AppNavbar'
import AppFooter from '@/components/layout/AppFooter'

export default function AppRouteLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="app-layout">
      <AppNavbar />

      <main className="app-main">
        {children}
      </main>

      <AppFooter />
    </div>
  )
}