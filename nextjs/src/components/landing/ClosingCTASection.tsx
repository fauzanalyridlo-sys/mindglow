
import Link from 'next/link'
import '../../styles/public-closing-cta.css'
export default function ClosingCTASection() {
  return (
    <section className="closing-cta-section">
      <div className="closing-cta-container">
        <div className="closing-cta-card">

          {/* Ornamen dekoratif */}
          <div
            className="closing-cta-decoration closing-cta-decoration-top"
            aria-hidden="true"
          />

          <div
            className="closing-cta-decoration closing-cta-decoration-bottom"
            aria-hidden="true"
          />

          {/* Konten CTA */}
          <div className="closing-cta-content">
            <span className="closing-cta-badge">
              MULAI DARI HARI INI
            </span>

            <h2>
              Dirimu layak mendapat ruang untuk didengar.
            </h2>

            <p>
              Tidak perlu menunggu semuanya sempurna.
              Mulai dengan satu check-in sederhana hari ini.
            </p>

           <Link href="/login" className="closing-cta-button">
              <span>Mulai sekarang</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
