import { useCallback, useState } from 'react'
import { Size } from 'spase'
import { useLatest } from './useLatest.js'
import { useVideoMetadataLoader, type UseVideoMetadataLoaderOptions } from './useVideoMetadataLoader.js'

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
export function useVideoSize(src?: string, {
  preservesSizeBetweenLoads = true,
  onLoadStart,
  onLoadComplete,
  onLoadError,
}: UseVideoSizeOptions = {}): Size | undefined {
  const [size, setSize] = useState<Size>()
  const loadStartHandlerRef = useLatest(onLoadStart)
  const loadCompleteHandlerRef = useLatest(onLoadComplete)
  const loadErrorHandlerRef = useLatest(onLoadError)

  const loadStartHandler = useCallback((element: HTMLVideoElement) => {
    if (!preservesSizeBetweenLoads) setSize(undefined)

    loadStartHandlerRef.current?.(element)
  }, [preservesSizeBetweenLoads])

  const loadCompleteHandler = useCallback((element: HTMLVideoElement) => {
    setSize(_getSize(element))

    loadCompleteHandlerRef.current?.(element)
  }, [])

  const loadErrorHandler = useCallback((element: HTMLVideoElement) => {
    if (!preservesSizeBetweenLoads) setSize(undefined)

    loadErrorHandlerRef.current?.(element)
  }, [preservesSizeBetweenLoads])

  useVideoMetadataLoader(src, {
    onLoadStart: loadStartHandler,
    onLoadComplete: loadCompleteHandler,
    onLoadError: loadErrorHandler,
  })

  return size
}

function _getSize(element?: HTMLVideoElement): Size | undefined {
  if (!element) return undefined
  if (typeof element.videoWidth !== 'number') return undefined
  if (typeof element.videoHeight !== 'number') return undefined

  return Size.make(element.videoWidth, element.videoHeight)
}
