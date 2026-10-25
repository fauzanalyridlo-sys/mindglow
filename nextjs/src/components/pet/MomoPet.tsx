'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import './momo-pet.css'

type Action = 'idle' | 'happy' | 'eat' | 'play'
type Particle = { id: number; emoji: string; dx: number }

const MIN_X = 18
const MAX_X = 82
const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v))

export default function MomoPet() {
  const [happiness, setHappiness] = useState(70)
  const [fullness, setFullness] = useState(65)
  const [energy, setEnergy] = useState(80)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState<string | null>(
    'Halo! Jangan lupa istirahat ya! ✨'
  )
  const [action, setAction] = useState<Action>('idle')
  const [x, setX] = useState(50)
  const [facing, setFacing] = useState<1 | -1>(1)
  const [walking, setWalking] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  const stageRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ active: false, moved: false, startX: 0 })
  const particleId = useRef(0)
  const xRef = useRef(50)
  const wasSleeping = useRef(false)

  // Sinkronkan ref setelah render (bukan saat render)
  useEffect(() => {
    xRef.current = x
  }, [x])

  const sleeping = energy < 20

  /* ---------- helpers ---------- */
  const say = useCallback((text: string) => setMessage(text), [])

  const spawn = useCallback((emoji: string, count = 3) => {
    const items: Particle[] = Array.from({ length: count }, () => ({
      id: ++particleId.current,
      emoji,
      dx: Math.round(Math.random() * 60 - 30),
    }))
    setParticles((p) => [...p, ...items])
    window.setTimeout(() => {
      setParticles((p) => p.filter((i) => !items.some((n) => n.id === i.id)))
    }, 1200)
  }, [])

  /* ---------- reset action ---------- */
  useEffect(() => {
    if (action === 'idle') return
    const t = window.setTimeout(() => setAction('idle'), 1000)
    return () => window.clearTimeout(t)
  }, [action])

  /* ---------- hide bubble ---------- */
  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(() => setMessage(null), 3500)
    return () => window.clearTimeout(t)
  }, [message])

  /* ---------- stats decay / sleep recovery ---------- */
  useEffect(() => {
    const t = window.setInterval(() => {
      setFullness((v) => clamp(v - 2))
      setHappiness((v) => clamp(v - 1))
      setEnergy((v) => (v < 20 ? clamp(v + 4) : clamp(v - 1)))
    }, 6000)
    return () => window.clearInterval(t)
  }, [])

  /* ---------- sleep / wake message ---------- */
  useEffect(() => {
    if (wasSleeping.current && !sleeping) say('Hoaam... aku sudah segar lagi! ☀️')
    if (!wasSleeping.current && sleeping) say('Zzz... aku ngantuk 😴')
    wasSleeping.current = sleeping
  }, [sleeping, say])

  /* ---------- wander randomly ---------- */
  useEffect(() => {
    const t = window.setInterval(() => {
      if (dragRef.current.active || sleeping) return
      if (Math.random() < 0.35) return // kadang diam saja

      const current = xRef.current
      const target = clamp(current + (Math.random() * 50 - 25), MIN_X, MAX_X)
      if (Math.abs(target - current) < 6) return

      setFacing(target > current ? 1 : -1)
      setWalking(true)
      setX(target)
      window.setTimeout(() => setWalking(false), 1700)
    }, 3800)
    return () => window.clearInterval(t)
  }, [sleeping])

  /* ---------- actions ---------- */
  function petMomo() {
    if (sleeping) {
      say('Zzz... (Momo masih tidur)')
      return
    }
    setHappiness((v) => clamp(v + 8))
    setScore((v) => v + 1)
    setAction('happy')
    spawn('💗')
    say('Meow! Aku suka dielus! 💗')
  }

  function feedMomo() {
    if (fullness >= 100) {
      setAction('happy')
      say('Aku sudah kenyang! 🍚')
      return
    }
    setFullness((v) => clamp(v + 15))
    setEnergy((v) => clamp(v + 5))
    setAction('eat')
    spawn('🍚', 2)
    say('Nyam nyam! Terima kasih!')
  }

  function playWithMomo() {
    if (energy < 15) {
      say('Aku capek. Istirahat dulu, ya!')
      return
    }
    setHappiness((v) => clamp(v + 12))
    setEnergy((v) => clamp(v - 15))
    setFullness((v) => clamp(v - 5))
    setScore((v) => v + 5)
    setAction('play')
    spawn('✨', 4)
    say('Yeay! Main lagi! ✨')
  }

  /* ---------- drag ---------- */
  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    dragRef.current = { active: true, moved: false, startX: e.clientX }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragRef.current.active || !stageRef.current) return

    if (!dragRef.current.moved && Math.abs(e.clientX - dragRef.current.startX) > 5) {
      dragRef.current.moved = true
      setDragging(true)
      setWalking(false)
    }
    if (!dragRef.current.moved) return

    const rect = stageRef.current.getBoundingClientRect()
    const next = clamp(((e.clientX - rect.left) / rect.width) * 100, MIN_X, MAX_X)
    setFacing(next > xRef.current ? 1 : -1)
    setX(next)
  }

  function onPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    const wasMoved = dragRef.current.moved
    dragRef.current.active = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }

    if (wasMoved) {
      setDragging(false)
      say('Wuuush! Seru! 🎈')
    } else {
      petMomo()
    }
  }

  const cls = [
    'momo-character',
    action,
    walking ? 'walking' : '',
    sleeping ? 'sleeping' : '',
    dragging ? 'dragging' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside className="momo-pet" aria-label="Pet virtual Momo">
      <div className="momo-garden" ref={stageRef}>
        <div
          className={`momo-walker ${dragging ? 'is-dragging' : ''}`}
          style={{ left: `${x}%` }}
        >
          {message && (
            <div className="momo-bubble" key={message}>
              {message}
            </div>
          )}

          {particles.map((p) => (
            <span
              key={p.id}
              className="momo-particle"
              style={{ ['--dx' as string]: `${p.dx}px` }}
            >
              {p.emoji}
            </span>
          ))}

          {sleeping && <span className="momo-zzz">Zzz</span>}

          <button
            type="button"
            className={cls}
            aria-label="Elus Momo (tahan dan geser untuk memindahkan)"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                petMomo()
              }
            }}
          >
            <span className="momo-flip" style={{ transform: `scaleX(${facing})` }}>
              <span className="momo-tail" />
              <span className="momo-torso" />
              <span className="momo-ear momo-ear-left" />
              <span className="momo-ear momo-ear-right" />
              <span className="momo-body">
                <span className="momo-patch" />
                <span className="momo-eye eye-left" />
                <span className="momo-eye eye-right" />
                <span className="momo-cheek cheek-left" />
                <span className="momo-cheek cheek-right" />
                <span className="momo-mouth">{action === 'eat' ? 'o' : 'ᴗ'}</span>
              </span>
              <span className="momo-foot foot-left" />
              <span className="momo-foot foot-right" />
            </span>
          </button>

          <span className="momo-ground" />
        </div>
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