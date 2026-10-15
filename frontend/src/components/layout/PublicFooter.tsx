import '../../styles/public-footer.css'
import Logo from '../ui/Logo'
import Icon from '../ui/Icon'

export default function PublicFooter() {
  return (
    <footer className="site-footer" id="tentang">
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
          <a href="#beranda">Beranda</a>
          <a href="#fitur">Tentang MindGlow</a>
          <a href="#tentang">Cara kerja</a>
        </div>

        <div className="footer-column">
          <h3>Fitur</h3>
          <a href="#checkin">Check-in harian</a>
          <a href="#refleksi">Refleksi AI</a>
          <a href="#jurnal">Jurnal pribadi</a>
        </div>

      </div>

      <div className="container footer-bottom">
        <p>© 2025 MindGlow. Semua hak dilindungi.</p>
        <p>Temani dirimu dengan lebih lembut.</p>
      </div>
    </footer>
  )
}