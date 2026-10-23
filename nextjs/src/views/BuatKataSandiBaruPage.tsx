'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import AuthCard from '../components/auth/AuthCard'
import '../styles/auth-new-password.css'

export default function BuatKataSandiBaruPage() {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password.length < 8) {
      setError('Kata sandi minimal 8 karakter.')
      return
    }

    if (password.length > 72) {
      setError('Kata sandi maksimal 72 karakter.')
      return
    }

    if (password !== confirmation) {
      setError('Konfirmasi kata sandi tidak cocok.')
      return
    }

    const token = new URLSearchParams(window.location.search).get('token')

    if (!token) {
      setError(
        'Token reset tidak ditemukan. Silakan minta tautan reset password yang baru.'
      )
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
          confirmPassword: confirmation,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.message ||
            'Password gagal diubah. Silakan periksa tautan dan coba lagi.'
        )
        return
      }

      setSuccess(true)
      setMessage(data.message || 'Password berhasil direset. Silakan login kembali.')
      setPassword('')
      setConfirmation('')
    } catch {
      setError('Tidak dapat terhubung ke server. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard variant="new-password">
      <div className="auth-new-password">
        <h1>Buat Kata Sandi Baru</h1>
        <p>Masukkan kata sandi baru untuk akun MindGlow kamu.</p>

        {success ? (
          <>
            <p role="status">{message}</p>
            <a href="/login">Login dengan kata sandi baru</a>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="new-password">Kata Sandi Baru</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              maxLength={72}
              required
              disabled={loading}
            />

            <label htmlFor="confirm-password">Konfirmasi Kata Sandi</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              maxLength={72}
              required
              disabled={loading}
            />

            {error && (
              <p role="alert" className="auth-new-password-error">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Kata Sandi'}
            </button>
          </form>
        )}

        {!success && <a href="/login">Kembali ke Login</a>}
      </div>
    </AuthCard>
  )
}
