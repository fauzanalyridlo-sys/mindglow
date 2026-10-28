
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MomoPet from '@/components/pet/MomoPet'
import MinecraftBackground from '@/components/pet/MinecraftBackground'
import '../styles/dashboard.css'

type DashboardData = {
  user: {
    name: string
  }
  todayMood: {
    mood: string
    energyLevel: number
    sleepHours: number
  } | null
  upcomingTasks: {
    count: number
    groupCount: number
  }
  priorityTasks: {
    id: string
    name: string
    course: string
    deadline: string
    priority: string
    type: string
    completed: boolean
  }[]
}

const formatDate = (date: string) => {
  const [year, month, day] = date.split('-')
  return `${day} - ${month} - ${year}`
}

const DashboardPage = () => {
  const router = useRouter()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      try {
        const response = await fetch('/api/dashboard', {
          method: 'GET',
          cache: 'no-store',
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || 'Gagal mengambil data Dashboard.'
          )
        }

        if (active) {
          setDashboard(result.data as DashboardData)
          setError('')
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan saat mengambil data.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [])


  const toggleTask = async (task: DashboardData['priorityTasks'][number]) => {
    if (busyTaskId) return

    setBusyTaskId(task.id)
    setError('')

    try {
      const response = await fetch(
        `/api/academic/tasks/${encodeURIComponent(task.id)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            completed: !task.completed,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Gagal memperbarui status tugas.'
        )
      }

      setDashboard((current) => {
        if (!current) return current

        return {
          ...current,
          priorityTasks: current.priorityTasks.map((item) =>
            item.id === task.id ? result.data : item
          ),
        }
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal memperbarui status tugas.'
      )
    } finally {
      setBusyTaskId(null)
    }
  }

  const mood = dashboard?.todayMood
  const tasks = dashboard?.priorityTasks ?? []

  return (
    <main className="dashboard-container">
      <section className="welcome-banner">
        <MinecraftBackground />

        <h1>
          Selamat Datang Kembali, {dashboard?.user.name ?? '...'} 👋
        </h1>

        <p>
          Ingat, kamu tidak perlu menyelesaikan semua masalah sekaligus.
          Cukup ambil satu langkah kecil hari ini.
        </p>

        <div className="banner-buttons">
          <button
            className="btn-glass"
            onClick={() => router.push('/checkin')}
          >
            Check hari ini
          </button>

          <button
            className="btn-glass"
            onClick={() => router.push('/relaksasi')}
          >
            🫀 Butuh Relaksasi Cepat
          </button>
        </div>

        <MomoPet />
      </section>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <div className="icon-circle">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>

          <div className="stat-content">
            <p className="stat-title">Suasana Hati Hari Ini</p>

            <h3 className="stat-value">
              {loading
                ? 'Memuat...'
                : mood
                  ? mood.mood
                  : 'Belum check-in'}
            </h3>

            <p className="stat-subtext">
              {mood
                ? `Tidur: ${mood.sleepHours} jam • Energi: ${mood.energyLevel}/5`
                : 'Lakukan check-in harian untuk melihat ringkasan.'}
            </p>
          </div>
        </div>

        <div
          className="stat-card"
          role="button"
          tabIndex={0}
          onClick={() => router.push('/akademik')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              router.push('/akademik')
            }
          }}
        >
          <div className="icon-circle">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 8 14" />
            </svg>
          </div>

          <div className="stat-content">
            <p className="stat-title">Deadline Dekat</p>

            <h3 className="stat-value">
              {loading
                ? 'Memuat...'
                : `${dashboard?.upcomingTasks.count ?? 0} Deadline Dekat`}
            </h3>

            <p className="stat-subtext text-red">
              {dashboard?.upcomingTasks.groupCount ?? 0} Tugas Kelompok
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-circle">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>

          <div className="stat-content">
            <p className="stat-title">Ruang Curhat AI</p>

            <h3 className="stat-value">Siap Mendengarkan</h3>

            <a href="/ai" className="stat-subtext text-blue">
              Mulai Chat &rarr;
            </a>
          </div>
        </div>
      </section>

      <section className="tasks-section">
        <div className="tasks-header">
          <h2>Tugas Prioritas Akademik</h2>

          <a href="/akademik" className="link-all">
            Kelola Semua Tasks &rarr;
          </a>
        </div>

        <div className="tasks-list">
          {error && <p role="alert">{error}</p>}

          {loading ? (
            <p>Memuat tugas akademik...</p>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <div className="task-item" key={task.id}>
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={task.completed}
                  disabled={busyTaskId !== null}
                  onChange={() => toggleTask(task)}
                  aria-label={`Tandai ${task.name} sebagai ${
                    task.completed ? 'belum selesai' : 'selesai'
                  }`}
                />

                <span className="task-name">
                  {task.name}
                </span>

                <span className="task-date">
                  {formatDate(task.deadline)}
                </span>
              </div>
            ))
          ) : (
            <p>Belum ada tugas akademik yang perlu ditampilkan.</p>
          )}
        </div>
      </section>
    </main>
  )
}

export default DashboardPage
