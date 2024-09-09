import clsx from 'clsx'
import type { HTMLAttributes, PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'

export type ButtonProps = HTMLAttributes<HTMLElement> & PropsWithChildren<{
  href?: string
  isDisabled?: boolean
  label?: string
  opensInNewTab?: boolean
  to?: string
  type?: HTMLButtonElement['type']
}>

export function Button({
  children,
  className,
  href,
  isDisabled = false,
  label,
  opensInNewTab,
  to,
  type,
  ...props
}: ButtonProps) {
  if (href) {
    return (
      <a
        {...props}
        className={clsx(className, { disabled: isDisabled })}
        data-component='button'
        href={href}
        rel={opensInNewTab ? 'noopener,noreferrer' : undefined}
        target={opensInNewTab ? '_blank' : undefined}
      >
        {children ?? label}
      </a>
    )
  }
  else if (to) {
    return (
      <Link
        {...props}
        className={clsx(className, { disabled: isDisabled })}
        data-component='button'
        to={to}
      >
        {children ?? label}
      </Link>
    )
  }
  else {
    return (
      <button
        {...props}
        className={className}
        data-component='button'
        disabled={isDisabled}
        type={type}
      >
        {children ?? label}
      </button>
    )
  }
}

Object.defineProperty(Button, 'displayName', { value: 'Button', writable: false })
