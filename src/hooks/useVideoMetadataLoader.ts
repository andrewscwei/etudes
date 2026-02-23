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
  onLoad?: (element: HTMLVideoElement) => void

  /**
   * Handler invoked when there is an error loading the video metadata.
   *
   * @param element The target video element.
   */
  onError?: (element: HTMLVideoElement) => void
}

/**
 * Hook for retrieving the size of a video.
 *
 * @param src Video source URL.
 * @param options See {@link UseVideoMetadataLoaderOptions}.
 */
export function useVideoMetadataLoader(src?: string, {
  onError,
  onLoad,
  onLoadStart,
}: UseVideoMetadataLoaderOptions = {}) {
  const loadStartHandlerRef = useLatest(onLoadStart)
  const loadCompleteHandlerRef = useLatest(onLoad)
  const loadErrorHandlerRef = useLatest(onError)

  useLayoutEffect(() => {
    if (!src) return

    const video = window.document.createElement('video')

    const loadCompleteListener = () => loadCompleteHandlerRef.current?.(video)
    const loadErrorListener = () => loadErrorHandlerRef.current?.(video)

    video.addEventListener('loadedmetadata', loadCompleteListener)
    video.addEventListener('error', loadErrorListener)
    video.src = src

    loadStartHandlerRef.current?.(video)

    return () => {
      video.removeEventListener('loadedmetadata', loadCompleteListener)
      video.removeEventListener('error', loadErrorListener)
      video.src = ''
    }
  }, [src])
}
