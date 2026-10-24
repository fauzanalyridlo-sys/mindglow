'use client'

import '../styles/login-page.css'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import AuthCard from '../components/auth/AuthCard'

type LoginResult = {
  success?: boolean
  message?: string
  user?: {
    id: string | number
    name?: string
    email?: string
    username?: string
  }
}

export default function LoginPage() {
  const router = useRouter()

  const [emailUsername, setEmailUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (loading) return

    if (!emailUsername.trim() || !password) {
      setErrorMessage('Masukkan email/username dan password terlebih dahulu.')
      return
    }

    setErrorMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailUsername: emailUsername.trim(),
          password,
        }),
      })

      const result: LoginResult = await response.json()

      if (!response.ok || !result.success) {
        setErrorMessage(
          result.message || 'Login belum berhasil. Silakan coba lagi.',
        )
        return
      }

      router.replace('/dashboard')
      router.refresh()
    } catch {
      setErrorMessage(
        'Tidak dapat menghubungi server. Periksa koneksi dan coba lagi.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential || loading) {
      setErrorMessage('Credential Google tidak tersedia. Silakan coba lagi.')
      return
    }

    setErrorMessage('')
    setLoading(true)

    try {
      const apiResponse = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      })

      const result: LoginResult = await apiResponse.json()

      if (!apiResponse.ok || !result.success) {
        setErrorMessage(
          result.message || 'Login Google gagal. Silakan coba lagi.',
        )
        return
      }

      router.replace('/dashboard')
      router.refresh()
    } catch {
      setErrorMessage(
        'Tidak dapat menghubungi server. Periksa koneksi dan coba lagi.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard variant="login">
      <div className="auth-login">
        <header className="auth-login-header">
          {errorMessage ? (
            <>
              <h1 className="auth-login-title">Login belum berhasil</h1>
              <p className="auth-login-error" role="alert">
                {errorMessage}
              </p>
            </>
          ) : (
            <h1 className="auth-login-title">
              <span>Hallo</span>
              <span>Selamat Datang Kembali 👋</span>
            </h1>
          )}
        </header>

        <form
          className="auth-login-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="auth-login-field">
            <label htmlFor="login-identity">Email/Username</label>
            <input
              id="login-identity"
              name="emailUsername"
              type="text"
              autoComplete="username"
              placeholder="Masukkan email atau username"
              value={emailUsername}
              onChange={(event) => {
                setEmailUsername(event.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              disabled={loading}
            />
          </div>

          <div className="auth-login-field">
            <label htmlFor="login-password">Password</label>
            <div className="auth-login-password-wrap">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Masukkan password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (errorMessage) setErrorMessage('')
                }}
                disabled={loading}
              />

              <button
                className="auth-password-toggle"
                type="button"
                aria-label={
                  showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                }
                aria-pressed={showPassword}
                onClick={() => setShowPassword((previous) => !previous)}
                disabled={loading}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                    <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.5 0 9 7 9 7a15.6 15.6 0 01-3.1 3.8" />
                    <path d="M6.2 6.2C3.9 7.7 2 12 2 12s3.5 7 10 7a10.7 10.7 0 004-.8" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            className="auth-submit-button"
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'MEMPROSES...' : 'MASUK'}
          </button>
        </form>

        <div className="auth-login-divider" aria-hidden="true">
          <span>atau masuk dengan</span>
        </div>

        <div
          className={`auth-google-button${loading ? ' auth-google-button--loading' : ''}`}
        >
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setErrorMessage('Login Google dibatalkan atau gagal. Silakan coba lagi.')
            }}
            text="signin_with"
            shape="pill"
            theme="outline"
            size="large"
            width="280"
            useOneTap={false}
          />
        </div>

        <nav className="auth-login-links" aria-label="Tautan autentikasi">
          <a href="/forgot-password" className="auth-inactive-link">
            Lupa sandi
          </a>

          <span className="auth-register-prompt">
            Belum Punya Akun?{' '}
            <a href="/register" className="auth-inactive-link">
              Daftar sekarang
            </a>
          </span>
        </nav>
      </div>
    </AuthCard>
  )
}
