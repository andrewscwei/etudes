import React, { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactEventHandler, type RefObject } from 'react'
import { type Size } from 'spase'
import { useVideoSize } from '../hooks/useVideoSize'
import { useDebug } from '../utils'

const debug = useDebug('video')

export type VideoHTMLAttributes = Omit<HTMLAttributes<HTMLVideoElement>, 'autoPlay' | 'controls' | 'loop' | 'muted' | 'playsInline' | 'poster' | 'onCanPlay' | 'onEnded' | 'onPause' | 'onPlay'>

export type VideoProps = {
  autoLoop?: boolean
  autoPlay?: boolean
  hasControls?: boolean
  isMuted?: boolean
  playsInline?: boolean
  posterSrc?: string
  src: string
  onCanPlay?: () => void
  onEnd?: () => void
  onFullscreenChange?: (isFullscreen: boolean) => void
  onLoadMetadata?: () => void
  onLoadMetadataComplete?: () => void
  onLoadMetadataError?: () => void
  onPause?: () => void
  onPlay?: () => void
  onSizeChange?: (size?: Size) => void
}

export const Video = forwardRef<HTMLVideoElement, VideoHTMLAttributes & VideoProps>(({
  autoLoop = true,
  autoPlay = true,
  hasControls = false,
  isMuted = true,
  playsInline = true,
  posterSrc,
  src,
  onCanPlay,
  onEnd,
  onFullscreenChange,
  onLoadMetadata,
  onLoadMetadataComplete,
  onLoadMetadataError,
  onPause,
  onPlay,
  onSizeChange,
  ...props
}, ref) => {
  const videoRef = ref as RefObject<HTMLVideoElement> ?? useRef<HTMLVideoElement>(null)
  const size = (onLoadMetadata || onLoadMetadataComplete || onLoadMetadataError || onSizeChange) ? useVideoSize({
    src,
  }, {
    onLoadStart: onLoadMetadata,
    onLoadComplete: onLoadMetadataComplete,
    onLoadError: onLoadMetadataError,
  }) : undefined

  useEffect(() => {
    debug(`Initializing video with source <${src}>...`, 'OK')

    if (!videoRef.current) return

    videoRef.current.muted = isMuted
    videoRef.current.load()
    videoRef.current.addEventListener('webkitfullscreenchange', fullscreenChangeHandler)
    videoRef.current.addEventListener('mozfullscreenchange', fullscreenChangeHandler)
    videoRef.current.addEventListener('fullscreenchange', fullscreenChangeHandler)

    return () => {
      debug(`Deinitializing video with source <${src}>...`, 'OK')

      pause()

      videoRef.current?.removeEventListener('webkitfullscreenchange', fullscreenChangeHandler)
      videoRef.current?.removeEventListener('mozfullscreenchange', fullscreenChangeHandler)
      videoRef.current?.removeEventListener('fullscreenchange', fullscreenChangeHandler)
    }
  }, [src])

  useEffect(() => {
    onSizeChange?.(size)
  }, [size])

  const fullscreenChangeHandler = (event: Event) => {
    const isFullscreen: boolean | undefined = (document as any).fullScreen || (document as any).mozFullScreen || (document as any).webkitIsFullScreen
    if (isFullscreen === undefined) return
    onFullscreenChange?.(isFullscreen)
  }

  const canPlayHandler: ReactEventHandler<HTMLVideoElement> = event => {
    debug('Checking if video is ready to play...', 'OK')

    if (autoPlay && (videoRef.current?.paused ?? false)) {
      play()
    }

    onCanPlay?.()
  }

  const playHandler: ReactEventHandler<HTMLVideoElement> = event => {
    debug('Playing video...', 'OK')
    onPlay?.()
  }

  const pauseHandler: ReactEventHandler<HTMLVideoElement> = event => {
    debug('Pausing video...', 'OK')
    onPause?.()
  }

  const endHandler: ReactEventHandler<HTMLVideoElement> = event => {
    debug('Ending video...', 'OK')
    onEnd?.()
  }

  const play = () => {
    if (!videoRef.current) return
    videoRef.current.play()
  }

  const pause = () => {
    if (!videoRef.current) return
    videoRef.current.pause()
  }

  return (
    <video
      {...props}
      ref={ref}
      data-component='video'
      autoPlay={autoPlay}
      controls={hasControls}
      loop={autoLoop}
      muted={isMuted}
      playsInline={playsInline}
      poster={posterSrc}
      onCanPlay={canPlayHandler}
      onEnded={endHandler}
      onPause={pauseHandler}
      onPlay={playHandler}
    >
      <source src={src}/>
    </video>
  )
})

Object.defineProperty(Video, 'displayName', { value: 'Video', writable: false })
