import React, { CSSProperties, forwardRef, HTMLAttributes, ReactEventHandler, useEffect, useRef } from 'react'

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:video') : () => {}

export type Props = HTMLAttributes<HTMLDivElement> & {
  autoLoop: boolean
  autoPlay: boolean
  hasControls: boolean
  isCover: boolean
  isMuted: boolean
  playsInline: boolean
  posterSrc?: string
  src: string
  onCanPlay: () => void
  onEnd: () => void
  onFullscreenChange: (isFullscreen: boolean) => void
  onPause: () => void
  onPlay: () => void
}

export default forwardRef<HTMLDivElement, Props>(({
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
  const videoRef = useRef<HTMLVideoElement>(null)
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

  return (
    <div {...props} ref={ref}>
      <video
        ref={videoRef}
        autoPlay={autoPlay}
        playsInline={playsInline}
        muted={isMuted}
        controls={hasControls}
        onCanPlay={canPlayHandler}
        onPlay={playHandler}
        onPause={pauseHandler}
        onEnded={endHandler}
        loop={autoLoop}
        poster={posterSrc}
        style={{ objectFit: isCover ? 'cover' : 'fill', ...videoStyle }}
      >
        <source src={src}/>
      </video>
    </div>
  )
})

const videoStyle: CSSProperties = {
  height: '100%',
  width: '100%',
}
