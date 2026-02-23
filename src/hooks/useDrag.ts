import { type RefObject, useCallback, useLayoutEffect, useRef } from 'react'
import { Point } from 'spase'

import { useLatest } from './useLatest.js'

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
  shouldUpdateCursor?: boolean

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
 * @param target The target element or reference
 * @param options Additional options.
 * @param deps Dependencies that trigger this effect.
 *
 * @returns The states created for this effect.
 */
export function useDrag(
  target: HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined,
  {
    isEnabled = true,
    shouldUpdateCursor = true,
    onDragEnd,
    onDragMove,
    onDragStart,
  }: UseDragOptions,
) {
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
    const element = target && 'current' in target ? target.current : target
    if (!element || !startPositionRef.current) return

    const position = Point.make(event.clientX, event.clientY)
    const displacement = Point.subtract(dragPositionRef.current ?? startPositionRef.current, position)

    dragEndHandlerRef.current?.(position, displacement, startPositionRef.current)

    startPositionRef.current = undefined
    dragPositionRef.current = undefined

    element.removeEventListener('mousemove', mouseMoveListener)
    element.removeEventListener('mouseup', mouseUpListener, { capture: true })
    element.removeEventListener('mouseleave', mouseUpListener)

    if (shouldUpdateCursor) element.style.cursor = 'grab'
  }, [target, shouldUpdateCursor, mouseMoveListener])

  const mouseDownListener = useCallback((event: MouseEvent) => {
    const element = target && 'current' in target ? target.current : target
    if (!element) return

    event.preventDefault()

    const position = Point.make(event.clientX, event.clientY)

    startPositionRef.current = position
    dragPositionRef.current = position

    element.addEventListener('mousemove', mouseMoveListener)
    element.addEventListener('mouseup', mouseUpListener, { capture: true })
    element.addEventListener('mouseleave', mouseUpListener)

    if (shouldUpdateCursor) element.style.cursor = 'grabbing'

    dragStartHandlerRef.current?.(position)
  }, [target, shouldUpdateCursor, mouseMoveListener, mouseUpListener])

  useLayoutEffect(() => {
    const element = target && 'current' in target ? target.current : target
    if (!element || !isEnabled || !shouldUpdateCursor) return

    const defaultCursor = element.style.cursor
    element.style.cursor = 'grab'

    return () => {
      element.style.cursor = defaultCursor
    }
  }, [target, isEnabled, shouldUpdateCursor])

  useLayoutEffect(() => {
    const element = target && 'current' in target ? target.current : target
    if (!element || !isEnabled) return

    element.addEventListener('mousedown', mouseDownListener)

    return () => {
      element.removeEventListener('mousedown', mouseDownListener)
      element.removeEventListener('mousemove', mouseMoveListener)
      element.removeEventListener('mouseup', mouseUpListener, { capture: true })
      element.removeEventListener('mouseleave', mouseUpListener)
    }
  }, [target, isEnabled, mouseMoveListener, mouseUpListener, mouseDownListener])
}
