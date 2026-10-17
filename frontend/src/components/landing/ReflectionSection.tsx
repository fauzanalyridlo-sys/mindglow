import ReflectionDemo from './ReflectionDemo'
import '../../styles/reflection.css'

const benefits = [
  {
    icon: '◈',
    title: 'Memahami konteks',
    description: 'Berdasarkan ceritamu sendiri',
  },
  {
    icon: '♡',
    title: 'Respons empatik',
    description: 'Tanpa penilaian dari luar',
  },
  {
    icon: '✧',
    title: 'Wawasan bermakna',
    description: 'Buka sudut pandang baru',
  },
]

export default function ReflectionSection() {
  return (
    <section className="reflection-section" id="reflection">
      <div className="reflection-container">
        <div className="reflection-layout">
          <ReflectionDemo />

          <div className="reflection-description">
            <span className="reflection-number">02</span>

            <h2>
              Refleksi yang
              <br />
              terasa personal,
              <br />
              bukan menggurui.
            </h2>

            <p className="reflection-intro">
              AI membantu merangkum ceritamu dengan bahasa yang
              empatik, lalu menawarkan pertanyaan untuk mengenal
              dirimu lebih dalam.
            </p>

            <div className="reflection-benefits">
              {benefits.map((benefit) => (
                <div className="reflection-benefit" key={benefit.title}>
                  <span className="reflection-benefit-icon" aria-hidden="true">
                    {benefit.icon}
                  </span>

                  <div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
