import interact from 'interactjs'
import { useLayoutEffect, type RefObject } from 'react'
import { Point } from 'spase'
import { createKey } from '../utils/createKey.js'

type InteractDraggableOptions = Parameters<Interact.Interactable['draggable']>[0]

type Options = Omit<InteractDraggableOptions, 'onstart' | 'onmove' | 'onend'> & {
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
   */
  onDragMove?: (displacement: Point) => void

  /**
   * Handler invoked when dragging ends.
   */
  onDragEnd?: (endPosition: Point) => void
}

/**
 * Hook for adding dragging interaction to an element.
 *
 * @param targetRef The reference to the target element to add drag interaction
 *                  to.
 * @param options Additional options which include options for
 *                `module:interactjs.draggable`.
 *
 * @returns The states created for this effect.
 */
export function useInteractiveDrag(targetRef: RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>, {
  isEnabled = true,
  onDragStart,
  onDragMove,
  onDragEnd,
  ...options
}: Options) {
  useLayoutEffect(() => {
    if (!isEnabled) return

    const el = targetRef.current
    if (!el) return

    const interactable = interact(el).draggable({
      inertia: true,
      ...options,
      onstart: ({ client }) => onDragStart?.(Point.make(client)),
      onmove: event => onDragMove?.(Point.make(event.dx, event.dy)),
      onend: ({ client }) => onDragEnd?.(Point.make(client)),
    })

    return () => {
      interactable.unset()

      onDragEnd?.(Point.make())
    }
  }, [targetRef.current, isEnabled, onDragStart, onDragMove, onDragEnd, createKey(options)])
}
