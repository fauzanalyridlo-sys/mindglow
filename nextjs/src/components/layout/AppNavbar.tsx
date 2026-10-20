import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Logo from '../ui/Logo'
import UserAvatar from '../ui/UserAvatar'
import '../../styles/app-navbar.css'

type AppNavbarProps = {
  userName?: string
}

const navigation = [
  { label: 'Beranda', path: '/dashboard' },
  { label: 'Cek Harian', path: '/checkin' },
  { label: 'Jurnal', path: '/journal' },
  { label: 'Akademik', path: '/akademik' },
  { label: 'Wawasan', path: '/wawasan' },
  { label: 'Refleksi AI', path: '/Ai' },
]

export default function AppNavbar({
  userName = 'Fauzan Aly Ridlo',
}: AppNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="app-navbar">
      <div className="app-navbar-container">
        <Logo />

        <nav
          id="app-navbar-navigation"
          className={`app-navbar-links ${
            isMenuOpen ? 'app-navbar-links--open' : ''
          }`}
          aria-label="Navigasi utama"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={({ isActive }) =>
                `app-navbar-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-navbar-actions">
          <NavLink
            to="/profile"
            className="app-navbar-profile"
            aria-label="Buka profil pengguna"
            title="Profil pengguna"
            onClick={closeMenu}
          >
            <UserAvatar name={userName} />
          </NavLink>

          <button
            type="button"
            className="app-navbar-toggle"
            aria-label={
              isMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'
            }
            aria-expanded={isMenuOpen}
            aria-controls="app-navbar-navigation"
            onClick={() => setIsMenuOpen((previous) => !previous)}
          >
            {isMenuOpen ? (
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
                <path d="M18 6 6 18M6 6l12 12" />
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
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}