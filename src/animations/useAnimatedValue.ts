import { useEffect, useRef, useState } from 'react'

import { linear } from './easing.js'

/**
 * Type describing the options of {@link useAnimatedValue}.
 */
export type UseAnimatedValueOptions = {
  /**
   * Duration of the animation in milliseconds.
   */
  duration: number

  /**
   * Easing function mapping `t` in `[0, 1]` to an eased value. Defaults to
   * linear.
   */
  easing?: (t: number) => number
}

/**
 * Type describing the output of {@link useAnimatedValue}.
 */
export type UseAnimatedValueOutput = {
  /**
   * The current value (updated each animation frame).
   */
  value: number

  /**
   * Snaps the value immediately, cancelling any in-flight animation.
   */
  setValue: (value: number) => void

  /**
   * Animates the value from its current state to `target` over the configured
   * duration, cancelling any in-flight animation.
   */
  animateTo: (target: number) => void

  /**
   * Cancels any in-flight animation, freezing the value at its current state.
   */
  cancel: () => void
}

/**
 * Hook for animating a numeric value over time using `requestAnimationFrame`.
 *
 * @param initialValue The initial value.
 * @param options See {@link UseAnimatedValueOptions}.
 *
 * @returns See {@link UseAnimatedValueOutput}.
 */
export function useAnimatedValue(
  initialValue: number,
  {
    duration,
    easing = linear,
  }: UseAnimatedValueOptions,
): UseAnimatedValueOutput {
  const [value, setValueState] = useState(initialValue)
  const animationRef = useRef<number>(undefined)

  const cancel = () => {
    if (animationRef.current === undefined) return

    cancelAnimationFrame(animationRef.current)
    animationRef.current = undefined
  }

  const setValue = (next: number) => {
    cancel()
    setValueState(next)
  }

  const animateTo = (target: number) => {
    cancel()

    const startValue = value
    const startTime = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration)
      const eased = easing(t)

      setValueState(startValue + (target - startValue) * eased)

      if (t < 1) {
        animationRef.current = requestAnimationFrame(tick)
      } else {
        animationRef.current = undefined
      }
    }

    animationRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => {
    if (animationRef.current !== undefined) {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return {
    animateTo,
    cancel,
    value,
    setValue,
  }
}
