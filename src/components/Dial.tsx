import { forwardRef, type HTMLAttributes, type SVGAttributes } from 'react'
import { asComponentDict, asStyleDict, cloneStyledElement, styles } from '../utils/index.js'

export type DialProps = HTMLAttributes<HTMLDivElement> & {
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

/**
 * A circular dial with a knob and a track.
 *
 * @exports DialKnob
 * @exports DialTrack
 */
export const Dial = forwardRef<HTMLDivElement, DialProps>(({
  children,
  style,
  angle = 0,
  knobLength = 30,
  knobThickness = 10,
  radius = 50,
  trackGap = 0,
  trackThickness = 2,
  ...props
}, ref) => {
  const diameter = radius * 2
  const clampedKnobAngle = Math.max(0, Math.min(360, knobLength))

  const components = asComponentDict(children, {
    track: DialTrack,
    knob: DialKnob,
  })

  const fixedStyles = getFixedStyles({ angle, diameter })

  return (
    <div {...props} ref={ref} style={styles(style, fixedStyles.root)}>
      <div style={fixedStyles.trackContainer}>
        <svg height={diameter} style={fixedStyles.svgContainer} viewBox={`0 0 ${diameter} ${diameter}`} width={diameter}>
          {cloneStyledElement(components.track ?? <DialTrack/>, {
            cx: radius,
            cy: radius,
            fill: 'none',
            r: radius - trackThickness / 2,
            strokeDasharray: trackGap,
            strokeWidth: trackThickness,
          })}
        </svg>
      </div>
      <div style={styles(fixedStyles.knobContainer)}>
        <svg style={fixedStyles.svgContainer} viewBox={`0 0 ${diameter} ${diameter}`} xmlns='http://www.w3.org/2000/svg'>
          {cloneStyledElement(components.knob ?? <DialKnob/>, {
            d: arcPath(radius, radius, radius - knobThickness / 2 - (trackThickness - knobThickness) / 2, -clampedKnobAngle / 2, clampedKnobAngle / 2),
            fill: 'none',
            strokeWidth: knobThickness,
          })}
        </svg>
      </div>
    </div>
  )
})

export const DialTrack = ({ ...props }: SVGAttributes<SVGCircleElement>) => (
  <circle {...props}/>
)

export const DialKnob = ({ ...props }: SVGAttributes<SVGPathElement>) => (
  <path {...props}/>
)

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

function arcPath(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
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

function getFixedStyles({ diameter = 0, angle = 0 }) {
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

Object.defineProperty(Dial, 'displayName', { value: 'Dial', writable: false })
