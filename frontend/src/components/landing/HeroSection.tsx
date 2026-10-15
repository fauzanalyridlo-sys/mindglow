import Button from '../ui/Button'
import '../../styles/hero.css'


export default function HeroSection() {
  return (
    <section className="hero" id="beranda">
      <div className="decor decor--hero-left" />
      <div className="decor decor--hero-right" />

      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">
            Ruang aman untuk dirimu
          </p>

          <h1>
            Kenali dirimu,
            <br />
            satu hari dalam
            <br />
            satu waktu.
          </h1>

          <p>
            Temukan pola emosimu, tuangkan isi pikiran,
            dan dapatkan refleksi personal—semuanya
            dalam satu ruang yang tenang.
          </p>

          <div className="hero-actions">
  <Button href="#checkin">
    Mulai perjalananmu
  </Button>

  <div className="hero-free-info">
    <span className="hero-check-icon" aria-hidden="true">
      ✓
    </span>
    <span>Gratis untuk memulai</span>
  </div>
</div>
        </div>

       <div className="hero-art">
  <img
    src="/images/Happy student-bro.svg"
    alt="Ilustrasi tiga mahasiswa MindGlow"
    className="hero-image"
  />
</div>
      </div>
    </section>
  )
}