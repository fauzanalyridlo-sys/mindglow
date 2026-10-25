'use client'

import { useEffect, useRef, useState } from 'react'
import '../../styles/public-stats.css'

const stats = [
  { value: '1 menit', label: 'untuk check-in', target: 1, suffix: ' menit' },
  { value: '24/7', label: 'ruang refleksi', target: 24, suffix: '/7' },
  { value: '100%', label: 'privat & personal', target: 100, suffix: '%' },
  { value: 'Setiap hari', label: 'wawasan baru' },
]

function AnimatedStat({
  target,
  suffix,
}: {
  target: number
  suffix: string
}) {
  const [value, setValue] = useState(0)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduceMotion || !('IntersectionObserver' in window)) {
      setValue(target)
      return
    }

    let frame = 0
    let started = false
    let startTime = 0
    const duration = 1200

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return

        started = true

        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp

          const progress = Math.min(
            (timestamp - startTime) / duration,
            1,
          )
          const eased = 1 - Math.pow(1 - progress, 3)

          setValue(Math.round(target * eased))

          if (progress < 1) {
            frame = window.requestAnimationFrame(animate)
          } else {
            setValue(target)
          }
        }

        frame = window.requestAnimationFrame(animate)
        observer.disconnect()
      },
      { threshold: 0.4 },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frame)
    }
  }, [target])

  return (
    <strong ref={elementRef}>
      {value}{suffix}
    </strong>
  )
}

export default function StatsSection() {
  return (
    <section className="stats" aria-label="Keunggulan MindGlow">
      <div className="container stats-grid">
        {stats.map((stat) => (
          <div className="stat-item" key={stat.value}>
            {stat.target !== undefined ? (
              <AnimatedStat
                target={stat.target}
                suffix={stat.suffix ?? ''}
              />
            ) : (
              <strong>{stat.value}</strong>
            )}
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
