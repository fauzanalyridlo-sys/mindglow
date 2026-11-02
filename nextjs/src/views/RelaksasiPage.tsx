"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "../styles/relaksasi.css";
import "../styles/animasi-relaksasi.css";

type BreathPhase = "siap" | "tarik" | "tahan" | "hembus" | "selesai";

const phases: {
  name: BreathPhase;
  duration: number;
  instruction: string;
}[] = [
  {
    name: "tarik",
    duration: 4,
    instruction: "Tarik napas perlahan melalui hidung.",
  },
  {
    name: "tahan",
    duration: 7,
    instruction: "Tahan napas dengan nyaman.",
  },
  {
    name: "hembus",
    duration: 8,
    instruction: "Hembuskan napas perlahan melalui mulut.",
  },
];

const TOTAL_CYCLES = 4;

const phaseLabels: Record<BreathPhase, string> = {
  siap: "Siapkan dirimu untuk memulai",
  tarik: "Tarik napas",
  tahan: "Tahan napas",
  hembus: "Hembuskan napas",
  selesai: "Latihan selesai",
};

export default function RelaksasiPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<BreathPhase>("siap");
  const [seconds, setSeconds] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  const isRunningRef = useRef(false);
  const voiceEnabledRef = useRef(true);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  // Membuat audio context setelah pengguna berinteraksi.
  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;

    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    return audioContextRef.current;
  }, []);

  // Suara mangkuk lembut menggunakan Web Audio API.
  const playSingingBowl = useCallback(async () => {
    try {
      const context = getAudioContext();

      if (!context) {
        console.warn("Browser tidak mendukung Web Audio API.");
        return;
      }

      if (context.state === "suspended") {
        await context.resume();
      }

      const now = context.currentTime;

      // Dua nada chime yang jernih dan harmonis.
      const tones = [
        { frequency: 659.25, start: 0, volume: 0.045 },
        { frequency: 783.99, start: 0.42, volume: 0.035 },
      ];

      tones.forEach(({ frequency, start, volume }) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        const toneStart = now + start;
        const toneDuration = 2.8;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, toneStart);

        // Fade-in lembut, lalu gema memudar perlahan.
        gain.gain.setValueAtTime(0.0001, toneStart);
        gain.gain.exponentialRampToValueAtTime(
          volume,
          toneStart + 0.12,
        );
        gain.gain.setValueAtTime(
          volume,
          toneStart + 0.35,
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          toneStart + toneDuration,
        );

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(toneStart);
        oscillator.stop(toneStart + toneDuration + 0.1);
      });
    } catch (error) {
      console.error("Gagal memainkan suara mangkuk:", error);
    }
  }, [getAudioContext]);

  // Bunyi pendek dan lembut untuk countdown 3, 2, 1.
  const playCountdownTone = useCallback(() => {
    try {
      const context = getAudioContext();
      if (!context) return;

      if (context.state === "suspended") {
        void context.resume();
      }

      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      // Nada rendah dan hangat agar countdown terasa lebih tenang.
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(440, now);
      oscillator.frequency.exponentialRampToValueAtTime(392, now + 0.45);

      // Volume rendah dengan fade-in dan fade-out yang halus.
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.018, now + 0.12);
      gain.gain.setValueAtTime(0.018, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.9);
    } catch (error) {
      console.error("Gagal memainkan bunyi countdown:", error);
    }
  }, [getAudioContext]);

  // Bunyi ting lembut sebagai penanda perubahan fase.
  const playPhaseTone = useCallback(
    async (currentPhase: BreathPhase) => {
      if (!voiceEnabledRef.current) return;

      if (
        currentPhase !== "tarik" &&
        currentPhase !== "tahan" &&
        currentPhase !== "hembus"
      ) {
        return;
      }

      try {
        const context = getAudioContext();
        if (!context) return;

        if (context.state === "suspended") {
          await context.resume();
        }

        const now = context.currentTime;
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        const frequency =
          currentPhase === "tarik"
            ? 659.25
            : currentPhase === "tahan"
              ? 587.33
              : 523.25;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(now);
        oscillator.stop(now + 0.8);
      } catch (error) {
        console.error("Gagal memainkan suara penanda fase:", error);
      }
    },
    [getAudioContext],
  );

  // Bunyi saat fase tarik, tahan, atau hembus dimulai.
  useEffect(() => {
    if (!isRunning || !voiceEnabled) return;

    if (
      phase !== "tarik" &&
      phase !== "tahan" &&
      phase !== "hembus"
    ) {
      return;
    }

    void playPhaseTone(phase);
  }, [phase, isRunning, voiceEnabled, playPhaseTone]);

  // Narasi menggunakan suara bawaan browser.
  const speak = useCallback((message: string) => {
    if (typeof window === "undefined") return;

    if (!voiceEnabledRef.current) return;

    if (!("speechSynthesis" in window)) {
      console.warn("Browser tidak mendukung Speech Synthesis.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);

    utterance.lang = "id-ID";
    utterance.rate = 0.85;
    utterance.pitch = 0.9;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();

    const indonesiaVoice = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith("id"),
    );

    if (indonesiaVoice) {
      utterance.voice = indonesiaVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  // Bunyi countdown hanya ketika fase siap dan timer berjalan.
  useEffect(() => {
    if (!isRunning || phase !== "siap" || seconds < 1) return;

    playCountdownTone();
  }, [isRunning, phase, seconds, playCountdownTone]);

  // Timer latihan pernapasan.
  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setTimeout(() => {
      if (seconds > 1) {
        setSeconds((current) => current - 1);
        return;
      }

      if (phase === "siap") {
        setPhase("tarik");
        setPhaseIndex(0);
        setSeconds(phases[0].duration);
        return;
      }

      const nextIndex = phaseIndex + 1;

      if (nextIndex < phases.length) {
        setPhaseIndex(nextIndex);
        setPhase(phases[nextIndex].name);
        setSeconds(phases[nextIndex].duration);
        return;
      }

      const nextCycles = cycles + 1;

      setCycles(nextCycles);

      if (nextCycles >= TOTAL_CYCLES) {
        setPhase("selesai");
        setSeconds(0);
        setIsRunning(false);
        return;
      }

      setPhaseIndex(0);
      setPhase("tarik");
      setSeconds(phases[0].duration);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isRunning, seconds, phase, phaseIndex, cycles]);

  // Narasi otomatis ketika fase latihan berubah.
  useEffect(() => {
    if (!isRunning || !voiceEnabled) return;

    if (phase === "siap") {
      return;
    }

    const currentPhase = phases.find((item) => item.name === phase);

    if (currentPhase) {
      speak(currentPhase.instruction);
    }
  }, [phase, isRunning, voiceEnabled, speak]);

  // Mulai latihan.
  const startRelaxation = async () => {
    window.speechSynthesis?.cancel();

    setPhase("siap");
    setSeconds(3);
    setPhaseIndex(0);
    setCycles(0);

    setIsRunning(true);
  };

  // Selesaikan latihan.
  const finishRelaxation = async () => {
    setIsRunning(false);
    setPhase("selesai");
    setSeconds(0);

    window.speechSynthesis?.cancel();

    await playSingingBowl();

    if (voiceEnabledRef.current) {
      window.setTimeout(() => {
        if (!isRunningRef.current) {
          speak(
            "Latihan selesai. Kamu sudah meluangkan waktu " +
              "untuk dirimu sendiri. Bernapaslah secara normal " +
              "sebelum melanjutkan aktivitas.",
          );
        }
      }, 2300);
    }
  };

  // Ulangi latihan.
  const resetRelaxation = () => {
    setIsRunning(false);
    setPhase("siap");
    setSeconds(3);
    setPhaseIndex(0);
    setCycles(0);

    window.speechSynthesis?.cancel();
  };

  // Aktifkan atau matikan suara panduan.
  const toggleVoice = () => {
    const nextValue = !voiceEnabled;

    setVoiceEnabled(nextValue);
    voiceEnabledRef.current = nextValue;

    if (!nextValue) {
      window.speechSynthesis?.cancel();
      return;
    }

    if (isRunningRef.current) {
      speak("Suara panduan diaktifkan. Ikuti instruksi pernapasan.");
    }
  };

  // Membersihkan audio ketika komponen dilepas.
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();

      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const instruction =
    phase === "siap"
      ? "Siapkan dirimu untuk memulai."
      : phase === "selesai"
        ? "Kamu sudah meluangkan waktu untuk dirimu sendiri. Bernapaslah secara normal sebelum melanjutkan aktivitas."
        : phases.find((item) => item.name === phase)?.instruction;

  return (
    <section className="relax-page">
      <section className="relax-content">
        <header className="relax-header">
          <h1>LATIHAN PERNAPASAN 4–7–8</h1>

          <p>
            Latihan singkat untuk membantumu menenangkan diri saat sedang merasa
            tegang.
          </p>
        </header>

        <div
          className={`breath-stage phase-${phase}`}
          role="timer"
          aria-label={`${phaseLabels[phase]}, ${seconds} detik`}
        >
          <div className="breath-circle">
            <div className="breath-circle-content">
              <span
                key={`${phase}-${seconds}`}
                className="breath-number"
                aria-live="polite"
                aria-atomic="true"
              >
                {seconds}
              </span>

              <span className="breath-label">{phaseLabels[phase]}</span>
            </div>
          </div>
        </div>

        <p className="relax-instruction" aria-live="polite">
          {instruction}
        </p>

        {isRunning && phase !== "siap" && (
          <div className="relax-progress">
            <div
              className="relax-progress-track"
              role="progressbar"
              aria-label="Putaran latihan selesai"
              aria-valuemin={0}
              aria-valuemax={TOTAL_CYCLES}
              aria-valuenow={cycles}
            >
              <div
                className="relax-progress-fill"
                style={{
                  width: `${(cycles / TOTAL_CYCLES) * 100}%`,
                }}
              />
            </div>

            <span>
              Putaran {Math.min(cycles + 1, TOTAL_CYCLES)} dari {TOTAL_CYCLES}
            </span>
          </div>
        )}

        <div className="relax-actions">
          {phase === "selesai" ? (
            <button
              type="button"
              className="relax-button relax-button-start"
              onClick={resetRelaxation}
            >
              Ulangi Relaksasi
            </button>
          ) : (
            <button
              type="button"
              className="relax-button relax-button-start"
              onClick={startRelaxation}
              disabled={isRunning}
            >
              {isRunning ? "Relaksasi Berlangsung" : "Mulai Relaksasi"}
            </button>
          )}

          <button
            type="button"
            className="relax-button relax-button-finish"
            onClick={finishRelaxation}
            disabled={phase === "selesai"}
          >
            Selesai
          </button>

        <p className="relax-tip">
          Lakukan dengan nyaman. Jika merasa pusing atau tidak nyaman, hentikan
          latihan dan bernapaslah secara normal.
        </p>
          <div className="relax-bottom-actions">
          <button
          type="button"
          className="relax-voice-toggle"
          onClick={toggleVoice}
          aria-pressed={voiceEnabled}
        >
          {voiceEnabled ? "Suara: Aktif" : "Suara: Nonaktif"}
        </button>
          <button
          type="button"
          className="relax-back-button"
          onClick={() => router.push("/dashboard")}
        >
          Kembali
        </button>
        </div>

        </div>

        

        
      </section>
    </section>
  );
}
