import React, { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactEventHandler } from 'react'
import { asStyleDict, useDebug } from './utils'

const debug = useDebug('video')

export type VideoProps = HTMLAttributes<HTMLDivElement> & {
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

export const Video = forwardRef<HTMLDivElement, VideoProps>(({
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
  const bodyRef = useRef<HTMLVideoElement>(null)
  const isPaused = bodyRef.current?.paused ?? false

  useEffect(() => {
    debug(`Initializing video with src <${src}>...`, 'OK')

    if (!bodyRef.current) return

    bodyRef.current.muted = isMuted
    bodyRef.current.load()
    bodyRef.current.addEventListener('webkitfullscreenchange', fullscreenChangeHandler)
    bodyRef.current.addEventListener('mozfullscreenchange', fullscreenChangeHandler)
    bodyRef.current.addEventListener('fullscreenchange', fullscreenChangeHandler)

    return () => {
      debug(`Deinitializing video with src <${src}>...`, 'OK')

      pause()

      bodyRef.current?.removeEventListener('webkitfullscreenchange', fullscreenChangeHandler)
      bodyRef.current?.removeEventListener('mozfullscreenchange', fullscreenChangeHandler)
      bodyRef.current?.removeEventListener('fullscreenchange', fullscreenChangeHandler)
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
    if (!bodyRef.current) return
    bodyRef.current.play()
  }

  const pause = () => {
    if (!bodyRef.current) return
    bodyRef.current.pause()
  }

  const fixedStyles = asStyleDict({
    body: {
      height: '100%',
      width: '100%',
      objectFit: isCover ? 'cover' : 'fill',
    },
  })

  return (
    <div {...props} ref={ref}>
      <video
        ref={bodyRef}
        style={fixedStyles.body}
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
    </div>
  )
})

Object.defineProperty(Video, 'displayName', { value: 'Video', writable: false })
