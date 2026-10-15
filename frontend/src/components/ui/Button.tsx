import type { ReactNode } from 'react'
import Icon from './Icon'

type ButtonProps = {
  children: ReactNode
  href: string
  variant?: 'primary' | 'secondary' | 'light'
}

export default function Button({
  children,
  href,
  variant = 'primary',
}: ButtonProps) {
  return (
    <a className={`button button--${variant}`} href={href}>
      <span>{children}</span>

      {variant !== 'secondary' && (
        <Icon name="arrow" size={20} />
      )}
    </a>
  )
}