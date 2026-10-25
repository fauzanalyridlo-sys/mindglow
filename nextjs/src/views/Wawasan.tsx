
'use client'

import { useEffect, useRef, useState } from 'react'

import '../styles/wawasan.css'
import '../styles/wawasan-animation.css'

import moodSadAsset from '../icons/Solid mood sad.svg'
import moodDepressedAsset from '../icons/Solid mood depressed.svg'
import moodNeutralAsset from '../icons/Solid mood neutral.svg'
import moodHappyAsset from '../icons/Solid mood happy.svg'
import moodOverjoyedAsset from '../icons/Solid mood overjoyed.svg'

import emojiAsset from '../icons/emoji.svg'
import energyAsset from '../icons/energi.svg'
import sleepAsset from '../icons/tidur.svg'
import ringkasanAsset from '../icons/Ringkasan.svg'
import gambarWawasanAsset from '../assets/gambarwawasan.svg'
import perjalananAsset from '../icons/Perjalanan.svg'
import polaAsset from '../icons/pola.svg'
import aiAsset from '../icons/ai.svg'
import robotAsset from '../icons/robot.svg'
import akademikAsset from '../icons/akademik.svg'

const moodSad = moodSadAsset.src
const moodDepressed = moodDepressedAsset.src
const moodNeutral = moodNeutralAsset.src
const moodHappy = moodHappyAsset.src
const moodOverjoyed = moodOverjoyedAsset.src

const emojiIcon = emojiAsset.src
const energyIcon = energyAsset.src
const sleepIcon = sleepAsset.src
const ringkasanIcon = ringkasanAsset.src
const gambarWawasan = gambarWawasanAsset.src
const perjalananIcon = perjalananAsset.src
const polaIcon = polaAsset.src
const aiIcon = aiAsset.src
const robotIcon = robotAsset.src
const akademikIcon = akademikAsset.src

type MoodPoint = {
  day: string
  date: string
  mood: string | null
  label: string | null
  value: number | null
}

type InsightData = {
  period: string
  startDate: string
  endDate: string
  totalCheckins: number
  totalDays: number
  averageMood: number | null
  averageEnergy: number | null
  averageSleepHours: number | null
  dominantMood: string | null
  moodTrend: {
    date: string
    mood: number | null
    moodLabel: string | null
    energy: number | null
    sleepHours: number | null
  }[]
  insights: string[]
}

const getMood = (
  value: number,
): { mood: string; label: string } => {
  if (value <= 1.5) {
    return { mood: moodSad, label: 'Lelah/Down' }
  }

  if (value <= 2.5) {
    return { mood: moodDepressed, label: 'Cemas' }
  }

  if (value <= 3.5) {
    return { mood: moodNeutral, label: 'Biasa aja' }
  }

  if (value <= 4.5) {
    return { mood: moodHappy, label: 'Tenang' }
  }

  return { mood: moodOverjoyed, label: 'Semangat!' }
}

function formatDay(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00.000Z`)

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(date)
}

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00.000Z`)

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}

function MoodChart({ data }: { data: MoodPoint[] }) {
  const left = 24
  const right = 510
  const top = 30
  const bottom = 155

  const x = (index: number) =>
    data.length <= 1
      ? (left + right) / 2
      : left + (index / (data.length - 1)) * (right - left)

  const y = (value: number) =>
    bottom - ((value - 1) / 4) * (bottom - top)

  // Putuskan garis pada hari yang tidak memiliki check-in.
  const segments: string[] = []
  let currentSegment: string[] = []

  data.forEach((point, index) => {
    if (point.value === null) {
      if (currentSegment.length) {
        segments.push(currentSegment.join(' '))
        currentSegment = []
      }
      return
    }

    currentSegment.push(
      `${currentSegment.length === 0 ? 'M' : 'L'} ${x(index)} ${y(point.value)}`,
    )
  })

  if (currentSegment.length) {
    segments.push(currentSegment.join(' '))
  }

  const legendItems = [
    { icon: moodSad, label: 'Lelah/Down' },
    { icon: moodDepressed, label: 'Cemas' },
    { icon: moodNeutral, label: 'Biasa aja' },
    { icon: moodHappy, label: 'Tenang' },
    { icon: moodOverjoyed, label: 'Semangat!' },
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
          {[1, 2, 3, 4, 5].map((value) => {
            const gridY = y(value)

            return (
              <g key={value}>
                <line
                  x1={left}
                  x2={right}
                  y1={gridY}
                  y2={gridY}
                  className="mood-gridline"
                />
                <text
                  x={left - 7}
                  y={gridY + 4}
                  textAnchor="end"
                  className="mood-day"
                >
                  {value}
                </text>
              </g>
            )
          })}

          <path
            d={`M ${left} ${top} V ${bottom} H ${right}`}
            className="mood-axis"
          />

          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment}
              className="mood-line"
            />
          ))}

          {data.map((point, index) => (
            <g key={point.date}>
              {point.value !== null && (
                <>
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

                  {point.mood && (
                    <image
                      href={point.mood}
                      x={x(index) - 10}
                      y={y(point.value) - 29}
                      width="20"
                      height="20"
                    >
                      <title>{`${point.day}: ${point.label ?? ''}`}</title>
                    </image>
                  )}
                </>
              )}

              {(data.length <= 7 ||
                index % 3 === 0 ||
                index === data.length - 1) && (
                  <text
                    x={x(index)}
                    y="178"
                    textAnchor="middle"
                    className="mood-day"
                  >
                    {data.length === 7
                      ? point.day
                      : new Date(
                        `${point.date}T00:00:00.000Z`,
                      ).getUTCDate()}
                  </text>
                )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

export default function Wawasan() {
  const [period, setPeriod] = useState<7 | 30>(7)
  const [data, setData] = useState<InsightData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const habitGridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadInsights() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`/api/insights?period=${period}`, {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ?? 'Gagal mengambil data Wawasan.',
          )
        }

        setData(result.data as InsightData)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        setError(
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan saat mengambil data Wawasan.',
        )
        setData(null)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadInsights()

    return () => controller.abort()
  }, [period])

  useEffect(() => {
    const grid = habitGridRef.current
    if (!grid) return

    const cards = grid.querySelectorAll('.habit-card')

    if (typeof IntersectionObserver === 'undefined') {
      cards.forEach((card) => card.classList.add('is-visible'))
      return
    }

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
  }, [data])

  const chartData: MoodPoint[] = (data?.moodTrend ?? []).map((point) => {
    const moodInfo =
      point.mood === null ? null : getMood(point.mood)

    return {
      date: point.date,
      day: period === 7 ? formatDay(point.date) : formatDate(point.date),
      value: point.mood,
      mood: moodInfo?.mood ?? null,
      label: point.moodLabel ?? moodInfo?.label ?? null,
    }
  })

  const summaryDescription =
    loading
      ? 'Memuat ringkasan check-in kamu...'
      : error
        ? 'Ringkasan belum dapat dimuat.'
        : !data || data.totalCheckins === 0
          ? `Belum ada check-in dalam ${period} hari terakhir.`
          : `Kamu mencatat ${data.totalCheckins} check-in dalam ${period} hari terakhir.`

  return (
    <main className="insight-page">
      <section className="emotion-summary">
        <div className="summary-heading">
          <div className="summary-icon" aria-hidden="true">
            <img src={ringkasanIcon} alt="" />
          </div>

          <div>
            <h2>Ringkasan Emosimu</h2>
            <p>{summaryDescription}</p>
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
                <strong>
                  {loading
                    ? 'Memuat...'
                    : error
                      ? 'Tidak tersedia'
                      : data?.dominantMood ?? 'Belum ada data'}
                </strong>
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
                <strong>
                  {loading
                    ? 'Memuat...'
                    : data?.averageEnergy !== null &&
                      data?.averageEnergy !== undefined
                      ? `${data.averageEnergy}/5`
                      : 'Belum ada data'}
                </strong>
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
                <strong>
                  {loading
                    ? 'Memuat...'
                    : data?.averageSleepHours !== null &&
                      data?.averageSleepHours !== undefined
                      ? `${data.averageSleepHours} jam`
                      : 'Belum ada data'}
                </strong>
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

        {loading ? (
          <p role="status">Memuat grafik mood...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : data?.totalCheckins === 0 ? (
          <p>Belum ada data Check-in untuk periode ini. Isi Check-in Harian untuk mulai melihat grafik mood.</p>
        ) : (
          <MoodChart data={chartData} />
        )}
      </section>

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
              {loading
                ? 'Memuat data tidur dan suasana hati...'
                : data && data.totalCheckins > 0
                  ? `Rata-rata durasi tidurmu selama ${period} hari terakhir adalah ${data.averageSleepHours ?? 'belum tersedia'} jam.`
                  : 'Belum ada data tidur yang cukup untuk melihat pola kebiasaan.'}
            </p>

            <div className="habit-insight">
              <div className="habit-insight-label">
                <span>Rata-rata tidur</span>
                <strong>
                  {data?.averageSleepHours !== null &&
                    data?.averageSleepHours !== undefined
                    ? `${data.averageSleepHours} jam`
                    : 'Belum ada data'}
                </strong>
              </div>

              <div className="habit-progress-row">
                <div
                  className="habit-progress"
                  role="progressbar"
                  aria-label="Rata-rata durasi tidur dibandingkan 8 jam"
                  aria-valuenow={Math.min(
                    100,
                    ((data?.averageSleepHours ?? 0) / 8) * 100,
                  )}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="habit-progress-fill sleep-progress"
                    style={{
                      width: `${Math.min(
                        100,
                        ((data?.averageSleepHours ?? 0) / 8) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <strong className="habit-percent">
                  {data?.averageSleepHours !== null &&
                    data?.averageSleepHours !== undefined
                    ? `${Math.round(
                      Math.min(100, (data.averageSleepHours / 8) * 100),
                    )}%`
                    : '—'}
                </strong>
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
              {loading
                ? 'Memuat ringkasan check-in...'
                : data && data.totalCheckins > 0
                  ? `Kamu telah mengisi ${data.totalCheckins} dari ${period} hari dalam periode ini.`
                  : 'Isi Check-in Harian untuk mulai menemukan pola aktivitasmu.'}
            </p>

            <div className="habit-insight">
              <div className="habit-insight-label">
                <span>Konsistensi check-in</span>
                <strong>
                  {data && data.totalDays > 0
                    ? `${Math.round(
                      (data.totalCheckins / data.totalDays) * 100,
                    )}%`
                    : 'Belum ada data'}
                </strong>
              </div>

              <div className="habit-progress-row">
                <div
                  className="habit-progress"
                  role="progressbar"
                  aria-label="Persentase hari dengan check-in"
                  aria-valuenow={
                    data && data.totalDays > 0
                      ? Math.round(
                        (data.totalCheckins / data.totalDays) * 100,
                      )
                      : 0
                  }
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="habit-progress-fill academic-progress"
                    style={{
                      width: `${data && data.totalDays > 0
                          ? Math.min(
                            100,
                            (data.totalCheckins / data.totalDays) * 100,
                          )
                          : 0
                        }%`,
                    }}
                  />
                </div>
                <strong className="habit-percent">
                  {data && data.totalDays > 0
                    ? `${Math.round(
                      (data.totalCheckins / data.totalDays) * 100,
                    )}%`
                    : '—'}
                </strong>
              </div>
            </div>
          </article>
        </div>

        {data?.insights && data.insights.length > 0 && (
          <div className="insight-observations">
            {data.insights.map((insight, index) => (
              <p key={`${index}-${insight}`}>{insight}</p>
            ))}
          </div>
        )}
      </section>

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
