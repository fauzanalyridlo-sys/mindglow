'use client'

import './minecraft-bg.css'
import { useWorld } from './momo-world'

/* ---------- helper: SVG -> data URI untuk tekstur blok ---------- */
const svgUrl = (inner: string, w: number, h: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${inner}</svg>`
  )}")`

const GRASS = svgUrl(
  `<rect width="16" height="16" fill="#866043"/>
   <rect x="4" y="10" width="2" height="2" fill="#6b4a31"/>
   <rect x="10" y="12" width="2" height="2" fill="#9b7653"/>
   <rect x="2" y="13" width="2" height="2" fill="#9b7653"/>
   <rect x="12" y="9" width="2" height="2" fill="#6b4a31"/>
   <rect width="16" height="6" fill="#5fae3b"/>
   <rect x="2" width="2" height="2" fill="#4f9a2f"/>
   <rect x="8" y="2" width="4" height="2" fill="#78c24f"/>
   <rect x="12" width="2" height="2" fill="#4f9a2f"/>
   <rect y="6" width="2" height="2" fill="#5fae3b"/>
   <rect x="6" y="6" width="4" height="2" fill="#5fae3b"/>
   <rect x="13" y="6" width="3" height="2" fill="#4f9a2f"/>`,
  16,
  16
)

const DIRT = svgUrl(
  `<rect width="16" height="16" fill="#866043"/>
   <rect x="4" y="3" width="2" height="2" fill="#6b4a31"/>
   <rect x="10" y="6" width="2" height="2" fill="#9b7653"/>
   <rect x="2" y="10" width="2" height="2" fill="#9b7653"/>
   <rect x="12" y="12" width="2" height="2" fill="#6b4a31"/>
   <rect x="7" y="13" width="3" height="2" fill="#6b4a31"/>`,
  16,
  16
)

const STONE = svgUrl(
  `<rect width="16" height="16" fill="#858585"/>
   <rect x="2" y="3" width="4" height="2" fill="#6e6e6e"/>
   <rect x="10" y="2" width="2" height="4" fill="#9a9a9a"/>
   <rect x="6" y="9" width="2" height="2" fill="#6e6e6e"/>
   <rect x="11" y="11" width="3" height="2" fill="#9a9a9a"/>
   <rect x="2" y="13" width="2" height="2" fill="#9a9a9a"/>`,
  16,
  16
)

const MOUNTAINS = svgUrl(
  `<path d="M0 80 V56 H32 V40 H64 V24 H112 V40 H144 V56 H176 V40 H208 V16 H256 V32 H288 V48 H320 V80 Z" fill="#8bbcb0"/>
   <rect x="64" y="24" width="48" height="8" fill="#fff" opacity=".9"/>
   <rect x="208" y="16" width="48" height="8" fill="#fff" opacity=".9"/>`,
  320,
  80
)

const HILLS = svgUrl(
  `<path d="M0 48 V32 H32 V24 H96 V32 H128 V16 H192 V32 H224 V24 H256 V48 Z" fill="#5fa047"/>
   <rect x="0" y="32" width="32" height="4" fill="#4f8c3b"/>
   <rect x="128" y="16" width="64" height="4" fill="#78c24f"/>`,
  256,
  48
)

const FENCE = svgUrl(
  `<rect y="8" width="24" height="3" fill="#a4793c"/>
   <rect y="16" width="24" height="3" fill="#a4793c"/>
   <rect y="11" width="24" height="1" fill="#7c5a28"/>
   <rect y="19" width="24" height="1" fill="#7c5a28"/>
   <rect x="9" width="6" height="28" fill="#a4793c"/>
   <rect x="9" width="2" height="28" fill="#c29552"/>
   <rect x="13" width="2" height="28" fill="#7c5a28"/>`,
  24,
  28
)

const STARS = Array.from({ length: 26 }, (_, i) => i)
const DROPS = Array.from({ length: 36 }, (_, i) => i)
const FLAKES = Array.from({ length: 28 }, (_, i) => i)

/* ---------- sprite kecil ---------- */
function Prop({
  left,
  width,
  viewBox,
  className = '',
  children,
}: {
  left: string
  width: number
  viewBox: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <svg
      className={`mc-prop ${className}`}
      style={{ left, width }}
      viewBox={viewBox}
      shapeRendering="crispEdges"
    >
      {children}
    </svg>
  )
}

function Tree({ left, width, className = '' }: { left: string; width: number; className?: string }) {
  return (
    <Prop left={left} width={width} viewBox="0 0 80 112" className={className}>
      <rect x="32" y="64" width="16" height="48" fill="#7a5a34" />
      <rect x="36" y="64" width="3" height="48" fill="#5e4426" />
      <rect x="44" y="64" width="3" height="48" fill="#8c6a3f" />
      <rect x="0" y="32" width="80" height="32" fill="#3f8f2f" stroke="rgba(0,0,0,.25)" strokeWidth="1.5" />
      <rect x="16" y="0" width="48" height="32" fill="#3f8f2f" stroke="rgba(0,0,0,.25)" strokeWidth="1.5" />
      <g fill="#2f7a24">
        <rect x="6" y="38" width="8" height="6" />
        <rect x="40" y="50" width="10" height="6" />
        <rect x="24" y="6" width="10" height="8" />
        <rect x="50" y="18" width="8" height="6" />
        <rect x="64" y="42" width="8" height="8" />
      </g>
      <g fill="#58a83e">
        <rect x="60" y="36" width="8" height="6" />
        <rect x="20" y="20" width="8" height="6" />
        <rect x="12" y="52" width="10" height="6" />
        <rect x="44" y="8" width="8" height="6" />
      </g>
    </Prop>
  )
}

function Flower({ left, color }: { left: string; color: string }) {
  return (
    <Prop left={left} width={18} viewBox="0 0 8 12">
      <rect x="3" y="4" width="2" height="8" fill="#3f8a2a" />
      <rect x="1" y="0" width="6" height="4" fill={color} />
      <rect x="3" y="1" width="2" height="2" fill="#fff6b8" opacity=".8" />
    </Prop>
  )
}

function Torch({ left }: { left: string }) {
  return (
    <Prop left={left} width={16} viewBox="0 0 8 26" className="mc-hide-sm">
      <g className="mc-fire">
        <rect className="mc-flame" x="0" y="0" width="8" height="8" fill="#ffb52e" />
        <rect className="mc-flame" x="2" y="2" width="4" height="4" fill="#fff0a0" />
      </g>
      <rect x="2" y="8" width="4" height="18" fill="#8b5a2b" />
    </Prop>
  )
}

function Cloud({ top, left, dur }: { top: number; left: string; dur: number }) {
  return (
    <svg
      className="mc-cloud"
      style={{ top, left, animationDuration: `${dur}s` }}
      viewBox="-8 0 80 24"
      shapeRendering="crispEdges"
      fill="#fff"
    >
      <rect x="0" y="8" width="56" height="10" />
      <rect x="10" y="0" width="28" height="10" />
      <rect x="-8" y="14" width="72" height="6" />
    </svg>
  )
}

/* =====================================================
   LATAR BELAKANG MINECRAFT — memenuhi seluruh card
   Taruh sebagai anak pertama di dalam card
   (card: position: relative; overflow: hidden; isolation: isolate)
   ===================================================== */
export default function MinecraftBackground() {
  const { phase, weather } = useWorld()

  return (
    <div className="mc-bg" data-phase={phase} data-weather={weather} aria-hidden="true">
      {/* langit (berganti halus sesuai jam) */}
      <div className="mc-sky mc-sky-day" />
      <div className="mc-sky mc-sky-dawn" />
      <div className="mc-sky mc-sky-dusk" />
      <div className="mc-sky mc-sky-night" />
      <div className="mc-sky-rain" />

      <div className="mc-stars">
        {STARS.map((i) => (
          <span
            key={i}
            className="mc-star"
            style={{
              left: `${(i * 53) % 97}%`,
              top: `${(i * 29) % 100}%`,
              animationDelay: `${(i % 7) * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="mc-sun" />
      <div className="mc-moon">
        <i />
        <i />
        <i />
      </div>

      {/* dunia: gunung, bukit, pohon, tanah */}
      <div className="mc-world">
        <Cloud top={22} left="40%" dur={14} />
        <Cloud top={64} left="58%" dur={18} />
        <Cloud top={30} left="72%" dur={16} />

        <div className="mc-layer mc-mountains" style={{ backgroundImage: MOUNTAINS }} />
        <div className="mc-layer mc-hills" style={{ backgroundImage: HILLS }} />

        <Tree left="50%" width={104} />
        <Tree left="76%" width={80} className="mc-hide-sm" />
        <Tree left="93%" width={92} className="mc-hide-sm" />

        <div className="mc-prop mc-fence mc-hide-sm" style={{ backgroundImage: FENCE }} />

        <Prop left="70%" width={32} viewBox="0 0 16 20" className="mc-hide-sm">
          <rect x="6" y="0" width="4" height="4" fill="#4a7a2e" />
          <rect x="0" y="4" width="16" height="16" fill="#d9822b" />
          <rect x="5" y="4" width="2" height="16" fill="#b86a1c" />
          <rect x="10" y="4" width="2" height="16" fill="#b86a1c" />
        </Prop>

        <Prop left="48%" width={28} viewBox="0 0 14 12">
          <rect x="5" y="6" width="4" height="6" fill="#e8dcc0" />
          <rect x="0" y="0" width="14" height="6" fill="#e0443c" />
          <rect x="3" y="1" width="2" height="2" fill="#fff" />
          <rect x="9" y="2" width="2" height="2" fill="#fff" />
        </Prop>

        <Flower left="46%" color="#e0443c" />
        <Flower left="64%" color="#f5d63d" />
        <Flower left="68%" color="#5bc0de" />
        <Flower left="73%" color="#b86bd6" />
        <Flower left="84%" color="#e0443c" />

        <div
          className="mc-ground"
          style={{ backgroundImage: `${GRASS}, ${DIRT}, ${STONE}` }}
        />
        <div className="mc-snowcap" />
      </div>

      {/* obor + cahaya (tidak ikut meredup) */}
      <Torch left="calc(58% - 18px)" />
      <Torch left="calc(58% + 150px)" />
      <span className="mc-glow mc-hide-sm" style={{ left: 'calc(58% - 10px)' }} />
      <span className="mc-glow mc-hide-sm" style={{ left: 'calc(58% + 158px)' }} />

      {/* cuaca */}
      <div className="mc-weather mc-rain">
        {DROPS.map((i) => (
          <span
            key={i}
            className="mc-drop"
            style={{
              left: `${(i * 29) % 100}%`,
              animationDelay: `${((i * 13) % 20) / 10}s`,
              animationDuration: `${0.55 + ((i * 7) % 5) / 20}s`,
            }}
          />
        ))}
      </div>
      <div className="mc-weather mc-snow">
        {FLAKES.map((i) => (
          <span
            key={i}
            className="mc-flake"
            style={{
              left: `${(i * 37) % 100}%`,
              animationDelay: `${((i * 11) % 30) / 10}s`,
              animationDuration: `${3.2 + ((i * 5) % 6) / 3}s`,
            }}
          />
        ))}
      </div>

      {/* peredup kiri supaya teks tetap terbaca */}
      <div className="mc-shade" />
    </div>
  )
}