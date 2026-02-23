import { useCallback, useState } from 'react'
import { Size } from 'spase'

import { useImageLoader, type UseImageLoaderOptions, type UseImageLoaderParams } from './useImageLoader.js'
import { useLatest } from './useLatest.js'

/**
 * Type describing the parameters of {@link useImageSize}.
 */
export type UseImageSizeParams = UseImageLoaderParams

/**
 * Type describing the options of {@link useImageSize}.
 */
export type UseImageSizeOptions = {
  /**
   * If `false`, the size will be reset to `undefined` when the image begins
   * loading or when an error occurs. Defaults to `true`.
   */
  preservesSizeBetweenLoads?: boolean
} & UseImageLoaderOptions

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
  sizes,
  src,
  srcSet,
}: UseImageSizeParams, {
  preservesSizeBetweenLoads = true,
  onError,
  onLoad,
  onLoadStart,
}: UseImageSizeOptions = {}): Size | undefined {
  const [size, setSize] = useState<Size | undefined>()
  const loadStartHandlerRef = useLatest(onLoadStart)
  const loadCompleteHandlerRef = useLatest(onLoad)
  const loadErrorHandlerRef = useLatest(onError)

  const loadStartHandler = useCallback((element: HTMLImageElement) => {
    if (!preservesSizeBetweenLoads) setSize(undefined)

    loadStartHandlerRef.current?.(element)
  }, [preservesSizeBetweenLoads])

  const loadCompleteHandler = useCallback((element: HTMLImageElement) => {
    setSize(_getSize(element))

    loadCompleteHandlerRef.current?.(element)
  }, [])

  const loadErrorHandler = useCallback((element: HTMLImageElement) => {
    if (!preservesSizeBetweenLoads) setSize(undefined)

    loadErrorHandlerRef.current?.(element)
  }, [preservesSizeBetweenLoads])

  useImageLoader({ sizes, src, srcSet }, {
    onError: loadErrorHandler,
    onLoad: loadCompleteHandler,
    onLoadStart: loadStartHandler,
  })

  return size
}

function _getSize(element?: HTMLImageElement): Size | undefined {
  if (!element) return undefined
  if (typeof element.width !== 'number') return undefined
  if (typeof element.height !== 'number') return undefined

  return Size.make(element.width, element.height)
}
