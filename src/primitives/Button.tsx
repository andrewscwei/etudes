import clsx from 'clsx'
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react'

type ButtonVariantProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-disabled' | 'aria-label' | 'disabled' | 'rel' | 'onClick'> & {
  isDisabled?: boolean
  label?: string
  action?: () => void
}

type AnchorVariantProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'aria-disabled' | 'aria-label' | 'href' | 'rel' | 'target' | 'type' | 'onClick'> & {
  action: string
  isDisabled?: boolean
  label?: string
  opensInNewTab?: boolean
}

export namespace Button {
  /**
   * Type describing the props of {@link Button}.
   */
  export type Props = AnchorVariantProps | ButtonVariantProps
}

/**
 * A button component that can be used as a {@link Link}, {@link NavLink},
 * {@link HTMLAnchorElement}, or {@link HTMLButtonElement} depending on the
 * structure of its props.
 */
export const Button = /* #__PURE__ */ forwardRef<HTMLAnchorElement | HTMLButtonElement, Button.Props>((props: Readonly<Button.Props>, ref) => {
  switch (true) {
    case _isAnchor(props): {
      const { action, children, className, isDisabled, label, opensInNewTab, ...uniqProps } = props

      return (
        <a
          {...uniqProps}
          ref={ref as React.Ref<HTMLAnchorElement>}
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
          ref={ref as React.Ref<HTMLButtonElement>}
          aria-disabled={isDisabled}
          aria-label={label}
          className={className}
          disabled={isDisabled}
          type={type}
          onClick={action}
        >
          {children ?? label}
        </button>
      )
    }
    default:
      console.error('[etudes::Button] Unknown button type')

      return undefined
  }
})

function _isAnchor(props: Button.Props): props is AnchorVariantProps {
  if (typeof props.action === 'string') return true

  return false
}

function _isButton(props: Button.Props): props is ButtonVariantProps {
  if (typeof props.action === 'function' || typeof (props as any).type === 'string') return true

  return false
}

if (process.env.NODE_ENV === 'development') {
  Button.displayName = 'Button'
}
