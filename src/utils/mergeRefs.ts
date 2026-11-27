import type { Ref, RefCallback } from 'react'

/**
 * Merges multiple refs into a single callback ref.
 *
 * @param refs The refs to merge.
 *
 * @returns A callback ref that forwards the node to every given ref.
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return node => {
    const cleanups = refs.map(ref => {
      if (typeof ref === 'function') {
        const cleanup = ref(node)

        return typeof cleanup === 'function' ? cleanup : () => ref(null)
      } else if (ref) {
        ref.current = node

        return () => {
          ref.current = null
        }
      }

      return undefined
    })

    return () => {
      cleanups.forEach(cleanup => cleanup?.())
    }
  }
}
