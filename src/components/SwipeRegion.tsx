import { forwardRef, useState, type HTMLAttributes } from 'react'
import { Point } from 'spase'

/**
 * Type describing the props of {@link SwipeRegion}.
 */
export type SwipeRegionProps = Omit<HTMLAttributes<HTMLDivElement>, 'onMouseDown' | 'onMouseLeave' | 'onMouseMove' | 'onMouseUp' | 'onTouchEnd' | 'onTouchMove' | 'onTouchStart'> & {
  /**
   * Specifies if swipe detection is enabled.
   */
  isEnabled?: boolean

  /**
   * The minimum velocity (in pixels per millisecond) required to trigger a
   * swipe event.
   */
  threshold?: number

  /**
   * Handler invoked when a swipe down gesture is detected.
   */
  onSwipeDown?: () => void

  /**
   * Handler invoked when a swipe left gesture is detected.
   */
  onSwipeLeft?: () => void

  /**
   * Handler invoked when a swipe right gesture is detected.
   */
  onSwipeRight?: () => void

  /**
   * Handler invoked when a swipe up gesture is detected.
   */
  onSwipeUp?: () => void
}

/**
 * An {@link HTMLDivElement} container that detects swipe gestures.
 */
export const SwipeRegion = /* #__PURE__ */ forwardRef<HTMLDivElement, Readonly<SwipeRegionProps>>(({
  children,
  isEnabled = true,
  threshold = 0.5,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  ...props
}, ref) => {
  const [dragStartPosition, setDragStartPosition] = useState<Point | undefined>(undefined)
  const [dragEndPosition, setDragEndPosition] = useState<Point | undefined>(undefined)
  const [dragStartTime, setDragStartTime] = useState(NaN)

  const onDragStart = (x: number, y: number) => {
    if (isNaN(x) || isNaN(y)) return onDragCancel()
    setDragStartPosition(Point.make(x, y))
  }

  const onDragMove = (x: number, y: number) => {
    const startPosition = dragStartPosition

    if (startPosition === undefined) return

    const hasMovement = startPosition.x !== x || startPosition.y !== y
    const hasStartTime = !isNaN(dragStartTime)

    if (!hasMovement) return

    if (!hasStartTime) setDragStartTime(Date.now())

    setDragEndPosition(Point.make(x, y))
  }

  const onDragEnd = () => {
    const time = dragStartTime
    const startPosition = dragStartPosition
    const endPosition = dragEndPosition

    if (isNaN(time) || startPosition === undefined || endPosition === undefined) return

    const dt = Date.now() - time
    const dx = endPosition.x - startPosition.x
    const dy = endPosition.y - startPosition.y
    const vx = dx / dt
    const vy = dy / dt

    if (isEnabled) {
      if (Math.abs(vx) >= threshold && Math.abs(vx) > Math.abs(vy)) {
        if (vx > 0) {
          onSwipeRight?.()
        }
        else {
          onSwipeLeft?.()
        }
      }
      else if (Math.abs(vy) >= threshold && Math.abs(vy) > Math.abs(vx)) {
        if (vy > 0) {
          onSwipeDown?.()
        }
        else {
          onSwipeUp?.()
        }
      }
    }

    onDragCancel()
  }

  const onDragCancel = () => {
    setDragStartPosition(undefined)
    setDragEndPosition(undefined)
    setDragStartTime(NaN)
  }

  return (
    <div
      {...props}
      ref={ref}
      onMouseDown={event => onDragStart(event.clientX, event.clientY)}
      onMouseLeave={() => onDragCancel()}
      onMouseMove={event => onDragMove(event.clientX, event.clientY)}
      onMouseUp={() => onDragEnd()}
      onTouchEnd={() => onDragEnd()}
      onTouchMove={event => onDragMove(event.targetTouches[0].clientX, event.targetTouches[0].clientY)}
      onTouchStart={event => onDragStart(event.targetTouches[0].clientX, event.targetTouches[0].clientY)}
    >
      {children}
    </div>
  )
})

if (process.env.NODE_ENV === 'development') {
  SwipeRegion.displayName = 'SwipeRegion'
}
