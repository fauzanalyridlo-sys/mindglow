"use client";

import { useState, useRef, useEffect } from "react";
import "../styles/ai-ruang-refleksi.css";
import "../styles/ai-ruang-refleksi-animation.css";

import iconAiAsset from "../icons/iconai.svg";
import iconGembokAsset from "../icons/gembok.svg";

const iconAi = iconAiAsset.src;
const iconGembok = iconGembokAsset.src;

type Message = {
  id: number;
  sender: "ai" | "user";
  text: string;
};

type ApiResponse = {
  success: boolean;
  data?: {
    reply?: string;
  };
  message?: string;
};

export default function AiRuangRefleksi() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Hai, aku MindGlow. Ceritakan apa yang sedang kamu rasakan. Aku siap mendengarkan.",
    },
  ]);

  const nextId = useRef(2);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>(messages);
  const previousMessageCountRef = useRef(messages.length);
  const previousTypingRef = useRef(false);

  // Menjaga referensi percakapan terbaru untuk riwayat API.
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Gulir hanya area percakapan ketika pesan baru ditambahkan
  // atau indikator AI sedang mengetik mulai ditampilkan.
  // Tidak berjalan saat halaman pertama kali dibuka.
  useEffect(() => {
    const container = messagesContainerRef.current;

    const hasNewMessage =
      messages.length > previousMessageCountRef.current;

    const typingJustStarted =
      isTyping && !previousTypingRef.current;

    previousMessageCountRef.current = messages.length;
    previousTypingRef.current = isTyping;

    if (!container || (!hasNewMessage && !typingJustStarted)) {
      return;
    }

    // Ubah scrollTop pada wadah percakapan, bukan scroll halaman.
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  async function handleSend() {
    const text = input.trim();

    if (!text || isTyping) return;

    const userMessage: Message = {
      id: nextId.current++,
      sender: "user",
      text,
    };

    const history = messagesRef.current
      .filter((message) => message.id !== 1 || message.sender === "user")
      .slice(-10)
      .map((message) => ({
        role:
          message.sender === "ai"
            ? ("assistant" as const)
            : ("user" as const),
        content: message.text,
      }));

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          message: text,
          history,
        }),
      });

      const result = (await response
        .json()
        .catch(() => null)) as ApiResponse | null;

      if (!response.ok || !result?.success || !result.data?.reply) {
        if (response.status === 401) {
          throw new Error(
            "Sesi login kamu sudah berakhir. Silakan login kembali.",
          );
        }

        if (response.status === 429) {
          throw new Error(
            result?.message ||
            "Kuota chat AI kamu sudah mencapai batas. Silakan coba lagi nanti.",
          );
        }

        throw new Error(
          result?.message ||
          "MindGlow AI sedang mengalami gangguan. Silakan coba lagi.",
        );
      }

      const aiMessage: Message = {
        id: nextId.current++,
        sender: "ai",
        text: result.data.reply,
      };

      setMessages((current) => [...current, aiMessage]);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan. Silakan coba lagi.";

      setError(message);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
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
          ref={messagesContainerRef}
          className="reflection-messages"
          aria-live="polite"
          aria-label="Percakapan refleksi"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`reflection-message-row ${message.sender === "user" ? "is-user" : "is-ai"
                }`}
            >
              {message.sender === "ai" && (
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
        </div>

        {error && (
          <p className="reflection-error" role="alert">
            {error}
          </p>
        )}

        <form
          className="reflection-composer"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSend();
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
  );
}
