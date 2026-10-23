import type { ReactNode } from 'react'
import AuthLayout from '@/layouts/AuthLayout'
import GoogleAuthProvider from '@/components/auth/GoogleAuthProvider'

export default function AuthRouteLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <GoogleAuthProvider>
      <AuthLayout>{children}</AuthLayout>
    </GoogleAuthProvider>
  )
}
