import React, { HTMLAttributes } from 'react'
import styled, { CSSProp } from 'styled-components'

export type Props = HTMLAttributes<HTMLDivElement> & {
  /**
   * Current angle reading of the compass, between 0.0 - 360.0 degrees, inclusive.
   */
  angle?: number

  /**
   * Length of the knob along the track expressed in degrees, between 0.0 and 360.0 degrees,
   * exclusive. If set to 0 or 360, the knob disappears.
   *
   * @example Suppose the compass were to be used to control a photosphere of an image that is 1000
   *          x 500, and the window size is 500 x 500, that would mean the FOV is 500 / 1000 * 360 =
   *          180 degrees.
   */
  knobLength?: number

  /**
   * Radius of the compass.
   */
  radius?: number

  /**
   * The thickness of the knob, which is equivalent to the `stroke-width` of the `<path>` element.
   * Note that this overwrites the `stroke-width` set inside `knobCSS`.
   */
  knobThickness?: number

  /**
   * CSS of the knob, which is a `<path>` element.
   */
  knobCSS?: CSSProp<any>

  /**
   * The thickness of the circular track, which is equivalent to the `stroke-width` of the
   * `<circle>` element. Note that this overwrites the `stroke-width` set inside `trackCSS`.
   */
  trackThickness?: number

  /**
   * CSS of the track, which is a `<circle>` element.
   */
  trackCSS?: CSSProp<any>
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians)),
  }
}

function arcPath(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  const d = [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ]

  return d.join(' ')
}

/**
 * A circular dial with a knob and a track.
 *
 * @requires react
 * @requires styled-components
 */
export default function Dial({
  angle = 0,
  radius = 50,
  knobLength = 30,
  knobThickness = 10,
  knobCSS,
  trackThickness = 2,
  trackCSS,
  style,
  ...props
}: Props) {
  const diameter = radius * 2
  const clampedKnobAngle = Math.max(0, Math.min(360, knobLength))

  return (
    <StyledRoot style={{ ...style, width: `${diameter}px`, height: `${diameter}px` }} {...props}>
      <StyledTrack>
        <svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`}>
          <StyledTrackCircle
            cx={radius}
            cy={radius}
            r={radius - trackThickness / 2}
            css={trackCSS}
            strokeWidth={trackThickness}
          />
        </svg>
      </StyledTrack>
      <StyledKnob style={{ transform: `rotate(${(angle + 360) % 360}deg)` }}>
        <svg viewBox={`0 0 ${diameter} ${diameter}`} xmlns='http://www.w3.org/2000/svg'>
          <StyledKnobPath css={knobCSS} strokeWidth={knobThickness} d={arcPath(radius, radius, radius - knobThickness / 2 - (trackThickness - knobThickness) / 2, -clampedKnobAngle / 2, clampedKnobAngle / 2)}/>
        </svg>
      </StyledKnob>
    </StyledRoot>
  )
}

const StyledTrack = styled.div`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  transform-origin: center;
  width: 100%;
`

const StyledTrackCircle = styled.circle`
  stroke-dasharray: 4;
  stroke: #fff;
  ${props => props.css}
`

const StyledKnob = styled.div`
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100%;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  transform-origin: center;
  width: 100%;

  svg {
    overflow: visible;
    position: absolute;
    right: 0;
    top: 0;
  }
`

const StyledKnobPath = styled.path`
  stroke: #fff;
  ${props => props.css}
`

const StyledRoot = styled.div`
  box-sizing: border-box;
  display: block;
`
