import clsx from 'clsx'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router'

type ButtonVariantProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-disabled' | 'aria-label' | 'disabled' | 'type'>
type LinkVariantProps = Omit<LinkProps, 'aria-disabled' | 'aria-label' | 'to'>
type AnchorVariantProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'aria-disabled' | 'aria-label' | 'rel' | 'target'>

export type ButtonProps = (AnchorVariantProps | LinkVariantProps | ButtonVariantProps) & {
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
}: Readonly<ButtonProps>) {
  if (href) {
    return (
      <a
        {...props as AnchorVariantProps}
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
        {...props as LinkVariantProps}
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
        {...props as ButtonVariantProps}
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
