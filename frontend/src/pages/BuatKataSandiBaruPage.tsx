import { useState } from 'react'
import type { FormEvent } from 'react'
import AuthCard from '../components/auth/AuthCard'
import '../styles/auth-new-password.css'

export default function BuatKataSandiBaruPage() {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password.length < 8) {
      setError('Kata sandi minimal 8 karakter.')
      return
    }

    if (password !== confirmation) {
      setError('Konfirmasi kata sandi tidak cocok.')
      return
    }

    setError('Fitur penyimpanan kata sandi belum terhubung ke server.')
  }

  return (
    <AuthCard variant="new-password">
      <div className="auth-new-password">
        <h1>Buat Kata Sandi Baru</h1>
        <p>Masukkan kata sandi baru untuk akunmu.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="new-password">Kata Sandi Baru</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <label htmlFor="confirm-password">Konfirmasi Kata Sandi</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            required
          />

          {error && <p role="alert" className="auth-new-password-error">{error}</p>}

          <button type="submit">Simpan Kata Sandi</button>
        </form>

        <a href="/login">Kembali ke Login</a>
      </div>
    </AuthCard>
  )
}
