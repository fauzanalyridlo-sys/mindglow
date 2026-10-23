'use client'

import '../styles/auth-email.css'
import { useState } from 'react'
import type { FormEvent } from 'react'
import AuthCard from '../components/auth/AuthCard'

export default function KonfirmasiEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Permintaan gagal. Silakan coba lagi.')
        return
      }

      setMessage(
        data.message ||
          'Jika email terdaftar, instruksi reset password akan dikirim. Periksa kotak masuk email kamu.'
      )
    } catch {
      setError(
        'Tidak dapat terhubung ke server. Periksa koneksi dan coba lagi.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard variant="email">
      <div className="auth-email">
        <header className="auth-email-header">
          <h1>Lupa Password?</h1>
          <p>
            Masukkan email akun MindGlow kamu. Kami akan mengirimkan
            tautan untuk mengatur ulang password jika email terdaftar.
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
              maxLength={255}
              required
              disabled={loading}
            />
          </div>

          {message && (
            <p role="status" aria-live="polite">
              {message}
            </p>
          )}

          {error && (
            <p role="alert">
              {error}
            </p>
          )}

          <button
            className="auth-email-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
          </button>
        </form>

        <div className="auth-email-footer">
          <a href="/login">Kembali ke login</a>
        </div>
      </div>
    </AuthCard>
  )
}
