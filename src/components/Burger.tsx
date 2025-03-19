import clsx from 'clsx'
import { forwardRef, type HTMLAttributes } from 'react'
import { Repeat } from '../operators/index.js'
import { asClassNameDict, asComponentDict, asStyleDict, cloneStyledElement, styles } from '../utils/index.js'

export type BurgerProps = HTMLAttributes<HTMLDivElement> & {
  isActive?: boolean
  isSplit?: boolean
  isTailHidden?: boolean
  numberOfBars?: 2 | 3
}

/**
 * Three-striped burger component that transforms into an "X" when active.
 *
 * @exports BurgerBar Component for each bar in the burger.
 */
export const Burger = /* #__PURE__ */ forwardRef<HTMLDivElement, Readonly<BurgerProps>>(({
  children,
  className,
  isActive = false,
  isTailHidden = false,
  isSplit = false,
  numberOfBars = 3,
  ...props
}, ref) => {
  const components = asComponentDict(children, {
    bar: BurgerBar,
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
    <div
      {...props}
      ref={ref}
      className={clsx(className, fixedClassNames.root)}
    >
      <Repeat count={isSplit ? 2 : 1}>
        {j => (
          <div aria-hidden={true} style={styles(fixedStyles.section, (fixedStyles as any)[`section${j}`])}>
            <Repeat count={numberOfBars}>
              {i => cloneStyledElement(components.bar ?? <BurgerBar/>, {
                'aria-hidden': true,
                'className': clsx(fixedClassNames.bar),
                'style': (() => {
                  switch (numberOfBars) {
                    case 2:
                      return styles(fixedStyles.bar, (fixedStyles as any)[`bar${j}${i === 0 ? 0 : 2}`])
                    case 3:
                    default:
                      return styles(fixedStyles.bar, (fixedStyles as any)[`bar${j}${i}`])
                  }
                })(),
              })}
            </Repeat>
          </div>
        )}
      </Repeat>
    </div>
  )
})

export const BurgerBar = ({ ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span {...props}/>
)

function getFixedStyles({ isActive = false, isSplit = false, isTailHidden = false }) {
  return asStyleDict({
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
