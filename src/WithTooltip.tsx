import React, { HTMLAttributes, MouseEvent, PropsWithChildren, useState } from 'react'
import { Rect, Size } from 'spase'
import styled, { css, CSSProp } from 'styled-components'
import ExtractChildren from './ExtractChildren'

type Props = PropsWithChildren<HTMLAttributes<HTMLElement>> & {
  /**
   * The height of the arrow. The width (longest edge) of the arrow is always twice its height.
   */
  arrowHeight?: number

  /**
   * Color of the dialog background, same format as a CSS color string (i.e. '#000').
   */
  backgroundColor?: string

  /**
   * Specifies if the tooltip should be disabled in touch devices (i.e. `html` has class `.touch`).
   */
  disabledOnTouch?: boolean

  /**
   * The offset (in pixels) between the target element and the tooltip, defaults to zero.
   */
  offset?: number

  /**
   * The hint string to display in the tooltip.
   */
  hint: string

  /**
   * Color of the dialog text, same format as a CSS color string (i.e. '#000').
   */
  textColor?: string

  /**
   * The minimum space (in pixels) between the target element and the edge of the window required to
   * trigger an alignment change, defaults to `100px`.
   */
  threshold?: number

  /**
   * Custom CSS provided to the dialog. Not all CSS rules will take effect as they will be
   * overridden by internal rules.
   */
  cssDialog?: CSSProp<any>
}

type Position = 'tl' | 'tc' | 'tr' | 'cl' | 'cr' | 'bl' | 'bc' | 'br'

export default function WithTooltip({
  arrowHeight = 8,
  backgroundColor = '#000',
  cssDialog,
  disabledOnTouch = true,
  hint,
  offset = 5,
  textColor = '#fff',
  threshold = 100,
  ...props
}: Props) {
  const [textSize, setTextSize] = useState<Size>(new Size())
  const [position, setPosition] = useState<Position>('bc')

  function computePosition(target: Element, threshold: number): Position {
    const vrect = Rect.fromViewport()
    const rect = Rect.intersecting(target)

    if (rect) {
      const leftBound = (rect.center.x - vrect.left) < threshold
      const rightBound = (vrect.center.x - rect.right) < threshold
      const topBound = (rect.center.y - vrect.top) < threshold
      const bottomBound = (vrect.center.y - rect.bottom) < threshold

      if (leftBound && topBound) return 'br'
      if (leftBound && bottomBound) return 'tr'
      if (rightBound && topBound) return 'bl'
      if (rightBound && bottomBound) return 'tl'
      if (leftBound) return 'cr'
      if (rightBound) return 'cl'
      if (bottomBound) return 'tc'
    }

    return 'bc'
  }

  function computeTextSize(target: Element): Size {
    const computedStyle = window.getComputedStyle(target, '::after')
    const div = document.createElement('div')
    div.innerHTML = hint
    div.style.fontFamily = computedStyle.getPropertyValue('font-family')
    div.style.fontSize = computedStyle.getPropertyValue('font-size')
    div.style.fontStyle = computedStyle.getPropertyValue('font-style')
    div.style.fontVariant = computedStyle.getPropertyValue('font-variant')
    div.style.fontWeight = computedStyle.getPropertyValue('font-weight')
    div.style.height = '30px'
    div.style.left = '0'
    div.style.position = 'absolute'
    div.style.top = '0'
    div.style.visibility = 'hidden'
    div.style.whiteSpace = 'no-wrap'

    document.body.appendChild(div)
    // Add 1px as buffer to mitigate precision discrepancies.
    const width = div.clientWidth + 1
    const height = div.clientHeight + 1
    document.body.removeChild(div)

    return new Size([width, height])
  }

  function onMouseOver(event: MouseEvent) {
    setTextSize(computeTextSize(event.currentTarget))
    setPosition(computePosition(event.currentTarget, threshold))
  }

  return (
    <StyledRoot
      position={position}
      arrowHeight={arrowHeight}
      backgroundColor={backgroundColor}
      cssDialog={cssDialog}
      disabledOnTouch={disabledOnTouch}
      hint={hint}
      offset={offset}
      onMouseOver={event => onMouseOver(event)}
      textColor={textColor}
      textSize={textSize}
      {...props}
    />
  )
}

function _cssDisplacement(position: Position, arrowHeight: number, offset: number): CSSProp {
  switch (position) {
  case 'tl': return css`top: ${-arrowHeight}px; left: 100%;`
  case 'tc': return css`top: ${-arrowHeight}px; left: 50%;`
  case 'tr': return css`top: ${-arrowHeight}px; right: 100%;`
  case 'cl': return css`top: 50%; left: ${-arrowHeight}px;`
  case 'cr': return css`top: 50%; right: ${-arrowHeight}px;`
  case 'bl': return css`bottom: ${-arrowHeight}px; left: 100%;`
  case 'bc': return css`bottom: ${-arrowHeight}px; left: 50%;`
  case 'br': return css`bottom: ${-arrowHeight}px; right: 100%;`
  }
}

function _cssDialog(position: Position, arrowHeight: number, offset: number): CSSProp {
  switch (position) {
  case 'tl': return css`transform: translate3d(calc(-100% - ${offset}px), calc(-100% - ${offset}px), 0);`
  case 'tc': return css`transform: translate3d(-50%, calc(-100% - ${offset}px), 0);`
  case 'tr': return css`transform: translate3d(calc(100% + ${offset}px), calc(-100% - ${offset}px), 0);`
  case 'cl': return css`transform: translate3d(calc(-100% - ${offset}px), -50%, 0);`
  case 'cr': return css`transform: translate3d(calc(100% + ${offset}px), -50%, 0);`
  case 'bl': return css`transform: translate3d(calc(-100% - ${offset}px), calc(100% + ${offset}px), 0);`
  case 'bc': return css`transform: translate3d(-50%, calc(100% + ${offset}px), 0);`
  case 'br': return css`transform: translate3d(calc(100% + ${offset}px), calc(100% + ${offset}px), 0);`
  }
}

function _cssArrow(position: Position, arrowHeight: number, offset: number, color: string): CSSProp {
  return css`
    ${() => {
    switch (position) {
    case 'tl': return css`border-color: ${color} transparent transparent transparent;`
    case 'tc': return css`border-color: ${color} transparent transparent transparent;`
    case 'tr': return css`border-color: ${color} transparent transparent transparent;`
    case 'cl': return css`border-color: transparent transparent transparent ${color};`
    case 'cr': return css`border-color: transparent ${color} transparent transparent;`
    case 'bl': return css`border-color: transparent transparent ${color} transparent;`
    case 'bc': return css`border-color: transparent transparent ${color} transparent;`
    case 'br': return css`border-color: transparent transparent ${color} transparent;`
    }
  }}
    ${() => {
    switch (position) {
    case 'tl': return css`transform: translate3d(calc(0% - ${offset}px - ${arrowHeight*3}px), calc(0% - ${offset}px), 0);`
    case 'tc': return css`transform: translate3d(-50%, calc(0% - ${offset}px), 0);`
    case 'tr': return css`transform: translate3d(calc(100% + ${offset}px + ${arrowHeight}px), calc(0% - ${offset}px), 0);`
    case 'cl': return css`transform: translate3d(calc(0% - ${offset}px), -50%, 0);`
    case 'cr': return css`transform: translate3d(calc(0% + ${offset}px), -50%, 0);`
    case 'bl': return css`transform: translate3d(calc(0% - ${offset}px - ${arrowHeight*3}px), calc(0% + ${offset}px), 0);`
    case 'bc': return css`transform: translate3d(-50%, calc(0% + ${offset}px), 0);`
    case 'br': return css`transform: translate3d(calc(100% + ${offset}px + ${arrowHeight}px), calc(0% + ${offset}px), 0);`
    }
  }}
  `
}

const StyledRoot = styled(ExtractChildren)<{
  arrowHeight: number
  backgroundColor: string
  cssDialog?: CSSProp
  disabledOnTouch: boolean
  hint: string
  offset: number
  position: Position
  textColor: string
  textSize: Size
}>`
  cursor: pointer;
  position: relative;

  &::before {
    border-style: solid;
    border-width: ${props => props.arrowHeight}px;
    content: '';
    height: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: opacity 200ms ease-out;
    width: 0;
    z-index: 10001;

    ${props => _cssDisplacement(props.position, props.arrowHeight, props.offset)}
    ${props => _cssArrow(props.position, props.arrowHeight, props.offset, props.backgroundColor)}
    ${props => props.disabledOnTouch ? 'html.touch & { display: none; }' : ''}
  }

  &::after {
    box-sizing: content-box;
    font-size: 12px;
    max-width: 240px;
    padding: 10px 14px;
    text-align: left;

    ${props => props.cssDialog}

    background: ${props => props.backgroundColor};
    color: ${props => props.textColor};
    content: '${props => props.hint}';
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
    position: absolute;
    transform: translate3d(0, 0, 0);
    transition: opacity 200ms ease-out;
    width: ${props => props.textSize.width > 0 ? `${props.textSize.width}px` : 'auto'};
    z-index: 10000;

    ${props => _cssDisplacement(props.position, props.arrowHeight, props.offset)}
    ${props => _cssDialog(props.position, props.arrowHeight, props.offset)}
    ${props => props.disabledOnTouch ? 'html.touch & { display: none; }' : ''}
  }

  ${props => props.disabledOnTouch ? 'html:not(.touch) &:hover::before' : '&:hover::before'} {
    opacity: 1;
  }

  ${props => props.disabledOnTouch ? 'html:not(.touch) &:hover::after' : '&:hover::after'} {
    opacity: 1;
  }
`
