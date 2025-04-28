import clsx from 'clsx'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { Link, NavLink, type LinkProps, type NavLinkProps } from 'react-router'

type ButtonVariantProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-disabled' | 'aria-label' | 'disabled' | 'rel' | 'onClick'> & {
  action: () => void
  isDisabled?: boolean
  label?: string
}

type LinkVariantProps = Omit<LinkProps, 'aria-disabled' | 'aria-label' | 'rel' | 'to' | 'type' | 'onClick'> & {
  action: string
  isDisabled?: boolean
  isNav?: false
  label?: string
}

type NavLinkVariantProps = Omit<NavLinkProps, 'aria-disabled' | 'aria-label' | 'rel' | 'to' | 'target' | 'type' | 'onClick'> & {
  action: string
  isDisabled?: boolean
  isNav: true
  label?: string
}

type AnchorVariantProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'aria-disabled' | 'aria-label' | 'href' | 'rel' | 'target' | 'type' | 'onClick'> & {
  action: string
  isDisabled?: boolean
  label?: string
  opensInNewTab?: boolean
}

export type ButtonProps = AnchorVariantProps | LinkVariantProps | NavLinkVariantProps | ButtonVariantProps

export function Button(props: Readonly<ButtonProps>) {
  switch (true) {
    case isNavLink(props): {
      const { action, children, isNav: _, className, isDisabled, label, ...uniqProps } = props

      return (
        <NavLink
          {...uniqProps}
          aria-disabled={isDisabled}
          aria-label={label}
          className={clsx(className, { disabled: isDisabled })}
          to={action}
        >
          {children ?? label}
        </NavLink>
      )
    }
    case isLink(props): {
      const { action, children, className, isDisabled, label, ...uniqProps } = props

      return (
        <Link
          {...uniqProps}
          aria-disabled={isDisabled}
          aria-label={label}
          className={clsx(className, { disabled: isDisabled })}
          to={action}
        >
          {children ?? label}
        </Link>
      )
    }
    case isAnchor(props): {
      const { action, children, className, isDisabled, label, opensInNewTab, ...uniqProps } = props

      return (
        <a
          {...uniqProps}
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
    case isButton(props): {
      const { action, children, className, isDisabled, label, type = 'button', ...uniqProps } = props

      return (
        <button
          {...uniqProps}
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
    default:
      throw Error('Unknown button type')
  }
}

function isNavLink(props: ButtonProps): props is NavLinkVariantProps {
  if (typeof props.action !== 'string') return false
  if (!props.action.startsWith('/')) return false
  if (!('isNav' in props)) return false
  if (!props.isNav) return false

  return true
}

function isLink(props: ButtonProps): props is LinkVariantProps {
  if (typeof props.action !== 'string') return false
  if (!props.action.startsWith('/')) return false
  if ('isNav' in props && props.isNav) return false

  return true
}

function isAnchor(props: ButtonProps): props is AnchorVariantProps {
  if (typeof props.action !== 'string') return false
  if (props.action.startsWith('/')) return false

  return true
}

function isButton(props: ButtonProps): props is ButtonVariantProps {
  if (typeof props.action !== 'function') return false

  return true
}
