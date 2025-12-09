import { forwardRef, type HTMLAttributes, type SVGAttributes } from 'react'
import { Styled } from '../utils/Styled.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { styles } from '../utils/styles.js'

export namespace Dial {
  /**
   * Type describing the props of {@link Dial}.
   */
  export type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Current angle reading of the compass, between 0.0 - 360.0 degrees,
     * inclusive.
     */
    angle?: number

    /**
     * Gap between each dashed line on the track.
     */
    trackGap?: number

    /**
     * Length of the knob along the track expressed in degrees, between 0.0 and
     * 360.0 degrees, exclusive. If set to 0 or 360, the knob disappears.
     *
     * @example Suppose the compass were to be used to control a photosphere of an
     *          image that is 1000 x 500, and the window size is 500 x 500, that
     *          would mean the FOV is 500 / 1000 * 360 = 180 degrees.
     */
    knobLength?: number

    /**
     * Radius of the compass.
     */
    radius?: number

    /**
     * The thickness of the knob, which is equivalent to the `stroke-width` of the
     * `<path>` element.
     */
    knobThickness?: number

    /**
     * The thickness of the circular track, which is equivalent to the
     * `stroke-width` of the `<circle>` element.
     */
    trackThickness?: number
  }
}

const _Dial = /* #__PURE__ */ forwardRef<HTMLDivElement, Readonly<Dial.Props>>((
  {
    children,
    style,
    angle = 0,
    knobLength = 30,
    knobThickness = 10,
    radius = 50,
    trackGap = 0,
    trackThickness = 2,
    ...props
  },
  ref,
) => {
  const diameter = radius * 2
  const clampedKnobAngle = Math.max(0, Math.min(360, knobLength))

  const components = asComponentDict(children, {
    track: _Track,
    knob: _Knob,
  })

  const fixedStyles = _getFixedStyles({ angle, diameter })

  return (
    <div {...props} ref={ref} style={styles(style, fixedStyles.root)}>
      <div style={fixedStyles.trackContainer}>
        <svg height={diameter} style={fixedStyles.svgContainer} viewBox={`0 0 ${diameter} ${diameter}`} width={diameter}>
          <Styled
            cx={radius}
            cy={radius}
            element={components.track ?? <_Track/>}
            fill='none'
            r={radius - trackThickness / 2}
            strokeDasharray={trackGap}
            strokeWidth={trackThickness}
          />
        </svg>
      </div>
      <div style={styles(fixedStyles.knobContainer)}>
        <svg style={fixedStyles.svgContainer} viewBox={`0 0 ${diameter} ${diameter}`} xmlns='http://www.w3.org/2000/svg'>
          <Styled
            d={_arcPath(radius, radius, radius - knobThickness / 2 - (trackThickness - knobThickness) / 2, -clampedKnobAngle / 2, clampedKnobAngle / 2)}
            element={components.knob ?? <_Knob/>}
            fill='none'
            strokeWidth={knobThickness}
          />
        </svg>
      </div>
    </div>
  )
})

export const _Track = ({ ...props }: SVGAttributes<SVGCircleElement>) => (
  <circle {...props}/>
)

export const _Knob = ({ ...props }: SVGAttributes<SVGPathElement>) => (
  <path {...props}/>
)

/**
 * A circular dial with a knob and a track.
 *
 * @exports Dial.Knob Component for the knob.
 * @exports Dial.Track Component for the track.
 */
export const Dial = /* #__PURE__ */ Object.assign(_Dial, {
  /**
   * Component for the track of a {@link Dial}.
   */
  Track: _Track,

  /**
   * Component for the knob of a {@link Dial}.
   */
  Knob: _Knob,
})

function _polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

function _arcPath(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = _polarToCartesian(x, y, radius, endAngle)
  const end = _polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  const d = [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ]

  return d.join(' ')
}

function _getFixedStyles({ diameter = 0, angle = 0 }) {
  return asStyleDict({
    root: {
      height: `${diameter}px`,
      width: `${diameter}px`,
    },
    knobContainer: {
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100%',
      height: '100%',
      left: '0',
      position: 'absolute',
      top: '0',
      transformOrigin: 'center',
      width: '100%',
      transform: `rotate(${(angle + 360) % 360}deg)`,
    },
    trackContainer: {
      height: '100%',
      left: '0',
      position: 'absolute',
      top: '0',
      transformOrigin: 'center',
      width: '100%',
    },
    svgContainer: {
      overflow: 'visible',
      position: 'absolute',
      right: '0',
      top: '0',
    },
  })
}

if (process.env.NODE_ENV === 'development') {
  Dial.displayName = 'Dial'

  _Track.displayName = 'DialTrack'
  _Knob.displayName = 'DialKnob'
}
