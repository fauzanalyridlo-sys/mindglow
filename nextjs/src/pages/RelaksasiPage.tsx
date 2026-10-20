import { useEffect, useState } from 'react'
import '../styles/relaksasi.css'
import '../styles/animasi-relaksasi.css'

type BreathPhase = 'siap' | 'tarik' | 'tahan' | 'hembus' | 'selesai'

const phases: {
  name: BreathPhase
  duration: number
  instruction: string
}[] = [
  {
    name: 'tarik',
    duration: 4,
    instruction: 'Tarik napas perlahan melalui hidung.',
  },
  {
    name: 'tahan',
    duration: 7,
    instruction: 'Tahan napas dengan nyaman.',
  },
  {
    name: 'hembus',
    duration: 8,
    instruction: 'Hembuskan napas perlahan melalui mulut.',
  },
]

const TOTAL_CYCLES = 4

const phaseLabels: Record<BreathPhase, string> = {
  siap: 'Siapkan dirimu untuk memulai',
  tarik: 'Tarik napas',
  tahan: 'Tahan napas',
  hembus: 'Hembuskan napas',
  selesai: 'Latihan selesai',
}

export default function RelaksasiPage() {
  const [phase, setPhase] = useState<BreathPhase>('siap')
  const [seconds, setSeconds] = useState(3)
  const [isRunning, setIsRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [cycles, setCycles] = useState(0)

  useEffect(() => {
    if (!isRunning) return

    const timer = window.setTimeout(() => {
      if (seconds > 1) {
        setSeconds((current) => current - 1)
        return
      }

      if (phase === 'siap') {
        setPhase('tarik')
        setPhaseIndex(0)
        setSeconds(phases[0].duration)
        return
      }

      const nextIndex = phaseIndex + 1

      if (nextIndex < phases.length) {
        setPhaseIndex(nextIndex)
        setPhase(phases[nextIndex].name)
        setSeconds(phases[nextIndex].duration)
        return
      }

      const nextCycles = cycles + 1
      setCycles(nextCycles)

      if (nextCycles >= TOTAL_CYCLES) {
        setPhase('selesai')
        setSeconds(0)
        setIsRunning(false)
        return
      }

      setPhaseIndex(0)
      setPhase('tarik')
      setSeconds(phases[0].duration)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [isRunning, seconds, phase, phaseIndex, cycles])

  const startRelaxation = () => {
    setPhase('siap')
    setSeconds(3)
    setPhaseIndex(0)
    setCycles(0)
    setIsRunning(true)
  }

  const finishRelaxation = () => {
    setIsRunning(false)
    setPhase('selesai')
    setSeconds(0)
  }

  const resetRelaxation = () => {
    setIsRunning(false)
    setPhase('siap')
    setSeconds(3)
    setPhaseIndex(0)
    setCycles(0)
  }

  const instruction =
    phase === 'siap'
      ? 'Siapkan dirimu untuk memulai.'
      : phase === 'selesai'
        ? 'Kamu sudah meluangkan waktu untuk dirimu sendiri. Bernapaslah secara normal sebelum melanjutkan aktivitas.'
        : phases.find((item) => item.name === phase)?.instruction

  return (
    <main className="relax-page">
      <section className="relax-content">
        <header className="relax-header">
          <h1>LATIHAN PERNAPASAN 4–7–8</h1>
          <p>
            Latihan singkat untuk membantumu menenangkan diri saat sedang
            merasa tegang.
          </p>
        </header>

        <div
          className={`breath-stage phase-${phase}`}
          role="timer"
          aria-label={`${phaseLabels[phase]}, ${seconds} detik`}
        >
          <div className="breath-circle">
            <div className="breath-circle-content">
              <span
                key={`${phase}-${seconds}`}
                className="breath-number"
                aria-live="polite"
                aria-atomic="true"
              >
                {seconds}
              </span>

              <span className="breath-label">
                {phaseLabels[phase]}
              </span>
            </div>
          </div>
        </div>

        <p className="relax-instruction" aria-live="polite">
          {instruction}
        </p>

        {isRunning && phase !== 'siap' && (
          <div className="relax-progress">
            <div
              className="relax-progress-track"
              role="progressbar"
              aria-label="Putaran latihan selesai"
              aria-valuemin={0}
              aria-valuemax={TOTAL_CYCLES}
              aria-valuenow={cycles}
            >
              <div
                className="relax-progress-fill"
                style={{
                  width: `${(cycles / TOTAL_CYCLES) * 100}%`,
                }}
              />
            </div>

            <span>
              Putaran {Math.min(cycles + 1, TOTAL_CYCLES)} dari {TOTAL_CYCLES}
            </span>
          </div>
        )}

        <div className="relax-actions">
          {phase === 'selesai' ? (
            <button
              type="button"
              className="relax-button relax-button-start"
              onClick={resetRelaxation}
            >
              Ulangi Relaksasi
            </button>
          ) : (
            <button
              type="button"
              className="relax-button relax-button-start"
              onClick={startRelaxation}
              disabled={isRunning}
            >
              {isRunning ? 'Relaksasi Berlangsung' : 'Mulai Relaksasi'}
            </button>
          )}

          <button
            type="button"
            className="relax-button relax-button-finish"
            onClick={finishRelaxation}
            disabled={phase === 'selesai'}
          >
            Selesai
          </button>
        </div>

        <p className="relax-tip">
          Lakukan dengan nyaman. Jika merasa pusing atau tidak nyaman,
          hentikan latihan dan bernapaslah secara normal.
        </p>
      </section>
    </main>
  )
}
