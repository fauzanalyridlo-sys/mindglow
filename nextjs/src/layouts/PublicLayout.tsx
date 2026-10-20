import type { ReactNode } from 'react'

import PublicNavbar from '../components/layout/PublicNavbar'
import PublicFooter from '../components/layout/PublicFooter'

type PublicLayoutProps = {
  children: ReactNode
}

export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <>
      <PublicNavbar />

      <main id="top">
        {children}
      </main>

      <PublicFooter />
    </>
  )
}