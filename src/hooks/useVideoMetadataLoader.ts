import { useLayoutEffect } from 'react'
import { useLatest } from './useLatest.js'

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
 * @param src Video source URL.
 * @param options See {@link UseVideoMetadataLoaderOptions}.
 */
export function useVideoMetadataLoader(src?: string, {
  onLoadStart,
  onLoadComplete,
  onLoadError,
}: UseVideoMetadataLoaderOptions = {}) {
  const loadStartHandlerRef = useLatest(onLoadStart)
  const loadCompleteHandlerRef = useLatest(onLoadComplete)
  const loadErrorHandlerRef = useLatest(onLoadError)

  useLayoutEffect(() => {
    if (!src) return

    const video = window.document.createElement('video')

    const loadCompleteHandler = () => loadCompleteHandlerRef.current?.(video)
    const loadErrorHandler = () => loadErrorHandlerRef.current?.(video)

    video.addEventListener('loadedmetadata', loadCompleteHandler)
    video.addEventListener('error', loadErrorHandler)
    video.src = src

    loadStartHandlerRef.current?.(video)

    return () => {
      video.removeEventListener('loadedmetadata', loadCompleteHandler)
      video.removeEventListener('error', loadErrorHandler)
      video.src = ''
    }
  }, [src])
}
