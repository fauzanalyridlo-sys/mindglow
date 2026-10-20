'use client'
import { useState, type FormEvent } from 'react'
import Link from 'next/link'

export default function JournalDemo() {
  const [story, setStory] = useState('')
  const [isFinished, setIsFinished] = useState(false)

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!story.trim()) return

    setIsFinished(true)
  }

  return (
    <div className="journal-demo-card">
      <h3>JURNAL CURHAT PRIVAT</h3>
      <p>Tulisanmu aman</p>

      <form className="journal-demo-editor" onSubmit={handleSave}>
        <textarea
          value={story}
          onChange={(event) => setStory(event.target.value)}
          placeholder="Bagaimana harimu? Apa hal yang paling menyita pikiranmu saat ini?..."
          aria-label="Tulis cerita jurnal"
          disabled={isFinished}
          maxLength={1000}
        />

        {!isFinished ? (
          <div className="journal-demo-footer">
            <span>Cerita hanya digunakan selama demo ini</span>

            <button type="submit" disabled={!story.trim()}>
              Simpan Aman
            </button>
          </div>
        ) : (
          <div className="journal-demo-success">
            <h4>🌱 Cerita kecilmu berarti.</h4>

            <p>
              Terima kasih sudah meluangkan waktu untuk menulis.
              Yuk, masuk atau daftar untuk mulai menyimpan
              jurnalmu di MindGlow.
            </p>

            <div className="journal-demo-actions">
              <Link href="/login" className="journal-demo-login">
                Masuk
              </Link>

              <Link href="/register" className="journal-demo-register">
                Daftar Sekarang
              </Link>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}