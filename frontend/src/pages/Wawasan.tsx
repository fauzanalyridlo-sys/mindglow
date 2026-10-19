
import { useEffect, useRef, useState } from 'react'

import '../styles/wawasan.css'
import '../styles/wawasan-animation.css'

import moodHappy from '../icons/Solid mood happy.svg'
import moodOverjoyed from '../icons/Solid mood overjoyed.svg'
import moodNeutral from '../icons/Solid mood neutral.svg'
import moodDepressed from '../icons/Solid mood depressed.svg'

import emojiIcon from '../icons/emoji.svg'
import energyIcon from '../icons/energi.svg'
import sleepIcon from '../icons/tidur.svg'
import ringkasanIcon from '../icons/Ringkasan.svg'
import gambarWawasan from '../assets/gambarwawasan.svg'
import perjalananIcon from '../icons/Perjalanan.svg'
import polaIcon from '../icons/pola.svg'
import aiIcon from '../icons/ai.svg'
import robotIcon from '../icons/robot.svg'
import akademikIcon from '../icons/akademik.svg'

type MoodPoint = {
  day: string
  mood: string
  label: string
  value: number
}

const moodJourney7: MoodPoint[] = [
  { day: 'Sen', mood: moodOverjoyed, label: 'Sangat Senang', value: 4.5 },
  { day: 'Sel', mood: moodHappy, label: 'Senang', value: 3.8 },
  { day: 'Rab', mood: moodDepressed, label: 'Cemas', value: 2.2 },
  { day: 'Kam', mood: moodNeutral, label: 'Biasa Saja', value: 2.5 },
  { day: 'Jum', mood: moodHappy, label: 'Tenang', value: 3.4 },
  { day: 'Sab', mood: moodOverjoyed, label: 'Sangat Senang', value: 4.8 },
  { day: 'Min', mood: moodHappy, label: 'Senang', value: 4.0 },
]

const moodValues30 = [
  3.2, 3.8, 4.1, 2.7, 3.0, 4.3, 3.7,
  2.4, 2.8, 3.5, 4.0, 4.4, 3.6, 3.1,
  2.5, 3.3, 3.9, 4.6, 4.2, 3.4, 3.0,
  2.2, 2.9, 3.7, 4.1, 4.5, 3.8, 3.2,
  4.0, 4.3,
]

const moodJourney30: MoodPoint[] = moodValues30.map((value, index) => {
  let mood = moodNeutral
  let label = 'Biasa Saja'

  if (value >= 4.3) {
    mood = moodOverjoyed
    label = 'Sangat Senang'
  } else if (value >= 3.5) {
    mood = moodHappy
    label = 'Senang'
  } else if (value < 2.5) {
    mood = moodDepressed
    label = 'Cemas'
  }

  return {
    day: `${index + 1}`,
    mood,
    label,
    value,
  }
})

function MoodChart({ data }: { data: MoodPoint[] }) {
  const left = 24
  const right = 510
  const top = 30
  const bottom = 155

  const x = (index: number) =>
    left + (index / (data.length - 1)) * (right - left)

  const y = (value: number) =>
    bottom - (value / 5) * (bottom - top)

  const path = data
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.value)}`,
    )
    .join(' ')

  const legendItems = [
    { icon: moodOverjoyed, label: 'Sangat Senang' },
    { icon: moodHappy, label: 'Senang' },
    { icon: moodNeutral, label: 'Biasa Saja' },
    { icon: moodDepressed, label: 'Cemas' },
  ]

  return (
    <div className="mood-chart-layout">
      <aside className="mood-legend" aria-label="Keterangan suasana hati">
        {legendItems.map((item) => (
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
          aria-label={`Grafik perjalanan mood selama ${data.length} hari`}
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

          {data.map((point, index) => (
            <g key={`${point.day}-${index}`}>
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
                {data.length === 7 ? point.day : index + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

export default function Wawasan() {
  const [period, setPeriod] = useState<7 | 30>(7)
  const habitGridRef = useRef<HTMLDivElement>(null)

  const chartData = period === 7 ? moodJourney7 : moodJourney30

  useEffect(() => {
    const grid = habitGridRef.current
    if (!grid) return

    const cards = grid.querySelectorAll('.habit-card')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )

    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <main className="insight-page">
      {/* Ringkasan emosi */}
      <section className="emotion-summary">
        <div className="summary-heading">
          <div className="summary-icon" aria-hidden="true">
            <img src={ringkasanIcon} alt="" />
          </div>

          <div>
            <h2>Ringkasan Emosimu</h2>
            <p>
              Dalam {period} hari terakhir, kamu lebih sering merasa tenang.
            </p>
          </div>
        </div>

        <div className="summary-bottom">
          <div className="summary-stats">
            <article className="summary-stat">
              <img src={emojiIcon} alt="" className="summary-mood-icon" />
              <div>
                <small>Mood dominan</small>
                <strong>Tenang</strong>
              </div>
            </article>

            <article className="summary-stat">
              <img src={energyIcon} alt="" className="summary-mood-icon" />
              <div>
                <small>Rata-rata energi</small>
                <strong>7/10</strong>
              </div>
            </article>

            <article className="summary-stat">
              <img src={sleepIcon} alt="" className="summary-mood-icon" />
              <div>
                <small>Rata-rata tidur</small>
                <strong>7 jam</strong>
              </div>
            </article>
          </div>

          <div className="summary-art">
            <img
              src={gambarWawasan}
              alt="Ilustrasi wawasan"
              className="summary-art-image"
            />
          </div>
        </div>
      </section>

      {/* Grafik perjalanan mood */}
      <section className="insight-panel">
        <div className="panel-heading">
          <div className="panel-icon" aria-hidden="true">
            <img src={perjalananIcon} alt="" />
          </div>

          <div className="panel-heading-text">
            <h2>Perjalanan Mood</h2>
            <p>Lihat perubahan suasana hatimu dari waktu ke waktu.</p>
          </div>

          <div className="period-switch" aria-label="Pilih periode grafik">
            <button
              type="button"
              className={period === 7 ? 'selected' : ''}
              aria-pressed={period === 7}
              onClick={() => setPeriod(7)}
            >
              7 Hari
            </button>

            <button
              type="button"
              className={period === 30 ? 'selected' : ''}
              aria-pressed={period === 30}
              onClick={() => setPeriod(30)}
            >
              30 Hari
            </button>
          </div>
        </div>

        <MoodChart data={chartData} />
      </section>

      {/* Pola kebiasaan */}
      <section className="insight-panel">
        <div className="panel-heading">
          <div className="panel-icon" aria-hidden="true">
            <img src={polaIcon} alt="" />
          </div>

          <div className="panel-heading-text">
            <h2>Pola Kebiasaan</h2>
            <p>
              Temukan kebiasaan yang mungkin berpengaruh pada suasana hatimu.
            </p>
          </div>
        </div>

        <div className="habit-grid" ref={habitGridRef}>
          <article className="habit-card sleep-card">
            <div className="habit-title-row">
              <span className="habit-card-icon sleep-icon">
                <img src={sleepIcon} alt="" />
              </span>
              <h3>Tidur dan Perasaanmu</h3>
            </div>

            <p>
              Pada hari-hari ketika kamu tidur lebih dari 7 jam, kamu lebih
              sering mencatat suasana hati yang tenang.
            </p>

            <div className="habit-insight">
              <div className="habit-insight-label">
                <span>Tidur &gt; 7 jam</span>
                <strong>Mood tenang</strong>
              </div>

              <div className="habit-progress-row">
                <div
                  className="habit-progress"
                  role="progressbar"
                  aria-label="Contoh persentase mood tenang"
                  aria-valuenow={80}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="habit-progress-fill sleep-progress"
                    style={{ width: '80%' }}
                  />
                </div>
                <strong className="habit-percent">80%</strong>
              </div>
            </div>
          </article>

          <article className="habit-card academic-card">
            <div className="habit-title-row">
              <span className="habit-card-icon academic-icon">
                <img src={akademikIcon} alt="" />
              </span>
              <h3>Aktivitas Akademik</h3>
            </div>

            <p>
              Kamu lebih sering mencatat rasa cemas pada hari dengan banyak
              tugas kuliah.
            </p>

            <div className="habit-insight">
              <div className="habit-insight-label">
                <span>Banyak tugas</span>
                <strong>Mood cemas</strong>
              </div>

              <div className="habit-progress-row">
                <div
                  className="habit-progress"
                  role="progressbar"
                  aria-label="Contoh persentase mood cemas"
                  aria-valuenow={60}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="habit-progress-fill academic-progress"
                    style={{ width: '60%' }}
                  />
                </div>
                <strong className="habit-percent">60%</strong>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Ajakan menuju Ruang Refleksi AI */}
      <section className="reflection-prompt">
        <div className="prompt-icon" aria-hidden="true">
          <img src={aiIcon} alt="" />
        </div>

        <div className="prompt-content">
          <h2>Yuk, Luangkan Waktu untuk Dirimu</h2>

          <p>
            Apa yang sedang kamu rasakan hari ini? Ceritakan pikiran atau
            pengalamanmu di Ruang Refleksi AI. Kamu bisa menelusuri perasaanmu
            dengan lebih tenang dan mencari langkah kecil yang terasa cocok
            untukmu.
          </p>

          <a
            href="/reflection"
            className="reflection-button"
            aria-label="Refleksikan bersama AI"
          >
            Refleksikan Bersama AI
            <span aria-hidden="true">➜</span>
          </a>
        </div>

        <div className="prompt-art">
          <img
            src={robotIcon}
            alt="Robot AI ramah yang memeluk hati"
            className="prompt-ai-image"
          />

          <div className="prompt-note">
            Setiap perasaan punya cerita.
            <br />
            Yuk, beri ruang untuk memahaminya.
            <b aria-hidden="true">♥</b>
          </div>
        </div>
      </section>
    </main>
  )
}
