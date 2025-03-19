import clsx from 'clsx'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { asClassNameDict, asStyleDict, styles } from '../utils/index.js'
import { Burger, BurgerBar, type BurgerProps } from './Burger.js'

export type BurgerButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement> & BurgerProps, 'onToggle'> & {
  onActivate?: () => void
  onDeactivate?: () => void
  onToggle?: (isActive: boolean) => void
}

/**
 * Three-striped burger button component that transforms into an "X" when
 * active.
 *
 * @exports BurgerButtonBar Component for each bar in the burger button.
 */
export const BurgerButton = /* #__PURE__ */ forwardRef<HTMLButtonElement, Readonly<BurgerButtonProps>>(({
  children,
  className,
  style,
  isActive = false,
  isTailHidden = false,
  isSplit = false,
  numberOfBars = 3,
  onActivate,
  onDeactivate,
  onToggle,
  ...props
}, ref) => {
  const onClick = () => {
    onToggle?.(!isActive)

    if (isActive) {
      onDeactivate?.()
    }
    else {
      onActivate?.()
    }
  }

  const fixedClassNames = asClassNameDict({
    root: clsx({
      active: isActive,
    }),
  })

  const fixedStyles = getFixedStyles()

  return (
    <button
      {...props}
      ref={ref}
      aria-expanded={isActive}
      className={clsx(className, fixedClassNames.root)}
      style={styles(style, fixedStyles.root)}
      onClick={onClick}
    >
      <Burger
        isActive={isActive}
        isSplit={isSplit}
        isTailHidden={isTailHidden}
        numberOfBars={numberOfBars}
      >
        {children}
      </Burger>
    </button>
  )
})

export const BurgerButtonBar = BurgerBar

function getFixedStyles() {
  return asStyleDict({
    root: {
      background: 'transparent',
      border: 'none',
      display: 'block',
      outline: 'none',
    },
  })
}
