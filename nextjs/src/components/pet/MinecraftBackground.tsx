"use client";

import "./minecraft-bg.css";
import { useWorld } from "./momo-world";

const svgUrl = (inner: string, w: number, h: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${inner}</svg>`,
  )}")`;

const GRASS = svgUrl(
  `<rect width="16" height="16" fill="#795438"/>
   <rect width="16" height="5" fill="#5ca83b"/>
   <rect x="2" y="0" width="3" height="2" fill="#4a9130"/>
   <rect x="8" y="2" width="4" height="2" fill="#78c64d"/>
   <rect x="13" y="0" width="2" height="3" fill="#43852d"/>
   <rect y="5" width="16" height="2" fill="#4e9632"/>
   <rect x="3" y="8" width="2" height="2" fill="#68472e"/>
   <rect x="10" y="11" width="3" height="2" fill="#946b46"/>
   <rect x="1" y="13" width="3" height="2" fill="#946b46"/>
   <rect x="7" y="6" width="2" height="2" fill="#6b4a31"/>`,
  16,
  16,
);

const DIRT = svgUrl(
  `<rect width="16" height="16" fill="#795438"/>
   <rect x="2" y="2" width="3" height="2" fill="#68472e"/>
   <rect x="10" y="4" width="3" height="2" fill="#946b46"/>
   <rect x="5" y="8" width="2" height="3" fill="#68472e"/>
   <rect x="12" y="12" width="3" height="2" fill="#68472e"/>
   <rect x="1" y="13" width="3" height="2" fill="#946b46"/>
   <rect x="8" y="2" width="2" height="2" fill="#a27a51"/>`,
  16,
  16,
);

const STONE = svgUrl(
  `<rect width="16" height="16" fill="#858585"/>
   <rect x="1" y="2" width="5" height="2" fill="#6c6c6c"/>
   <rect x="10" y="1" width="3" height="3" fill="#a1a1a1"/>
   <rect x="7" y="7" width="4" height="2" fill="#707070"/>
   <rect x="1" y="11" width="3" height="3" fill="#a1a1a1"/>
   <rect x="11" y="12" width="4" height="2" fill="#6c6c6c"/>`,
  16,
  16,
);

const MOUNTAINS = svgUrl(
  `<path d="M0 80V56H32V40H64V24H112V40H144V56H176V40H208V16H256V32H288V48H320V80Z" fill="#8bbcb0"/>
   <path d="M64 24H80V32H96V24H112V32H96V40H80V32H64Z" fill="#e8f3ed"/>
   <path d="M208 16H224V24H240V16H256V24H240V32H224V24H208Z" fill="#f5fbff"/>
   <rect x="32" y="40" width="32" height="4" fill="#7eafa2"/>
   <rect x="176" y="40" width="32" height="4" fill="#7eafa2"/>`,
  320,
  80,
);

const HILLS = svgUrl(
  `<path d="M0 48V32H32V24H96V32H128V16H192V32H224V24H256V48Z" fill="#5a9b42"/>
   <rect x="0" y="32" width="32" height="4" fill="#4b8738"/>
   <rect x="32" y="24" width="64" height="4" fill="#70b84d"/>
   <rect x="128" y="16" width="64" height="4" fill="#78c64d"/>
   <rect x="224" y="24" width="32" height="4" fill="#4b8738"/>`,
  256,
  48,
);

const FENCE = svgUrl(
  `<rect y="8" width="24" height="3" fill="#a4793c"/>
   <rect y="16" width="24" height="3" fill="#a4793c"/>
   <rect y="11" width="24" height="1" fill="#7c5a28"/>
   <rect y="19" width="24" height="1" fill="#7c5a28"/>
   <rect x="9" width="6" height="28" fill="#a4793c"/>
   <rect x="9" width="2" height="28" fill="#c29552"/>
   <rect x="13" width="2" height="28" fill="#7c5a28"/>`,
  24,
  28,
);

const STARS = Array.from({ length: 30 }, (_, i) => i);
const DROPS = Array.from({ length: 36 }, (_, i) => i);
const FLAKES = Array.from({ length: 28 }, (_, i) => i);

function Prop({
  left,
  width,
  viewBox,
  className = "",
  children,
}: {
  left: string;
  width: number;
  viewBox: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      className={`mc-prop ${className}`}
      style={{ left, width }}
      viewBox={viewBox}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Tree({
  left,
  width,
  className = "",
}: {
  left: string;
  width: number;
  className?: string;
}) {
  return (
    <Prop left={left} width={width} viewBox="0 0 80 112" className={className}>
      <rect x="32" y="64" width="16" height="48" fill="#79552f" />
      <rect x="36" y="64" width="3" height="48" fill="#5e4025" />
      <rect x="44" y="64" width="3" height="48" fill="#946a3c" />

      <rect x="0" y="32" width="80" height="32" fill="#347d2d" />
      <rect x="16" y="0" width="48" height="32" fill="#347d2d" />

      <rect x="0" y="32" width="80" height="4" fill="#438f33" />
      <rect x="16" y="0" width="48" height="4" fill="#4a9838" />

      <g fill="#286b26">
        <rect x="6" y="40" width="8" height="8" />
        <rect x="24" y="48" width="8" height="8" />
        <rect x="48" y="36" width="10" height="8" />
        <rect x="64" y="48" width="8" height="8" />
        <rect x="24" y="8" width="10" height="8" />
        <rect x="48" y="20" width="8" height="6" />
      </g>

      <g fill="#5eae43">
        <rect x="16" y="20" width="8" height="6" />
        <rect x="40" y="8" width="8" height="6" />
        <rect x="60" y="36" width="8" height="6" />
        <rect x="8" y="52" width="10" height="6" />
      </g>
    </Prop>
  );
}

function Flower({ left, color }: { left: string; color: string }) {
  return (
    <Prop left={left} width={18} viewBox="0 0 8 12">
      <rect x="3" y="4" width="2" height="8" fill="#347d2d" />
      <rect x="1" y="0" width="6" height="4" fill={color} />
      <rect x="3" y="1" width="2" height="2" fill="#fff6c7" />
    </Prop>
  );
}

function Torch({ left }: { left: string }) {
  return (
    <Prop left={left} width={16} viewBox="0 0 8 26" className="mc-hide-sm">
      <g className="mc-fire">
        <rect
          className="mc-flame"
          x="0"
          y="0"
          width="8"
          height="8"
          fill="#ff9f24"
        />
        <rect
          className="mc-flame"
          x="2"
          y="2"
          width="4"
          height="4"
          fill="#fff0a0"
        />
      </g>
      <rect x="2" y="8" width="4" height="18" fill="#8b5a2b" />
      <rect x="2" y="8" width="2" height="18" fill="#b17a3c" />
    </Prop>
  );
}

function Cloud({ top, left, dur }: { top: number; left: string; dur: number }) {
  return (
    <svg
      className="mc-cloud"
      style={{ top, left, animationDuration: `${dur}s` }}
      viewBox="-8 0 80 24"
      shapeRendering="crispEdges"
      fill="#fff"
      aria-hidden="true"
    >
      <rect x="0" y="8" width="56" height="10" />
      <rect x="10" y="0" width="28" height="10" />
      <rect x="-8" y="14" width="72" height="6" />
      <rect x="8" y="18" width="42" height="2" fill="#dce9f2" />
    </svg>
  );
}

export default function MinecraftBackground() {
  const { phase, weather } = useWorld();

  return (
    <div
      className="mc-bg"
      data-phase={phase}
      data-weather={weather}
      aria-hidden="true"
    >
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
              top: `${(i * 29) % 85}%`,
              animationDelay: `${(i % 7) * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="mc-sun" />
      <div className="mc-moon" />

      <div className="mc-world">
        <Cloud top={22} left="40%" dur={14} />
        <Cloud top={64} left="58%" dur={18} />
        <Cloud top={30} left="72%" dur={16} />

        <div
          className="mc-layer mc-mountains"
          style={{ backgroundImage: MOUNTAINS }}
        />
        <div className="mc-layer mc-hills" style={{ backgroundImage: HILLS }} />

        <Tree left="50%" width={104} />
        <Tree left="76%" width={80} className="mc-hide-sm" />
        <Tree left="93%" width={92} className="mc-hide-sm" />

        <div
          className="mc-prop mc-fence mc-hide-sm"
          style={{ backgroundImage: FENCE }}
        />

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

      <Torch left="calc(58% - 18px)" />
      <Torch left="calc(58% + 150px)" />

      <span
        className="mc-glow mc-hide-sm"
        style={{ left: "calc(58% - 10px)" }}
      />
      <span
        className="mc-glow mc-hide-sm"
        style={{ left: "calc(58% + 158px)" }}
      />

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

      <div className="mc-shade" />
    </div>
  );
}
