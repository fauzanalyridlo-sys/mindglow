
import '../styles/wawasan.css'

import moodHappy from '../icons/Solid mood happy.svg'
import moodOverjoyed from '../icons/Solid mood overjoyed.svg'
import moodNeutral from '../icons/Solid mood neutral.svg'
import moodDepressed from '../icons/Solid mood depressed.svg'
import moodSad from '../icons/Solid mood sad.svg'

import emojiIcon from '../icons/emoji.svg'
import energyIcon from '../icons/energi.svg'
import sleepIcon from '../icons/tidur.svg'
import ringkasanIcon from '../icons/Ringkasan.svg'
import gambarWawasan from '../assets/gambarwawasan.svg'
import perjalananIcon from '../icons/Perjalanan.svg'
import polaIcon from '../icons/pola.svg'

const moodJourney = [
  { day: 'Senin', mood: moodOverjoyed, label: 'Sangat Senang', value: 4.5 },
  { day: 'Selasa', mood: moodHappy, label: 'Senang', value: 3.8 },
  { day: 'Rabu', mood: moodDepressed, label: 'Cemas', value: 2.2 },
  { day: 'Kamis', mood: moodNeutral, label: 'Biasa Saja', value: 2.5 },
  { day: 'Jumat', mood: moodHappy, label: 'Tenang', value: 3.4 },
  { day: 'Sabtu', mood: moodOverjoyed, label: 'Sangat Senang', value: 4.8 },
  { day: 'Minggu', mood: moodHappy, label: 'Senang', value: 4.0 },
]

function MoodChart() {
  const left = 24
  const right = 510
  const top = 30
  const bottom = 155

  const x = (index: number) =>
    left + (index / (moodJourney.length - 1)) * (right - left)

  const y = (value: number) =>
    bottom - (value / 5) * (bottom - top)

  const path = moodJourney
    .map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.value)}`,
    )
    .join(' ')

  return (
    <div className="mood-chart-layout">
      <aside className="mood-legend">
        {[
          { icon: moodOverjoyed, label: 'Sangat Senang' },
          { icon: moodHappy, label: 'Senang' },
          { icon: moodHappy, label: 'Tenang' },
          { icon: moodNeutral, label: 'Biasa Saja' },
          { icon: moodDepressed, label: 'Cemas' },
          { icon: moodSad, label: 'Sedih' },
        ].map((item) => (
          <div className="mood-legend-item" key={item.label}>
            <img src={item.icon} alt="" />
            <span>{item.label}</span>
          </div>
        ))}
      </aside>

      <div className="mood-chart">
        <svg
          viewBox="0 0 540 195"
          role="img"
          aria-label="Grafik perjalanan mood selama tujuh hari"
        >
          {[0, 1, 2, 3].map((index) => {
            const gridY = top + index * ((bottom - top) / 3)

            return (
              <line
                key={index}
                x1={left}
                x2={right}
                y1={gridY}
                y2={gridY}
                className="mood-gridline"
              />
            )
          })}

          <path
            d={`M ${left} ${top} V ${bottom} H ${right}`}
            className="mood-axis"
          />

          <path d={path} className="mood-line" />

          {moodJourney.map((point, index) => (
            <g key={point.day}>
              <line
                x1={x(index)}
                x2={x(index)}
                y1={y(point.value)}
                y2={bottom}
                className="mood-guide"
              />

              <circle
                cx={x(index)}
                cy={y(point.value)}
                r="4"
                className="mood-dot"
              />

              <image
                href={point.mood}
                x={x(index) - 10}
                y={y(point.value) - 29}
                width="20"
                height="20"
              >
                <title>{`${point.day}: ${point.label}`}</title>
              </image>

              <text
                x={x(index)}
                y="178"
                textAnchor="middle"
                className="mood-day"
              >
                {point.day}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

export default function Wawasan() {
  return (
    <main className="insight-page">
      {/* Ringkasan emosimu */}
      <section className="emotion-summary">
        <div className="summary-heading">
          <div className="summary-icon" aria-hidden="true">
            <img
              src={ringkasanIcon}
              alt=""
              width="22"
              height="22"
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div>
            <h2>Ringkasan Emosimu</h2>
            <p>Dalam 7 hari terakhir, kamu lebih sering merasa tenang.</p>
          </div>
        </div>

        <div className="summary-bottom">
          <div className="summary-stats">
            <article className="summary-stat">
              <img
                src={emojiIcon}
                alt=""
                className="summary-mood-icon"
              />

              <div>
                <small>Mood dominan</small>
                <strong>Tenang</strong>
              </div>
            </article>

            <article className="summary-stat">
              <img
                src={energyIcon}
                alt=""
                className="summary-mood-icon"
              />

              <div>
                <small>Rata-rata energi</small>
                <strong>7/10</strong>
              </div>
            </article>

            <article className="summary-stat">
              <img
                src={sleepIcon}
                alt=""
                className="summary-mood-icon"
              />

              <div>
                <small>Rata-rata tidur</small>
                <strong>7 jam</strong>
              </div>
            </article>
          </div>

          {/* Ilustrasi dari src/assets/gambarwawasan.svg */}
          <div className="summary-art">
            <img
              src={gambarWawasan}
              alt="Ilustrasi wawasan"
              className="summary-art-image"
            />
          </div>
        </div>
      </section>

      {/* Perjalanan mood */}
        <section className="insight-panel">
        <div className="panel-heading">
         <div className="panel-icon" aria-hidden="true">
         <img src={perjalananIcon} alt="" />
       </div>

          <div>
            <h2>Perjalanan Mood</h2>
            <p>Lihat perubahan suasana hatimu dari waktu ke waktu.</p>
          </div>

          <div className="period-switch">
            <button type="button" className="selected">
              7 Hari
            </button>
            <button type="button" disabled>
              30 Hari
            </button>
          </div>
        </div>

        <MoodChart />
      </section>

      {/* Pola kebiasaan */}
      <section className="insight-panel">
        <div className="panel-heading">
          <div className="habit-icon" aria-hidden="true">
  <img src={polaIcon} alt="" />
</div>

          <div>
            <h2>Pola Kebiasaan</h2>
            <p>Temukan kebiasaan yang berpengaruh pada suasana hatimu.</p>
          </div>
        </div>

        <div className="habit-grid">
          <article className="habit-card sleep-card">
            <div className="habit-icon" aria-hidden="true">
              ☾
            </div>

            <div className="habit-content">
              <h3>Tidur dan Perasaanmu</h3>

              <p>
                Pada hari-hari ketika kamu tidur lebih dari 7 jam,
                kamu lebih sering mencatat suasana hati yang tenang.
              </p>

              <div className="habit-stat">
                <span>☾ &nbsp; &gt; 7 jam tidur</span>
                <b>=</b>
                <strong>80% tenang</strong>
              </div>
            </div>

            <span className="habit-chevron" aria-hidden="true">
              ›
            </span>
          </article>

          <article className="habit-card academic-card">
            <div className="habit-icon" aria-hidden="true">
              ♧
            </div>

            <div className="habit-content">
              <h3>Aktivitas Akademik</h3>

              <p>
                Kamu lebih sering mencatat rasa cemas pada hari
                dengan banyak tugas kuliah.
              </p>

              <div className="habit-stat">
                <span>▤ &nbsp; Banyak tugas</span>
                <b>=</b>
                <strong>60% cemas</strong>
              </div>
            </div>

            <span className="habit-chevron" aria-hidden="true">
              ›
            </span>
          </article>
        </div>
      </section>

      {/* Hal kecil untuk dicoba */}
      <section className="reflection-prompt">
        <div className="prompt-icon" aria-hidden="true">
          ☼
        </div>

        <div className="prompt-content">
          <h2>Hal Kecil untuk Dicoba</h2>

          <p>
            Kamu beberapa kali mencatat energi rendah setelah hari yang sibuk.
            Mungkin kamu bisa mencoba menyediakan waktu istirahat singkat
            di sela aktivitas.
          </p>

          <a href="/reflection" className="reflection-button">
            Mulai Refleksi <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="prompt-art" aria-hidden="true">
          <span className="prompt-plant">🌱</span>

          <div className="prompt-note">
            Ingat, kamu tidak perlu sempurna. Kamu hanya perlu terus berusaha,
            dan itu sudah sangat berarti.
            <b>♥</b>
          </div>
        </div>
      </section>
    </main>
  )
}
