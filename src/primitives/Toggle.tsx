import clsx from 'clsx'
import { forwardRef, type HTMLAttributes, useRef } from 'react'
import { Size } from 'spase'

import { useSize } from '../hooks/useSize.js'
import { asClassNameDict } from '../utils/asClassNameDict.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

export namespace Toggle {
  /**
   * Type describing the props of {@link Toggle}.
   */
  export type Props = {
    /**
     * Specifies if the toggle is inverted.
     */
    isInverted?: boolean

    /**
     * Specifies if the toggle is on or off.
     */
    isOn?: boolean

    /**
     * The orientation of the toggle.
     */
    orientation?: 'horizontal' | 'vertical'

    /**
     * Handler invoked when the state of the toggle changes.
     *
     * @param isOn - The new state of the toggle.
     */
    onChange?: (isOn: boolean) => void
  } & Omit<HTMLAttributes<HTMLLabelElement>, 'onChange' | 'onClick'>
}

const _Toggle = /* #__PURE__ */ forwardRef<HTMLLabelElement, Toggle.Props>(({
  className,
  style,
  children,
  orientation = 'horizontal',
  isInverted = false,
  isOn = false,
  onChange,
  ...props
}, ref) => {
  const knobRef = useRef<HTMLSpanElement>(null)
  const knobSize = useSize(knobRef)

  const components = asComponentDict(children, {
    knob: _Knob,
    track: _Track,
  })

  const fixedClassNames = _getFixedClassNames({ isOn })
  const fixedStyles = _getFixedStyles({ knobSize, orientation, isInverted, isOn })

  return (
    <label {...props} className={clsx(className, fixedClassNames.root)} ref={ref} style={styles(style, fixedStyles.root)}>
      <input style={fixedStyles.input} checked={isOn} type='checkbox' onChange={event => onChange?.(event.target.checked)}/>
      <Styled className={fixedClassNames.track} style={fixedStyles.track} element={components.track ?? <_Track/>}>
        <div style={{ height: '100%', position: 'relative', width: '100%' }}>
          <Styled className={fixedClassNames.knob} ref={knobRef} style={fixedStyles.knob} element={components.knob ?? <_Knob/>}/>
        </div>
      </Styled>
    </label>
  )
})

const _Track = ({ children, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <div {...props}>{children}</div>
)

const _Knob = ({ children, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <div {...props}>{children}</div>
)

/**
 * A toggle switch component that allows users to switch between on or off.
 *
 * @exports Toggle.Knob The knob of the toggle switch.
 * @exports Toggle.Track The track of the toggle switch.
 */
export const Toggle = /* #__PURE__ */ Object.assign(_Toggle, {
  /**
   * Component for the knob of a {@link Toggle}.
   */
  Knob: _Knob,

  /**
   * Component for the track of a {@link Toggle}.
   */
  Track: _Track,
})

function _getFixedClassNames({ isOn = false }) {
  return asClassNameDict({
    knob: clsx({ active: isOn }),
    root: clsx({ active: isOn }),
    track: clsx({ active: isOn }),
  })
}

function _getFixedStyles({ knobSize = Size.zero, orientation = 'horizontal', isInverted = false, isOn = false }) {
  return asStyleDict({
    input: {
      height: 0,
      left: 0,
      opacity: 0,
      position: 'absolute',
      top: 0,
      width: 0,
    },
    knob: {
      position: 'absolute',
      ...orientation === 'horizontal' ? {
        ...knobSize.height > 0 ? {
          top: `calc((100% - ${knobSize.height}px) / 2)`,
        } : {
          visibility: 'hidden',
        },
        ...knobSize.width > 0 ? {
          ...isInverted ? {
            left: isOn ? '0' : `calc(100% - ${knobSize.width}px)`,
          } : {
            left: isOn ? `calc(100% - ${knobSize.width}px)` : '0',
          },
        } : {
          visibility: 'hidden',
        },
      } : {
        ...knobSize.width > 0 ? {
          left: `calc((100% - ${knobSize.width}px) / 2)`,
        } : {
          visibility: 'hidden',
        },
        ...knobSize.height > 0 ? {
          ...isInverted ? {
            top: isOn ? '0' : `calc(100% - ${knobSize.height}px)`,
          } : {
            top: isOn ? `calc(100% - ${knobSize.height}px)` : '0',
          },
        } : {
          visibility: 'hidden',
        },
      },
    },
    root: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'start',
      position: 'relative',
      ...orientation === 'horizontal' ? {
        flexDirection: 'row',
      } : {
        flexDirection: 'column',
      },
    },
    track: {
      position: 'relative',
    },
  })
}

if (process.env.NODE_ENV === 'development') {
  _Toggle.displayName = 'Toggle'

  _Knob.displayName = 'Toggle.Knob'
  _Track.displayName = 'Toggle.Track'
}
