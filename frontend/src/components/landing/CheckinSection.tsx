import MoodCheckinDemo from './MoodCheckinDemo'
import '../../styles/checkin.css'

export default function CheckinSection() {
  return (
    <section className="checkin-section" id="checkin">
      <div className="container">
        <div className="checkin-heading">
          <span className="checkin-label">DEMO FITUR</span>

          <h2>
            Satu check-in kecil, gambaran
            <br />
            diri yang lebih utuh.
          </h2>

          <p>
            Coba alur sederhana di bawah. Kenali apa yang kamu
            rasakan sebelum melanjutkan aktivitas.
          </p>
        </div>

        <div className="checkin-layout">
          <div className="checkin-description">
            <span className="checkin-number">01</span>

            <h3>Check-in harian</h3>

            <p>
              Luangkan dua menit untuk mengenali kondisimu hari ini.
              Jawabanmu akan membantu membangun pola personal
              dari waktu ke waktu.
            </p>

            <ul>
              <li>Catat dan tidak terasa seperti survei</li>
              <li>Parameter bisa disesuaikan</li>
              <li>Data disimpan secara privat</li>
            </ul>
          </div>

          <MoodCheckinDemo />
        </div>
      </div>
    </section>
  )
}