import isDeepEqual from 'fast-deep-equal/react'
import { useCallback, useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from 'react'
import type { Point } from 'spase'
import { useInteractiveDrag } from './useInteractiveDrag.js'

type Output<T> = {
  isDragging: boolean
  isReleasing: boolean
  value: T
  setValue: Dispatch<SetStateAction<T>>
}

type Options<T> = Parameters<typeof useInteractiveDrag>[1] & {
  /**
   * The initial associated value of this hook.
   */
  initialValue: T

  /**
   * A function that transforms the drag move delta values to the associated
   * value of this hook.
   *
   * @param currentValue The current associated value.
   * @param dx The displacement on the x-axis (in pixels) since the last emitted
   *           drag move event.
   * @param dy The displacement on the y-axis (in pixels) since the last emitted
   *           drag move event.
   *
   * @returns The transformed value.
   */
  transform: (currentValue: T, dx: number, dy: number) => T
}

/**
 * Hook for adding dragging interaction to an element.
 *
 * @param targetRef The reference to the target element to add drag interaction
 *                  to.
 * @param options Additional options.
 *
 * @returns The states created for this effect.
 */
export function useDragValue<T = [number, number]>(targetRef: RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>, {
  initialValue,
  transform,
  onDragStart,
  onDragMove,
  onDragEnd,
  ...options
}: Options<T>): Output<T> {
  /**
   * Sets the current associated value reference. This reference object is equal
   * to the `value` state but differs slightly in how they are set. Because
   * states are asynchronous by nature, this reference object is used to cache
   * time-sensitive value changes while drag event happens.
   *
   * @param value The value to set the associated value to.
   *
   * @returns `true` if the value was set, `false` otherwise.
   */
  const setValueRef = (value: T): boolean => {
    if (isDeepEqual(valueRef.current, value)) return false
    valueRef.current = value

    return true
  }

  const valueRef = useRef<T>(initialValue)
  const [isDragging, setIsDragging] = useState(false)
  const [isReleasing, setIsReleasing] = useState(false)
  const [value, setValue] = useState(initialValue)

  const dragStartHandler = useCallback((startPosition: Point) => {
    setIsDragging(true)
    setIsReleasing(false)

    onDragStart?.(startPosition)
  }, [onDragStart])

  const dragMoveHandler = useCallback((displacement: Point) => {
    const newValue = transform(valueRef.current, displacement.x, displacement.y)

    if (setValueRef(newValue)) {
      setValue(newValue)
    }

    setIsDragging(true)
    setIsReleasing(false)

    onDragMove?.(displacement)
  }, [transform, onDragMove])

  const dragEndHandler = useCallback((endPosition: Point) => {
    setIsDragging(false)
    setIsReleasing(true)

    onDragEnd?.(endPosition)
  }, [onDragEnd])

  useInteractiveDrag(targetRef, {
    onDragStart: dragStartHandler,
    onDragMove: dragMoveHandler,
    onDragEnd: dragEndHandler,
    ...options,
  })

  useEffect(() => {
    setValueRef(value)
  }, [value])

  return {
    isDragging,
    isReleasing,
    value,
    setValue,
  }
}
