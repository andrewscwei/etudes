import { DependencyList, Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { Rect, Size } from 'spase'

const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:hooks') : () => {}

type Options = {
  onResize?: (size: Size) => void
}

export default function useResizeEffect(targetRef: RefObject<Element>, { onResize }: Options = {}, deps?: DependencyList): [Size, Dispatch<SetStateAction<Size>>] {
  const [size, setSize] = useState<Size>(new Size())
  const observerRef = useRef<ResizeObserver | undefined>(undefined)

  useEffect(() => {
    debug(`Using resize effect for element ${targetRef.current}...`, 'OK')

    observerRef.current = new ResizeObserver(() => {
      const rect = Rect.from(targetRef.current)

      if (!rect) return

      const size = rect.size

      debug(`Observing size change for element ${targetRef.current}...`, 'OK', size)

      setSize(size)
      onResize?.(size)
    })

    if (observerRef.current && targetRef.current) {
      observerRef.current.observe(targetRef.current)
    }

    return () => {
      debug(`Removing resize effect for element ${targetRef.current}...`, 'OK')

      if (observerRef.current && targetRef.current) {
        observerRef.current.unobserve(targetRef.current)
      }
    }
  }, [targetRef, ...deps ? deps : []])

  return [size, setSize]
}
