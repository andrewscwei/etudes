/**
 * Easing function that produces a constant speed animation.
 *
 * @param t A value in the range `[0, 1]` representing the normalized time of
 *          the animation.
 *
 * @returns The eased value corresponding to `t`.
 */
export function linear(t: number) {
  return t
}

/**
 * Easing function that accelerates into the middle and decelerates out of it.
 *
 * @param t A value in the range `[0, 1]` representing the normalized time of
 *          the animation.
 *
 * @returns The eased value corresponding to `t`.
 */
export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}
