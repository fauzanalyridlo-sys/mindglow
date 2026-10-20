
import AuthCard from '../components/auth/AuthCard'
import '../styles/auth-reset-confirmation.css'

export default function TautanResetPasswordPage() {
  return (
    <AuthCard variant="confirmation">
      <div className="auth-reset-confirmation">
        <header className="auth-reset-confirmation-header">
          <h1>
            Kami sudah mengirim tautan reset password
          </h1>

          <p>
            Cek email Anda atau folder spam untuk melanjutkan.
          </p>
        </header>

        <a
          className="auth-reset-confirmation-button"
          href="/auth-preview.html?view=login"
        >
          Kembali ke login
        </a>
      </div>
    </AuthCard>
  )
}
