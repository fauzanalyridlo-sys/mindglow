import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'
import Icon from '../ui/Icon'
import '../../styles/public-footer.css'
import '../../styles/app-footer.css'

const navigation = [
  { label: 'Beranda', path: '/dashboard' },
  { label: 'Cek Harian', path: '/checkin' },
  { label: 'Jurnal', path: '/journal' },
  { label: 'Akademik', path: '/akademik' },
  { label: 'Wawasan', path: '/wawasan' },
  { label: 'Refleksi AI', path: '/reflection' },
]

export default function AppFooter() {
  return (
    <footer className="site-footer app-footer">
      <div className="footer-wave" />

      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo light />

          <p>
            Ruang aman untuk mengenali emosi, menulis cerita, dan
            bertumbuh—satu hari dalam satu waktu.
          </p>

          <span>
            <Icon name="heart" size={16} />
            {' '}Dibuat untuk menemani mahasiswa Indonesia.
          </span>
        </div>

        <div className="footer-column">
  <h3>Navigasi</h3>

  {navigation.map((item) => (
    <Link key={item.path} to={item.path}>
      {item.label}
    </Link>
  ))}
</div>
      </div>

      <div className="container footer-bottom">
        <p>© 2026 MindGlow. Semua hak dilindungi.</p>
        <p>Temani dirimu dengan lebih lembut.</p>
      </div>
    </footer>
  )
}