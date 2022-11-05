import equal from 'fast-deep-equal'
import interact from 'interactjs'
import { DependencyList, Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react'

// Const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:hooks') : () => {}

type ReturnedStates<T> = {
  isDragging: [boolean, Dispatch<SetStateAction<boolean>>]
  value: [T, Dispatch<SetStateAction<T>>]
}

type Options<T> = Omit<Parameters<Interact.Interactable['draggable']>[0], 'onstart' | 'onmove' | 'onend'> & {
  /**
   * The initial associated value of this hook.
   */
  initialValue: T

  /**
   * A function that transforms the drag move delta values to the associated value of this hook.
   *
   * @param currentValue - The current associated value.
   * @param dx - The displacement on the x-axis (in pixels) since the last emitted drag move event.
   * @param dy - The displacement on the y-axis (in pixels) since the last emitted drag move event.
   *
   * @returns The transformed value.
   */
  transform: (currentValue: T, dx: number, dy: number) => T

  /**
   * Handler invoked when dragging starts.
   */
  onDragStart?: () => void

  /**
   * Handler invoked when dragging.
   *
   * @param dx - The displacement on the x-axis (in pixels) since the last emitted drag move event.
   * @param dy - The displacement on the y-axis (in pixels) since the last emitted drag move event.
   */
  onDragMove?: (dx: number, dy: number) => void

  /**
   * Handler invoked when dragging ends.
   */
  onDragEnd?: () => void
}

/**
 * Hook for adding effectful dragging interaction to an element.
 *
 * @param targetRef - The reference to the target element to add drag interaction to.
 * @param options - Additional options which include options for `module:interactjs.draggable`.
 * @param deps - Dependencies that trigger this effect.
 *
 * @returns The states created for this effect.
 */
export default function useDragEffect<T = [number, number]>(targetRef: RefObject<HTMLElement>, {
  initialValue,
  transform,
  onDragStart,
  onDragMove,
  onDragEnd,
  ...options
}: Options<T>, deps?: DependencyList): ReturnedStates<T> {
  /**
   * Sets the current associated value reference. This reference object is equal to the `value`
   * state but differs slightly in how they are set. Because states are asynchronous by nature, this
   * reference object is used to cache time-sensitive value changes while drag event happens.
   *
   * @param value - The value to set the associated value to.
   *
   * @returns `true` if the value was set, `false` otherwise.
   */
  const setValueRef = (value: T): boolean => {
    if (equal(valueRef.current, value)) return false
    valueRef.current = value

    return true
  }

  const valueRef = useRef<T>(initialValue)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [value, setValue] = useState(valueRef.current)

  useEffect(() => {
    // Debug(`Using drag effect for element ${targetRef.current}...`, 'OK', `value=${valueRef.current}`)

    if (targetRef.current && !interact.isSet(targetRef.current)) {
      // Do not consume states in these listeners as they will remain their initial values within
      // The scope of the listeners.
      interact(targetRef.current).draggable({
        inertia: true,
        ...options,
        onstart: () => {
          setIsDragging(true)
          onDragStart?.()
        },
        onmove: ({ dx, dy }) => {
          const newValue = transform(valueRef.current, dx, dy)

          if (setValueRef(newValue)) {
            // Debug('Updating value from dragging...', 'OK', newValue)
            setValue(newValue)
          }

          onDragMove?.(dx, dy)
        },
        onend: () => {
          setIsDragging(false)
          onDragEnd?.()
        },
      })
    }

    return () => {
      // Debug(`Removing drag effect for element ${targetRef.current}...`, 'OK', `value=${valueRef.current}`)

      if (targetRef.current && interact.isSet(targetRef.current)) {
        interact(targetRef.current).unset()
      }
    }
  }, [...deps ? deps : []])

  useEffect(() => {
    if (setValueRef(value)) {
      // Debug('Updating value from externally...', 'OK', value)
    }
  }, [value])

  return {
    isDragging: [isDragging, setIsDragging],
    value: [value, setValue],
  }
}
