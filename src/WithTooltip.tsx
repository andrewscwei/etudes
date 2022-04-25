import React, { HTMLAttributes, MouseEvent, RefObject, useEffect, useRef, useState } from 'react'
import { Rect, Size } from 'spase'
import styled, { css, CSSProp } from 'styled-components'
import ExtractChild from './ExtractChild'

export type Props = HTMLAttributes<HTMLElement> & {
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
   * The hint string to display in the tooltip.
   */
  hint: string

  /**
   * The gap (in pixels) between the target element and the tooltip, defaults to zero.
   */
  gap?: number

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

type Alignment = 'tl' | 'tc' | 'tr' | 'cl' | 'cr' | 'bl' | 'bc' | 'br'

export default function WithTooltip({
  arrowHeight = 8,
  backgroundColor = '#000',
  cssDialog,
  disabledOnTouch = true,
  hint,
  gap = 5,
  textColor = '#fff',
  threshold = 100,
  ...props
}: Props) {
  const computeAlignment = (target: Element, threshold: number): Alignment => {
    const vrect = Rect.fromViewport()
    const rect = Rect.intersecting(target)

    if (rect) {
      const leftBound = (rect.left - vrect.left) < threshold
      const rightBound = (vrect.right - rect.right) < threshold
      const topBound = (rect.top - vrect.top) < threshold
      const bottomBound = (vrect.bottom - rect.bottom) < threshold

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

  const computeTextSize = (target: Element, threshold: number): Size => {
    const computedStyle = window.getComputedStyle(target, '::after')
    const div = document.createElement('div')
    div.innerHTML = hint
    div.style.fontFamily = computedStyle.getPropertyValue('font-family')
    div.style.fontSize = computedStyle.getPropertyValue('font-size')
    div.style.fontStyle = computedStyle.getPropertyValue('font-style')
    div.style.fontVariant = computedStyle.getPropertyValue('font-variant')
    div.style.fontWeight = computedStyle.getPropertyValue('font-weight')
    div.style.left = '0'
    div.style.position = 'absolute'
    div.style.top = '0'
    div.style.visibility = 'hidden'
    div.style.whiteSpace = 'pre'

    document.body.appendChild(div)

    // Add 1px as buffer to mitigate precision discrepancies.
    const width = div.clientWidth + 1
    const height = div.clientHeight + 1

    document.body.removeChild(div)

    return new Size([width, height])
  }

  const onMouseOver = (event: MouseEvent) => {
    setAlignment(computeAlignment(event.currentTarget, threshold))
    setTextSize(computeTextSize(event.currentTarget, threshold))
  }

  const [textSize, setTextSize] = useState<Size | undefined>(new Size())
  const [alignment, setAlignment] = useState<Alignment | undefined>(undefined)

  const childRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const childNode = childRef.current
    if (!childNode) return
    setAlignment(computeAlignment(childNode, threshold))
    setTextSize(computeTextSize(childNode, threshold))
  }, [])

  return (
    <StyledRoot
      arrowHeight={arrowHeight}
      backgroundColor={backgroundColor}
      ref={childRef}
      cssDialog={cssDialog}
      disabledOnTouch={disabledOnTouch}
      hint={hint}
      gap={gap}
      onMouseOver={event => onMouseOver(event)}
      alignment={alignment}
      textColor={textColor}
      textSize={textSize}
      {...props}
    />
  )
}

function makeDisplacementCSS(alignment: Alignment, arrowHeight: number, gap: number): CSSProp {
  switch (alignment) {
  case 'tl': return css`top: ${-arrowHeight}px; left: calc(50% + ${arrowHeight*2.5}px);`
  case 'tc': return css`top: ${-arrowHeight}px; left: 50%;`
  case 'tr': return css`top: ${-arrowHeight}px; right: calc(50% + ${arrowHeight*2.5}px);`
  case 'cl': return css`top: 50%; left: ${-arrowHeight}px;`
  case 'cr': return css`top: 50%; right: ${-arrowHeight}px;`
  case 'bl': return css`bottom: ${-arrowHeight}px; left: calc(50% + ${arrowHeight*2.5}px);`
  case 'bc': return css`bottom: ${-arrowHeight}px; left: 50%;`
  case 'br': return css`bottom: ${-arrowHeight}px; right: calc(50% + ${arrowHeight*2.5}px);`
  }
}

function makeDialogPositionCSS(alignment: Alignment, arrowHeight: number, gap: number): CSSProp {
  switch (alignment) {
  case 'tl': return css`transform: translate3d(calc(-100% - ${gap}px), calc(-100% - ${gap}px), 0);`
  case 'tc': return css`transform: translate3d(-50%, calc(-100% - ${gap}px), 0);`
  case 'tr': return css`transform: translate3d(calc(100% + ${gap}px), calc(-100% - ${gap}px), 0);`
  case 'cl': return css`transform: translate3d(calc(-100% - ${gap}px), -50%, 0);`
  case 'cr': return css`transform: translate3d(calc(100% + ${gap}px), -50%, 0);`
  case 'bl': return css`transform: translate3d(calc(-100% - ${gap}px), calc(100% + ${gap}px), 0);`
  case 'bc': return css`transform: translate3d(-50%, calc(100% + ${gap}px), 0);`
  case 'br': return css`transform: translate3d(calc(100% + ${gap}px), calc(100% + ${gap}px), 0);`
  }
}

function makeArrowPositionCSS(alignment: Alignment, arrowHeight: number, gap: number, color: string): CSSProp {
  return css`
    ${() => {
    switch (alignment) {
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
    switch (alignment) {
    case 'tl': return css`transform: translate3d(calc(0% - ${gap}px - ${arrowHeight*3}px), calc(0% - ${gap}px), 0);`
    case 'tc': return css`transform: translate3d(-50%, calc(0% - ${gap}px), 0);`
    case 'tr': return css`transform: translate3d(calc(100% + ${gap}px + ${arrowHeight}px), calc(0% - ${gap}px), 0);`
    case 'cl': return css`transform: translate3d(calc(0% - ${gap}px), -50%, 0);`
    case 'cr': return css`transform: translate3d(calc(0% + ${gap}px), -50%, 0);`
    case 'bl': return css`transform: translate3d(calc(0% - ${gap}px - ${arrowHeight*3}px), calc(0% + ${gap}px), 0);`
    case 'bc': return css`transform: translate3d(-50%, calc(0% + ${gap}px), 0);`
    case 'br': return css`transform: translate3d(calc(100% + ${gap}px + ${arrowHeight}px), calc(0% + ${gap}px), 0);`
    }
  }}
  `
}

const StyledRoot = styled(ExtractChild)<{
  arrowHeight: number
  backgroundColor: string
  ref: RefObject<HTMLElement>
  cssDialog?: CSSProp
  disabledOnTouch: boolean
  hint: string
  gap: number
  alignment?: Alignment
  textColor: string
  textSize?: Size
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

    ${props => props.alignment && props.textSize && css`
      ${makeDisplacementCSS(props.alignment, props.arrowHeight, props.gap)}
      ${makeArrowPositionCSS(props.alignment, props.arrowHeight, props.gap, props.backgroundColor)}
      ${props.disabledOnTouch ? 'html.touch & { display: none; }' : ''}
    `}
  }

  &::after {
    box-sizing: content-box;
    font-size: 12px;
    max-width: 200px;
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
    z-index: 10000;

    ${props => props.alignment && props.textSize && css`
      width: ${props.textSize.width > 0 ? `${props.textSize.width}px` : 'auto'};
      ${makeDisplacementCSS(props.alignment, props.arrowHeight, props.gap)}
      ${makeDialogPositionCSS(props.alignment, props.arrowHeight, props.gap)}
      ${props.disabledOnTouch ? 'html.touch & { display: none; }' : ''}
    `}
  }

  ${props => props.disabledOnTouch ? 'html:not(.touch) &:hover' : '&:hover'} {
    &::before { opacity: 1; }
    &::after { opacity: 1; }
  }
`
