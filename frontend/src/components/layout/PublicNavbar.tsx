import '../../styles/public-navbar.css'
import Logo from '../ui/Logo'
import Button from '../ui/Button'

export default function PublicNavbar() {
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Logo />

        <nav aria-label="Navigasi utama">
          <a href="#beranda">Beranda</a>
          <a href="#fitur">Fitur</a>
          <a href="#tentang">Cara kerja</a>
        </nav>

        <div className="nav-actions">
          <Button href="#masuk" variant="secondary">
            Masuk
          </Button>

          <Button href="#mulai">Daftar</Button>
        </div>
      </div>
    </header>
  )
}