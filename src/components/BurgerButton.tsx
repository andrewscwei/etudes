import clsx from 'clsx'
import { forwardRef, type HTMLAttributes, type PropsWithChildren } from 'react'
import { Repeat } from '../operators/Repeat.js'
import { asClassNameDict, asComponentDict, asStyleDict, cloneStyledElement, styles } from '../utils/index.js'

export type BurgerButtonProps = HTMLAttributes<HTMLButtonElement> & PropsWithChildren<{
  isActive?: boolean
  isSplit?: boolean
  isTailHidden?: boolean
  usesDefaultStyles?: boolean
  onActivate?: () => void
  onDeactivate?: () => void
  onToggle?: (isActive: boolean) => void
}>

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
  usesDefaultStyles = false,
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
  const defaultStyles = usesDefaultStyles ? getDefaultStyles() : undefined

  return (
    <button
      {...props}
      ref={ref}
      className={clsx(className, fixedClassNames.root)}
      data-component='burger-button'
      style={styles(style, fixedStyles.root)}
      onClick={onClick}
    >
      <Repeat count={isSplit ? 2 : 1}>
        {j => (
          <div data-child='joint' style={styles(fixedStyles.joint, (fixedStyles as any)[`joint${j}`])}>
            <Repeat count={3}>
              {i => cloneStyledElement(components.bar ?? <BurgerButtonBar style={defaultStyles?.bar}/>, {
                className: clsx(fixedClassNames.bar),
                style: styles(fixedStyles.bar, (fixedStyles as any)[`bar${j}${i}`]),
              })}
            </Repeat>
          </div>
        )}
      </Repeat>
    </button>
  )
})

Object.defineProperty(BurgerButton, 'displayName', { value: 'BurgerButton', writable: false })

export const BurgerButtonBar = ({ ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span {...props} data-child='bar'/>
)

function getFixedStyles({
  isActive = false,
  isSplit = false,
  isTailHidden = false,
}) {
  return asStyleDict({
    root: {
      background: 'transparent',
      border: 'none',
      display: 'block',
      outline: 'none',
    },
    joint: {
      height: '100%',
      position: 'absolute',
      width: isSplit ? '50%' : '100%',
    },
    joint0: {
      left: '0',
      top: '0',
    },
    joint1: {
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

function getDefaultStyles() {
  return asStyleDict({
    bar: {
      height: '2px',
      background: '#fff',
      transitionDuration: '100ms',
      transitionProperty: 'background, height, opacity, transform, width, left, top, right, bottom',
      transitionTimingFunction: 'ease-out',
    },
  })
}