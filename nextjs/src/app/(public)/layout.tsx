import type { ReactNode } from 'react'

import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'
import '@/styles/landing-animation.css'

export default function PublicLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      <PublicNavbar />
      <main id="top">{children}</main>
      <PublicFooter />
    </>
  )
}