import clsx from 'clsx'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'

type ButtonVariantProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-disabled' | 'aria-label' | 'disabled' | 'rel' | 'onClick'> & {
  action: () => void
  isDisabled?: boolean
  label?: string
}

type AnchorVariantProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'aria-disabled' | 'aria-label' | 'href' | 'rel' | 'target' | 'type' | 'onClick'> & {
  action: string
  isDisabled?: boolean
  label?: string
  opensInNewTab?: boolean
}

/**
 * Type describing the props of {@link Button}.
 */
export type ButtonProps = AnchorVariantProps | ButtonVariantProps

/**
 * A button component that can be used as a {@link Link}, {@link NavLink},
 * {@link HTMLAnchorElement}, or {@link HTMLButtonElement} depending on the
 * structure of its props.
 */
export function Button(props: Readonly<ButtonProps>) {
  switch (true) {
    case _isAnchor(props): {
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
    case _isButton(props): {
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
      console.error('[etudes::Button] Unknown button type')

      return (
        <></>
      )
  }
}

function _isAnchor(props: ButtonProps): props is AnchorVariantProps {
  if (typeof props.action !== 'string') return false

  return true
}

function _isButton(props: ButtonProps): props is ButtonVariantProps {
  if (typeof props.action !== 'function') return false

  return true
}

if (process.env.NODE_ENV !== 'production') {
  Button.displayName = 'Button'
}
