import CheckinForm from '../components/checkin/CheckinForm'
import '../styles/public-checkin.css'
import '../styles/checkin-page.css'

export default function CheckinPage() {
  return (
    <section className="daily-checkin-page">
      <div className="daily-checkin-container">
        <header className="daily-checkin-heading">
          <h1>
            <span className="daily-checkin-heading-muted">
              Bagaimana perasaan hatimu hari ini?
            </span>
            <span className="daily-checkin-heading-primary">
              Check harianmu disini
            </span>
          </h1>
          <p>
            Hanya butuh 30 detik untuk mendengarkan dirimu sendiri
          </p>
        </header>

        {/* Kartu sapaan */}
        <div className="daily-checkin-greeting">
          <div className="daily-checkin-greeting-content">
            <span className="daily-checkin-greeting-label">
              🌿 RUANG KECIL UNTUK DIRIMU
            </span>

            <h2>Hai, apa kabar hatimu hari ini?</h2>

            <p>
              Apa pun yang kamu rasakan hari ini, semuanya layak
              didengarkan. Yuk, luangkan sedikit waktu untuk
              mengenali perasaanmu.
            </p>
          </div>

          <img
            className="daily-checkin-greeting-image"
            src="/images/checkin/Alone-amico.svg"
            alt="Ilustrasi untuk menemani check-in harian"
          />
        </div>

        {/* Form Check-in hanya satu kali */}
        <div className="daily-checkin-form">
          <CheckinForm />
        </div>
      </div>
    </section>
  )
}