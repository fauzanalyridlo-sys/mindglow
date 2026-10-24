'use client'

import type { ReactNode } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'

type GoogleAuthProviderProps = {
  children: ReactNode
}

export default function GoogleAuthProvider({
  children,
}: GoogleAuthProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!clientId) {
    console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID belum dikonfigurasi.')
    return <>{children}</>
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  )
}
