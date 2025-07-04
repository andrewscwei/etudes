import clsx from 'clsx'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { asClassNameDict } from '../utils/asClassNameDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { styles } from '../utils/styles.js'
import { Burger, BurgerBar, type BurgerProps } from './Burger.js'

/**
 * Type describing the props of {@link BurgerButton}.
 */
export type BurgerButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement> & BurgerProps, 'onToggle'> & {
  /**
   * Handler invoked when the button is activated.
   */
  onActivate?: () => void

  /**
   * Handler invoked when the button is deactivated.
   */
  onDeactivate?: () => void

  /**
   * Handler invoked when the button's active state is toggled.
   *
   * @param isActive The new active state of the button.
   */
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
    const newIsActive = !isActive

    onToggle?.(newIsActive)

    if (newIsActive) {
      onActivate?.()
    }
    else {
      onDeactivate?.()
    }
  }

  const fixedClassNames = asClassNameDict({
    root: clsx({
      active: isActive,
    }),
  })

  const fixedStyles = _getFixedStyles()

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

/**
 * Component for each bar in a {@link BurgerButton}.
 */
export const BurgerButtonBar = BurgerBar

function _getFixedStyles() {
  return asStyleDict({
    root: {
      background: 'transparent',
      border: 'none',
      display: 'block',
      outline: 'none',
    },
  })
}

if (process.env.NODE_ENV === 'development') {
  BurgerButton.displayName = 'BurgerButton'
  BurgerButtonBar.displayName = 'BurgerButtonBar'
}
