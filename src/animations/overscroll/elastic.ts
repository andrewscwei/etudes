/**
 * Elastic effect for overscroll behavior.
 *
 * @param value The current value that may be outside the bounds defined by min
 *              and max.
 * @param min The minimum bound.
 * @param max The maximum bound.
 * @param resistance The resistance factor (between 0 and 1) that determines how
 *                   much the value is pulled back towards the bounds when it
 *                   exceeds them. A value of 0 means no resistance (the value
 *                   can go infinitely), while a value of 1 means full
 *                   resistance (the value cannot exceed the bounds).
 *
 * @returns The adjusted value that applies the elastic effect when the input
 *          value exceeds the specified bounds.
 */
export function elastic(value: number, min: number, max: number, resistance: number): number {
  const factor = 1 - resistance

  if (value > max) return max + (value - max) * factor
  if (value < min) return min + (value - min) * factor

  return value
}
