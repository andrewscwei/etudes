import React, { HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

export type Props = HTMLAttributes<HTMLDivElement> & {
  isAnimated?: boolean
  fillColor?: string
  strokeColor?: string
  svgMarkup: string
}

/**
 * A component whose root element wraps an SVG markup.
 *
 * @requires react
 * @requires styled-component
 */
export default function FlatSVG({
  isAnimated = false,
  fillColor,
  strokeColor,
  svgMarkup,
  ...props
}: Props) {
  return (
    <StyledRoot
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
      isAnimated={isAnimated}
      fillColor={fillColor}
      strokeColor={strokeColor}
      {...props}
    />
  )
}

const StyledRoot = styled.figure<{
  fillColor?: string
  strokeColor?: string
  isAnimated: boolean
}>`
  box-sizing: border-box;
  display: inline-block;
  flex: 0 0 auto;
  height: 100%;
  position: relative;
  width: auto;

  > svg {
    height: 100%;
    transition-delay: inherit;
    transition-duration: inherit;
    transition-property: inherit;
    transition-timing-function: inherit;
    width: auto;

    ${props => props.isAnimated && css`
      transition-property: stroke, fill, transform;
      transition-duration: 100ms;
      transition-timing-function: ease-out;
    `}

    * {
      transition-delay: inherit;
      transition-duration: inherit;
      transition-property: inherit;
      transition-timing-function: inherit;

      ${props => props.fillColor !== undefined && css`
        fill: ${props.fillColor} !important;
      `}

      ${props => props.strokeColor !== undefined && css`
        stroke: ${props.strokeColor} !important;
      `}
    }
  }
`
