'use client'

import { useEffect, useState } from 'react'
import './momo-pet.css'

type Action = 'idle' | 'happy' | 'eat' | 'play'

export default function MomoPet() {
  const [happiness, setHappiness] = useState(70)
  const [fullness, setFullness] = useState(65)
  const [energy, setEnergy] = useState(80)
  const [message, setMessage] = useState('Halo! Jangan lupa istirahat ya! ✨')
  const [action, setAction] = useState<Action>('idle')
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (action === 'idle') return
    const timer = window.setTimeout(() => setAction('idle'), 1100)
    return () => window.clearTimeout(timer)
  }, [action])

  function petMomo() {
    setHappiness((v) => Math.min(100, v + 8))
    setMessage('Meow! Aku suka dielus! 💗')
    setAction('happy')
    setScore((v) => v + 1)
  }

  function feedMomo() {
    if (fullness >= 100) {
      setMessage('Aku sudah kenyang! 🍚')
      setAction('happy')
      return
    }

    setFullness((v) => Math.min(100, v + 15))
    setEnergy((v) => Math.min(100, v + 5))
    setMessage('Nyam nyam! Terima kasih!')
    setAction('eat')
  }

  function playWithMomo() {
    if (energy < 15) {
      setMessage('Aku capek. Istirahat dulu, ya!')
      setAction('idle')
      return
    }

    setHappiness((v) => Math.min(100, v + 12))
    setEnergy((v) => Math.max(0, v - 15))
    setFullness((v) => Math.max(0, v - 5))
    setScore((v) => v + 5)
    setMessage('Yeay! Main lagi! ✨')
    setAction('play')
  }

  return (
    <aside className="momo-pet" aria-label="Pet virtual Momo">
      <div className="momo-garden">
        <div className="garden-cloud cloud-one" />
        <div className="garden-cloud cloud-two" />
        <div className="garden-tree tree-one" />
        <div className="garden-tree tree-two" />
        <div className="garden-fence" />
        <div className="garden-hill" />

        <span className="garden-flower flower-one">🌼</span>
        <span className="garden-flower flower-two">🌸</span>
        <span className="garden-heart">♥</span>

        <div className="momo-bubble" key={message}>
          {message}
        </div>

        <button
          type="button"
          className={`momo-character ${action}`}
          onClick={petMomo}
          aria-label="Elus Momo"
        >
          <span className="momo-tail" />
          <span className="momo-ear momo-ear-left" />
          <span className="momo-ear momo-ear-right" />
          <span className="momo-body">
            <span className="momo-patch" />
            <span className="momo-eye eye-left" />
            <span className="momo-eye eye-right" />
            <span className="momo-cheek cheek-left" />
            <span className="momo-cheek cheek-right" />
            <span className="momo-mouth">ᴗ</span>
          </span>
          <span className="momo-foot foot-left" />
          <span className="momo-foot foot-right" />
        </button>

        <span className="momo-ground" />
      </div>

      <div className="momo-panel">
        <header className="momo-heading">
          <span className="momo-heading-icon">🌿</span>
          <strong>Momo</strong>
          <span className="momo-level">Lv. 1</span>
        </header>

        <div className="momo-stats">
          <PetStat icon="💗" label="Kebahagiaan" value={happiness} />
          <PetStat icon="🍚" label="Kenyang" value={fullness} />
          <PetStat icon="⚡" label="Energi" value={energy} />
        </div>

        <div className="momo-actions">
          <button type="button" onClick={petMomo}>
            <span>💗</span>Elus
          </button>
          <button type="button" onClick={feedMomo}>
            <span>🍚</span>Beri Makan
          </button>
          <button type="button" onClick={playWithMomo}>
            <span>🎮</span>Main
          </button>
        </div>

        <div className="momo-score">
          <span>⭐ Skor bermain</span>
          <strong>{score}</strong>
        </div>
      </div>
    </aside>
  )
}

function PetStat({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: number
}) {
  return (
    <div className="momo-stat">
      <span className="momo-stat-icon">{icon}</span>
      <span className="momo-stat-label">{label}</span>
      <div
        className="momo-progress"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
