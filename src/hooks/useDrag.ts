import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { Point } from 'spase'

/**
 * Type describing the options of {@link useDrag}.
 */
export type UseDragOptions = {
  /**
   * Specifies whether this effect is enabled.
   */
  isEnabled?: boolean

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
   * @param currentPosition The position (in pixels) where the drag is currently
   *                        at.
   * @param startPosition The position (in pixels) where the drag started.
   */
  onDragMove?: (displacement: Point, currentPosition: Point, startPosition: Point) => void

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
 * Hook for adding dragging interaction to an element.
 *
 * @param targetRef The reference to the target element to add drag interaction
 *                  to.
 * @param options Additional options.
 * @param deps Dependencies that trigger this effect.
 *
 * @returns The states created for this effect.
 */
export function useDrag(targetRef: RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>, {
  isEnabled = true,
  updatesCursor = true,
  onDragStart,
  onDragMove,
  onDragEnd,
}: UseDragOptions) {
  const startPositionRef = useRef<Point>(undefined)
  const dragPositionRef = useRef<Point>(undefined)

  const mouseMoveHandler = useCallback((event: MouseEvent) => {
    if (!startPositionRef.current) return

    const position = Point.make(event.clientX, event.clientY)
    const displacement = position.subtract(dragPositionRef.current ?? startPositionRef.current)

    dragPositionRef.current = position

    onDragMove?.(displacement, position, startPositionRef.current)
  }, [onDragMove])

  const mouseUpHandler = useCallback((event: MouseEvent) => {
    const element = targetRef.current
    if (!element || !startPositionRef.current) return

    const position = Point.make(event.clientX, event.clientY)
    const displacement = (dragPositionRef.current ?? startPositionRef.current).subtract(position)

    onDragEnd?.(position, displacement, startPositionRef.current)

    startPositionRef.current = undefined
    dragPositionRef.current = undefined

    element.removeEventListener('mousemove', mouseMoveHandler)
    element.removeEventListener('mouseup', mouseUpHandler, { capture: true })
    element.removeEventListener('mouseleave', mouseUpHandler)

    if (updatesCursor) element.style.cursor = 'grab'
  }, [targetRef.current, updatesCursor, mouseMoveHandler, onDragEnd])

  const mouseDownHandler = useCallback((event: MouseEvent) => {
    const element = targetRef.current
    if (!element) return

    event.preventDefault()

    const position = Point.make(event.clientX, event.clientY)

    startPositionRef.current = position
    dragPositionRef.current = position

    element.addEventListener('mousemove', mouseMoveHandler)
    element.addEventListener('mouseup', mouseUpHandler, { capture: true })
    element.addEventListener('mouseleave', mouseUpHandler)

    if (updatesCursor) element.style.cursor = 'grabbing'

    onDragStart?.(position)
  }, [targetRef.current, updatesCursor, mouseMoveHandler, mouseUpHandler, onDragStart])

  useEffect(() => {
    const element = targetRef.current
    if (!element || !isEnabled || !updatesCursor) return

    const defaultCursor = element.style.cursor
    element.style.cursor = 'grab'

    return () => {
      element.style.cursor = defaultCursor
    }
  }, [targetRef.current, isEnabled, updatesCursor])

  useEffect(() => {
    const element = targetRef.current
    if (!element || !isEnabled) return

    element.addEventListener('mousedown', mouseDownHandler)

    return () => {
      element.removeEventListener('mousedown', mouseDownHandler)
      element.removeEventListener('mousemove', mouseMoveHandler)
      element.removeEventListener('mouseup', mouseUpHandler, { capture: true })
      element.removeEventListener('mouseleave', mouseUpHandler)
    }
  }, [targetRef.current, isEnabled, mouseMoveHandler, mouseUpHandler, mouseDownHandler])
}
