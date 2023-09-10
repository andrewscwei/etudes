import { useEffect, useRef, useState, type DependencyList, type Dispatch, type RefObject, type SetStateAction } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { Rect, Size } from 'spase'

type Options = {
  /**
   * Handler invoked when the target element resizes.
   *
   * @param size The current size of the target element.
   */
  onResize?: (size: Size) => void
}

/**
 * Hook for monitoring the resizing event of the target element.
 *
 * @param targetRef Reference to the target element.
 * @param options See {@link Options}.
 * @param deps Additional dependencies.
 *
 * @returns A tuple consisting of a stateful value indicating the size of the
 *          target ref, and a function that sets its size.
 */
export default function useResizeEffect(targetRef: RefObject<Element>, { onResize }: Options = {}, deps?: DependencyList): [Size, Dispatch<SetStateAction<Size>>] {
  const observerRef = useRef<ResizeObserver | undefined>(undefined)
  const [size, setSize] = useState<Size>(new Size())

  useEffect(() => {
    observerRef.current = new ResizeObserver(() => {
      const rect = Rect.from(targetRef.current)

      if (!rect) return

      const newSize = rect.size

      setSize(newSize)
      onResize?.(newSize)
    })

    if (observerRef.current && targetRef.current) {
      observerRef.current.observe(targetRef.current)
    }

    return () => {
      if (observerRef.current && targetRef.current) {
        observerRef.current.unobserve(targetRef.current)
      }
    }
  }, [targetRef, ...deps ? deps : []])

  return [size, setSize]
}
