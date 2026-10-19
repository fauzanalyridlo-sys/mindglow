
import { useState, useRef, useEffect } from 'react'
import '../styles/ai-ruang-refleksi.css'
import '../styles/ai-ruang-refleksi-animation.css'

import iconAi from '../icons/iconai.svg'
import iconGembok from '../icons/gembok.svg'

type Message = {
  id: number
  sender: 'ai' | 'user'
  text: string
}

export default function AiRuangRefleksi() {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

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
  const replyTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Balasan simulasi berdasarkan kata yang muncul di pesan pengguna
  function getAiReply(userText: string): string {
    const text = userText.toLowerCase()

    if (
      text.includes('capek') ||
      text.includes('lelah') ||
      text.includes('kelelahan')
    ) {
      return 'Kedengarannya kamu sedang merasa lelah. Kamu nggak harus menyelesaikan semuanya sekaligus. Hal apa yang paling menguras energimu akhir-akhir ini?'
    }

    if (
      text.includes('sedih') ||
      text.includes('kecewa') ||
      text.includes('menangis')
    ) {
      return 'Aku menangkap kalau ada hal yang membuatmu sedih. Kalau kamu nyaman, mau cerita apa yang terjadi?'
    }

    if (
      text.includes('cemas') ||
      text.includes('khawatir') ||
      text.includes('takut')
    ) {
      return 'Rasa khawatir bisa terasa berat saat dipendam sendiri. Apa ada sesuatu yang paling kamu cemaskan saat ini?'
    }

    if (
      text.includes('senang') ||
      text.includes('bahagia') ||
      text.includes('lega')
    ) {
      return 'Senang mendengar ada hal yang membuatmu merasa lebih baik. Apa yang terjadi hari ini hingga kamu merasakan itu?'
    }

    return 'Terima kasih sudah berbagi. Apa hal yang paling ingin kamu pahami dari perasaan itu ?'
  }

  function handleSend() {
    const text = input.trim()

    if (!text || isTyping) return

    const userMessage: Message = {
      id: nextId.current++,
      sender: 'user',
      text,
    }

    setMessages((current) => [...current, userMessage])
    setInput('')
    setIsTyping(true)

    // Jeda singkat untuk menampilkan efek AI sedang mengetik
    replyTimeoutRef.current = window.setTimeout(() => {
      const aiMessage: Message = {
        id: nextId.current++,
        sender: 'ai',
        text: getAiReply(text),
      }

      setMessages((current) => [...current, aiMessage])
      setIsTyping(false)
      replyTimeoutRef.current = null
    }, 700)
  }

  // Bersihkan timer jika komponen ditutup sebelum balasan muncul
  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current !== null) {
        window.clearTimeout(replyTimeoutRef.current)
      }
    }
  }, [])

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
                message.sender === 'user' ? 'is-user' : 'is-ai'
              }`}
            >
              {message.sender === 'ai' && (
                <div className="reflection-avatar" aria-label="MindGlow">
                  <img src={iconAi} alt="" />
                </div>
              )}

              <div className="reflection-bubble">{message.text}</div>
            </div>
          ))}

          {isTyping && (
            <div className="reflection-message-row is-ai">
              <div className="reflection-avatar" aria-label="MindGlow">
                <img src={iconAi} alt="" />
              </div>

              <div
                className="reflection-bubble reflection-typing"
                aria-label="MindGlow sedang mengetik"
              >
                MindGlow sedang mengetik...
              </div>
            </div>
          )}

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
              disabled={isTyping}
            />
          </div>

          <button
            type="submit"
            className="reflection-send"
            aria-label="Kirim pesan"
            disabled={!input.trim() || isTyping}
          >
            ➤
          </button>
        </form>

        <p className="reflection-privacy">
          <img src={iconGembok} alt="" aria-hidden="true" />
          <span>Cerita kamu dijaga dengan aman.</span>
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
