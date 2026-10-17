import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Mood = {
  image: string
  label: string
}

const moods: Mood[] = [
  { image: '/images/moods/sedih.svg', label: 'Lelah/Down' },
  { image: '/images/moods/cemas.svg', label: 'Cemas' },
  { image: '/images/moods/biasa aja.svg', label: 'Biasa aja' },
  { image: '/images/moods/tenang.svg', label: 'Tenang' },
  { image: '/images/moods/semangat.svg', label: 'Semangat!' },
]

const activityOptions = [
  'Kuliah',
  'Proyek Kelompok',
  'Lab/Praktikum',
]

const energyLabels = [
  '',
  'Sangat baterai lemah',
  'Baterai lemah',
  'Cukup',
  'Berenergi',
  'Sangat berenergi',
]

export default function CheckinForm() {
  const navigate = useNavigate()

  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [energyLevel, setEnergyLevel] = useState(3)
  const [sleepHours, setSleepHours] = useState('')
  const [activities, setActivities] = useState<string[]>([])
  const [otherActivity, setOtherActivity] = useState('')
  const [message, setMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  function toggleActivity(activity: string) {
    setActivities((previous) =>
      previous.includes(activity)
        ? previous.filter((item) => item !== activity)
        : [...previous, activity]
    )

    setMessage('')
  }

  function handleSave() {
    if (!selectedMood) {
      setMessage('Pilih suasana hatimu terlebih dahulu, ya 💚')
      return
    }

    const hours = sleepHours.trim() === '' ? null : Number(sleepHours)

    if (
      hours !== null &&
      (!Number.isFinite(hours) || hours < 0 || hours > 24)
    ) {
      setMessage('Jam istirahat harus antara 0 sampai 24 jam, ya.')
      return
    }

    const checkin = {
      mood: selectedMood,
      energyLevel,
      sleepHours: hours,
      activities,
      otherActivity: otherActivity.trim(),
      createdAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem(
        'mindglow-checkin',
        JSON.stringify(checkin)
      )

      setMessage('')
      setShowSuccess(true)
    } catch {
      setMessage('Check-in belum berhasil disimpan. Coba lagi, ya.')
    }
  }

  return (
    <>
      <div className="checkin-demo-card">
        <div className="checkin-moods">
          {moods.map((mood) => (
            <button
              key={mood.label}
              type="button"
              className={`mood-option ${
                selectedMood === mood.label ? 'selected' : ''
              }`}
              onClick={() => {
                setSelectedMood(mood.label)
                setMessage('')
              }}
              aria-pressed={selectedMood === mood.label}
            >
              <img
                src={mood.image}
                alt=""
                className="mood-image"
                aria-hidden="true"
              />

              <small>{mood.label}</small>
            </button>
          ))}
        </div>

        <div className="checkin-energy-panel">
          <div className="checkin-energy-header">
            <label htmlFor="daily-energy-level">
              TINGKAT ENERGI BATERAI DIRI
            </label>

            <span className="checkin-energy-badge">
              {energyLevel}/5 ({energyLabels[energyLevel]})
            </span>
          </div>

          <input
            id="daily-energy-level"
            className="checkin-energy-slider"
            type="range"
            min={1}
            max={5}
            step={1}
            value={energyLevel}
            onChange={(event) =>
              setEnergyLevel(Number(event.target.value))
            }
            aria-valuetext={energyLabels[energyLevel]}
          />
        </div>

        <div className="checkin-bottom-grid">
          <div className="checkin-info-panel">
            <label htmlFor="daily-sleep-hours">
              ISTIRAHAT SEMALAM
            </label>

            <div className="checkin-sleep-input">
              <input
                id="daily-sleep-hours"
                type="number"
                min="0"
                max="24"
                step="0.5"
                placeholder="Contoh: 7"
                value={sleepHours}
                onChange={(event) => {
                  setSleepHours(event.target.value)
                  setMessage('')
                }}
              />

              <span>Jam</span>
            </div>
          </div>

          <div className="checkin-info-panel">
            <p className="checkin-panel-title">
              AKTIVITAS UTAMA
            </p>

            <div className="checkin-activities">
              {activityOptions.map((activity) => (
                <button
                  key={activity}
                  type="button"
                  className={
                    activities.includes(activity) ? 'selected' : ''
                  }
                  onClick={() => toggleActivity(activity)}
                  aria-pressed={activities.includes(activity)}
                >
                  {activity}
                </button>
              ))}
            </div>

            <div className="checkin-other-activity">
              <label
                htmlFor="daily-other-activity"
                className="sr-only"
              >
                Aktivitas lainnya
              </label>

              <input
                id="daily-other-activity"
                type="text"
                placeholder="Tulis aktivitas lainnya..."
                value={otherActivity}
                onChange={(event) => {
                  setOtherActivity(event.target.value)
                  setMessage('')
                }}
              />
            </div>
          </div>
        </div>

        <button
          className="checkin-save"
          type="button"
          onClick={handleSave}
        >
          Simpan Check-in Hari Ini
        </button>

        {message && (
          <p className="checkin-message" role="status">
            {message}
          </p>
        )}
      </div>

      {showSuccess && (
        <div
          className="daily-checkin-overlay"
          role="presentation"
        >
          <div
            className="daily-checkin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="daily-checkin-success-title"
            aria-describedby="daily-checkin-success-description"
          >
            <div
              className="daily-checkin-success-icon"
              aria-hidden="true"
            >
              ✓
            </div>

            <h2 id="daily-checkin-success-title">
              Berhasil!
            </h2>

            <p id="daily-checkin-success-description">
              Check harian berhasil disimpan!
            </p>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              autoFocus
            >
              Oke
            </button>
          </div>
        </div>
      )}
    </>
  )
}
