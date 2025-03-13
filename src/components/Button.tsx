import clsx from 'clsx'
import type { HTMLAttributes } from 'react'
import { Link } from 'react-router'

export type ButtonProps = HTMLAttributes<HTMLElement> & {
  href?: string
  isDisabled?: boolean
  label?: string
  opensInNewTab?: boolean
  to?: string
  type?: HTMLButtonElement['type']
}

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
        aria-disabled={isDisabled}
        aria-label={label}
        className={clsx(className, { disabled: isDisabled })}
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
        aria-disabled={isDisabled}
        aria-label={label}
        className={clsx(className, { disabled: isDisabled })}
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
        aria-disabled={isDisabled}
        aria-label={label}
        className={className}
        disabled={isDisabled}
        type={type}
      >
        {children ?? label}
      </button>
    )
  }
}
