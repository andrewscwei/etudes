import { useLayoutEffect, useRef } from 'react'
import { useLatest } from './useLatest.js'

/**
 * Type describing the parameters of {@link useImageLoader}.
 */
export type UseImageLoaderParams = {
  /**
   * `src` attribute of the image.
   */
  src?: string

  /**
   * `srcset` attribute of the image.
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
export function useImageLoader({
  src,
  srcSet,
  sizes,
}: UseImageLoaderParams, {
  onLoadStart,
  onLoadComplete,
  onLoadError,
}: UseImageLoaderOptions = {}) {
  const imageRef = useRef<HTMLImageElement>(undefined)
  const loadStartHandlerRef = useLatest(onLoadStart)
  const loadCompleteHandlerRef = useLatest(onLoadComplete)
  const loadErrorHandlerRef = useLatest(onLoadError)

  useLayoutEffect(() => {
    const imageLoadCompleteHandler = (event: Event) => {
      const element = event.currentTarget as HTMLImageElement

      loadCompleteHandlerRef.current?.(element)
    }

    const imageLoadErrorHandler = (event: Event) => {
      const element = event.currentTarget as HTMLImageElement

      loadErrorHandlerRef.current?.(element)
    }

    imageRef.current = new Image()
    if (src) imageRef.current.src = src
    if (srcSet) imageRef.current.srcset = srcSet
    if (sizes) imageRef.current.sizes = sizes

    loadStartHandlerRef.current?.(imageRef.current)

    imageRef.current.addEventListener('load', imageLoadCompleteHandler)
    imageRef.current.addEventListener('error', imageLoadErrorHandler)

    return () => {
      imageRef.current?.removeEventListener('load', imageLoadCompleteHandler)
      imageRef.current?.removeEventListener('error', imageLoadErrorHandler)
      imageRef.current = undefined
    }
  }, [src, srcSet, sizes])
}
