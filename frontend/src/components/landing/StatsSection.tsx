import '../../styles/stats.css'

const stats = [
  { value: '1 menit', label: 'untuk check-in' },
  { value: '24/7', label: 'ruang refleksi' },
  { value: '100%', label: 'privat & aman' },
  { value: 'Setiap hari', label: 'temani harimu' },
]

export default function StatsSection() {
  return (
    <section className="stats" aria-label="Keunggulan MindGlow">
      <div className="container stats-grid">
        {stats.map((stat) => (
          <div className="stat-item" key={stat.value}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}