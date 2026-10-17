import { useState, useRef, useEffect } from 'react'
import '../styles/ai-ruang-refleksi.css'

type Message = {
  id: number
  sender: 'ai' | 'user'
  text: string
}

export default function AiRuangRefleksi() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: 'Ceritakan apa yang sedang kamu rasakan...',
    },
    {
      id: 2,
      sender: 'user',
      text: 'Aku akhir-akhir ini merasa capek dan kepikiran banyak hal.',
    },
  ])

  const nextId = useRef(3)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const text = input.trim()
    if (!text) return

    setMessages((current) => [
      ...current,
      { id: nextId.current++, sender: 'user', text },
    ])
    setInput('')
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <section className="reflection-page">
      <div className="reflection-panel">
        <header className="reflection-heading">
          <h1>
            Ruang
            <br />
            Refleksi
          </h1>
        </header>

        <div
          className="reflection-messages"
          aria-live="polite"
          aria-label="Percakapan refleksi"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`reflection-message-row ${
                message.sender === 'user'
                  ? 'is-user'
                  : 'is-ai'
              }`}
            >
              {message.sender === 'ai' && (
                <div className="reflection-avatar" aria-label="MindGlow">
                  🧠
                </div>
              )}

              <div className="reflection-bubble">
                {message.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form
          className="reflection-composer"
          onSubmit={(event) => {
            event.preventDefault()
            handleSend()
          }}
        >
          <div className="reflection-input-wrap">
            <span className="reflection-input-icon" aria-hidden="true">
              ✎
            </span>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ceritakan apa yang sedang kamu rasakan..."
              aria-label="Tulis ceritamu"
              rows={1}
            />
          </div>

          <button
            type="submit"
            className="reflection-send"
            aria-label="Kirim pesan"
            disabled={!input.trim()}
          >
            ➤
          </button>
        </form>

        <p className="reflection-privacy">
          <span aria-hidden="true">♙</span>
          Cerita kamu perlu dijaga dengan aman.
        </p>
      </div>

      <button
        type="button"
        className="reflection-back"
        onClick={() => window.history.back()}
      >
        Kembali
      </button>
    </section>
  )
}
