import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

type ChatMessage = {
  id: number
  sender: 'user' | 'mindglow'
  text: string
}

type DemoStep = 'first-answer' | 'second-answer' | 'finished'

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: 'mindglow',
    text: 'Senang bertemu denganmu, bagaimana perasaanmu hari ini?',
  },
]

export default function ReflectionDemo() {
  const [messages, setMessages] =
    useState<ChatMessage[]>(initialMessages)

  const [input, setInput] = useState('')

  const [demoStep, setDemoStep] =
    useState<DemoStep>('first-answer')

    const chatAreaRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const chatArea = chatAreaRef.current

  if (chatArea) {
    chatArea.scrollTo({
      top: chatArea.scrollHeight,
      behavior: 'smooth',
    })
  }
}, [messages, demoStep])

  function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const text = input.trim()

    if (!text || demoStep === 'finished') return

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      sender: 'user',
      text,
    }

    if (demoStep === 'first-answer') {
      const replyMessage: ChatMessage = {
        id: messages.length + 2,
        sender: 'mindglow',
        text: 'Terima kasih sudah berbagi. Apa hal yang paling ingin kamu pahami dari perasaan itu?',
      }

      setMessages((previous) => [
        ...previous,
        userMessage,
        replyMessage,
      ])

      setDemoStep('second-answer')
    } else {
      setMessages((previous) => [
        ...previous,
        userMessage,
      ])

      setDemoStep('finished')
    }

    setInput('')
  }

  return (
    <div className="reflection-demo-card">

      {/* Header */}
      <div className="reflection-demo-header">
        <h3>
          Ruang
          <br />
          Refleksi
        </h3>
      </div>

      {/* Area percakapan */}
     <div
  ref={chatAreaRef}
  className="reflection-chat-area"
  aria-label="Percakapan demo refleksi"
  aria-live="polite"
>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`reflection-chat-message ${
              message.sender === 'user'
                ? 'reflection-chat-user'
                : ''
            }`}
          >
            {message.sender === 'mindglow' && (
              <img
                src="/images/reflection/mindglow-avatar.svg"
                alt=""
                className="reflection-avatar"
              />
            )}

            <div className="reflection-bubble">
              {message.text}
            </div>
          </div>
        ))}

        {/* CTA setelah jawaban kedua */}
        {demoStep === 'finished' && (
          <div className="reflection-cta">
            <h4>
              🌱 Lanjutkan refleksimu bersama MindGlow!
            </h4>

            <p>
              Kamu sudah memulai langkah kecil untuk
              memahami perasaanmu. Masuk atau buat akun
              untuk menjelajahi pengalaman refleksi
              yang lebih lengkap.
            </p>

            <div className="reflection-cta-actions">
              <Link
                to="/login"
                className="reflection-cta-login"
              >
                Masuk
              </Link>

              <Link
                to="/register"
                className="reflection-cta-register"
              >
                Daftar Sekarang
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Input dan tombol kirim */}
      <div className="reflection-demo-bottom">
        <form
          className="reflection-input-row"
          onSubmit={handleSend}
        >
          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            disabled={demoStep === 'finished'}
            placeholder={
              demoStep === 'finished'
                ? 'Masuk untuk melanjutkan refleksi'
                : 'Ceritakan apa yang sedang kamu rasakan...'
            }
            aria-label="Ceritakan perasaanmu"
            maxLength={300}
          />

          <button
            type="submit"
            aria-label="Kirim cerita"
            disabled={
              !input.trim() ||
              demoStep === 'finished'
            }
          >
            ➤
          </button>
        </form>

        {/* Informasi privasi */}
        <p className="reflection-privacy">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect
              x="3"
              y="11"
              width="18"
              height="11"
              rx="2"
              ry="2"
            />

            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>

          <span>
            Demo ini tidak mengirim atau menyimpan ceritamu.
          </span>
        </p>

        <p className="reflection-demo-note">
          Respons MindGlow di sini adalah simulasi,
          bukan AI sungguhan.
        </p>
      </div>
    </div>
  )
}