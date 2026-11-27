import { type CSSProperties, type HTMLAttributes, type PointerEvent, type RefObject, useCallback, useEffect, useRef } from 'react'
import { Point, Rect, Size } from 'spase'

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
     * Specifies if the tooltip should be wrapped in a container element,
     * defaults to `true`. If `false`, the tooltip will be directly attached to
     * the child element, and the child element must be able to accept a ref and
     * pointer event handlers.
     */
    forwardProps?: boolean

    /**
     * The hint string to display in the tooltip, rendered as raw HTML via
     * `innerHTML`. IMPORTANT: Sanitize this value if needed.
     */
    hint: string

    /**
     * The gap (in pixels) between the target element and the tooltip, defaults
     * to `0`.
     */
    gap?: number

    /**
     * Specifies if the tooltip should be displayed when the target element is
     * touched, defaults to `false`.
     */
    isTouchEnabled?: boolean

    /**
     * The maximum width (in pixels) of the tooltip.
     */
    maxWidth?: number
  } & Pick<HTMLAttributes<HTMLElement>, 'children' | 'className' | 'style'>
}

/**
 * A component that wraps a child component and displays a tooltip with a hint
 * string when the target element is hovered. The tooltip is rendered as a
 * fixed-position element appended to the document body, and its position is
 * dynamically computed based on the target element's position and the specified
 * alignment. The tooltip automatically realigns itself if the target element is
 * too close to the edge of the window, and is dismissed when the window is
 * resized, when the page or any scrollable ancestor of the target element is
 * scrolled, or when a pointer is pressed outside of the target element.
 *
 * The following requirements must be met:
 *   1. The child component must be a single React element
 *   2. The child component must support a forwarding ref to an HTML element,
 *      which will be used as the target of the tooltip
 *   3. The child component must have `onPointerEnter` and `onPointerLeave`
 *      props, which will be used to trigger the tooltip display and hide,
 *      respectively
 */
export function WithTooltip({
  className = '',
  style,
  alignment: externalAlignment,
  arrowHeight = 6,
  arrowWidth = 12,
  children,
  forwardProps = false,
  gap = 4,
  hint,
  maxWidth = 200,
  isTouchEnabled = false,
}: Readonly<WithTooltip.Props>) {
  const dialogRef = useRef<HTMLElement>(null)
  const arrowRef = useRef<HTMLElement>(null)
  const targetRef = useRef<HTMLElement>(null)
  const intersectionObserverRef = useRef<IntersectionObserver>(undefined)
  const abortControllerRef = useRef<AbortController>(undefined)

  const applyStyle = useCallback(() => {
    const dialog = dialogRef.current
    const arrow = arrowRef.current
    const target = targetRef.current
    if (!dialog || !arrow || !target) return

    const { origin, scale } = _measureFixedSpace(dialog)
    const targetRect = target.getBoundingClientRect()
    const viewportRect = Rect.fromViewport()

    const clientRect = Rect.make({
      height: targetRect.height,
      width: targetRect.width,
      x: targetRect.left,
      y: targetRect.top,
    })

    const anchorRect = Rect.make({
      height: targetRect.height / scale,
      width: targetRect.width / scale,
      x: (targetRect.left - origin.x) / scale,
      y: (targetRect.top - origin.y) / scale,
    })

    const arrowSize = Size.make(arrowWidth, arrowHeight)
    const dialogSize = Size.divide(measureIntrinsicSize(dialog, maxWidth), Size.make(scale, scale))
    const alignment = externalAlignment ?? _computeAlignment(clientRect, viewportRect)

    setStyles(styles(style, _makeDynamicDialogStyle(alignment, dialogSize, arrowSize, gap, anchorRect)), { target: dialog })
    setStyles(_makeDynamicArrowStyle(alignment, dialogSize, arrowSize, anchorRect), { target: arrow })
  }, [externalAlignment, maxWidth, style, arrowHeight, arrowWidth, gap])

  const hideTooltip = useCallback(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    intersectionObserverRef.current?.disconnect()
    intersectionObserverRef.current = undefined

    abortControllerRef.current?.abort()
    abortControllerRef.current = undefined

    if (dialog.isConnected) {
      window.document.body.removeChild(dialog)
    }
  }, [])

  const showTooltip = useCallback(() => {
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

    abortControllerRef.current?.abort()

    const listenersAbortController = new AbortController()
    abortControllerRef.current = listenersAbortController

    window.addEventListener('resize', hideTooltip, { signal: listenersAbortController.signal })
    window.addEventListener('scroll', hideTooltip, { capture: true, passive: true, signal: listenersAbortController.signal })
    window.addEventListener('pointerdown', event => {
      if (event.target instanceof Node && target.contains(event.target)) return

      hideTooltip()
    }, { capture: true, signal: listenersAbortController.signal })

    if (!dialog.isConnected) {
      window.document.body.appendChild(dialog)
    }

    applyStyle()
  }, [applyStyle, hideTooltip])

  const pointerEnterHandler = useCallback((event: PointerEvent) => {
    if (event.pointerType === 'touch' && !isTouchEnabled) return

    showTooltip()
  }, [isTouchEnabled, showTooltip])

  const pointerLeaveHandler = useCallback((event: PointerEvent) => {
    // For touch, `pointerleave` fires as soon as the finger lifts, so a tooltip
    // opened by touch is instead dismissed by pressing outside of the target.
    if (event.pointerType === 'touch') return

    hideTooltip()
  }, [hideTooltip])

  useEffect(() => {
    const { arrow, dialog } = _createDialog(className, hint)
    arrowRef.current = arrow
    dialogRef.current = dialog

    return () => {
      if (dialog.isConnected) {
        window.document.body.removeChild(dialog)
      }

      arrowRef.current = null
      dialogRef.current = null

      intersectionObserverRef.current?.disconnect()
      intersectionObserverRef.current = undefined

      abortControllerRef.current?.abort()
      abortControllerRef.current = undefined
    }
  }, [className, hint])

  if (forwardProps) {
    return (
      <ExtractChild
        ref={targetRef}
        onPointerEnter={pointerEnterHandler}
        onPointerLeave={pointerLeaveHandler}
      >
        {children}
      </ExtractChild>
    )
  } else {
    return (
      <div
        ref={targetRef as RefObject<HTMLDivElement>}
        onPointerEnter={pointerEnterHandler}
        onPointerLeave={pointerLeaveHandler}
      >
        {children}
      </div>
    )
  }
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

function _measureFixedSpace(dialog: HTMLElement): { origin: Point.Point; scale: number } {
  const probeSize = 100
  const { left, top, transform, width } = dialog.style

  setStyles({
    left: '0',
    top: '0',
    transform: 'none',
    width: `${probeSize}px`,
  }, {
    target: dialog,
  })

  const rect = dialog.getBoundingClientRect()

  setStyles({
    left,
    top,
    transform,
    width,
  }, {
    target: dialog,
  })

  return {
    origin: Point.make({ x: rect.left, y: rect.top }),
    scale: rect.width > 0 ? rect.width / probeSize : 1,
  }
}

function _computeAlignment(anchorRect: Rect.Rect, viewportRect: Rect.Rect): Alignment {
  const spaceAbove = anchorRect.top
  const spaceBelow = viewportRect.height - anchorRect.bottom
  const spaceLeft = anchorRect.left
  const spaceRight = viewportRect.width - anchorRect.right
  const threshold = 1.5

  const h = spaceRight <= 0 || (spaceLeft / spaceRight > threshold)
    ? 'left'
    : spaceLeft <= 0 || (spaceRight / spaceLeft > threshold)
      ? 'right'
      : 'center'

  const v = spaceBelow <= 0 || (spaceAbove / spaceBelow > threshold)
    ? 'top'
    : spaceAbove <= 0 || (spaceBelow / spaceAbove) > threshold
      ? 'bottom'
      : 'center'

  if (h === 'center' && v === 'center') {
    return 'bc'
  } else if (h === 'center') {
    switch (v) {
      case 'top':
        return 'tc'
      default:
        return 'bc'
    }
  } else if (v === 'center') {
    switch (h) {
      case 'left':
        return 'cl'
      default:
        return 'cr'
    }
  } else {
    return v.charAt(0) + h.charAt(0) as Alignment
  }
}

function _makeDynamicDialogStyle(alignment: Alignment, dialogSize: Size.Size, arrowSize: Size.Size, gap: number, targetRect: Rect.Rect): CSSProperties {
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

function _makeDynamicArrowStyle(alignment: Alignment, dialogSize: Size.Size, arrowSize: Size.Size, targetRect: Rect.Rect): CSSProperties {
  const targetWidth = targetRect.width
  const shouldRealign = targetWidth > dialogSize.width
  const isHorizontal = alignment === 'cl' || alignment === 'cr'
  const normalizedSize = isHorizontal ? Size.rotate(arrowSize) : arrowSize

  const baseStyle = {
    bottom: 'auto',
    height: `${normalizedSize.height}px`,
    left: 'auto',
    right: 'auto',
    top: 'auto',
    width: `${normalizedSize.width}px`,
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
      right: shouldRealign ? '' : `${targetWidth - normalizedSize.width / 2 - targetWidth / 2}px`,
      top: '0',
      transform: `translate(${shouldRealign ? '-50%' : '0'}, -100%)`,
    }
    case 'br': return {
      ...baseStyle,
      clipPath: 'polygon(50% 0,100% 100%,0 100%)',
      left: shouldRealign ? '50%' : `${targetWidth - normalizedSize.width / 2 - targetWidth / 2}px`,
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
      right: shouldRealign ? '' : `${targetWidth - normalizedSize.width / 2 - targetWidth / 2}px`,
      transform: `translate(${shouldRealign ? '-50%' : '0'}, 100%)`,
    }
    case 'tr': return {
      ...baseStyle,
      bottom: 0,
      clipPath: 'polygon(50% 100%, 100% 0, 0 0)',
      left: shouldRealign ? '50%' : `${targetWidth - normalizedSize.width / 2 - targetWidth / 2}px`,
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
