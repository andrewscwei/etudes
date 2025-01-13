import { useEffect, type DependencyList, type RefObject } from 'react'

type TargetRef = RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>

export function useClickOutsideEffect(
  targetRef: TargetRef | TargetRef[],
  handler: () => void,
  deps: DependencyList = [],
) {
  useEffect(() => {
    const clickOutsideHandler = (event: MouseEvent) => {
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

      handler()
    }

    window.addEventListener('click', clickOutsideHandler, true)

    return () => {
      window.removeEventListener('click', clickOutsideHandler, true)
    }
  }, [...deps])
}
