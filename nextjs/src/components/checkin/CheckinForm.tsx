
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Mood = {
  image: string
  label: string
}

type CheckinData = {
  id: string
  date: string
  mood: string
  energyLevel: number
  sleepHours: number
  activities: string[]
  otherActivity: string
}

type ApiResponse = {
  success: boolean
  message?: string
  data?: CheckinData | null
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
  const router = useRouter()

  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [energyLevel, setEnergyLevel] = useState(3)
  const [sleepHours, setSleepHours] = useState('')
  const [activities, setActivities] = useState<string[]>([])
  const [otherActivity, setOtherActivity] = useState('')
  const [message, setMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadTodayCheckin = useCallback(async (signal: AbortSignal) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/checkin/today', {
        method: 'GET',
        cache: 'no-store',
        signal,
      })

      const result = (await response.json()) as ApiResponse

      if (!response.ok || !result.success) {
        if (response.status === 401) {
          setMessage('Silakan login terlebih dahulu untuk menggunakan Check-in.')
        } else {
          setMessage(result.message ?? 'Data Check-in gagal dimuat.')
        }
        return
      }

      if (!result.data) {
        return
      }

      setSelectedMood(result.data.mood)
      setEnergyLevel(result.data.energyLevel)
      setSleepHours(String(result.data.sleepHours))
      setActivities(result.data.activities ?? [])
      setOtherActivity(result.data.otherActivity ?? '')
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      setMessage('Tidak dapat memuat Check-in. Periksa koneksi lalu coba lagi.')
    } finally {
      if (!signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadTodayCheckin(controller.signal)

    return () => controller.abort()
  }, [loadTodayCheckin])

  function toggleActivity(activity: string) {
    setActivities((previous) => {
      if (previous.includes(activity)) {
        return previous.filter((item) => item !== activity)
      }

      if (previous.length >= 3) {
        return previous
      }

      return [...previous, activity]
    })

    setMessage((previous) =>
      activities.length >= 3 && !activities.includes(activity)
        ? 'Pilih maksimal 3 aktivitas utama.'
        : ''
    )
  }

  async function handleSave() {
    if (isSaving || isLoading) return

    if (!selectedMood) {
      setMessage('Pilih suasana hatimu terlebih dahulu, ya 💚')
      return
    }

    if (sleepHours.trim() === '') {
      setMessage('Masukkan durasi tidurmu terlebih dahulu.')
      return
    }

    const hours = Number(sleepHours)

    if (!Number.isFinite(hours) || hours < 0 || hours > 24) {
      setMessage('Jam istirahat harus antara 0 sampai 24 jam, ya.')
      return
    }

    if (!Number.isInteger(hours * 2)) {
      setMessage('Durasi tidur harus dalam kelipatan 0,5 jam.')
      return
    }

    if (activities.length > 3) {
      setMessage('Pilih maksimal 3 aktivitas utama.')
      return
    }

    if (otherActivity.trim().length > 255) {
      setMessage('Aktivitas lainnya maksimal 255 karakter.')
      return
    }

    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: selectedMood,
          energyLevel,
          sleepHours: hours,
          activities,
          otherActivity: otherActivity.trim(),
        }),
      })

      const result = (await response.json()) as ApiResponse

      if (!response.ok || !result.success) {
        if (response.status === 401) {
          setMessage('Sesi login tidak ditemukan. Silakan login kembali.')
        } else {
          setMessage(result.message ?? 'Check-in gagal disimpan. Coba lagi.')
        }
        return
      }

      setShowSuccess(true)
    } catch {
      setMessage('Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="checkin-demo-card">
        <div className="checkin-moods" aria-busy={isLoading}>
          {moods.map((mood) => (
            <button
              key={mood.label}
              type="button"
              className={`mood-option ${selectedMood === mood.label ? 'selected' : ''
                }`}
              onClick={() => {
                setSelectedMood(mood.label)
                setMessage('')
              }}
              aria-pressed={selectedMood === mood.label}
              disabled={isLoading || isSaving}
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
            onChange={(event) => setEnergyLevel(Number(event.target.value))}
            aria-valuetext={energyLabels[energyLevel]}
            disabled={isLoading || isSaving}
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
                disabled={isLoading || isSaving}
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
                  disabled={isLoading || isSaving}
                >
                  {activity}
                </button>
              ))}
            </div>

            <div className="checkin-other-activity">
              <label htmlFor="daily-other-activity" className="sr-only">
                Aktivitas lainnya
              </label>

              <input
                id="daily-other-activity"
                type="text"
                maxLength={255}
                placeholder="Tulis aktivitas lainnya..."
                value={otherActivity}
                onChange={(event) => {
                  setOtherActivity(event.target.value)
                  setMessage('')
                }}
                disabled={isLoading || isSaving}
              />
            </div>
          </div>
        </div>

        <button
          className="checkin-save"
          type="button"
          onClick={handleSave}
          disabled={isLoading || isSaving}
        >
          {isLoading
            ? 'Memuat Check-in...'
            : isSaving
              ? 'Menyimpan...'
              : 'Simpan Check-in Hari Ini'}
        </button>

        {message && (
          <p className="checkin-message" role="status">
            {message}
          </p>
        )}
      </div>

      {showSuccess && (
        <div className="daily-checkin-overlay" role="presentation">
          <div
            className="daily-checkin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="daily-checkin-success-title"
            aria-describedby="daily-checkin-success-description"
          >
            <div className="daily-checkin-success-icon" aria-hidden="true">
              ✓
            </div>

            <h2 id="daily-checkin-success-title">
              Berhasil!
            </h2>

            <p id="daily-checkin-success-description">
              Check-in harian berhasil disimpan ke database.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowSuccess(false)
                router.push('/dashboard')
                router.refresh()
              }}
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
