import Link from "next/link";

import "../styles/ai.css";
import "../styles/ai-animation.css";

import aiImageAsset from "../assets/elemenheroai.svg";

const aiImage = aiImageAsset.src;

export default function Ai() {
  return (
    <section className="ai-page">
      <div className="ai-hero">
        <div className="ai-hero-content">
          <h1>
            Aku di sini buat dengerin
            <br className="ai-break" />
            kamu.
          </h1>

          <p>
            Ceritakan apa yang sedang kamu
            <br className="ai-break" />
            rasakan, aku akan menemanimu.
          </p>

          <Link
            href="/reflection"
            scroll={true}
            className="ai-button"
          >
            Mulai sekarang <span aria-hidden="true">➜</span>
          </Link>
        </div>

        <div className="ai-hero-image">
          <img
            src={aiImage}
            alt="Ilustrasi chatbot MindGlow"
          />
        </div>
      </div>
    </section>
  );
}
