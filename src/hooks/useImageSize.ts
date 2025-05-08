import { useCallback, useState } from 'react'
import { Size } from 'spase'
import { useImageLoader, type UseImageLoaderOptions, type UseImageLoaderParams } from './useImageLoader.js'

/**
 * Type describing the parameters of {@link useImageSize}.
 */
export type UseImageSizeParams = UseImageLoaderParams

/**
 * Type describing the options of {@link useImageSize}.
 */
export type UseImageSizeOptions = UseImageLoaderOptions & {
  /**
   * If `false`, the size will be reset to `undefined` when the image begins
   * loading or when an error occurs. Defaults to `true`.
   */
  preservesSizeBetweenLoads?: boolean
}

/**
 * Hook for retrieving the size of an image.
 *
 * @param params See {@link UseImageSizeParams}.
 * @param options See {@link UseImageSizeOptions}.
 *
 * @returns The actual size of the image if loading was successful, `undefined`
 *          otherwise.
 */
export function useImageSize({
  src,
  srcSet,
  sizes,
}: UseImageSizeParams, {
  preservesSizeBetweenLoads = true,
  onLoadStart,
  onLoadComplete,
  onLoadError,
}: UseImageSizeOptions = {}): Size | undefined {
  const [imageSize, setImageSize] = useState<Size | undefined>()

  const loadHandler = useCallback((element: HTMLImageElement) => {
    if (!preservesSizeBetweenLoads) setImageSize(undefined)

    onLoadStart?.(element)
  }, [onLoadStart])

  const loadCompleteHandler = useCallback((element: HTMLImageElement) => {
    setImageSize(getSize(element))

    onLoadComplete?.(element)
  }, [onLoadComplete])

  const loadErrorHandler = useCallback((element: HTMLImageElement) => {
    if (!preservesSizeBetweenLoads) setImageSize(undefined)

    onLoadError?.(element)
  }, [onLoadError])

  useImageLoader({ src, srcSet, sizes }, {
    onLoadStart: loadHandler,
    onLoadComplete: loadCompleteHandler,
    onLoadError: loadErrorHandler,
  })

  return imageSize
}

function getSize(element?: HTMLImageElement): Size | undefined {
  if (!element) return undefined
  if (typeof element.width !== 'number') return undefined
  if (typeof element.height !== 'number') return undefined

  return Size.make(element.width, element.height)
}
