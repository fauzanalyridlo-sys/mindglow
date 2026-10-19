import '../styles/auth-email.css'
import { useState } from 'react'
import type { FormEvent } from 'react'
import AuthCard from '../components/auth/AuthCard'

export default function KonfirmasiEmailPage() {
  const [email, setEmail] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // TODO: Hubungkan ke Laravel API setelah endpoint tersedia.
    // Belum mengirim email atau membuat proses reset palsu.
  }

  return (
    <AuthCard variant="email">
      <div className="auth-email">
        <header className="auth-email-header">
          <h1>Konfirmasi Email</h1>
          <p>
            Silakan verifikasi email kamu untuk melanjutkan.
          </p>
        </header>

        <form className="auth-email-form" onSubmit={handleSubmit}>
          <div className="auth-email-field">
            <label htmlFor="reset-email">Email</label>
            <input
              id="reset-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Masukkan email kamu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <button className="auth-email-submit" type="submit">
            Kirim Tautan Reset
          </button>
        </form>

        <div className="auth-email-footer">
          <a href="/login">Kembali ke login</a>
        </div>
      </div>
    </AuthCard>
  )
}
