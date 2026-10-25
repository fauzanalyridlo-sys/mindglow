'use client'

import { useEffect } from 'react'

export default function LandingAnimationObserver() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduceMotion || !('IntersectionObserver' in window)) {
      return
    }

    const selectors = [
      '.stats .stat-item',
      '.features-heading',
      '.feature-card',
      '.checkin-heading',
      '.checkin-description',
      '.checkin-demo-card',
      '.reflection-description',
      '.reflection-demo-card',
      '.reflection-benefit',
      '.journal-heading',
      '.journal-description',
      '.journal-demo-card',
      '.closing-cta-content',
    ]

    const elements = document.querySelectorAll<HTMLElement>(
      selectors.join(','),
    )

    if (elements.length === 0) return

    document.documentElement.classList.add('landing-motion-ready')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -35px 0px',
      },
    )

    elements.forEach((element) => {
      element.classList.add('landing-reveal')
      observer.observe(element)
    })

    return () => {
      observer.disconnect()
      document.documentElement.classList.remove(
        'landing-motion-ready',
      )
      elements.forEach((element) => {
        element.classList.remove('landing-reveal', 'is-visible')
      })
    }
  }, [])

  return null
}
