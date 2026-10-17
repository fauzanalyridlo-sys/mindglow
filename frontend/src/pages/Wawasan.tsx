
import '../styles/wawasan.css'

const days = [
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
  'Senin',
  'Selasa',
]

// Data contoh sementara
const moodValues: (number | null)[] = [
  null, 2.8, null, null, 3.8, null, 3.2,
]

const deadlineValues: (number | null)[] = [
  null, 2, null, null, 4, null, 2.9,
]

type WeeklyChartProps = {
  values: (number | null)[]
  max: number
  step: number
  label: string
}

function WeeklyChart({
  values,
  max,
  step,
  label,
}: WeeklyChartProps) {
  const left = 48
  const top = 12
  const chartHeight = 165
  const chartWidth = 390
  const bottom = top + chartHeight
  const barWidth = 20
  const tickCount = Math.round(max / step)

  return (
    <svg
      className="insight-chart"
      viewBox="0 0 470 225"
      role="img"
      aria-label={label}
    >
      {/* Garis bantu horizontal dan label skala */}
      {Array.from({ length: tickCount + 1 }, (_, index) => {
        const value = max - index * step
        const y = top + ((max - value) / max) * chartHeight

        return (
          <g key={value}>
            <line
              x1={left}
              y1={y}
              x2={left + chartWidth}
              y2={y}
              className="chart-grid-line"
            />

            <text
              x={left - 10}
              y={y + 5}
              textAnchor="end"
              className="chart-axis"
            >
              {Number.isInteger(value) ? value : value.toFixed(1)}
            </text>
          </g>
        )
      })}

      {/* Sumbu berbentuk L */}
      <path
        d={`M ${left} ${top} V ${bottom} H ${left + chartWidth}`}
        className="chart-axis-line"
      />

      {/* Batang grafik dan label hari */}
      {days.map((day, index) => {
        const x = left + (chartWidth / 6) * index
        const value = values[index]

        const barHeight =
          value === null
            ? 0
            : (Math.max(0, Math.min(value, max)) / max) *
              chartHeight

        return (
          <g key={day}>
            {value !== null && (
              <rect
                x={x - barWidth / 2}
                y={bottom - barHeight}
                width={barWidth}
                height={barHeight}
                rx={4}
                className="chart-bar"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <title>{`${day}: ${value}`}</title>
              </rect>
            )}

            <text
              x={x}
              y={bottom + 25}
              textAnchor="middle"
              className="chart-day"
            >
              {day}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function Wawasan() {
  return (
    <section className="insight-page">
      <header className="insight-hero">
        <div className="insight-hero-copy">
          <p className="insight-eyebrow">
            Temukan pola emosional Anda
          </p>

          <h1>Wawasan &amp; pola kondisi</h1>

          <p className="insight-description">
            Pahami korelasi antara beban tugas akademik dan
            kesehatan mentalmu
          </p>
        </div>

        <div
          className="insight-illustration"
          aria-hidden="true"
        >
          <div className="insight-dashboard">
            <div className="dashboard-sidebar">
              <span />
              <span />
              <span />
            </div>

            <div className="dashboard-content">
              <div className="dashboard-pill" />

              <div className="dashboard-metrics">
                <div>
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="dashboard-bottom">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>

          <div className="insight-person">●</div>
          <div className="insight-plant">♧</div>
        </div>
      </header>

      <div className="insight-grid">
        <article className="insight-card">
          <h2>Tren Mood 7 Hari Terakhir</h2>

          <div className="insight-legend">
            <span>Skala Mood</span>
          </div>

          <WeeklyChart
            values={moodValues}
            max={4}
            step={0.4}
            label="Grafik batang tren mood selama tujuh hari"
          />
        </article>

        <article className="insight-card">
          <h2>Jumlah Deadline &amp; Tingkat Stres</h2>

          <div className="insight-legend">
            <span>Jumlah Deadline Task</span>
          </div>

          <WeeklyChart
            values={deadlineValues}
            max={4}
            step={0.5}
            label="Grafik batang jumlah deadline selama tujuh hari"
          />
        </article>
      </div>
    </section>
  )
}
