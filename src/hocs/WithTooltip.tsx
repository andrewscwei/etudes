import clsx from 'clsx'
import { useCallback, useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react'
import { Rect, Size } from 'spase'
import { useRect } from '../hooks/useRect.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { createKey } from '../utils/createKey.js'
import { ExtractChild } from '../utils/ExtractChild.js'
import { styles } from '../utils/styles.js'

/**
 * Type describing the alignment of the tooltip relative to the wrapped element.
 */
type Alignment = 'tl' | 'tc' | 'tr' | 'cl' | 'cr' | 'bl' | 'bc' | 'br'

/**
 * Type describing the styling options of the tooltip.
 */
type StyleOptions = {
  alignment: Alignment
  arrowSize: Size
  fullDialogWidth: number
  gap: number
  maxDialogWidth: number
  targetWidth: number
}

export namespace WithTooltip {
  /**
   * Type describing the props of {@link WithTooltip}.
   */
  export type Props = Pick<HTMLAttributes<HTMLElement>, 'className' | 'children' | 'style'> & {
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
     * The hint string to display in the tooltip.
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
  }
}

/**
 * A component that wraps a target element and displays a tooltip with a hint
 * string when the target element is hovered.
 */
export function WithTooltip({
  children,
  className,
  style,
  alignment: externalAlignment,
  arrowHeight = 6,
  arrowWidth = 12,
  gap = 4,
  hint,
  maxWidth = 200,
  threshold = 100,
}: Readonly<WithTooltip.Props>) {
  const targetRef = useRef<HTMLElement>(null)
  const dialogRef = useRef<HTMLSpanElement>(undefined)
  const targetRect = useRect(targetRef)

  const createDialog = useCallback(() => {
    const dialog = window.document.createElement('span')
    dialog.className = clsx(className)
    dialog.innerHTML = hint
    dialog.role = 'tooltip'

    const alignment = externalAlignment ?? (targetRef.current ? _computeAlignment(targetRef.current, threshold) : 'tl')
    const fullDialogSize = _computeMaxSize(dialog)
    const fixedStyles = _getFixedStyles({ alignment, arrowSize: Size.make(arrowWidth, arrowHeight), gap, maxDialogWidth: maxWidth, fullDialogWidth: fullDialogSize.width, targetWidth: targetRect.width })

    const dialogStyle = styles(style, fixedStyles.dialog)
    Object.keys(dialogStyle).forEach(rule => (dialog.style as any)[rule] = (dialogStyle as any)[rule])

    const arrow = window.document.createElement('span')
    Object.keys(fixedStyles.arrow).forEach(rule => (arrow.style as any)[rule] = (fixedStyles.arrow as any)[rule])

    dialog.appendChild(arrow)

    return dialog
  }, [className, externalAlignment, hint, maxWidth, createKey(style), targetRect.width, threshold, arrowHeight, arrowWidth, gap])

  const mouseEnterHandler = useCallback(() => {
    if (!dialogRef.current) return

    dialogRef.current.style.opacity = '1'
    dialogRef.current.ariaHidden = 'false'
  }, [])

  const mouseLeaveHandler = useCallback(() => {
    if (!dialogRef.current) return

    dialogRef.current.style.opacity = '0'
    dialogRef.current.ariaHidden = 'true'
  }, [])

  useEffect(() => {
    const dialogNode = createDialog()
    targetRef.current?.appendChild(dialogNode)
    dialogRef.current = dialogNode

    return () => {
      targetRef.current?.removeChild(dialogNode)
      dialogRef.current = undefined
    }
  }, [createDialog])

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

function _computeMaxSize(element: HTMLElement) {
  if (typeof window === 'undefined') return Size.zero

  const clone = element.cloneNode(false) as HTMLElement
  clone.innerHTML = element.innerHTML
  clone.style.visibility = 'hidden'
  clone.style.whiteSpace = 'pre'

  window.document.body.appendChild(clone)
  const rect = clone.getBoundingClientRect()
  window.document.body.removeChild(clone)

  return Size.make(rect.width, rect.height)
}

function _computeAlignment(element: HTMLElement, threshold: number) {
  const vrect = Rect.fromViewport()
  const irect = Rect.intersecting(element)

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

  return 'tc'
}

function _makeDialogStyle({ alignment, arrowSize, fullDialogWidth, gap, maxDialogWidth, targetWidth }: StyleOptions): CSSProperties {
  const dialogWidth = Math.min(fullDialogWidth, maxDialogWidth)
  const shouldRealign = targetWidth > dialogWidth

  switch (alignment) {
    case 'tl': return {
      bottom: `calc(100% + ${arrowSize.height}px + ${gap}px)`,
      right: shouldRealign ? '' : '0',
      left: shouldRealign ? '50%' : '',
      transform: `translate(${dialogWidth > targetWidth ? '0' : '-50%'}, 0)`,
    }
    case 'tc': return {
      bottom: `calc(100% + ${arrowSize.height}px + ${gap}px)`,
      left: '50%',
      transform: 'translateX(-50%)',
    }
    case 'tr': return {
      bottom: `calc(100% + ${arrowSize.height}px + ${gap}px)`,
      left: shouldRealign ? '50%' : '0',
      transform: `translate(${dialogWidth > targetWidth ? '0' : '-50%'}, 0)`,
    }
    case 'cl': return {
      top: '50%',
      right: `calc(100% + ${arrowSize.height + gap}px)`,
      transform: 'translate(0, -50%)',
    }
    case 'cr': return {
      top: '50%',
      left: `calc(100% + ${arrowSize.height + gap}px)`,
      transform: 'translate(0, -50%)',
    }
    case 'bl': return {
      left: shouldRealign ? '50%' : '',
      right: shouldRealign ? '' : '0',
      top: `calc(100% + ${arrowSize.height}px + ${gap}px)`,
      transform: `translate(${dialogWidth > targetWidth ? '0' : '-50%'}, 0)`,
    }
    case 'bc': return {
      left: '50%',
      top: `calc(100% + ${arrowSize.height}px + ${gap}px)`,
      transform: 'translateX(-50%)',
    }
    case 'br': return {
      left: shouldRealign ? '50%' : '0',
      top: `calc(100% + ${arrowSize.height}px + ${gap}px)`,
      transform: `translate(${dialogWidth > targetWidth ? '0' : '-50%'}, 0)`,
    }
    default:
      console.error(`[etudes::WithTooltip] Invalid alignment: ${alignment}`)

      return {}
  }
}

function _makeArrowStyle({ alignment, arrowSize, fullDialogWidth, maxDialogWidth, targetWidth }: StyleOptions): CSSProperties {
  const dialogWidth = Math.min(fullDialogWidth, maxDialogWidth)
  const shouldRealign = targetWidth > dialogWidth

  switch (alignment) {
    case 'tl': return {
      bottom: 0,
      clipPath: 'polygon(50% 100%,100% 0,0 0)',
      height: `${arrowSize.height}px`,
      left: shouldRealign ? '50%' : '',
      right: shouldRealign ? '' : `${targetWidth - arrowSize.width / 2 - targetWidth / 2}px`,
      transform: `translate(${shouldRealign ? '-50%' : '0'}, 100%)`,
      width: `${arrowSize.width}px`,
    }
    case 'tc': return {
      bottom: 0,
      clipPath: 'polygon(50% 100%,100% 0,0 0)',
      height: `${arrowSize.height}px`,
      left: '50%',
      transform: 'translate(-50%, 100%)',
      width: `${arrowSize.width}px`,
    }
    case 'tr': return {
      bottom: 0,
      clipPath: 'polygon(50% 100%,100% 0,0 0)',
      height: `${arrowSize.height}px`,
      left: shouldRealign ? '50%' : `${targetWidth - arrowSize.width / 2 - targetWidth / 2}px`,
      transform: `translate(${shouldRealign ? '-50%' : '0'}, 100%)`,
      width: `${arrowSize.width}px`,
    }
    case 'cl': return {
      clipPath: 'polygon(0 0,100% 50%,0 100%)',
      height: `${arrowSize.width}px`,
      right: '0',
      top: '50%',
      transform: 'translate(100%, -50%)',
      width: `${arrowSize.height}px`,
    }
    case 'cr': return {
      clipPath: 'polygon(100% 0,0 50%,100% 100%)',
      height: `${arrowSize.width}px`,
      left: '0',
      top: '50%',
      transform: 'translate(-100%, -50%)',
      width: `${arrowSize.height}px`,
    }
    case 'bl': return {
      clipPath: 'polygon(50% 0,100% 100%,0 100%)',
      height: `${arrowSize.height}px`,
      left: shouldRealign ? '50%' : '',
      right: shouldRealign ? '' : `${targetWidth - arrowSize.width / 2 - targetWidth / 2}px`,
      top: '0',
      transform: `translate(${shouldRealign ? '-50%' : '0'}, -100%)`,
      width: `${arrowSize.width}px`,
    }
    case 'bc': return {
      clipPath: 'polygon(50% 0,100% 100%,0 100%)',
      height: `${arrowSize.height}px`,
      left: '50%',
      top: '0',
      transform: 'translate(-50%, -100%)',
      width: `${arrowSize.width}px`,
    }
    case 'br': return {
      clipPath: 'polygon(50% 0,100% 100%,0 100%)',
      height: `${arrowSize.height}px`,
      left: shouldRealign ? '50%' : `${targetWidth - arrowSize.width / 2 - targetWidth / 2}px`,
      top: '0',
      transform: `translate(${shouldRealign ? '-50%' : '0'}, -100%)`,
      width: `${arrowSize.width}px`,
    }
    default:
      console.error(`[etudes::WithTooltip] Invalid alignment: ${alignment}`)

      return {}
  }
}

function _getFixedStyles({ alignment, arrowSize, fullDialogWidth, gap, maxDialogWidth, targetWidth }: StyleOptions) {
  return asStyleDict({
    dialog: {
      boxSizing: 'border-box',
      height: 'auto',
      margin: '0',
      opacity: '0',
      pointerEvents: 'none',
      position: 'absolute',
      userSelect: 'none',
      whiteSpace: fullDialogWidth > maxDialogWidth ? 'normal' : 'pre',
      width: fullDialogWidth > maxDialogWidth ? `${maxDialogWidth}px` : '',
      ..._makeDialogStyle({ alignment, arrowSize, fullDialogWidth, gap, maxDialogWidth, targetWidth }),
    },
    arrow: {
      background: 'inherit',
      position: 'absolute',
      ..._makeArrowStyle({ alignment, arrowSize, fullDialogWidth, gap, maxDialogWidth, targetWidth }),
    },
  })
}

if (process.env.NODE_ENV === 'development') {
  WithTooltip.displayName = 'WithTooltip'
}
