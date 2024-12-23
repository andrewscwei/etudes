import { useEffect, type DependencyList, type RefObject } from 'react'

export function useClickOutsideEffect(targetRef: RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>, handler: () => void, deps: DependencyList = []) {
  useEffect(() => {
    const clickOutsideHandler = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return

      let isOutside = true
      let node = event.target

      while (node) {
        if (node === targetRef.current) {
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
