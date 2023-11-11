import { useEffect, useRef, useState, type DependencyList } from 'react'
import { Size } from 'spase'

type Options = {
  /**
   * Handler invoked when the video metadata starts loading.
   */
  onLoad?: () => void

  /**
   * Handler invoked when the video is done loading its metadata.
   *
   * @param videoElement The video element.
   */
  onLoadComplete?: (videoElement: HTMLVideoElement) => void

  /**
   * Handler invoked when there is an error loading the video metadata.
   */
  onLoadError?: () => void
}

function getVideoSize(videoElement?: HTMLVideoElement): Size | undefined {
  if (!videoElement) return undefined
  if (typeof videoElement.videoWidth !== 'number') return undefined
  if (typeof videoElement.videoHeight !== 'number') return undefined

  return new Size([videoElement.videoWidth, videoElement.videoHeight])
}

/**
 * Hook for dynamically returning the size of a video.
 *
 * @param src The video source.
 * @param options See {@link Options}.
 * @param deps Additional dependencies.
 *
 * @returns See {@link ReturnedState}.
 */
export function useVideoSize(src?: string, { onLoad, onLoadComplete, onLoadError }: Options = {}, deps?: DependencyList): Size | undefined {
  const loadCompleteHandler = (event: Event) => {
    const videoElement = event.currentTarget as HTMLVideoElement
    const videoSize = getVideoSize(videoElement)

    setVideoSize(videoSize)

    onLoadComplete?.(videoElement)
  }

  const loadErrorHandler = (event: Event) => {
    setVideoSize(undefined)

    onLoadError?.()
  }

  const videoRef = useRef<HTMLVideoElement | undefined>(undefined)
  const [videoSize, setVideoSize] = useState<Size | undefined>(undefined)

  useEffect(() => {
    if (!src) return

    onLoad?.()

    videoRef.current = document.createElement('video')
    videoRef.current.src = src
    videoRef.current.addEventListener('loadedmetadata', loadCompleteHandler)
    videoRef.current.addEventListener('error', loadErrorHandler)

    return () => {
      videoRef.current?.removeEventListener('loadedmetadata', loadCompleteHandler)
      videoRef.current?.removeEventListener('error', loadErrorHandler)
      videoRef.current = undefined
    }
  }, [src, ...deps ? deps : []])

  return videoSize
}
