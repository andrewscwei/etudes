import interact from 'interactjs'
import _ from 'lodash'
import { DependencyList, Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react'

const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:hooks') : () => {}

type ReturnedStates<T> = {
  isDragging: [boolean, Dispatch<SetStateAction<boolean>>]
  value: [T, Dispatch<SetStateAction<T>>]
}

type Options<T> = Omit<Interact.DraggableOptions, 'onstart' | 'onmove' | 'onend'> & {
  /**
   * The initial associated value of this hook.
   */
  initialValue: T

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

  /**
   * A function that transforms the drag move delta values to the associated value of this hook.
   *
   * @param currentValue - The current associated value.
   * @param dx - The displacement on the x-axis (in pixels) since the last emitted drag move event.
   * @param dy - The displacement on the y-axis (in pixels) since the last emitted drag move event.
   *
   * @returns The transformed value.
   */
  transform?: (currentValue: T, dx: number, dy: number) => T
}

/**
 * Hook for adding effectful dragging interaction to an element.
 *
 * @param targetRef - The reference to the target element to add drag interaction to.
 * @param options - Additional options which include options for `module:interactjs.draggable`.
 * @param deps - Dependencies that trigger this effect.
 *
 * @returns The states created for this effect.
 *
 * @requires react
 * @requires spase
 * @requires interactjs
 */
export default function useDragEffect<T = [number, number]>(targetRef: RefObject<HTMLElement>, { onDragStart, onDragMove, onDragEnd, initialValue, transform, ...options }: Options<T>, deps?: DependencyList): ReturnedStates<T> {
  const valueRef = useRef<T>(initialValue)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [value, setValue] = useState(valueRef.current)

  /**
   * Sets the current associated value reference. This reference object is equal to the `value`
   * state but differs slightly in how they are set. Because states are asynchronous by nature, this
   * reference object is used to cache time-sensitive value changes while drag event happens.
   *
   * @param value - The value to set the associated value to.
   *
   * @returns `true` if the value was set, `false` otherwise.
   */
  function setValueRef(value: T): boolean {
    if (_.isEqual(valueRef.current, value)) return false
    valueRef.current = value
    return true
  }

  useEffect(() => {
    // debug(`Using drag effect for element ${targetRef.current}...`, 'OK', `value=${valueRef.current}`)

    if (targetRef.current && !interact.isSet(targetRef.current)) {
      // Do not consume states in these listeners as they will remain their initial values within
      // the scope of the listeners.
      interact(targetRef.current).draggable({
        inertia: true,
        ...options,
        onstart: () => {
          console.log('started')
          setIsDragging(true)
          onDragStart?.()
        },
        onmove: ({ dx, dy }) => {
          const newValue = transform?.(valueRef.current, dx, dy) ?? [dx, dy] as unknown as T

          if (setValueRef(newValue)) {
            // debug('Updating value from dragging...', 'OK', newValue)
            setValue(newValue)
          }

          onDragMove?.(dx, dy)
        },
        onend: () => {
          console.log('stopped')
          setIsDragging(false)
          onDragEnd?.()
        },
      })
    }

    return () => {
      // debug(`Removing drag effect for element ${targetRef.current}...`, 'OK', `value=${valueRef.current}`)

      if (targetRef.current && interact.isSet(targetRef.current)) {
        interact(targetRef.current).unset()
      }
    }
  }, [...deps ? deps : []])

  useEffect(() => {
    if (setValueRef(value)) {
      // debug('Updating value from externally...', 'OK', value)
    }
  }, [value])

  return {
    isDragging: [isDragging, setIsDragging],
    value: [value, setValue],
  }
}
