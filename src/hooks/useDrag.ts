import { type RefObject, useLayoutEffect } from 'react'
import { Point } from 'spase'

import { useLatest } from './useLatest.js'

type Target = HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined

/**
 * Distance (in pixels) the pointer must move before dragging starts.
 */
const MOVE_TOLERANCE_PX = 1

/**
 * Type describing the options of {@link useDrag}.
 */
export type UseDragOptions = {
  /**
   * Specifies whether this effect is enabled.
   */
  isEnabled?: boolean

  /**
   * Supported pointer types. Exclude `touch` (and `pen`) to leave those to
   * native scrolling. Defaults to all pointer types.
   */
  pointerTypes?: ('mouse' | 'pen' | 'touch')[]

  /**
   * Specifies whether the cursor icon should update.
   */
  shouldUpdateCursor?: boolean

  /**
   * Handler invoked when dragging starts.
   *
   * @param startPosition The position (in pixels) where the drag started.
   */
  onDragStart?: (startPosition: Point.Point) => void

  /**
   * Handler invoked when dragging.
   *
   * @param displacement The displacement (in pixels) since the last emitted
   *                     drag move event.
   * @param currentPosition The position (in pixels) where the drag is currently
   *                        at.
   * @param startPosition The position (in pixels) where the drag started.
   */
  onDragMove?: (displacement: Point.Point, currentPosition: Point.Point, startPosition: Point.Point) => void

  /**
   * Handler invoked when dragging ends.
   *
   * @param displacement The displacement (in pixels) since the last emitted
   *                     drag move event.
   * @param endPosition The position (in pixels) where the drag ended.
   * @param startPosition The position (in pixels) where the drag started.
   */
  onDragEnd?: (displacement: Point.Point, endPosition: Point.Point, startPosition: Point.Point) => void
}

/**
 * Hook for adding dragging interaction to an element.
 *
 * While touch or pen input is handled, `touch-action` is set to `none` on the
 * element so the browser does not scroll instead.
 *
 * @param target The target element or reference
 * @param options Additional options.
 */
export function useDrag(
  target: Target,
  {
    pointerTypes,
    isEnabled = true,
    shouldUpdateCursor = true,
    onDragEnd,
    onDragMove,
    onDragStart,
  }: UseDragOptions,
) {
  const dragStartHandlerRef = useLatest(onDragStart)
  const dragMoveHandlerRef = useLatest(onDragMove)
  const dragEndHandlerRef = useLatest(onDragEnd)
  const pointerTypesRef = useLatest(pointerTypes)

  useLayoutEffect(() => {
    const element = target && 'current' in target ? target.current : target
    if (!element || !isEnabled || !shouldUpdateCursor) return

    const defaultCursor = element.style.cursor
    element.style.cursor = 'grab'

    return () => {
      element.style.cursor = defaultCursor
    }
  }, [target && 'current' in target ? target.current : target, isEnabled, shouldUpdateCursor])

  // Touch and pen gestures pan the page by default, which cancels the pointer
  // mid-drag. Disable that while those pointer types are handled.
  const handlesTouch = !pointerTypes || pointerTypes.includes('touch') || pointerTypes.includes('pen')

  useLayoutEffect(() => {
    const element = target && 'current' in target ? target.current : target
    if (!element || !isEnabled || !handlesTouch) return

    const defaultTouchAction = element.style.touchAction
    element.style.touchAction = 'none'

    return () => {
      element.style.touchAction = defaultTouchAction
    }
  }, [target && 'current' in target ? target.current : target, isEnabled, handlesTouch])

  useLayoutEffect(() => {
    const element = target && 'current' in target ? target.current : target
    if (!element || !isEnabled) return

    let pointerId: number | undefined
    let isDragging = false
    let startPosition = Point.zero
    let dragPosition = Point.zero

    const pointerDownListener = (event: PointerEvent) => {
      if (pointerId !== undefined) return
      if (event.pointerType === 'mouse' && event.button !== 0) return

      const types = pointerTypesRef.current
      if (types && !types.includes(event.pointerType as any)) return

      pointerId = event.pointerId
      startPosition = Point.make(event.clientX, event.clientY)
      dragPosition = startPosition

      element.setPointerCapture(event.pointerId)
    }

    const pointerMoveListener = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return

      const position = Point.make(event.clientX, event.clientY)

      if (!isDragging) {
        if (Math.hypot(position.x - startPosition.x, position.y - startPosition.y) <= MOVE_TOLERANCE_PX) return

        isDragging = true

        if (shouldUpdateCursor) element.style.cursor = 'grabbing'

        dragStartHandlerRef.current?.(startPosition)
      }

      const displacement = Point.subtract(position, dragPosition)

      dragPosition = position

      dragMoveHandlerRef.current?.(displacement, position, startPosition)
    }

    const pointerUpListener = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return

      pointerId = undefined

      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
      if (!isDragging) return

      isDragging = false

      if (shouldUpdateCursor) element.style.cursor = 'grab'

      const position = Point.make(event.clientX, event.clientY)
      const displacement = Point.subtract(dragPosition, position)

      dragEndHandlerRef.current?.(displacement, position, startPosition)
    }

    // Cancel the compatibility `mousedown` (rather than `pointerdown`) of a
    // tracked press to prevent text selection and native dragging.
    const mouseDownListener = (event: MouseEvent) => {
      if (pointerId === undefined) return

      event.preventDefault()
    }

    element.addEventListener('pointerdown', pointerDownListener)
    element.addEventListener('pointermove', pointerMoveListener)
    element.addEventListener('pointerup', pointerUpListener)
    element.addEventListener('pointercancel', pointerUpListener)
    element.addEventListener('mousedown', mouseDownListener)

    return () => {
      element.removeEventListener('pointerdown', pointerDownListener)
      element.removeEventListener('pointermove', pointerMoveListener)
      element.removeEventListener('pointerup', pointerUpListener)
      element.removeEventListener('pointercancel', pointerUpListener)
      element.removeEventListener('mousedown', mouseDownListener)

      if (pointerId !== undefined && element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId)
      }

      if (isDragging) {
        dragEndHandlerRef.current?.(Point.zero, dragPosition, startPosition)
      }
    }
  }, [target && 'current' in target ? target.current : target, isEnabled, shouldUpdateCursor])
}
