'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import './momo-pet.css'
import { CatSprite, CreeperSprite, type EyeState } from './MomoSprites'
import { useWorld, type Phase, type Weather } from './momo-world'
import {
  ACCESSORIES,
  DEFAULT_SAVED,
  SKINS,
  applyOffline,
  clamp,
  clearSaved,
  greeting,
  levelProgress,
  loadSaved,
  saveSaved,
  todayKey,
  unlocksAt,
  type Saved,
} from './momo-data'

type Action = 'idle' | 'happy' | 'eat' | 'play' | 'puff'
type Particle = { id: number; emoji: string; dx: number }
type Orb = { id: number; x: number; y: number; born: number }
type Burst = { id: number; x: number; y: number }
type Creeper = { x: number; dir: 1 | -1; fleeing: boolean }

const MIN_X = 18
const MAX_X = 82

const FEED_LINES = [
  'Nyam nyam! Ikannya enak! 🐟',
  'Ikan mentah favoritku! 🐟',
  'Terima kasih! Perutku hangat 💗',
]

/* Apakah tab sedang terlihat (timer dijeda kalau tersembunyi) */
function subscribeVisibility(cb: () => void) {
  document.addEventListener('visibilitychange', cb)
  return () => document.removeEventListener('visibilitychange', cb)
}

function usePageVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState !== 'hidden',
    () => true
  )
}

export default function MomoPet() {
  const world = useWorld()
  const visible = usePageVisible()

  /* ---------- data utama (tersimpan) ---------- */
  const [pet, setPet] = useState<Saved>(DEFAULT_SAVED)
  const [hydrated, setHydrated] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  /* ---------- state sementara ---------- */
  const [message, setMessage] = useState<string | null>(null)
  const [action, setAction] = useState<Action>('idle')
  const [x, setX] = useState(50)
  const [facing, setFacing] = useState<1 | -1>(1)
  const [walking, setWalking] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [bursts, setBursts] = useState<Burst[]>([])
  const [orbs, setOrbs] = useState<Orb[]>([])
  const [creeper, setCreeper] = useState<Creeper | null>(null)
  const [fishKey, setFishKey] = useState(0)

  /* ---------- refs ---------- */
  const stageRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
  })
  const petRef = useRef(pet)
  const xRef = useRef(50)
  const cursorRef = useRef<{ x: number; t: number } | null>(null)
  const creeperRef = useRef<Creeper | null>(null)
  const walkTimer = useRef<number | null>(null)
  const fishTimer = useRef<number | null>(null)
  const particleId = useRef(0)
  const orbId = useRef(0)
  const burstId = useRef(0)
  const wasSleeping = useRef(false)
  const prevLevel = useRef(1)
  const prevWeather = useRef<Weather>('clear')
  const prevPhase = useRef<Phase>('day')
  const worldInit = useRef(false)

  useEffect(() => {
    petRef.current = pet
  }, [pet])

  useEffect(() => {
    xRef.current = x
  }, [x])

  const { level, pct } = levelProgress(pet.score)
  const sleeping = pet.asleep
  const skin = SKINS.find((s) => s.id === pet.skin) ?? SKINS[0]
  const displayName = pet.name.trim() || 'Momo'
  const eyes: EyeState = sleeping
    ? 'sleep'
    : action === 'happy' || action === 'play'
      ? 'happy'
      : 'open'

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
      setParticles((p) =>
        p.filter((i) => !items.some((n) => n.id === i.id))
      )
    }, 1200)
  }, [])

  const moveTo = useCallback((target: number) => {
    setFacing(target > xRef.current ? 1 : -1)
    setWalking(true)
    setX(target)

    if (walkTimer.current) {
      window.clearTimeout(walkTimer.current)
    }

    walkTimer.current = window.setTimeout(
      () => setWalking(false),
      1700
    )
  }, [])

  /* ---------- muat data tersimpan dan hadiah check-in ---------- */
  useEffect(() => {
    const id = window.setTimeout(() => {
      const saved = loadSaved()
      const now = Date.now()

      let next: Saved = DEFAULT_SAVED
      let hours = 0

      if (saved) {
        const result = applyOffline(saved, now)
        next = result.saved
        hours = result.hours
      }

      const loaded: Saved = { ...next, lastSeen: now }
      const pendingCheckin = localStorage.getItem(
        'momo:pending-checkin'
      )
      const today = todayKey()
      let rewardedForCheckin = false

      if (pendingCheckin) {
        // Hapus penanda supaya tidak diproses ulang.
        localStorage.removeItem('momo:pending-checkin')

        // Hadiah hanya diberikan untuk tanggal hari ini, sekali sehari.
        if (
          pendingCheckin === today &&
          loaded.lastCheckin !== today
        ) {
          loaded.happiness = clamp(loaded.happiness + 20)
          loaded.score += 10
          loaded.lastCheckin = today
          rewardedForCheckin = true
        }
      }

      prevLevel.current = levelProgress(loaded.score).level
      wasSleeping.current = loaded.asleep
      petRef.current = loaded

      setPet(loaded)
      setHydrated(true)

      if (rewardedForCheckin) {
        setAction('play')
        spawn('🎉', 4)
        setMessage(
          'Hebat! Check-in hari ini selesai! +10 XP 🎉'
        )
      } else {
        setMessage(
          greeting(hours, new Date().getHours(), !saved)
        )
      }
    }, 0)

    return () => window.clearTimeout(id)
  }, [spawn])

  /* ---------- simpan setiap ada perubahan ---------- */
  useEffect(() => {
    if (!hydrated) return

    saveSaved({
      ...pet,
      lastSeen: Date.now(),
    })
  }, [pet, hydrated])

  /* ---------- simpan saat tab disembunyikan, hitung waktu ditinggal ---------- */
  useEffect(() => {
    if (!hydrated) return

    let hiddenAt = 0

    function onVisibility() {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now()

        saveSaved({
          ...petRef.current,
          lastSeen: hiddenAt,
        })
      } else if (hiddenAt) {
        const now = Date.now()

        if (now - hiddenAt > 5 * 60_000) {
          const { saved, hours } = applyOffline(
            {
              ...petRef.current,
              lastSeen: hiddenAt,
            },
            now
          )

          setPet({
            ...saved,
            lastSeen: now,
          })

          setMessage(
            hours >= 6
              ? 'Kamu lama tidak datang... aku kangen! 💗'
              : 'Selamat datang kembali! 👋'
          )
        }

        hiddenAt = 0
      }
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      document.removeEventListener(
        'visibilitychange',
        onVisibility
      )
    }
  }, [hydrated])

  /* ---------- reset action ---------- */
  useEffect(() => {
    if (action === 'idle') return

    const timer = window.setTimeout(
      () => setAction('idle'),
      action === 'puff' ? 1300 : 1000
    )

    return () => window.clearTimeout(timer)
  }, [action])

  /* ---------- sembunyikan bubble ---------- */
  useEffect(() => {
    if (!message) return

    const timer = window.setTimeout(
      () => setMessage(null),
      4500
    )

    return () => window.clearTimeout(timer)
  }, [message])

  /* ---------- stat turun pelan setiap 30 detik ---------- */
  useEffect(() => {
    if (!hydrated || !visible) return

    const weather = world.weather

    const timer = window.setInterval(() => {
      const now = Date.now()

      setPet((p) => {
        const energy = p.asleep
          ? clamp(p.energy + 20)
          : clamp(p.energy - 1)

        const asleep = p.asleep
          ? energy < 50
          : energy < 20

        const moodShift =
          weather === 'rain'
            ? -2
            : weather === 'snow'
              ? 0
              : -1

        return {
          ...p,
          fullness: clamp(p.fullness - 1),
          happiness: clamp(p.happiness + moodShift),
          energy,
          asleep,
          lastSeen: now,
        }
      })
    }, 30_000)

    return () => window.clearInterval(timer)
  }, [hydrated, visible, world.weather])

  /* ---------- pesan tidur / bangun ---------- */
  useEffect(() => {
    if (!hydrated) return

    const previousSleeping = wasSleeping.current
    wasSleeping.current = sleeping

    if (previousSleeping === sleeping) return

    const timer = window.setTimeout(
      () =>
        say(
          sleeping
            ? 'Zzz... aku ngantuk 😴'
            : 'Hoaam... aku sudah segar lagi! ☀️'
        ),
      0
    )

    return () => window.clearTimeout(timer)
  }, [sleeping, hydrated, say])

  /* ---------- pesan saat cuaca / malam berubah ---------- */
  useEffect(() => {
    if (!hydrated) return

    if (!worldInit.current) {
      worldInit.current = true
      prevWeather.current = world.weather
      prevPhase.current = world.phase
      return
    }

    const previousWeather = prevWeather.current
    const previousPhase = prevPhase.current

    prevWeather.current = world.weather
    prevPhase.current = world.phase

    let text: string | null = null

    if (world.weather !== previousWeather) {
      text =
        world.weather === 'rain'
          ? 'Hujan turun... 🌧️ aku jadi agak murung'
          : world.weather === 'snow'
            ? 'Salju! ❄️ Dingin tapi seru!'
            : 'Cuacanya cerah lagi! ☀️'
    } else if (
      world.phase !== previousPhase &&
      world.phase === 'night'
    ) {
      text = 'Sudah malam. Bintangnya cantik ya ✨'
    }

    if (!text) return

    const nextMessage = text
    const timer = window.setTimeout(
      () => say(nextMessage),
      0
    )

    return () => window.clearTimeout(timer)
  }, [hydrated, world.weather, world.phase, say])

  /* ---------- pengingat istirahat larut malam ---------- */
  useEffect(() => {
    if (!hydrated || !visible) return

    const timer = window.setInterval(() => {
      const hour = new Date().getHours()

      if (
        (hour >= 23 || hour < 4) &&
        !petRef.current.asleep
      ) {
        setMessage(
          'Sudah larut... istirahat dulu ya, besok lanjut lagi 🌙'
        )
      }
    }, 15 * 60_000)

    return () => window.clearInterval(timer)
  }, [hydrated, visible])

  /* ---------- level naik ---------- */
  useEffect(() => {
    if (!hydrated) return

    if (level <= prevLevel.current) {
      prevLevel.current = level
      return
    }

    prevLevel.current = level
    const items = unlocksAt(level)

    const timer = window.setTimeout(() => {
      setAction('play')
      spawn('⭐', 5)

      say(
        `Level ${level}! ${items.length
          ? `Baru: ${items.join(', ')} 🎁`
          : '🎉'
        }`
      )
    }, 0)

    return () => window.clearTimeout(timer)
  }, [level, hydrated, say, spawn])

  /* ---------- lacak posisi kursor di sekitar area Momo ---------- */
  useEffect(() => {
    function onMove(e: PointerEvent) {
      const el = stageRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()

      if (
        e.clientY < rect.top - 60 ||
        e.clientY > rect.bottom + 60 ||
        e.clientX < rect.left - 60 ||
        e.clientX > rect.right + 60
      ) {
        cursorRef.current = null
        return
      }

      cursorRef.current = {
        x: clamp(
          ((e.clientX - rect.left) / rect.width) * 100,
          MIN_X,
          MAX_X
        ),
        t: performance.now(),
      }
    }

    window.addEventListener('pointermove', onMove, {
      passive: true,
    })

    return () => {
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  /* ---------- jalan sendiri / mengejar kursor ---------- */
  useEffect(() => {
    if (
      !hydrated ||
      !visible ||
      pet.asleep ||
      !pet.autoMove
    ) {
      return
    }

    const chase = pet.chase

    const timer = window.setInterval(() => {
      if (dragRef.current.active) return

      const cursor = cursorRef.current

      if (
        chase &&
        cursor &&
        performance.now() - cursor.t < 2500
      ) {
        if (Math.abs(cursor.x - xRef.current) < 8) {
          return
        }

        const step = Math.max(
          -24,
          Math.min(24, cursor.x - xRef.current)
        )

        moveTo(
          clamp(xRef.current + step, MIN_X, MAX_X)
        )

        return
      }

      if (Math.random() < 0.35) return

      const target = clamp(
        xRef.current + (Math.random() * 50 - 25),
        MIN_X,
        MAX_X
      )

      if (Math.abs(target - xRef.current) < 6) return

      moveTo(target)
    }, 1500)

    return () => window.clearInterval(timer)
  }, [
    hydrated,
    visible,
    pet.asleep,
    pet.autoMove,
    pet.chase,
    moveTo,
  ])

  /* ---------- creeper: muncul sesekali ---------- */
  useEffect(() => {
    if (!hydrated || !visible) return

    const timer = window.setInterval(() => {
      if (
        creeperRef.current ||
        petRef.current.asleep ||
        Math.random() > 0.35
      ) {
        return
      }

      const fromLeft = Math.random() < 0.5

      const nextCreeper: Creeper = {
        x: fromLeft ? -10 : 110,
        dir: fromLeft ? 1 : -1,
        fleeing: false,
      }

      creeperRef.current = nextCreeper
      setCreeper(nextCreeper)
    }, 25_000)

    return () => window.clearInterval(timer)
  }, [hydrated, visible])

  const hasCreeper = creeper !== null

  useEffect(() => {
    if (!hasCreeper || !visible) return

    const timer = window.setInterval(() => {
      const current = creeperRef.current
      if (!current) return

      let next: Creeper = {
        ...current,
        x:
          current.x +
          current.dir * (current.fleeing ? 2.4 : 0.9),
      }

      if (
        !next.fleeing &&
        !petRef.current.asleep &&
        Math.abs(next.x - xRef.current) < 20
      ) {
        next = {
          ...next,
          fleeing: true,
          dir: next.dir === 1 ? -1 : 1,
        }

        setAction('puff')
        setMessage('Hsss! Pergi sana, Creeper! 😾')

        setPet((p) => ({
          ...p,
          happiness: clamp(p.happiness + 3),
          score: p.score + 1,
        }))
      }

      if (next.x < -16 || next.x > 116) {
        creeperRef.current = null
        setCreeper(null)
        return
      }

      creeperRef.current = next
      setCreeper(next)
    }, 120)

    return () => window.clearInterval(timer)
  }, [hasCreeper, visible])

  /* ---------- XP orb: muncul acak, hilang sendiri ---------- */
  useEffect(() => {
    if (!hydrated || !visible) return

    const timer = window.setInterval(() => {
      const now = Date.now()
      const skip = Math.random() > 0.7

      const fresh: Orb = {
        id: ++orbId.current,
        x:
          MIN_X -
          8 +
          Math.random() * (MAX_X - MIN_X + 16),
        y: 50 + Math.random() * 100,
        born: now,
      }

      setOrbs((previous) => {
        const alive = previous.filter(
          (orb) => now - orb.born < 12_000
        )

        return alive.length >= 3 || skip
          ? alive
          : [...alive, fresh]
      })
    }, 7000)

    return () => window.clearInterval(timer)
  }, [hydrated, visible])

  /* ---------- aksi elus Momo ---------- */
  function petMomo() {
    if (sleeping) {
      say('Zzz... (Momo masih tidur)')
      return
    }

    setPet((p) => ({
      ...p,
      happiness: clamp(p.happiness + 8),
      score: p.score + 1,
    }))

    setAction('happy')
    spawn('💗')
    say('Meow! Aku suka dielus! 💗')
  }

  /* ---------- aksi memberi makan ---------- */
  function feedMomo() {
    if (sleeping) {
      say('Zzz... (Momo masih tidur)')
      return
    }

    if (pet.fullness >= 100) {
      setAction('happy')
      say('Aku sudah kenyang! 🐟')
      return
    }

    setPet((p) => ({
      ...p,
      fullness: clamp(p.fullness + 15),
      energy: clamp(p.energy + 10),
      score: p.score + 2,
    }))

    setAction('eat')
    setFishKey((key) => key + 1)

    if (fishTimer.current) {
      window.clearTimeout(fishTimer.current)
    }

    fishTimer.current = window.setTimeout(
      () => setFishKey(0),
      900
    )

    say(
      FEED_LINES[
      Math.floor(Math.random() * FEED_LINES.length)
      ]
    )
  }

  /* ---------- aksi bermain dengan Momo ---------- */
  function playWithMomo() {
    if (sleeping) {
      say('Zzz... (Momo masih tidur)')
      return
    }

    if (pet.energy < 15) {
      say('Aku capek. Istirahat dulu, ya!')
      return
    }

    setPet((p) => ({
      ...p,
      happiness: clamp(p.happiness + 12),
      energy: clamp(p.energy - 15),
      fullness: clamp(p.fullness - 5),
      score: p.score + 5,
    }))

    setAction('play')
    spawn('✨', 4)
    say('Yeay! Main lagi! ✨')
  }

  /* ---------- kumpulkan XP orb ---------- */
  function collectOrb(orb: Orb) {
    setOrbs((previous) =>
      previous.filter((item) => item.id !== orb.id)
    )

    setPet((p) => ({
      ...p,
      score: p.score + 2,
      happiness: clamp(p.happiness + 1),
    }))

    const id = ++burstId.current

    setBursts((previous) => [
      ...previous,
      {
        id,
        x: orb.x,
        y: orb.y,
      },
    ])

    window.setTimeout(() => {
      setBursts((previous) =>
        previous.filter((item) => item.id !== id)
      )
    }, 900)
  }

  /* ---------- reset progres ---------- */
  function resetAll() {
    clearSaved()

    localStorage.removeItem('momo:pending-checkin')

    const fresh: Saved = {
      ...DEFAULT_SAVED,
      lastSeen: Date.now(),
    }

    prevLevel.current = 1
    wasSleeping.current = false
    petRef.current = fresh

    setPet(fresh)
    setConfirmReset(false)
    setSettingsOpen(false)
    setX(50)
    setMessage(
      'Halo lagi! Aku Momo. Senang bertemu denganmu! ✨'
    )
  }
  /* ---------- drag Momo ---------- */
  function onPointerDown(
    e: React.PointerEvent<HTMLButtonElement>
  ) {
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
    }

    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(
    e: React.PointerEvent<HTMLButtonElement>
  ) {
    if (
      !dragRef.current.active ||
      !stageRef.current
    ) {
      return
    }

    if (
      !dragRef.current.moved &&
      Math.abs(
        e.clientX - dragRef.current.startX
      ) > 5
    ) {
      dragRef.current.moved = true
      setDragging(true)
      setWalking(false)
    }

    if (!dragRef.current.moved) return

    const rect =
      stageRef.current.getBoundingClientRect()

    const next = clamp(
      ((e.clientX - rect.left) / rect.width) * 100,
      MIN_X,
      MAX_X
    )

    setFacing(next > xRef.current ? 1 : -1)
    setX(next)
  }

  function onPointerUp(
    e: React.PointerEvent<HTMLButtonElement>
  ) {
    const wasMoved = dragRef.current.moved
    dragRef.current.active = false

    if (
      e.currentTarget.hasPointerCapture(e.pointerId)
    ) {
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
    <aside
      className={`momo-pet ${pet.animations ? '' : 'no-anim'}`}
      aria-label={`Pet virtual ${displayName}`}
    >
      <span
        className="momo-sr"
        role="status"
        aria-live="polite"
      >
        {message ?? ''}
      </span>

      <div className="momo-garden" ref={stageRef}>
        {creeper && (
          <div
            className={`momo-creeper ${creeper.fleeing ? 'is-fleeing' : ''
              }`}
            style={{ left: `${creeper.x}%` }}
          >
            <CreeperSprite />
          </div>
        )}

        {orbs.map((orb) => (
          <button
            key={orb.id}
            type="button"
            className="momo-orb"
            aria-label="Ambil XP orb"
            style={{
              left: `${orb.x}%`,
              bottom: `calc(var(--momo-floor) + ${orb.y}px)`,
            }}
            onClick={() => collectOrb(orb)}
          />
        ))}

        {bursts.map((burst) => (
          <span
            key={burst.id}
            className="momo-burst"
            style={{
              left: `${burst.x}%`,
              bottom: `calc(var(--momo-floor) + ${burst.y}px)`,
            }}
          >
            +2 XP
          </span>
        ))}

        <div
          className={`momo-walker ${dragging ? 'is-dragging' : ''
            }`}
          style={{ left: `${x}%` }}
        >
          {message && (
            <div
              className="momo-bubble"
              key={message}
              aria-hidden="true"
            >
              {message}
            </div>
          )}

          {particles.map((particle) => (
            <span
              key={particle.id}
              className="momo-particle"
              style={{
                ['--dx' as string]: `${particle.dx}px`,
              }}
            >
              {particle.emoji}
            </span>
          ))}

          {fishKey > 0 && (
            <span key={fishKey} className="momo-fish">
              🐟
            </span>
          )}

          {sleeping && (
            <span className="momo-zzz">Zzz</span>
          )}

          <span className="momo-ground" />

          <button
            type="button"
            className={cls}
            aria-label={`Elus ${displayName} (tahan dan geser untuk memindahkan)`}
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
            <span
              className="momo-flip"
              style={{ transform: `scaleX(${facing})` }}
            >
              <CatSprite
                eyes={eyes}
                eating={action === 'eat'}
                skin={skin}
                accessory={pet.accessory}
              />
            </span>
          </button>
        </div>
      </div>
      <div className="momo-panel">
        <header className="momo-heading">
          <span className="momo-heading-icon">🌿</span>

          <strong>{displayName}</strong>

          <span className="momo-level">
            Lv. {level}
          </span>

          <button
            type="button"
            className="momo-gear"
            aria-label="Pengaturan Momo"
            aria-expanded={settingsOpen}
            onClick={() => {
              setSettingsOpen((value) => !value)
              setConfirmReset(false)
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
            </svg>
          </button>
        </header>

        <div
          className="momo-xp"
          role="progressbar"
          aria-label="Progres menuju level berikutnya"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${pct}%` }} />
        </div>

        {settingsOpen ? (
          <div className="momo-settings">
            <label className="momo-field">
              <span>Nama</span>

              <input
                type="text"
                value={pet.name}
                maxLength={12}
                onChange={(e) => {
                  const value = e.target.value

                  setPet((p) => ({
                    ...p,
                    name: value,
                  }))
                }}
                onBlur={() => {
                  if (!pet.name.trim()) {
                    setPet((p) => ({
                      ...p,
                      name: 'Momo',
                    }))
                  }
                }}
              />
            </label>

            <div className="momo-toggles">
              <label>
                <input
                  type="checkbox"
                  checked={pet.animations}
                  onChange={(e) => {
                    const value = e.target.checked

                    setPet((p) => ({
                      ...p,
                      animations: value,
                    }))
                  }}
                />
                Animasi Momo
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={pet.autoMove}
                  onChange={(e) => {
                    const value = e.target.checked

                    setPet((p) => ({
                      ...p,
                      autoMove: value,
                    }))
                  }}
                />
                Jalan sendiri
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={pet.chase}
                  onChange={(e) => {
                    const value = e.target.checked

                    setPet((p) => ({
                      ...p,
                      chase: value,
                    }))
                  }}
                />
                Kejar kursor
              </label>
            </div>

            <fieldset className="momo-group">
              <legend>Warna bulu</legend>

              <div className="momo-choices">
                {SKINS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="momo-choice"
                    aria-pressed={pet.skin === item.id}
                    disabled={level < item.level}
                    onClick={() => {
                      setPet((p) => ({
                        ...p,
                        skin: item.id,
                      }))
                    }}
                  >
                    <i
                      style={{
                        background: item.swatch,
                      }}
                    />

                    {item.label}

                    {level < item.level
                      ? ` · Lv.${item.level}`
                      : ''}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="momo-group">
              <legend>Aksesori</legend>

              <div className="momo-choices">
                {ACCESSORIES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="momo-choice"
                    aria-pressed={
                      pet.accessory === item.id
                    }
                    disabled={level < item.level}
                    onClick={() => {
                      setPet((p) => ({
                        ...p,
                        accessory: item.id,
                      }))
                    }}
                  >
                    {item.label}

                    {level < item.level
                      ? ` · Lv.${item.level}`
                      : ''}
                  </button>
                ))}
              </div>
            </fieldset>

            {confirmReset ? (
              <div className="momo-confirm">
                <span>Hapus semua progres?</span>

                <button
                  type="button"
                  onClick={resetAll}
                >
                  Ya, reset
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="momo-reset"
                onClick={() => setConfirmReset(true)}
              >
                Reset progres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="momo-stats">
              <PetStat
                icon="💗"
                label="Kebahagiaan"
                value={pet.happiness}
              />

              <PetStat
                icon="🐟"
                label="Kenyang"
                value={pet.fullness}
              />

              <PetStat
                icon="⚡"
                label="Energi"
                value={pet.energy}
              />
            </div>

            <div className="momo-actions">
              <button
                type="button"
                onClick={petMomo}
              >
                <span>💗</span>Elus
              </button>

              <button
                type="button"
                onClick={feedMomo}
              >
                <span>🐟</span>Beri Makan
              </button>

              <button
                type="button"
                onClick={playWithMomo}
              >
                <span>🎮</span>Main
              </button>
            </div>

            <div className="momo-score">
              <span>⭐ Skor bermain</span>
              <strong>{pet.score}</strong>
            </div>
          </>
        )}
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
      <span className="momo-stat-icon">
        {icon}
      </span>

      <span className="momo-stat-label">
        {label}
      </span>

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