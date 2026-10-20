
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import AuthLayout from './layouts/AuthLayout'
import LoginPage from './pages/LoginPage'
import TautanResetPasswordPage from './pages/TautanResetPasswordPage'

const isLoginPreview =
  new URLSearchParams(window.location.search).get('view') === 'login'

const PreviewPage = isLoginPreview
  ? LoginPage
  : TautanResetPasswordPage

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthLayout>
      <PreviewPage />
    </AuthLayout>
  </StrictMode>,
)
