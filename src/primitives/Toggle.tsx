import clsx from 'clsx'
import { type HTMLAttributes, type Ref, useRef } from 'react'
import { Size } from 'spase'

import { useSize } from '../hooks/useSize.js'
import { asClassNameDict } from '../utils/asClassNameDict.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

/**
 * A toggle switch component that allows users to switch between on or off.
 *
 * @exports Toggle.Knob The knob of the toggle switch.
 * @exports Toggle.Track The track of the toggle switch.
 */
export function Toggle({
  className,
  ref,
  style,
  children,
  orientation = 'horizontal',
  isInverted = false,
  isOn = false,
  onChange,
  ...props
}: Toggle.Props) {
  const knobRef = useRef<HTMLSpanElement>(null)
  const knobSize = useSize(knobRef)

  const components = asComponentDict(children, {
    knob: Toggle.Knob,
    track: Toggle.Track,
  })

  const fixedClassNames = _getFixedClassNames({ isOn })
  const fixedStyles = _getFixedStyles({ knobSize, orientation, isInverted, isOn })

  return (
    <label {...props} className={clsx(className, fixedClassNames.root)} ref={ref} style={styles(style, fixedStyles.root)}>
      <input style={fixedStyles.input} checked={isOn} type='checkbox' onChange={event => onChange?.(event.target.checked)}/>
      <Styled className={fixedClassNames.track} style={fixedStyles.track} element={components.track ?? <Toggle.Track/>}>
        <div style={{ height: '100%', position: 'relative', width: '100%' }}>
          <Styled className={fixedClassNames.knob} ref={knobRef} style={fixedStyles.knob} element={components.knob ?? <Toggle.Knob/>}/>
        </div>
      </Styled>
    </label>
  )
}

export namespace Toggle {
  /**
   * Type describing the props of {@link Toggle}.
   */
  export type Props = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLLabelElement>

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

  /**
   * Component for the track of a {@link Toggle}.
   */
  export const Track = ({ children, ...props }: HTMLAttributes<HTMLSpanElement>) => (
    <div {...props}>{children}</div>
  )

  /**
   * Component for the knob of a {@link Toggle}.
   */
  export const Knob = ({ children, ...props }: HTMLAttributes<HTMLSpanElement>) => (
    <div {...props}>{children}</div>
  )
}

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
  Toggle.displayName = 'Toggle'
  Toggle.Knob.displayName = 'Toggle.Knob'
  Toggle.Track.displayName = 'Toggle.Track'
}
