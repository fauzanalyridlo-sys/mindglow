import { useState } from 'react'
import '../../styles/public-navbar.css'
import Logo from '../ui/Logo'
import Button from '../ui/Button'

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Logo />

        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={menuOpen}
          aria-controls="public-navigation"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="M6 6 18 18" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          )}
        </button>

        <div
          id="public-navigation"
          className={`nav-content ${menuOpen ? 'nav-content--open' : ''}`}
        >
          <nav aria-label="Navigasi utama">
            <a href="#beranda" onClick={closeMenu}>
              Beranda
            </a>
            <a href="#fitur" onClick={closeMenu}>
              Fitur
            </a>
            <a href="#checkin" onClick={closeMenu}>
              Cara kerja
            </a>
          </nav>

          <div className="nav-actions">
            <Button href="/login" variant="secondary">
              Masuk
            </Button>

            <Button href="/register">
              Daftar
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}