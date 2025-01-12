import clsx from 'clsx'
import { forwardRef, type HTMLAttributes } from 'react'
import { Repeat } from '../operators/Repeat.js'
import { asClassNameDict, asComponentDict, asStyleDict, cloneStyledElement, styles } from '../utils/index.js'

export type BurgerButtonProps = HTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean
  isSplit?: boolean
  isTailHidden?: boolean
  onActivate?: () => void
  onDeactivate?: () => void
  onToggle?: (isActive: boolean) => void
}

/**
 * Three-striped burger button component that transforms into an "X" when
 * selected.
 *
 * @exports BurgerButtonBar Component for each bar in the burger button.
 */
export const BurgerButton = forwardRef<HTMLButtonElement, BurgerButtonProps>(({
  children,
  className,
  style,
  isActive = false,
  isTailHidden = false,
  isSplit = false,
  onActivate,
  onDeactivate,
  onToggle,
  ...props
}, ref) => {
  const onClick = () => {
    onToggle?.(isActive)

    if (isActive) {
      onDeactivate?.()
    }
    else {
      onActivate?.()
    }
  }

  const components = asComponentDict(children, {
    bar: BurgerButtonBar,
  })

  const fixedClassNames = asClassNameDict({
    root: clsx({
      active: isActive,
    }),
    bar: clsx({
      active: isActive,
    }),
  })

  const fixedStyles = getFixedStyles({ isSplit, isActive, isTailHidden })

  return (
    <button
      {...props}
      ref={ref}
      aria-expanded={isActive}
      className={clsx(className, fixedClassNames.root)}
      style={styles(style, fixedStyles.root)}
      onClick={onClick}
    >
      <Repeat count={isSplit ? 2 : 1}>
        {j => (
          <div aria-hidden={true} style={styles(fixedStyles.section, (fixedStyles as any)[`section${j}`])}>
            <Repeat count={3}>
              {i => cloneStyledElement(components.bar ?? <BurgerButtonBar/>, {
                'aria-hidden': true,
                'className': clsx(fixedClassNames.bar),
                'style': styles(fixedStyles.bar, (fixedStyles as any)[`bar${j}${i}`]),
              })}
            </Repeat>
          </div>
        )}
      </Repeat>
    </button>
  )
})

export const BurgerButtonBar = ({ ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span {...props}/>
)

function getFixedStyles({ isActive = false, isSplit = false, isTailHidden = false }) {
  return asStyleDict({
    root: {
      background: 'transparent',
      border: 'none',
      display: 'block',
      outline: 'none',
    },
    section: {
      height: '100%',
      position: 'absolute',
      width: isSplit ? '50%' : '100%',
    },
    section0: {
      left: '0',
      top: '0',
    },
    section1: {
      right: '0',
      top: '0',
    },
    bar: {
      margin: '0',
      padding: '0',
      position: 'absolute',
      width: '100%',
    },
    bar00: {
      left: '0',
      top: isActive ? '50%' : '0',
      transform: isActive ? 'translate(0, -50%) rotate(45deg)' : 'translate(0, 0) rotate(0deg)',
      transformOrigin: isSplit ? 'right center' : 'center',
    },
    bar01: {
      left: '0',
      top: '50%',
      transform: isActive ? 'translate(0, -50%) scale(0)' : 'translate(0, -50%) scale(1)',
      transformOrigin: isSplit ? 'right center' : 'center',
    },
    bar02: {
      left: '0',
      top: isActive ? '50%' : '100%',
      transform: isActive ? 'translate(0, -50%) rotate(-45deg)' : 'translate(0, -100%) rotate(0deg)',
      transformOrigin: isSplit ? 'right center' : 'center',
      width: isActive || isSplit ? '100%' : `${isTailHidden ? '50%' : '100%'}`,
    },
    bar10: {
      left: '0',
      top: isActive ? '50%' : '0',
      transform: isActive ? 'translate(0, -50%) rotate(-45deg)' : 'translate(0, 0) rotate(0deg)',
      transformOrigin: 'left center',
    },
    bar11: {
      left: '0',
      top: '50%',
      transform: isActive ? 'translate(0, -50%) scale(0)' : 'translate(0, -50%) scale(1)',
      transformOrigin: 'left center',
    },
    bar12: {
      left: '0',
      top: isActive ? '50%' : '100%',
      transform: isActive ? 'translate(0, -50%) rotate(45deg)' : 'translate(0, -100%) rotate(0deg)',
      transformOrigin: 'left center',
      width: isTailHidden && !isActive ? '0' : '100%',
    },
  })
}

Object.defineProperty(BurgerButton, 'displayName', { value: 'BurgerButton', writable: false })
