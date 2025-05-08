import { useCallback, useEffect } from 'react'

/**
 * Type describing the parameters of {@link useVideoMetadataLoader}.
 */
export type UseVideoMetadataLoaderParams = {
  /**
   * `src` attribute of the video.
   */
  src?: string
}

/**
 * Type describing the options of {@link useVideoMetadataLoader}.
 */
export type UseVideoMetadataLoaderOptions = {
  /**
   * Handler invoked when the video metadata starts loading.
   *
   * @param element The target video element.
   */
  onLoadStart?: (element: HTMLVideoElement) => void

  /**
   * Handler invoked when the video is done loading its metadata.
   *
   * @param element The target video element.
   */
  onLoadComplete?: (element: HTMLVideoElement) => void

  /**
   * Handler invoked when there is an error loading the video metadata.
   *
   * @param element The target video element.
   */
  onLoadError?: (element: HTMLVideoElement) => void
}

/**
 * Hook for retrieving the size of a video.
 *
 * @param params See {@link UseVideoMetadataLoaderParams}.
 * @param options See {@link UseVideoMetadataLoaderOptions}.
 */
export function useVideoMetadataLoader({
  src,
}: UseVideoMetadataLoaderParams, {
  onLoadStart,
  onLoadComplete,
  onLoadError,
}: UseVideoMetadataLoaderOptions = {}) {
  const loadCompleteHandler = useCallback((event: Event) => {
    const element = event.currentTarget as HTMLVideoElement

    onLoadComplete?.(element)
  }, [onLoadComplete])

  const loadErrorHandler = useCallback((event: Event) => {
    const element = event.currentTarget as HTMLVideoElement

    onLoadError?.(element)
  }, [onLoadError])

  useEffect(() => {
    const video = document.createElement('video')
    video.addEventListener('loadedmetadata', loadCompleteHandler)
    video.addEventListener('error', loadErrorHandler)
    if (src) video.src = src

    onLoadStart?.(video)

    return () => {
      video.removeEventListener('loadedmetadata', loadCompleteHandler)
      video.removeEventListener('error', loadErrorHandler)
    }
  }, [src, onLoadStart])
}
