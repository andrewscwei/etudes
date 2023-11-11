import React, { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactEventHandler, type RefObject } from 'react'
import { asStyleDict, useDebug } from '../utils'

const debug = useDebug('video')

export type VideoProps = Omit<HTMLAttributes<HTMLVideoElement>, 'autoPlay' | 'playsInline' | 'onCanPlay' | 'onPause' | 'onPlay'> & {
  autoLoop?: boolean
  autoPlay?: boolean
  hasControls?: boolean
  isCover?: boolean
  isMuted?: boolean
  playsInline?: boolean
  posterSrc?: string
  src: string
  onCanPlay?: () => void
  onEnd?: () => void
  onFullscreenChange?: (isFullscreen: boolean) => void
  onPause?: () => void
  onPlay?: () => void
}

export const Video = forwardRef<HTMLVideoElement, VideoProps>(({
  autoLoop = true,
  autoPlay = true,
  hasControls = false,
  isCover = true,
  isMuted = true,
  playsInline = true,
  posterSrc,
  src,
  onCanPlay,
  onEnd,
  onFullscreenChange,
  onPause,
  onPlay,
  ...props
}, ref) => {
  const videoRef = ref as RefObject<HTMLVideoElement> ?? useRef<HTMLVideoElement>(null)
  const isPaused = videoRef.current?.paused ?? false

  useEffect(() => {
    debug(`Initializing video with src <${src}>...`, 'OK')

    if (!videoRef.current) return

    videoRef.current.muted = isMuted
    videoRef.current.load()
    videoRef.current.addEventListener('webkitfullscreenchange', fullscreenChangeHandler)
    videoRef.current.addEventListener('mozfullscreenchange', fullscreenChangeHandler)
    videoRef.current.addEventListener('fullscreenchange', fullscreenChangeHandler)

    return () => {
      debug(`Deinitializing video with src <${src}>...`, 'OK')

      pause()

      videoRef.current?.removeEventListener('webkitfullscreenchange', fullscreenChangeHandler)
      videoRef.current?.removeEventListener('mozfullscreenchange', fullscreenChangeHandler)
      videoRef.current?.removeEventListener('fullscreenchange', fullscreenChangeHandler)
    }
  }, [src])

  const fullscreenChangeHandler = (event: Event) => {
    const isFullscreen: boolean | undefined = (document as any).fullScreen || (document as any).mozFullScreen || (document as any).webkitIsFullScreen
    if (isFullscreen === undefined) return
    onFullscreenChange?.(isFullscreen)
  }

  const canPlayHandler: ReactEventHandler<HTMLVideoElement> = event => {
    debug('Checking if video is ready to play...', 'OK')

    if (autoPlay && isPaused) {
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

  const fixedStyles = asStyleDict({
    body: {
      height: '100%',
      width: '100%',
      objectFit: isCover ? 'cover' : 'fill',
    },
  })

  return (
    <video
      {...props}
      ref={ref}
      style={fixedStyles.body}
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
