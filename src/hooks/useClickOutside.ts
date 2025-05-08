import { useCallback, useEffect, type RefObject } from 'react'

type TargetRef = RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>

/**
 * Hook for adding click outside interaction to an element.
 *
 * @param targetRef The reference to the target element to add click outside
 *                  interaction to.
 * @param onClickOutside The handler to call when a click outside the target
 *                       element is detected.
 */
export function useClickOutside(
  targetRef: TargetRef | TargetRef[],
  onClickOutside: () => void,
) {
  const clickOutsideHandler = useCallback((event: MouseEvent) => {
    if (!(event.target instanceof Node)) return

    let isOutside = true
    let node = event.target

    const targetRefs = ([] as TargetRef[]).concat(targetRef)
    const targetNodes = targetRefs.map(ref => ref.current)

    while (node) {
      if (targetNodes.find(t => t === node)) {
        isOutside = false
        break
      }

      if (!node.parentNode) break

      node = node.parentNode
    }

    if (!isOutside) return

    onClickOutside()
  }, [onClickOutside])

  useEffect(() => {
    window.addEventListener('click', clickOutsideHandler, true)

    return () => {
      window.removeEventListener('click', clickOutsideHandler, true)
    }
  }, [clickOutsideHandler])
}
