import { useCallback, useState } from 'react'
import { Size } from 'spase'
import { useVideoMetadataLoader, type UseVideoMetadataLoaderOptions, type UseVideoMetadataLoaderParams } from './useVideoMetadataLoader.js'

/**
 * Type describing the parameters of {@link useVideoSize}.
 */
export type UseVideoSizeParams = UseVideoMetadataLoaderParams

/**
 * Type describing the options of {@link useVideoSize}.
 */
type UseVideoSizeOptions = UseVideoMetadataLoaderOptions & {
  /**
   * If `false`, the size will be reset to `undefined` when the video begins
   * loading or when an error occurs. Defaults to `true`.
   */
  preservesSizeBetweenLoads?: boolean
}

/**
 * Hook for retrieving the size of a video.
 *
 * @param params See {@link UseVideoSizeParams}.
 * @param options See {@link UseVideoSizeOptions}.
 *
 * @returns The actual size of the video if loading was successful, `undefined`
 *          otherwise.
 */
export function useVideoSize({
  src,
}: UseVideoSizeParams, {
  preservesSizeBetweenLoads = true,
  onLoadStart,
  onLoadComplete,
  onLoadError,
}: UseVideoSizeOptions = {}): Size | undefined {
  const [size, setSize] = useState<Size | undefined>()

  const loadStartHandler = useCallback((element: HTMLVideoElement) => {
    if (!preservesSizeBetweenLoads) setSize(undefined)

    onLoadStart?.(element)
  }, [preservesSizeBetweenLoads, onLoadStart])

  const loadCompleteHandler = useCallback((element: HTMLVideoElement) => {
    setSize(getSize(element))

    onLoadComplete?.(element)
  }, [onLoadComplete])

  const loadErrorHandler = useCallback((element: HTMLVideoElement) => {
    if (!preservesSizeBetweenLoads) setSize(undefined)

    onLoadError?.(element)
  }, [preservesSizeBetweenLoads, onLoadError])

  useVideoMetadataLoader({ src }, {
    onLoadStart: loadStartHandler,
    onLoadComplete: loadCompleteHandler,
    onLoadError: loadErrorHandler,
  })

  return size
}

function getSize(element?: HTMLVideoElement): Size | undefined {
  if (!element) return undefined
  if (typeof element.videoWidth !== 'number') return undefined
  if (typeof element.videoHeight !== 'number') return undefined

  return Size.make(element.videoWidth, element.videoHeight)
}
