import { useCallback, useState } from 'react'
import { Size } from 'spase'

import { type ImageSource } from '../types/ImageSource.js'
import { useImageLoader, type UseImageLoaderOptions } from './useImageLoader.js'
import { useLatest } from './useLatest.js'

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
 * @param source Either a string URL or a tuple of the form `[src,
 *               ImageSource]`, where `src` is a fallback image URL and
 *               `ImageSource` provides additional information for responsive
 *               images. If a tuple is provided, the `src` will be used as the
 *               `src` attribute of the `<img>` element, while the properties of
 *               `ImageSource` will be used to set the `sizes` and `srcSet`
 *               attributes.
 * @param options See {@link UseImageSizeOptions}.
 *
 * @returns The actual size of the image if loading was successful, `undefined`
 *          otherwise.
 */
export function useImageSize(
  source?: [string, Omit<ImageSource, 'media' | 'type'>] | string,
  {
    preservesSizeBetweenLoads = true,
    onError,
    onLoad,
    onLoadStart,
  }: UseImageSizeOptions = {},
): Size.Size | undefined {
  const [size, setSize] = useState<Size.Size | undefined>()
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

  useImageLoader(source, {
    onError: loadErrorHandler,
    onLoad: loadCompleteHandler,
    onLoadStart: loadStartHandler,
  })

  return size
}

function _getSize(element?: HTMLImageElement): Size.Size | undefined {
  if (!element) return undefined
  if (typeof element.width !== 'number') return undefined
  if (typeof element.height !== 'number') return undefined

  return Size.make(element.width, element.height)
}
