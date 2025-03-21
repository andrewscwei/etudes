import clsx from 'clsx'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router'

type ButtonVariantProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-disabled' | 'aria-label' | 'disabled' | 'rel' | 'type' | 'onClick'>
type LinkVariantProps = Omit<LinkProps, 'aria-disabled' | 'aria-label' | 'rel' | 'to' | 'target' | 'type' | 'onClick'>
type AnchorVariantProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'aria-disabled' | 'aria-label' | 'href' | 'rel' | 'target' | 'type' | 'onClick'>

export type ButtonProps = (AnchorVariantProps | LinkVariantProps | ButtonVariantProps) & {
  action: string | (() => void)
  isDisabled?: boolean
  label?: string
  opensInNewTab?: boolean
  type?: HTMLButtonElement['type']
}

export function Button({
  action,
  children,
  className,
  isDisabled = false,
  label,
  opensInNewTab,
  type,
  ...props
}: Readonly<ButtonProps>) {
  if (typeof action === 'string') {
    if (action.startsWith('/')) {
      return (
        <Link
          {...props as LinkVariantProps}
          aria-disabled={isDisabled}
          aria-label={label}
          className={clsx(className, { disabled: isDisabled })}
          to={action}
        >
          {children ?? label}
        </Link>
      )
    }
    else {
      return (
        <a
          {...props as AnchorVariantProps}
          aria-disabled={isDisabled}
          aria-label={label}
          className={clsx(className, { disabled: isDisabled })}
          href={action}
          rel={opensInNewTab ? 'noopener,noreferrer' : undefined}
          target={opensInNewTab ? '_blank' : undefined}
        >
          {children ?? label}
        </a>
      )
    }
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
        onClick={() => action()}
      >
        {children ?? label}
      </button>
    )
  }
}
