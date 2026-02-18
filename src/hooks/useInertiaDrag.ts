import interact from 'interactjs'
import { type RefObject, useLayoutEffect } from 'react'
import { Point } from 'spase'

import { createKey } from '../utils/createKey.js'
import { useLatest } from './useLatest.js'

type InteractDraggableOptions = Parameters<Interact.Interactable['draggable']>[0]

/**
 * Type describing the options of {@link useInertiaDrag}.
 */
export type UseInertiaDragOptions = {
  /**
   * Specifies whether this effect is enabled.
   */
  isEnabled?: boolean

  /**
   * Handler invoked when dragging starts.
   */
  onDragStart?: (startPosition: Point) => void

  /**
   * Handler invoked when dragging.
   *
   * @param displacement The displacement (in pixels) since the last emitted
   *                     drag move event.
   * @param currentPosition The position (in pixels) where the drag is
   *                        currently at.
   * @param startPosition The position (in pixels) where the drag started.
   */
  onDragMove?: (displacement: Point, currentPosition: Point, startPosition: Point) => void

  /**
   * Handler invoked when dragging ends.
   *
   * @param endPosition The position (in pixels) where the drag ended.
   * @param startPosition The position (in pixels) where the drag started.
   */
  onDragEnd?: (endPosition: Point, startPosition: Point) => void
} & Omit<InteractDraggableOptions, 'onend' | 'onmove' | 'onstart'>

/**
 * Hook for adding dragging interaction to an element.
 *
 * @param target The reference to the target element to add drag interaction
 *                  to.
 * @param options Additional options which include options for
 *                `module:interactjs.draggable`.
 *
 * @returns The states created for this effect.
 */
export function useInertiaDrag(
  target: HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined,
  {
    isEnabled = true,
    onDragEnd,
    onDragMove,
    onDragStart,
    ...options
  }: UseInertiaDragOptions,
) {
  const dragStartHandlerRef = useLatest(onDragStart)
  const dragMoveHandlerRef = useLatest(onDragMove)
  const dragEndHandlerRef = useLatest(onDragEnd)

  useLayoutEffect(() => {
    if (!isEnabled) return

    const element = target && 'current' in target ? target.current : target
    if (!element) return

    const interactable = interact(element).draggable({
      inertia: true,
      ...options,
      onend: ({ client, clientX0, clientY0 }) => {
        const startPosition = Point.make(clientX0, clientY0)
        const endPosition = Point.make(client)

        dragEndHandlerRef.current?.(endPosition, startPosition)
      },
      onmove: ({ client, clientX0, clientY0, dx, dy }) => {
        const startPosition = Point.make(clientX0, clientY0)
        const currentPosition = Point.make(client)
        const displacement = Point.make(dx, dy)

        dragMoveHandlerRef.current?.(displacement, currentPosition, startPosition)
      },
      onstart: ({ client }) => {
        const startPosition = Point.make(client)

        dragStartHandlerRef.current?.(startPosition)
      },
    })

    return () => {
      interactable.unset()

      dragEndHandlerRef.current?.(Point.zero, Point.zero)
    }
  }, [target, isEnabled, createKey(options)])
}
