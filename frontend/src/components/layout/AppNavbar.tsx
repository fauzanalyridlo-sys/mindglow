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
  { label: 'Refleksi AI', path: '/reflection' },
]

export default function AppNavbar({
  userName = 'Fauzan Aly Ridlo',
}: AppNavbarProps) {
  return (
    <header className="app-navbar">
      <div className="app-navbar-container">
        <Logo />

        <nav className="app-navbar-links" aria-label="Navigasi utama">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="app-navbar-link"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <NavLink
  to="/profile"
  className="app-navbar-profile"
  aria-label="Buka profil pengguna"
  title="Profil pengguna"
>
  <UserAvatar name={userName} />
</NavLink>
      </div>
    </header>
  )
}