import type { ReactNode } from 'react'

export type IconName =
  | 'heart'
  | 'sparkle'
  | 'book'
  | 'arrow'
  | 'lock'
  | 'check'

type IconProps = {
  name: IconName
  size?: number
}

export default function Icon({ name, size = 18 }: IconProps) {
  const paths: Record<IconName, ReactNode> = {
    heart: (
      <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.4l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    ),
    sparkle: (
      <>
        <path d="m12 3-1.1 3.1A7.2 7.2 0 0 1 6.5 10L3 11l3.5 1a7.2 7.2 0 0 1 4.4 3.9L12 19l1.1-3.1a7.2 7.2 0 0 1 4.4-3.9l3.5-1-3.5-1a7.2 7.2 0 0 1-4.4-3.9L12 3Z" />
        <path d="m19 18-.4 1.1a2.7 2.7 0 0 1-1.5 1.5L16 21l1.1.4a2.7 2.7 0 0 1 1.5 1.5L19 24l.4-1.1a2.7 2.7 0 0 1 1.5-1.5L22 21l-1.1-.4a2.7 2.7 0 0 1-1.5-1.5L19 18Z" />
      </>
    ),
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    lock: (
      <>
        <rect width="14" height="10" x="5" y="11" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
  }

 return (
  <svg
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    height={size}
    width={size}
    viewBox="0 0 24 24"
  >
    {paths[name]}
  </svg>
)
}