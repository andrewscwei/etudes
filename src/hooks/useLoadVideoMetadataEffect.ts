import { useEffect, useRef, type DependencyList } from 'react'

export type UseLoadVideoMetadataEffectParams = {
  /**
   * `src` attribute of the video.
   */
  src?: string
}

export type UseLoadVideoMetadataEffectOptions = {
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
 * @param params See {@link UseLoadVideoMetadataEffectParams}.
 * @param options See {@link UseLoadVideoMetadataEffectOptions}.
 * @param deps Additional dependencies.
 */
export function useLoadVideoMetadataEffect({ src }: UseLoadVideoMetadataEffectParams, { onLoadStart, onLoadComplete, onLoadError }: UseLoadVideoMetadataEffectOptions = {}, deps: DependencyList = []) {
  const loadCompleteHandler = (event: Event) => {
    const element = event.currentTarget as HTMLVideoElement

    onLoadComplete?.(element)
  }

  const loadErrorHandler = (event: Event) => {
    const element = event.currentTarget as HTMLVideoElement

    onLoadError?.(element)
  }

  const ref = useRef<HTMLVideoElement | undefined>(undefined)

  useEffect(() => {
    ref.current = document.createElement('video')
    if (src) ref.current.src = src
    ref.current.addEventListener('loadedmetadata', loadCompleteHandler)
    ref.current.addEventListener('error', loadErrorHandler)

    onLoadStart?.(ref.current)

    return () => {
      ref.current?.removeEventListener('loadedmetadata', loadCompleteHandler)
      ref.current?.removeEventListener('error', loadErrorHandler)
      ref.current = undefined
    }
  }, [src, ...deps])
}
