import { useState } from 'react'

type Mood = {
  emoji: string
  label: string
}

const moods: Mood[] = [
  { emoji: '😠', label: 'Kesal' },
  { emoji: '😟', label: 'Cemas' },
  { emoji: '😐', label: 'Biasa' },
  { emoji: '🙂', label: 'Senang' },
  { emoji: '😄', label: 'Semangat' },
]

export default function MoodCheckinDemo() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [sleepHours, setSleepHours] = useState('')
  const [activities, setActivities] = useState<string[]>([])
  const [message, setMessage] = useState('')

  const activityOptions = [
    'Belajar',
    'Bersosialisasi',
    'Olahraga',
    'Istirahat',
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
      sleepHours,
      activities,
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
            <span>{mood.emoji}</span>
            <small>{mood.label}</small>
          </button>
        ))}
      </div>

      <div className="checkin-field">
        <label htmlFor="sleep-hours">
          Berapa jam kamu tidur semalam?
        </label>

        <input
          id="sleep-hours"
          type="number"
          min="0"
          max="24"
          step="0.5"
          placeholder="Contoh: 7"
          value={sleepHours}
          onChange={(event) => setSleepHours(event.target.value)}
        />
      </div>

      <div className="checkin-field">
        <p>Aktivitas hari ini</p>

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