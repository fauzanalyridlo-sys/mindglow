import Icon, { type IconName } from '../ui/Icon'
import '../../styles/public-features.css'

type Feature = {
  icon: IconName
  number: string
  title: string
  description: string
  color: string
  href: string
}

const features: Feature[] = [
  {
    icon: 'calendar',
  number: '01',
  title: 'Check-in harian',
    description:
      'Kenali perasaanmu hari ini melalui refleksi singkat yang terasa ringan.',
    color: 'pink',
    href: '#checkin',
  },
  {
    icon: 'brain',
  number: '02',
  title: 'Refleksi AI',
    description:
      'Temukan perspektif yang empatik dan personal tanpa rasa menghakimi.',
    color: 'green',
    href: '#reflection',
  },
  {
     icon: 'message',
  number: '03',
  title: 'Jurnal terpandu',
    description:
      'Tulis ceritamu dengan aman untuk memahami pola pikiran dan emosimu.',
    color: 'cream',
    href: '#journal',
  },
]

export default function FeaturesSection() {
  return (
    <section className="features-section" id="fitur">
      <div className="container">
        <div className="features-heading">
          <span className="features-label">
            DIBUAT UNTUK KESEHARIANMU
          </span>

          <h2>
            Memahami diri terasa lebih
            <br />
            sederhana.
          </h2>

          <p>
  Rutinitas kecil yang membantumu berhenti sejenak,
  mengenali perasaan, dan melangkah dengan lebih sadar.
</p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <article
              className={`feature-card feature-card--${feature.color}`}
              key={feature.number}
            >
              <div className="feature-card-top">
                <span className="feature-icon">
                  <Icon name={feature.icon} size={20} />
                </span>

                <span className="feature-number">
                  {feature.number}
                </span>
              </div>

              <div className="feature-card-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>

                <a href={feature.href}>
                  Lihat fitur <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}