import { useLayoutEffect, useRef } from 'react'
import { useLatest } from './useLatest.js'

/**
 * Type describing the parameters of {@link useImageLoader}.
 */
export type UseImageLoaderParams = {
  /**
   * `src` attribute of the image.
   */
  src: string

  /**
   * `srcSet` attribute of the image.
   */
  srcSet?: string

  /**
   * `sizes` attribute of the image.
   */
  sizes?: string
}

/**
 * Type describing the options of {@link useImageLoader}.
 */
export type UseImageLoaderOptions = {
  /**
   * Handler invoked when the image starts loading.
   *
   * @param element The target image element.
   */
  onLoadStart?: (element: HTMLImageElement) => void

  /**
   * Handler invoked when the image is done loading.
   *
   * @param element The target image element.
   */
  onLoadComplete?: (element: HTMLImageElement) => void

  /**
   * Handler invoked when there is an error loading the image.
   *
   * @param element The target image element.
   */
  onLoadError?: (element: HTMLImageElement) => void
}

/**
 * Hook for preloading an image.
 *
 * @param params See {@link UseImageLoaderParams}.
 * @param options See {@link UseImageLoaderOptions}.
 */
export function useImageLoader(
  { src, srcSet, sizes }: UseImageLoaderParams,
  { onLoadStart, onLoadComplete, onLoadError }: UseImageLoaderOptions = {},
) {
  const imageRef = useRef<HTMLImageElement>(undefined)
  const loadStartHandlerRef = useLatest(onLoadStart)
  const loadCompleteHandlerRef = useLatest(onLoadComplete)
  const loadErrorHandlerRef = useLatest(onLoadError)

  useLayoutEffect(() => {
    let cancelled = false

    const loadListener = (event: Event) => {
      if (cancelled) return

      const element = event.currentTarget as HTMLImageElement
      loadCompleteHandlerRef.current?.(element)
    }

    const errorListener = (event: Event) => {
      if (cancelled) return

      const element = event.currentTarget as HTMLImageElement
      loadErrorHandlerRef.current?.(element)
    }

    const image = new Image()
    image.addEventListener('load', loadListener)
    image.addEventListener('error', errorListener)

    loadStartHandlerRef.current?.(image)

    if (srcSet) image.srcset = srcSet
    if (sizes) image.sizes = sizes
    image.src = src

    imageRef.current = image

    return () => {
      cancelled = true

      image.removeEventListener('load', loadListener)
      image.removeEventListener('error', errorListener)
      imageRef.current = undefined
    }
  }, [src, srcSet, sizes])
}
