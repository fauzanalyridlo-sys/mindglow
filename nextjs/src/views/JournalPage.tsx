
'use client'

import '../styles/JournalPage.css'
import { useEffect, useRef, useState } from 'react'

interface JournalEntry {
  id: string
  content: string
  createdAt: string | null
  updatedAt: string | null
}

function formatDate(dateString: string | null) {
  if (!dateString) return '-'

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(dateString: string | null) {
  if (!dateString) return '--:--'

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) return '--:--'

  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const JournalPage = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [inputText, setInputText] = useState('')
  const [journals, setJournals] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Ambil riwayat jurnal dari database melalui API.
  useEffect(() => {
    let active = true

    async function loadJournals() {
      try {
        const response = await fetch('/api/journal', {
          method: 'GET',
          cache: 'no-store',
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.message || 'Gagal mengambil riwayat jurnal.'
          )
        }

        if (active) {
          setJournals(result.data ?? [])
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan saat mengambil jurnal.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadJournals()

    return () => {
      active = false
    }
  }, [])

  const handleInput = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInputText(e.target.value)
    setError('')
    setNotice('')

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height =
        `${textareaRef.current.scrollHeight}px`
    }
  }

  // Simpan jurnal ke Supabase melalui API POST.
  const handleSave = async () => {
    const content = inputText.trim()

    if (!content) {
      setError('Tuliskan isi jurnal terlebih dahulu.')
      return
    }

    if (saving) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Jurnal gagal disimpan.'
        )
      }

      setJournals((current) => [
        result.data,
        ...current,
      ])

      setInputText('')
      setNotice('Jurnal berhasil disimpan.')

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat menyimpan jurnal.'
      )
    } finally {
      setSaving(false)
    }
  }

  // Hapus jurnal dari database melalui API DELETE.
  const handleDelete = async (id: string) => {
    if (deletingId) return

    const confirmed = window.confirm(
      'Apakah kamu yakin ingin menghapus jurnal ini?'
    )

    if (!confirmed) return

    setDeletingId(id)
    setError('')
    setNotice('')

    try {
      const response = await fetch(
        `/api/journal/${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Jurnal gagal dihapus.'
        )
      }

      setJournals((current) =>
        current.filter((journal) => journal.id !== id)
      )

      setNotice('Jurnal berhasil dihapus.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat menghapus jurnal.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="journal-page-container">
      <header className="journal-header">
        <h1>JURNAL CURHAT PRIVAT</h1>
        <p>Tuliskan pengalamanmu disini</p>
      </header>

      <section className="journal-input-section">
        <div className="journal-input-card">
          <textarea
            ref={textareaRef}
            className="journal-textarea"
            placeholder="Bagaimana harimu? Apa hal yang paling menyita pikiranmu saat ini?..."
            value={inputText}
            onChange={handleInput}
            rows={3}
            maxLength={10000}
            disabled={saving}
          />

          <div className="journal-input-footer">
            <span className="auto-save-text">
              {saving
                ? 'Menyimpan jurnal...'
                : 'Jurnal tersimpan ke database saat disimpan'}
            </span>

            <button
              className="btn-simpan-journal"
              onClick={handleSave}
              disabled={saving || !inputText.trim()}
            >
              {saving ? 'Menyimpan...' : 'Simpan Jurnal'}
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="journal-error">
            {error}
          </p>
        )}

        {notice && (
          <p role="status" className="journal-notice">
            {notice}
          </p>
        )}
      </section>

      <section className="journal-riwayat-section">
        <h2>Riwayat Catatan Jurnal</h2>

        <div className="journal-history-list">
          {loading ? (
            <p>Memuat riwayat jurnal...</p>
          ) : journals.length === 0 ? (
            <p>
              Belum ada catatan jurnal. Mulai tuliskan
              ceritamu di atas.
            </p>
          ) : (
            journals.map((journal) => (
              <div
                className="journal-history-card"
                key={journal.id}
              >
                <div className="journal-card-header">
                  <div className="journal-date-time">
                    <span className="journal-date">
                      {formatDate(journal.createdAt)}
                    </span>

                    <span className="journal-time">
                      • {formatTime(journal.createdAt)}
                    </span>
                  </div>

                  <button
                    className="btn-delete-journal"
                    onClick={() => handleDelete(journal.id)}
                    title="Hapus Jurnal"
                    aria-label="Hapus jurnal"
                    disabled={deletingId !== null}
                  >
                    {deletingId === journal.id
                      ? '...'
                      : '×'}
                  </button>
                </div>

                <p className="journal-text">
                  {journal.content}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}

export default JournalPage
