'use client'
import { useState } from 'react'

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

export default function MoodCheckinDemo() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
const [energyLevel, setEnergyLevel] = useState(3)
const [sleepHours, setSleepHours] = useState('')
  const [activities, setActivities] = useState<string[]>([])
  const [otherActivity, setOtherActivity] = useState('')
  const [message, setMessage] = useState('')

  const activityOptions = [
  'Kuliah',
  'Proyek Kelompok',
  'Lab/Praktikum',
]

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

 const checkin = {
  mood: selectedMood,
  energyLevel,
  sleepHours,
  activities,
  otherActivity: otherActivity.trim(),
  createdAt: new Date().toISOString(),
}

    localStorage.setItem('mindglow-demo-checkin', JSON.stringify(checkin))

    setMessage('Check-in berhasil disimpan di browser ini! 💚')
  }

  return (
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
    <label htmlFor="energy-level">
      TINGKAT ENERGI BATERAI DIRI
    </label>

    <span className="checkin-energy-badge">
      {energyLevel}/5 (
      {[
        '',
        'Sangat baterai lemah',
        'Baterai lemah',
        'Cukup',
        'Berenergi',
        'Sangat berenergi',
      ][energyLevel]}
      )
    </span>
  </div>

  <input
    id="energy-level"
    className="checkin-energy-slider"
    type="range"
    min={1}
    max={5}
    step={1}
    value={energyLevel}
    onChange={(event) => setEnergyLevel(Number(event.target.value))}
    aria-valuetext={
      [
        '',
        'Sangat baterai lemah',
        'Baterai lemah',
        'Cukup',
        'Berenergi',
        'Sangat berenergi',
      ][energyLevel]
    }
  />
</div>

      <div className="checkin-bottom-grid">
  {/* Panel istirahat */}
  <div className="checkin-info-panel">
    <label htmlFor="sleep-hours">
      ISTIRAHAT SEMALAM
    </label>

    <div className="checkin-sleep-input">
      <input
        id="sleep-hours"
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

  {/* Panel aktivitas */}
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
      <label htmlFor="other-activity" className="sr-only">
        Aktivitas lainnya
      </label>

      <input
        id="other-activity"
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
  )
}