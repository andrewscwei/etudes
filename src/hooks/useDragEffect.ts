import { useEffect, useRef, type DependencyList, type RefObject } from 'react'
import { Point } from 'spase'

type Options = {
  /**
   * Specifies whether the cursor icon should update.
   */
  updatesCursor?: boolean

  /**
   * Handler invoked when dragging starts.
   *
   * @param startPosition The element that was dragged.
   */
  onDragStart?: (startPosition: Point) => void

  /**
   * Handler invoked when dragging.
   *
   * @param displacement The displacement (in pixels) since the last emitted
   *                     drag move event.
   * @param startPosition The position (in pixels) where the drag started.
   */
  onDragMove?: (displacement: Point, startPosition: Point) => void

  /**
   * Handler invoked when dragging ends.
   *
   * @param endPosition The position (in pixels) where the drag ended.
   * @param displacement The displacement (in pixels) since the last emitted
   *                     drag move event.
   * @param startPosition The position (in pixels) where the drag started.
   */
  onDragEnd?: (displacement: Point, startPosition: Point, endPosition: Point) => void
}

/**
 * Hook for adding effectful dragging interaction to an element.
 *
 * @param targetRef The reference to the target element to add drag interaction
 *                  to.
 * @param options Additional options which include options for
 *                `module:interactjs.draggable`.
 * @param deps Dependencies that trigger this effect.
 *
 * @returns The states created for this effect.
 */
export function useDragEffect(targetRef: RefObject<HTMLElement>, {
  updatesCursor = true,
  onDragStart,
  onDragMove,
  onDragEnd,
}: Options, deps: DependencyList = []) {
  const element = targetRef.current
  const startPositionRef = useRef<Point>()
  const dragPositionRef = useRef<Point>()

  if (updatesCursor && element) element.style.cursor = 'grab'

  useEffect(() => {
    if (!element) return

    const mouseDownHandler = (event: MouseEvent) => {
      event.preventDefault()

      const position = new Point([event.clientX, event.clientY])

      startPositionRef.current = position
      dragPositionRef.current = position

      element.addEventListener('mousemove', mouseMoveHandler)
      element.addEventListener('mouseup', mouseUpHandler, { capture: true })
      element.addEventListener('mouseleave', mouseUpHandler)

      if (updatesCursor) element.style.cursor = 'grabbing'

      onDragStart?.(position)
    }

    const mouseMoveHandler = (event: MouseEvent) => {
      if (!startPositionRef.current) return

      const position = new Point([event.clientX, event.clientY])
      const displacement = (dragPositionRef.current ?? startPositionRef.current).subtract(position)

      dragPositionRef.current = position

      onDragMove?.(displacement, startPositionRef.current)
    }

    const mouseUpHandler = (event: MouseEvent) => {
      if (!startPositionRef.current) return

      const position = new Point([event.clientX, event.clientY])
      const displacement = (dragPositionRef.current ?? startPositionRef.current).subtract(position)

      onDragEnd?.(position, displacement, startPositionRef.current)

      startPositionRef.current = undefined
      dragPositionRef.current = undefined

      element.removeEventListener('mousemove', mouseMoveHandler)
      element.removeEventListener('mouseup', mouseUpHandler, { capture: true })
      element.removeEventListener('mouseleave', mouseUpHandler)

      if (updatesCursor) element.style.cursor = 'grab'
    }

    element.addEventListener('mousedown', mouseDownHandler)

    return () => {
      element.removeEventListener('mousedown', mouseDownHandler)
      element.removeEventListener('mousemove', mouseMoveHandler)
      element.removeEventListener('mouseup', mouseUpHandler, { capture: true })
      element.removeEventListener('mouseleave', mouseUpHandler)
    }
  }, [targetRef.current, ...deps])
}
