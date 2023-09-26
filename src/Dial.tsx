import React, { forwardRef, type HTMLAttributes, type PropsWithChildren, type SVGAttributes } from 'react'
import { asComponentDict, asStyleDict, cloneStyledElement, styles } from './utils'

export type DialProps = HTMLAttributes<HTMLDivElement> & PropsWithChildren<{
  /**
   * Current angle reading of the compass, between 0.0 - 360.0 degrees,
   * inclusive.
   */
  angle?: number

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
   * `<path>` element. Note that this overwrites the `stroke-width` set inside
   * `cssKnob`.
   */
  knobThickness?: number

  /**
   * The thickness of the circular track, which is equivalent to the
   * `stroke-width` of the `<circle>` element. Note that this overwrites the
   * `stroke-width` set inside `cssTrack`.
   */
  trackThickness?: number
}>

/**
 * A circular dial with a knob and a track.
 *
 * @exports DialKnob
 * @exports DialTrack
 */
export const Dial = forwardRef<HTMLDivElement, DialProps>(({
  angle = 0,
  children,
  knobLength = 30,
  knobThickness = 10,
  radius = 50,
  trackThickness = 2,
  style,
  ...props
}, ref) => {
  const diameter = radius * 2
  const clampedKnobAngle = Math.max(0, Math.min(360, knobLength))

  const components = asComponentDict(children, {
    track: DialTrack,
    knob: DialKnob,
  })

  const fixedStyles = asStyleDict({
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

  const defaultStyles = asStyleDict({
    knob: {
      stroke: '#fff',
    },
    track: {
      strokeDasharray: '4',
      stroke: '#fff',
    },
  })

  return (
    <div {...props} ref={ref} style={styles(style, fixedStyles.root)}>
      <div style={fixedStyles.trackContainer}>
        <svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`} style={fixedStyles.svgContainer}>
          {cloneStyledElement(components.track ?? <DialTrack style={defaultStyles.track}/>, {
            cx: radius,
            cy: radius,
            r: radius - trackThickness / 2,
            strokeWidth: trackThickness,
          })}
        </svg>
      </div>
      <div style={styles(fixedStyles.knobContainer)}>
        <svg viewBox={`0 0 ${diameter} ${diameter}`} xmlns='http://www.w3.org/2000/svg' style={fixedStyles.svgContainer}>
          {cloneStyledElement(components.knob ?? <DialKnob style={defaultStyles.knob}/>, {
            strokeWidth: knobThickness,
            d: arcPath(radius, radius, radius - knobThickness / 2 - (trackThickness - knobThickness) / 2, -clampedKnobAngle / 2, clampedKnobAngle / 2),
          })}
        </svg>
      </div>
    </div>
  )
})

Object.defineProperty(Dial, 'displayName', { value: 'Dial', writable: false })

export const DialTrack = ({ ...props }: SVGAttributes<SVGCircleElement>) => <circle {...props}/>

export const DialKnob = ({ ...props }: SVGAttributes<SVGPathElement>) => <path {...props}/>

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
