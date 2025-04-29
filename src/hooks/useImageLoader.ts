import { useEffect, useRef, type DependencyList } from 'react'

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
 * @param deps Additional dependencies.
 */
export function useImageLoader({ src, srcSet, sizes }: UseImageLoaderParams, { onLoadStart, onLoadComplete, onLoadError }: UseImageLoaderOptions = {}, deps: DependencyList = []) {
  const imageLoadCompleteHandler = (event: Event) => {
    const element = event.currentTarget as HTMLImageElement

    onLoadComplete?.(element)
  }

  const imageLoadErrorHandler = (event: Event) => {
    const element = event.currentTarget as HTMLImageElement

    onLoadError?.(element)
  }

  const imageRef = useRef<HTMLImageElement | undefined>(undefined)

  useEffect(() => {
    imageRef.current = new Image()
    if (src) imageRef.current.src = src
    if (srcSet) imageRef.current.srcset = srcSet
    if (sizes) imageRef.current.sizes = sizes

    onLoadStart?.(imageRef.current)

    imageRef.current.addEventListener('load', imageLoadCompleteHandler)
    imageRef.current.addEventListener('error', imageLoadErrorHandler)

    return () => {
      imageRef.current?.removeEventListener('load', imageLoadCompleteHandler)
      imageRef.current?.removeEventListener('error', imageLoadErrorHandler)
      imageRef.current = undefined
    }
  }, [src, srcSet, sizes, ...deps])
}
