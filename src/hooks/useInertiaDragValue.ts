import type { Point } from 'spase'

import isDeepEqual from 'fast-deep-equal/react'
import { type Dispatch, type RefObject, type SetStateAction, useEffect, useRef, useState } from 'react'

import { useInertiaDrag } from './useInertiaDrag.js'
import { useLatest } from './useLatest.js'

/**
 * Type describing the output of {@link useInertiaDragValue}.
 */
export type UseDragValueOutput<T = [number, number]> = {
  /**
   * Indicates whether the drag is currently happening.
   */
  isDragging: boolean

  /**
   * Indicates whether the drag is currently being released.
   */
  isReleasing: boolean

  /**
   * The current associated value of this hook.
   */
  value: T

  /**
   * A function that sets the current associated value of this hook.
   *
   * @param value The new associated value.
   */
  setValue: Dispatch<SetStateAction<T>>
}

/**
 * Type describing the options of {@link useInertiaDragValue}.
 */
export type UseDragValueOptions<T = [number, number]> = {
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
} & Parameters<typeof useInertiaDrag>[1]

/**
 * Hook for adding dragging interaction to an element.
 *
 * @param target The target element or reference to add drag interaction to.
 * @param options Additional options.
 *
 * @returns The states created for this effect.
 */
export function useInertiaDragValue<T = [number, number]>(
  target: HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined,
  {
    initialValue,
    transform,
    onDragEnd,
    onDragMove,
    onDragStart,
    ...options
  }: UseDragValueOptions<T>,
): UseDragValueOutput<T> {
  const valueRef = useRef<T>(initialValue)
  const [isDragging, setIsDragging] = useState(false)
  const [isReleasing, setIsReleasing] = useState(false)
  const [value, setValue] = useState(initialValue)

  const dragStartHandlerRef = useLatest(onDragStart)
  const dragMoveHandlerRef = useLatest(onDragMove)
  const dragEndHandlerRef = useLatest(onDragEnd)
  const transformRef = useLatest(transform)

  const dragStartHandler = (startPosition: Point) => {
    setIsDragging(true)
    setIsReleasing(false)

    dragStartHandlerRef.current?.(startPosition)
  }

  const dragMoveHandler = (displacement: Point, currentPosition: Point, startPosition: Point) => {
    const newValue = transformRef.current(valueRef.current, displacement.x, displacement.y)

    if (_setValueRef(valueRef, newValue)) {
      setValue(newValue)
    }

    setIsDragging(true)
    setIsReleasing(false)

    dragMoveHandlerRef.current?.(displacement, currentPosition, startPosition)
  }

  const dragEndHandler = (endPosition: Point, startPosition: Point) => {
    setIsDragging(false)
    setIsReleasing(true)

    dragEndHandlerRef.current?.(endPosition, startPosition)
  }

  useInertiaDrag(target, {
    onDragEnd: dragEndHandler,
    onDragMove: dragMoveHandler,
    onDragStart: dragStartHandler,
    ...options,
  })

  useEffect(() => {
    _setValueRef(valueRef, value)
  }, [value])

  return {
    setValue,
    value,
    isDragging,
    isReleasing,
  }
}

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
function _setValueRef<T>(ref: RefObject<T>, value: T): boolean {
  if (isDeepEqual(ref.current, value)) return false
  ref.current = value

  return true
}
