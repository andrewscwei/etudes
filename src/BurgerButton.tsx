import classNames from 'classnames'
import React, { forwardRef, HTMLAttributes, PropsWithChildren, useEffect, useState } from 'react'
import Repeat from './Repeat'
import asClassNameDict from './utils/asClassNameDict'
import asComponentDict from './utils/asComponentDict'
import asStyleDict from './utils/asStyleDict'
import cloneStyledElement from './utils/cloneStyledElement'
import styles from './utils/styles'

export type BurgerButtonProps = HTMLAttributes<HTMLButtonElement> & PropsWithChildren<{
  height?: number
  isActive?: boolean
  isDoubleJointed?: boolean
  isLastBarHalfWidth?: boolean
  thickness?: number
  transitionDuration?: number
  width?: number
  onActivate?: () => void
  onDeactivate?: () => void
}>

/**
 * Three-striped burger button component that transforms into an "X" when
 * selected.
 *
 * @exports BurgerButtonBar - Component for each line on the burger button.
 */
export default forwardRef<HTMLButtonElement, BurgerButtonProps>(({
  children,
  className,
  style,
  height = 20,
  isActive: externalIsActive = false,
  isDoubleJointed = false,
  isLastBarHalfWidth = false,
  thickness = 2,
  transitionDuration = 200,
  width = 20,
  onActivate,
  onDeactivate,
  ...props
}, ref) => {
  const [isActive, setIsActive] = useState(externalIsActive)

  useEffect(() => {
    if (isActive !== externalIsActive) {
      setIsActive(externalIsActive)
    }
  }, [externalIsActive])

  useEffect(() => {
    if (isActive) {
      onActivate?.()
    }
    else {
      onDeactivate?.()
    }
  }, [isActive])

  const components = asComponentDict(children, {
    bar: BurgerButtonBar,
  })

  const fixedClassNames = asClassNameDict({
    root: classNames({
      active: isActive,
    }),
    bar: classNames({
      active: isActive,
    }),
  })

  const fixedStyles = asStyleDict({
    root: {
      border: 'none',
      display: 'block',
      height: `${height}px`,
      outline: 'none',
      width: `${width}px`,
    },
    joint: {
      height: '100%',
      position: 'absolute',
      width: isDoubleJointed ? '50%' : '100%',
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
      height: `${thickness}px`,
      margin: '0',
      padding: '0',
      position: 'absolute',
      width: '100%',
    },
    bar00: {
      left: '0',
      top: '0',
      transform: isActive ? `translate3d(0, ${height * 0.5 - thickness * 0.5}px, 0) rotate(45deg)` : 'translate3d(0, 0, 0) rotate(0deg)',
      transformOrigin: isDoubleJointed ? 'right center' : 'center',
    },
    bar01: {
      left: '0',
      top: `${height * 0.5 - thickness * 0.5}px`,
      transform: isActive ? 'translate3d(0, 0, 0) scale(0)' : 'translate3d(0, 0, 0) scale(1)',
      transformOrigin: isDoubleJointed ? 'right center' : 'center',
    },
    bar02: {
      left: '0',
      top: `${height - thickness}px`,
      transform: isActive ? `translate3d(0, ${thickness * 0.5 - height * 0.5}px, 0) rotate(-45deg)` : 'translate3d(0, 0, 0) rotate(0deg)',
      transformOrigin: isDoubleJointed ? 'right center' : 'center',
      width: isActive || isDoubleJointed ? '100%' : `${isLastBarHalfWidth ? '50%' : '100%'}`,
    },
    bar10: {
      left: '0',
      top: '0',
      transform: isActive ? `translate3d(0, ${height * 0.5 - thickness * 0.5}px, 0) rotate(-45deg)` : 'translate3d(0, 0, 0) rotate(0deg)',
      transformOrigin: 'left center',
    },
    bar11: {
      left: '0',
      top: `${height * 0.5 - thickness * 0.5}px`,
      transform: isActive ? 'translate3d(0, 0, 0) scale(0)' : 'translate3d(0, 0, 0) scale(1)',
      transformOrigin: 'left center',
    },
    bar12: {
      left: '0',
      top: `${height - thickness}px`,
      transform: isActive ? `translate3d(0, ${thickness * 0.5 - height * 0.5}px, 0) rotate(45deg)` : 'translate3d(0, 0, 0) rotate(0deg)',
      transformOrigin: 'left center',
      width: isLastBarHalfWidth && !isActive ? '0' : '100%',
    },
  })

  const defaultStyles = asStyleDict({
    bar: {
      background: '#fff',
      transitionDuration: '100ms',
      transitionProperty: 'width, height, transform, opacity, background',
      transitionTimingFunction: 'ease-out',
    },
  })

  return (
    <button
      {...props}
      ref={ref}
      className={classNames(className, fixedClassNames.root)}
      style={styles(style, fixedStyles.root)}
      onClick={() => setIsActive(!isActive)}
    >
      <Repeat count={isDoubleJointed ? 2 : 1}>
        {j => (
          <div style={styles(fixedStyles.joint, (fixedStyles as any)[`joint${j}`])}>
            <Repeat count={3}>
              {i => cloneStyledElement(components.bar ?? <BurgerButtonBar style={defaultStyles.bar}/>, {
                'className': classNames(fixedClassNames.bar),
                'style': styles(fixedStyles.bar, (fixedStyles as any)[`bar${j}${i}`]),
                'data-index': i,
              })}
            </Repeat>
          </div>
        )}
      </Repeat>
    </button>
  )
})

export const BurgerButtonBar = ({ ...props }: HTMLAttributes<HTMLSpanElement>) => <span {...props}/>
