import JournalDemo from './JournalDemo'
import '../../styles/public-journal.css'

const benefits = [
  'Menuangkan pikiran dan perasaan',
  'Melakukan refleksi diri',
  'Mencatat pengalaman harian',
]

export default function JournalSection() {
  return (
    <section className="journal-section" id="journal">
      <div className="journal-container">

        {/* Judul utama */}
        <div className="journal-heading">
          <h2>
            Tuliskan cerita dan
            <br />
            pengalamanmu disini
          </h2>

          <p>
            Mulai menulis dengan pertanyaan sederhana
            yang membantumu lebih terbuka.
          </p>
        </div>

        {/* Konten dua kolom */}
        <div className="journal-layout">

          {/* Kolom kiri */}
          <div className="journal-description">
            <span className="journal-number">03</span>

            <h3>Jurnal</h3>

            <p className="journal-intro">
              Jurnal adalah ruang aman untuk menulis apa pun
              yang kamu rasakan. Dengan menulis, kamu bisa
              lebih jujur pada diri sendiri dan menemukan
              kejernihan dalam pikiran.
            </p>

            <ul className="journal-benefits">
              {benefits.map((benefit) => (
                <li key={benefit}>
                  <span aria-hidden="true">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom kanan */}
          <JournalDemo />

        </div>
      </div>
    </section>
  )
}