import clsx from 'clsx'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

import { asClassNameDict } from '../utils/asClassNameDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { styles } from '../utils/styles.js'
import { Burger } from './Burger.js'

const _BurgerButton = /* #__PURE__ */ forwardRef<HTMLButtonElement, Readonly<BurgerButton.Props>>(({
  className,
  style,
  children,
  numberOfBars = 3,
  isActive = false,
  isSplit = false,
  isTailHidden = false,
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
    } else {
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
      className={clsx(className, fixedClassNames.root)}
      ref={ref}
      style={styles(style, fixedStyles.root)}
      aria-expanded={isActive}
      onClick={onClick}
    >
      <Burger
        numberOfBars={numberOfBars}
        isActive={isActive}
        isSplit={isSplit}
        isTailHidden={isTailHidden}
      >
        {children}
      </Burger>
    </button>
  )
})

/**
 * Component for each bar in a {@link BurgerButton}.
 */
const _Bar = Burger.Bar

export namespace BurgerButton {
  /**
   * Type describing the props of {@link BurgerButton}.
   */
  export type Props = {
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
  } & Omit<Burger.Props & ButtonHTMLAttributes<HTMLButtonElement>, 'onToggle'>
}

/**
 * Three-striped burger button component that transforms into an "X" when
 * active.
 *
 * @exports BurgerButton.Bar Component for each bar in the burger button.
 */
export const BurgerButton = /* #__PURE__ */ Object.assign(_BurgerButton, {
  /**
   * Component for each bar in a {@link BurgerButton}.
   */
  Bar: _Bar,
})

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
  _BurgerButton.displayName = 'BurgerButton'

  _Bar.displayName = 'BurgerButton.Bar'
}
