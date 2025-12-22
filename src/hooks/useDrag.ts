import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react'
import { Point } from 'spase'
import { useLatest } from './useLatest.js'

type TargetRef = RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>

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
export function useDrag(targetRef: TargetRef, {
  isEnabled = true,
  updatesCursor = true,
  onDragStart,
  onDragMove,
  onDragEnd,
}: UseDragOptions) {
  const startPositionRef = useRef<Point>(undefined)
  const dragPositionRef = useRef<Point>(undefined)
  const dragStartHandlerRef = useLatest(onDragStart)
  const dragMoveHandlerRef = useLatest(onDragMove)
  const dragEndHandlerRef = useLatest(onDragEnd)

  const mouseMoveListener = useCallback((event: MouseEvent) => {
    if (!startPositionRef.current) return

    const position = Point.make(event.clientX, event.clientY)
    const displacement = Point.subtract(position, dragPositionRef.current ?? startPositionRef.current)

    dragPositionRef.current = position

    dragMoveHandlerRef.current?.(displacement, position, startPositionRef.current)
  }, [])

  const mouseUpListener = useCallback((event: MouseEvent) => {
    const element = targetRef.current
    if (!element || !startPositionRef.current) return

    const position = Point.make(event.clientX, event.clientY)
    const displacement = Point.subtract(dragPositionRef.current ?? startPositionRef.current, position)

    dragEndHandlerRef.current?.(position, displacement, startPositionRef.current)

    startPositionRef.current = undefined
    dragPositionRef.current = undefined

    element.removeEventListener('mousemove', mouseMoveListener)
    element.removeEventListener('mouseup', mouseUpListener, { capture: true })
    element.removeEventListener('mouseleave', mouseUpListener)

    if (updatesCursor) element.style.cursor = 'grab'
  }, [updatesCursor, mouseMoveListener])

  const mouseDownListener = useCallback((event: MouseEvent) => {
    const element = targetRef.current
    if (!element) return

    event.preventDefault()

    const position = Point.make(event.clientX, event.clientY)

    startPositionRef.current = position
    dragPositionRef.current = position

    element.addEventListener('mousemove', mouseMoveListener)
    element.addEventListener('mouseup', mouseUpListener, { capture: true })
    element.addEventListener('mouseleave', mouseUpListener)

    if (updatesCursor) element.style.cursor = 'grabbing'

    dragStartHandlerRef.current?.(position)
  }, [updatesCursor, mouseMoveListener, mouseUpListener])

  useLayoutEffect(() => {
    const element = targetRef.current
    if (!element || !isEnabled || !updatesCursor) return

    const defaultCursor = element.style.cursor
    element.style.cursor = 'grab'

    return () => {
      element.style.cursor = defaultCursor
    }
  }, [isEnabled, updatesCursor])

  useLayoutEffect(() => {
    const element = targetRef.current
    if (!element || !isEnabled) return

    element.addEventListener('mousedown', mouseDownListener)

    return () => {
      element.removeEventListener('mousedown', mouseDownListener)
      element.removeEventListener('mousemove', mouseMoveListener)
      element.removeEventListener('mouseup', mouseUpListener, { capture: true })
      element.removeEventListener('mouseleave', mouseUpListener)
    }
  }, [isEnabled, mouseMoveListener, mouseUpListener, mouseDownListener])
}
