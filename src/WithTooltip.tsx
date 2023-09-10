import classNames from 'classnames'
import React, { useEffect, useRef, type CSSProperties, type HTMLAttributes, type MouseEvent, type PropsWithChildren } from 'react'
import { Rect, Size } from 'spase'
import ExtractChild from './ExtractChild'
import useElementRect from './hooks/useElementRect'
import useViewportSize from './hooks/useViewportSize'
import asStyleDict from './utils/asStyleDict'
import styles from './utils/styles'

type Alignment = 'tl' | 'tc' | 'tr' | 'cl' | 'cr' | 'bl' | 'bc' | 'br'

export type WithToolTipProps = Pick<HTMLAttributes<HTMLElement>, 'className' | 'style'> & PropsWithChildren<{
  /**
   * The height of the arrow. The width (longest edge) of the arrow is always
   * twice its height.
   */
  arrowHeight?: number

  /**
   * Color of the dialog background, same format as a CSS color string (i.e.
   * '#000').
   */
  backgroundColor?: string

  /**
   * Specifies if the tooltip should be disabled in touch devices (i.e. `html`
   * has class `.touch`).
   */
  disabledOnTouch?: boolean

  /**
   * The hint string to display in the tooltip.
   */
  hint: string

  /**
   * The gap (in pixels) between the target element and the tooltip, defaults to
   * zero.
   */
  gap?: number

  /**
   * The maximum width (in pixels) of the hint text.
   */
  maxTextWidth?: number

  /**
   * The minimum space (in pixels) between the target element and the edge of
   * the window required to trigger an alignment change, defaults to `100px`.
   */
  threshold?: number
}>

export default function WithTooltip({
  children,
  className,
  style,
  arrowHeight = 8,
  backgroundColor = '#000',
  gap = 5,
  hint,
  maxTextWidth = 200,
  threshold = 100,
}: WithToolTipProps) {
  const createDialog = () => {
    const dialog = document.createElement('div')
    const dialogStyle = styles(style, fixedStyles.dialog)
    dialog.className = classNames(className)
    Object.keys(dialogStyle).forEach(rule => (dialog.style as any)[rule] = (dialogStyle as any)[rule])

    const arrow = document.createElement('div')
    Object.keys(fixedStyles.arrow).forEach(rule => (arrow.style as any)[rule] = (fixedStyles.arrow as any)[rule])

    const content = document.createElement('div')
    content.innerText = hint
    Object.keys(fixedStyles.content).forEach(rule => (content.style as any)[rule] = (fixedStyles.content as any)[rule])

    dialog.appendChild(arrow)
    dialog.appendChild(content)

    return dialog
  }

  const computeAlignment = () => {
    if (!rootRef.current) return 'bc'

    const vrect = Rect.fromViewport()
    const irect = Rect.intersecting(rootRef.current)

    if (irect) {
      const leftBound = irect.left - vrect.left < threshold
      const rightBound = vrect.right - irect.right < threshold
      const topBound = irect.top - vrect.top < threshold
      const bottomBound = vrect.bottom - irect.bottom < threshold

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

  const computeTextSize = () => {
    if (!dialogRef.current) return new Size()

    const computedStyle = window.getComputedStyle(dialogRef.current)
    const div = document.createElement('div')
    div.innerText = hint
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

  const mouseEnterHandler = (event: MouseEvent) => {
    if (!dialogRef.current) return
    dialogRef.current.style.opacity = '1'
  }

  const mouseLeaveHandler = (event: MouseEvent) => {
    if (!dialogRef.current) return
    dialogRef.current.style.opacity = '0'
  }

  const rootRef = useRef<HTMLElement>(null)
  const dialogRef = useRef<HTMLDivElement>()
  const rect = useElementRect(rootRef)
  const viewportSize = useViewportSize()
  const alignment = computeAlignment()
  const textSize = computeTextSize()

  useEffect(() => {
    const dialogNode = createDialog()
    rootRef.current?.appendChild(dialogNode)

    dialogRef.current = dialogNode

    return () => {
      rootRef.current?.removeChild(dialogNode)
    }
  }, [rect, viewportSize])

  const fixedStyles = asStyleDict({
    dialog: {
      background: 'none',
      boxSizing: 'border-box',
      height: `${rect.size.height}px`,
      left: '0',
      margin: '0',
      opacity: '0',
      position: 'absolute',
      top: '0',
      width: `${rect.size.width}px`,
      zIndex: '10000',
    },
    arrow: {
      borderStyle: 'solid',
      borderWidth: `${arrowHeight}px`,
      height: '0',
      pointerEvents: 'none',
      position: 'absolute',
      width: '0',
      ...makeDisplacementStyle(alignment, arrowHeight, gap),
      ...makeArrowPositionStyle(alignment, arrowHeight, gap, backgroundColor),
    },
    content: {
      background: backgroundColor,
      boxSizing: 'content-box',
      color: 'inherit',
      fontFamily: 'inherit',
      fontSize: 'inherit',
      fontWeight: 'inherit',
      letterSpacing: 'inherit',
      lineHeight: 'inherit',
      maxWidth: `${maxTextWidth}px`,
      overflow: 'hidden',
      padding: 'inherit',
      pointerEvents: 'none',
      position: 'absolute',
      textAlign: 'inherit',
      transition: 'inherit',
      width: textSize.width > 0 ? `${textSize.width}px` : 'auto',
      ...makeDisplacementStyle(alignment, arrowHeight, gap),
      ...makeContentPositionStyle(alignment, arrowHeight, gap),
    },
  })

  return (
    <ExtractChild
      children={children}
      ref={rootRef}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
    />
  )
}

function makeDisplacementStyle(alignment: Alignment, arrowHeight: number, gap: number): CSSProperties {
  switch (alignment) {
    case 'tl': return {
      top: `${-arrowHeight}px`,
      left: `calc(50% + ${arrowHeight * 2.5}px)`,
    }
    case 'tc': return {
      top: `${-arrowHeight}px`,
      left: '50%',
    }
    case 'tr': return {
      top: `${-arrowHeight}px`,
      right: `calc(50% + ${arrowHeight * 2.5}px)`,
    }
    case 'cl': return {
      top: '50%',
      left: `${-arrowHeight}px`,
    }
    case 'cr': return {
      top: '50%',
      right: `${-arrowHeight}px`,
    }
    case 'bl': return {
      bottom: `${-arrowHeight}px`,
      left: `calc(50% + ${arrowHeight * 2.5}px)`,
    }
    case 'bc': return {
      bottom: `${-arrowHeight}px`,
      left: '50%',
    }
    case 'br': return {
      bottom: `${-arrowHeight}px`,
      right: `calc(50% + ${arrowHeight * 2.5}px)`,
    }
    default: return {

    }
  }
}

function makeContentPositionStyle(alignment: Alignment, arrowHeight: number, gap: number): CSSProperties {
  switch (alignment) {
    case 'tl': return {
      transform: `translate3d(calc(-100% - ${gap}px), calc(-100% - ${gap}px), 0)`,
    }
    case 'tc': return {
      transform: `translate3d(-50%, calc(-100% - ${gap}px), 0)`,
    }
    case 'tr': return {
      transform: `translate3d(calc(100% + ${gap}px), calc(-100% - ${gap}px), 0)`,
    }
    case 'cl': return {
      transform: `translate3d(calc(-100% - ${gap}px), -50%, 0)`,
    }
    case 'cr': return {
      transform: `translate3d(calc(100% + ${gap}px), -50%, 0)`,
    }
    case 'bl': return {
      transform: `translate3d(calc(-100% - ${gap}px), calc(100% + ${gap}px), 0)`,
    }
    case 'bc': return {
      transform: `translate3d(-50%, calc(100% + ${gap}px), 0)`,
    }
    case 'br': return {
      transform: `translate3d(calc(100% + ${gap}px), calc(100% + ${gap}px), 0)`,
    }
    default: return {

    }
  }
}

function makeArrowPositionStyle(alignment: Alignment, arrowHeight: number, gap: number, color: string): CSSProperties {
  switch (alignment) {
    case 'tl': return {
      borderColor: `${color} transparent transparent transparent`,
      transform: `translate3d(calc(0% - ${gap}px - ${arrowHeight * 3}px), calc(0% - ${gap}px), 0)`,
    }
    case 'tc': return {
      borderColor: `${color} transparent transparent transparent`,
      transform: `translate3d(-50%, calc(0% - ${gap}px), 0)`,
    }
    case 'tr': return {
      borderColor: `${color} transparent transparent transparent`,
      transform: `translate3d(calc(100% + ${gap}px + ${arrowHeight}px), calc(0% - ${gap}px), 0)`,
    }
    case 'cl': return {
      borderColor: `transparent transparent transparent ${color}`,
      transform: `translate3d(calc(0% - ${gap}px), -50%, 0)`,
    }
    case 'cr': return {
      borderColor: `transparent ${color} transparent transparent`,
      transform: `translate3d(calc(0% + ${gap}px), -50%, 0)`,
    }
    case 'bl': return {
      borderColor: `transparent transparent ${color} transparent`,
      transform: `translate3d(calc(0% - ${gap}px - ${arrowHeight * 3}px), calc(0% + ${gap}px), 0)`,
    }
    case 'bc': return {
      borderColor: `transparent transparent ${color} transparent`,
      transform: `translate3d(-50%, calc(0% + ${gap}px), 0)`,
    }
    case 'br': return {
      borderColor: `transparent transparent ${color} transparent`,
      transform: `translate3d(calc(100% + ${gap}px + ${arrowHeight}px), calc(0% + ${gap}px), 0)`,
    }
    default: return {

    }
  }
}
