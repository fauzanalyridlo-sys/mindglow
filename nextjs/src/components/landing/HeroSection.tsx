import Button from '../ui/Button'
import '../../styles/public-hero.css'

export default function HeroSection() {
  return (
    <section className="hero" id="beranda">
      <div className="decor decor--hero-left" aria-hidden="true" />
      <div className="decor decor--hero-right" aria-hidden="true" />

      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0-.1-7.5Z" />
            </svg>

            <span>Ruang aman untuk dirimu</span>
          </div>

          <h1>
            Kenali dirimu,
            <br />
            <span className="hero-highlight">satu hari</span> dalam
            <br />
            satu waktu.
          </h1>

          <p className="hero-description">
            Temukan pola emosimu, tuangkan isi pikiran,
            dan dapatkan refleksi personal—semuanya
            dalam satu ruang yang tenang.
          </p>

          <div className="hero-actions">
            <Button href="/register">
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