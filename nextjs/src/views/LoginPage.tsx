'use client'
import '../styles/login-page.css'
import { useState } from 'react'
import type { FormEvent } from 'react'
import AuthCard from '../components/auth/AuthCard'

export default function LoginPage() {
  const [emailUsername, setEmailUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emptyError, setEmptyError] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!emailUsername.trim() || !password) {
      setEmptyError(true)
      return
    }

    setEmptyError(false)

    // TODO: Hubungkan ke Laravel API setelah endpoint backend tersedia.
    // Tidak ada pemeriksaan kredensial palsu di frontend.
  }

  return (
    <AuthCard variant="login">
      <div className="auth-login">
        <header className="auth-login-header">
          {emptyError ? (
            <>
              <h1 className="auth-login-title">
                Login tidak berhasil
              </h1>
              <p className="auth-login-error">
                Sepertinya email/username atau password belum sesuai.
                <br />
                Yuk, coba periksa kembali.
              </p>
            </>
          ) : (
            <h1 className="auth-login-title">
              <span>Hallo</span>
              <span>Selamat Datang Kembali 👋</span>
            </h1>
          )}
        </header>

        <form className="auth-login-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-login-field">
            <label htmlFor="login-identity">
              Email/Username
            </label>
            <input
              id="login-identity"
              name="emailUsername"
              type="text"
              autoComplete="username"
              placeholder="Masukkan email atau username"
              value={emailUsername}
              onChange={(event) => setEmailUsername(event.target.value)}
            />
          </div>

          <div className="auth-login-field">
            <label htmlFor="login-password">
              Password
            </label>

            <div className="auth-login-password-wrap">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Masukkan password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <button
                className="auth-password-toggle"
                type="button"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((previous) => !previous)}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7" />
                    <path d="M9.9 5.2A11.8 11.8 0 0112 5c5.2 0 8.5 5.3 9 7-.2.7-1.2 2.5-3.2 4M6.2 6.2C3.9 7.8 2.3 10.1 2 12c.5 1.7 3.8 7 10 7 1.1 0 2.1-.2 3-.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button className="auth-submit-button" type="submit">
            MASUK
          </button>
        </form>

        <nav className="auth-login-links" aria-label="Tautan autentikasi">
          <a href="/forgot-password" className="auth-inactive-link">Lupa sandi</a>
          <span className="auth-register-prompt">
            Belum Punya Akun? <a href="/register" className="auth-inactive-link">Daftar sekarang</a>
          </span>
        </nav>
      </div>
    </AuthCard>
  )
}
