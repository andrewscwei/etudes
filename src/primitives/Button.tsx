import clsx from 'clsx'
import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariantProps = {
  action?: () => void
  label?: string
  isDisabled?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-disabled' | 'aria-label' | 'disabled' | 'onClick' | 'rel'>

type AnchorVariantProps = {
  action: string
  label?: string
  opensInNewTab?: boolean
  isDisabled?: boolean
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'aria-disabled' | 'aria-label' | 'href' | 'onClick' | 'rel' | 'target' | 'type'>

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
      const { className, action, children, label, opensInNewTab, isDisabled, ...uniqProps } = props

      return (
        <a
          {...uniqProps}
          {...isDisabled ? { 'aria-disabled': true } : {}}
          className={clsx(className, { disabled: isDisabled })}
          ref={ref as React.Ref<HTMLAnchorElement>}
          aria-label={label}
          href={action}
          rel={opensInNewTab ? 'noopener,noreferrer' : undefined}
          target={opensInNewTab ? '_blank' : undefined}
        >
          {children ?? label}
        </a>
      )
    }
    case _isButton(props): {
      const { className, action, children, label, type = 'button', isDisabled, ...uniqProps } = props

      return (
        <button
          {...uniqProps}
          {...isDisabled ? { 'aria-disabled': true } : {}}
          className={className}
          ref={ref as React.Ref<HTMLButtonElement>}
          aria-label={label}
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
