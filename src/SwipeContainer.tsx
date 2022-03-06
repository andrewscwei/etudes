import React, { HTMLAttributes, PropsWithChildren, useState } from 'react'
import { Point } from 'spase'
import styled from 'styled-components'

type Props = HTMLAttributes<HTMLDivElement> & PropsWithChildren<{
  isEnabled?: boolean
  threshold?: number
  onSwipeDown?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
}>

/**
 * An empty component with a backing `<div>` element that detects swipe gestures.
 */
export default function SwipeContainer({
  children,
  isEnabled = true,
  threshold = 0.5,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  ...props
}: Props) {
  const [dragStartPosition, setDragStartPosition] = useState<Point | undefined>(undefined)
  const [dragEndPosition, setDragEndPosition] = useState<Point | undefined>(undefined)
  const [dragStartTime, setDragStartTime] = useState(NaN)

  const onDragStart = (x: number, y: number) => {
    if (isNaN(x) || isNaN(y)) return onDragCancel()
    setDragStartPosition(new Point([x, y]))
  }

  const onDragMove = (x: number, y: number) => {
    const startPosition = dragStartPosition

    if (startPosition === undefined) return

    const hasMovement = startPosition.x !== x || startPosition.y !== y
    const hasStartTime = !isNaN(dragStartTime)

    if (!hasMovement) return

    if (!hasStartTime) setDragStartTime(Date.now())

    setDragEndPosition(new Point([x, y]))
  }

  const onDragEnd = () => {
    const time = dragStartTime
    const startPosition = dragStartPosition
    const endPosition = dragEndPosition

    if (isNaN(time) || startPosition === undefined || endPosition === undefined) return

    const dt = Date.now() - time
    const dx = endPosition.x - startPosition.x
    const dy = endPosition.y - endPosition.y
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
    <StyledRoot
      {...props}
      onTouchStart={event => onDragStart(event.targetTouches[0].clientX, event.targetTouches[0].clientY)}
      onTouchMove={event => onDragMove(event.targetTouches[0].clientX, event.targetTouches[0].clientY)}
      onTouchEnd={() => onDragEnd()}
      onMouseDown={event => onDragStart(event.clientX, event.clientY)}
      onMouseMove={event => onDragMove(event.clientX, event.clientY)}
      onMouseUp={() => onDragEnd()}
      onMouseLeave={() => onDragCancel()}
    >
      {children}
    </StyledRoot>
  )
}

const StyledRoot = styled.div`

`
