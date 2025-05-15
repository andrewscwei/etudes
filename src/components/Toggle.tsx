import clsx from 'clsx'
import { forwardRef, useRef, type HTMLAttributes } from 'react'
import { Size } from 'spase'
import { useSize } from '../hooks/useSize.js'
import { Styled } from '../operators/Styled.js'
import { asClassNameDict } from '../utils/asClassNameDict.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { styles } from '../utils/styles.js'

/**
 * Type describing the props of {@link Toggle}.
 */
export type ToggleProps = Omit<HTMLAttributes<HTMLLabelElement>, 'onChange' | 'onClick'> & {
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
}

/**
 * A toggle switch component that allows users to switch between on or off.
 *
 * @exports ToggleKnob The knob of the toggle switch.
 * @exports ToggleTrack The track of the toggle switch.
 */
export const Toggle = forwardRef<HTMLLabelElement, ToggleProps>(({
  className,
  children,
  isInverted = false,
  isOn = false,
  orientation = 'horizontal',
  style,
  onChange,
  ...props
}, ref) => {
  const knobRef = useRef<HTMLSpanElement>(null)
  const knobSize = useSize(knobRef)

  const components = asComponentDict(children, {
    knob: ToggleKnob,
    track: ToggleTrack,
  })

  const fixedClassNames = _getFixedClassNames({ isOn })
  const fixedStyles = _getFixedStyles({ isOn, isInverted, orientation, knobSize })

  return (
    <label {...props} ref={ref} className={clsx(className, fixedClassNames.root)} style={styles(style, fixedStyles.root)}>
      <input checked={isOn} style={fixedStyles.input} type='checkbox' onChange={event => onChange?.(event.target.checked)}/>
      <Styled className={fixedClassNames.track} element={components.track ?? <ToggleTrack/>} style={fixedStyles.track}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Styled ref={knobRef} className={fixedClassNames.knob} element={components.knob ?? <ToggleKnob/>} style={fixedStyles.knob}/>
        </div>
      </Styled>
    </label>
  )
})

/**
 * Component for the knob of a {@link Toggle}.
 */
export const ToggleTrack = ({ children, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <div {...props}>{children}</div>
)

/**
 * Component for the track of a {@link Toggle}.
 */
export const ToggleKnob = ({ children, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <div {...props}>{children}</div>
)

function _getFixedClassNames({ isOn = false }) {
  return asClassNameDict({
    root: clsx({ on: isOn }),
    knob: clsx({ on: isOn }),
    track: clsx({ on: isOn }),
  })
}

function _getFixedStyles({ isOn = false, isInverted = false, knobSize = Size.zero, orientation = 'horizontal' }) {
  return asStyleDict({
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
    input: {
      position: 'absolute',
      top: 0,
      left: 0,
      opacity: 0,
      width: 0,
      height: 0,
    },
    knob: {
      position: 'absolute',
      ...orientation === 'horizontal' ? {
        top: `calc((100% - ${knobSize.height}px) / 2)`,
        ...isInverted ? {
          left: isOn ? '0' : `calc(100% - ${knobSize.width}px)`,
        } : {
          left: isOn ? `calc(100% - ${knobSize.width}px)` : '0',
        },
      } : {
        left: `calc((100% - ${knobSize.width}px) / 2)`,
        ...isInverted ? {
          top: isOn ? '0' : `calc(100% - ${knobSize.height}px)`,
        } : {
          top: isOn ? `calc(100% - ${knobSize.height}px)` : '0',
        },
      },
    },
    track: {
      position: 'relative',
    },
  })
}

if (process.env.NODE_ENV !== 'production') {
  Toggle.displayName = 'Toggle'
  ToggleKnob.displayName = 'ToggleKnob'
  ToggleTrack.displayName = 'ToggleTrack'
}
