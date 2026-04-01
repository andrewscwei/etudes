import { type CSSProperties, type HTMLAttributes, useCallback, useEffect, useRef } from 'react'
import { Rect, Size } from 'spase'

import { ExtractChild } from '../utils/ExtractChild.js'
import { measureIntrinsicSize } from '../utils/measureIntrinsicSize.js'
import { setStyles } from '../utils/setStyles.js'
import { styles } from '../utils/styles.js'

/**
 * Type describing the alignment of the tooltip relative to the wrapped element.
 */
type Alignment = 'bc' | 'bl' | 'br' | 'cl' | 'cr' | 'tc' | 'tl' | 'tr'

export namespace WithTooltip {
  /**
   * Type describing the props of {@link WithTooltip}.
   */
  export type Props = {
    /**
     * Target alignment with respect to the wrapped element, automatically
     * computed if not provided.
     */
    alignment?: Alignment

    /**
     * The height of the arrow.
     */
    arrowHeight?: number

    /**
     * The width of the arrow.
     */
    arrowWidth?: number

    /**
     * The hint string to display in the tooltip, rendered as raw HTML via
     * `innerHTML`. IMPORTANT: Sanitizing this value if needed.
     */
    hint: string

    /**
     * The gap (in pixels) between the target element and the tooltip, defaults
     * to `0`.
     */
    gap?: number

    /**
     * The maximum width (in pixels) of the tooltip.
     */
    maxWidth?: number

    /**
     * The minimum space (in pixels) between the target element and the edge of
     * the window required to trigger an alignment change, defaults to `100px`.
     */
    threshold?: number
  } & Pick<HTMLAttributes<HTMLElement>, 'children' | 'className' | 'style'>
}

/**
 * A component that wraps a target element and displays a tooltip with a hint
 * string when the target element is hovered.
 */
export function WithTooltip({
  className = '',
  style,
  alignment: externalAlignment,
  arrowHeight = 6,
  arrowWidth = 12,
  children,
  gap = 4,
  hint,
  maxWidth = 200,
  threshold = 100,
}: Readonly<WithTooltip.Props>) {
  const dialogRef = useRef<HTMLElement>(null)
  const arrowRef = useRef<HTMLElement>(null)
  const targetRef = useRef<HTMLElement>(null)
  const intersectionObserverRef = useRef<IntersectionObserver>(undefined)

  const applyStyle = useCallback(() => {
    const dialog = dialogRef.current
    const arrow = arrowRef.current
    const target = targetRef.current
    if (!dialog || !arrow || !target) return

    const targetRect = Rect.from(target)
    const arrowSize = Size.make(arrowWidth, arrowHeight)
    const dialogSize = measureIntrinsicSize(dialog, maxWidth)
    const alignment = externalAlignment ?? _computeAlignment(targetRect, threshold)
    const dialogStyle = _makeDynamicDialogStyle(alignment, dialogSize, arrowSize, gap, targetRect)
    const arrowStyle = _makeDynamicArrowStyle(alignment, dialogSize, arrowSize, targetRect)

    setStyles(styles(style, dialogStyle), { target: dialog })
    setStyles(arrowStyle, { target: arrow })
  }, [externalAlignment, maxWidth, style, threshold, arrowHeight, arrowWidth, gap])

  const mouseEnterHandler = useCallback(() => {
    const dialog = dialogRef.current
    const target = targetRef.current
    if (!dialog || !target) return

    const intersectionObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === target) {
          applyStyle()
          break
        }
      }
    })

    intersectionObserver.observe(target)
    intersectionObserverRef.current = intersectionObserver

    window.addEventListener('resize', applyStyle)

    dialog.style.opacity = '1'
    dialog.ariaHidden = 'false'

    applyStyle()
  }, [applyStyle])

  const mouseLeaveHandler = useCallback(() => {
    const el = dialogRef.current
    if (!el) return

    el.style.opacity = '0'
    el.ariaHidden = 'true'

    intersectionObserverRef.current?.disconnect()
    intersectionObserverRef.current = undefined

    window.removeEventListener('resize', applyStyle)
  }, [applyStyle])

  useEffect(() => {
    const { arrow, dialog } = _createDialog(className, hint)
    arrowRef.current = arrow
    dialogRef.current = dialog

    window.document.body.appendChild(dialog)

    mouseLeaveHandler()

    return () => {
      window.document.body.removeChild(dialog)
      arrowRef.current = null
      dialogRef.current = null

      intersectionObserverRef.current?.disconnect()
      intersectionObserverRef.current = undefined

      window.removeEventListener('resize', applyStyle)
    }
  }, [className, hint])

  return (
    <ExtractChild
      ref={targetRef}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
    >
      {children}
    </ExtractChild>
  )
}

function _createDialog(className: string, content: string): { arrow: HTMLElement; dialog: HTMLElement } {
  const dialog = window.document.createElement('span')
  dialog.className = className
  dialog.innerHTML = content
  dialog.role = 'tooltip'

  setStyles({
    boxSizing: 'border-box',
    height: 'auto',
    margin: '0',
    pointerEvents: 'none',
    position: 'fixed',
    userSelect: 'none',
    zIndex: 100,
  }, { target: dialog })

  const arrow = window.document.createElement('span')

  setStyles({
    background: 'inherit',
    position: 'absolute',
  }, { target: arrow })

  dialog.appendChild(arrow)

  return { arrow, dialog }
}

function _computeAlignment(targetRect: Rect, threshold: number) {
  const vrect = Rect.fromViewport()

  const leftBound = (targetRect.left - vrect.left) < threshold
  const rightBound = (vrect.right - targetRect.right) < threshold
  const topBound = (targetRect.top - vrect.top) < threshold
  const bottomBound = (vrect.bottom - targetRect.bottom) < threshold

  if (leftBound && topBound) return 'br'
  if (leftBound && bottomBound) return 'tr'
  if (rightBound && topBound) return 'bl'
  if (rightBound && bottomBound) return 'tl'
  if (leftBound) return 'cr'
  if (rightBound) return 'cl'
  if (bottomBound) return 'tc'

  return 'tc'
}

function _makeDynamicDialogStyle(alignment: Alignment, dialogSize: Size, arrowSize: Size, gap: number, targetRect: Rect): CSSProperties {
  const width = dialogSize.width
  const shouldRealign = targetRect.width > width
  const centerX = targetRect.left + targetRect.width / 2
  const centerY = targetRect.top + targetRect.height / 2

  const baseStyle = {
    width: `${width}px`,
  }

  switch (alignment) {
    case 'bc': return {
      ...baseStyle,
      left: `${centerX}px`,
      top: `${targetRect.bottom + arrowSize.height + gap}px`,
      transform: 'translateX(-50%)',
    }
    case 'bl': return {
      ...baseStyle,
      left: shouldRealign ? `${centerX}px` : `${targetRect.right}px`,
      top: `${targetRect.bottom + arrowSize.height + gap}px`,
      transform: shouldRealign ? 'translateX(-50%)' : 'translateX(-100%)',
    }
    case 'br': return {
      ...baseStyle,
      left: shouldRealign ? `${centerX}px` : `${targetRect.left}px`,
      top: `${targetRect.bottom + arrowSize.height + gap}px`,
      transform: shouldRealign ? 'translateX(-50%)' : '',
    }
    case 'cl': return {
      ...baseStyle,
      left: `${targetRect.left - arrowSize.height - gap}px`,
      top: `${centerY}px`,
      transform: 'translate(-100%, -50%)',
    }
    case 'cr': return {
      ...baseStyle,
      left: `${targetRect.right + arrowSize.height + gap}px`,
      top: `${centerY}px`,
      transform: 'translateY(-50%)',
    }
    case 'tc': return {
      ...baseStyle,
      left: `${centerX}px`,
      top: `${targetRect.top - arrowSize.height - gap}px`,
      transform: 'translate(-50%, -100%)',
    }
    case 'tl': return {
      ...baseStyle,
      left: shouldRealign ? `${centerX}px` : `${targetRect.right}px`,
      top: `${targetRect.top - arrowSize.height - gap}px`,
      transform: shouldRealign ? 'translate(-50%, -100%)' : 'translate(-100%, -100%)',
    }
    case 'tr': return {
      ...baseStyle,
      left: shouldRealign ? `${centerX}px` : `${targetRect.left}px`,
      top: `${targetRect.top - arrowSize.height - gap}px`,
      transform: shouldRealign ? 'translate(-50%, -100%)' : 'translateY(-100%)',
    }
    default:
      console.error(`[etudes::WithTooltip] Invalid alignment: ${alignment}`)

      return {}
  }
}

function _makeDynamicArrowStyle(alignment: Alignment, dialogSize: Size, arrowSize: Size, targetRect: Rect): CSSProperties {
  const targetWidth = targetRect.width
  const shouldRealign = targetWidth > dialogSize.width

  const baseStyle = {
    bottom: 'auto',
    height: `${arrowSize.height}px`,
    left: 'auto',
    right: 'auto',
    top: 'auto',
    width: `${arrowSize.width}px`,
  }

  switch (alignment) {
    case 'bc': return {
      ...baseStyle,
      clipPath: 'polygon(50% 0,100% 100%,0 100%)',
      left: '50%',
      top: '0',
      transform: 'translate(-50%, -100%)',
    }
    case 'bl': return {
      ...baseStyle,
      clipPath: 'polygon(50% 0,100% 100%,0 100%)',
      left: shouldRealign ? '50%' : '',
      right: shouldRealign ? '' : `${targetWidth - arrowSize.width / 2 - targetWidth / 2}px`,
      top: '0',
      transform: `translate(${shouldRealign ? '-50%' : '0'}, -100%)`,
    }
    case 'br': return {
      ...baseStyle,
      clipPath: 'polygon(50% 0,100% 100%,0 100%)',
      left: shouldRealign ? '50%' : `${targetWidth - arrowSize.width / 2 - targetWidth / 2}px`,
      top: '0',
      transform: `translate(${shouldRealign ? '-50%' : '0'}, -100%)`,
    }
    case 'cl': return {
      ...baseStyle,
      clipPath: 'polygon(0 0,100% 50%,0 100%)',
      right: '0',
      top: '50%',
      transform: 'translate(100%, -50%)',
    }
    case 'cr': return {
      ...baseStyle,
      clipPath: 'polygon(100% 0,0 50%,100% 100%)',
      left: '0',
      top: '50%',
      transform: 'translate(-100%, -50%)',
    }
    case 'tc': return {
      ...baseStyle,
      bottom: 0,
      clipPath: 'polygon(50% 100%, 100% 0, 0 0)',
      left: '50%',
      transform: 'translate(-50%, 100%)',
    }
    case 'tl': return {
      ...baseStyle,
      bottom: 0,
      clipPath: 'polygon(50% 100%, 100% 0, 0 0)',
      left: shouldRealign ? '50%' : '',
      right: shouldRealign ? '' : `${targetWidth - arrowSize.width / 2 - targetWidth / 2}px`,
      transform: `translate(${shouldRealign ? '-50%' : '0'}, 100%)`,
    }
    case 'tr': return {
      ...baseStyle,
      bottom: 0,
      clipPath: 'polygon(50% 100%, 100% 0, 0 0)',
      left: shouldRealign ? '50%' : `${targetWidth - arrowSize.width / 2 - targetWidth / 2}px`,
      transform: `translate(${shouldRealign ? '-50%' : '0'}, 100%)`,
    }
    default:
      console.error(`[etudes::WithTooltip] Invalid alignment: ${alignment}`)

      return {}
  }
}

if (process.env.NODE_ENV === 'development') {
  WithTooltip.displayName = 'WithTooltip'
}
