import { useLayoutEffect, useRef } from 'react'

import { ImageSource } from '../types/ImageSource.js'
import { useLatest } from './useLatest.js'

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
  onLoad?: (element: HTMLImageElement) => void

  /**
   * Handler invoked when there is an error loading the image.
   *
   * @param element The target image element.
   */
  onError?: (element: HTMLImageElement) => void
}

/**
 * Hook for preloading an image.
 *
 * @param source Either a string URL or a tuple of the form `[src,
 *               ImageSource]`, where `src` is a fallback image URL and
 *               `ImageSource` provides additional information for responsive
 *               images. If a tuple is provided, the `src` will be used as the
 *               `src` attribute of the `<img>` element, while the properties of
 *               `ImageSource` will be used to set the `sizes` and `srcSet`
 *               attributes.
 * @param options See {@link UseImageLoaderOptions}.
 */
export function useImageLoader(
  source: [string, Omit<ImageSource, 'media' | 'type'>] | string,
  { onError, onLoad, onLoadStart }: UseImageLoaderOptions = {},
) {
  const fallbackSrc = typeof source === 'string' ? source : source[0]
  const imageSource = typeof source === 'string' ? undefined : source[1]
  const resolvedImageSource = imageSource ? ImageSource.asProps(imageSource) : undefined

  const imageRef = useRef<HTMLImageElement>(undefined)
  const loadStartHandlerRef = useLatest(onLoadStart)
  const loadCompleteHandlerRef = useLatest(onLoad)
  const loadErrorHandlerRef = useLatest(onError)

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

    if (resolvedImageSource?.srcSet) image.srcset = resolvedImageSource.srcSet
    if (resolvedImageSource?.sizes) image.sizes = resolvedImageSource.sizes
    image.src = fallbackSrc

    imageRef.current = image

    return () => {
      cancelled = true

      image.removeEventListener('load', loadListener)
      image.removeEventListener('error', errorListener)
      imageRef.current = undefined
    }
  }, [fallbackSrc, resolvedImageSource?.srcSet, resolvedImageSource?.sizes])
}
