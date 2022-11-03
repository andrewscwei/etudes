import React, { CSSProperties, forwardRef, HTMLAttributes, ReactEventHandler, useEffect, useRef } from 'react'

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:video') : () => {}

export type VideoProps = HTMLAttributes<HTMLDivElement> & {
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

export default forwardRef<HTMLDivElement, VideoProps>(({
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

  return (
    <div {...props} ref={ref}>
      <video
        ref={bodyRef}
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
