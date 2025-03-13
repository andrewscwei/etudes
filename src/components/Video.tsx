import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactEventHandler, type RefObject } from 'react'
import { type Size } from 'spase'
import { useVideoSize } from '../hooks/index.js'

export type VideoProps = Omit<HTMLAttributes<HTMLVideoElement>, 'autoPlay' | 'controls' | 'loop' | 'muted' | 'playsInline' | 'poster' | 'onCanPlay' | 'onEnded' | 'onPause' | 'onPlay' | 'onTimeUpdate'> & {
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
  onTimeUpdate?: (currentTime: number, duration: number) => void
}

/**
 * A component for displaying video content.
 *
 * Note that this component will handle HLS streams automatically, but only if
 * the browser supports it. If the browser does not support HLS streams, then
 * you must include `hls.js` in your project and ensure that it is loaded before
 * this component is rendered, i.e. by including it in the `<head>` of your
 * HTML document.
 *
 * @see {@link https://www.npmjs.com/package/hls.js}
 */
export const Video = /* #__PURE__ */ forwardRef<HTMLVideoElement, VideoProps>(({
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
  onTimeUpdate,
  ...props
}, ref) => {
  const localRef = useRef<HTMLVideoElement>(null)
  const videoRef = ref as RefObject<HTMLVideoElement> ?? localRef
  const size = useVideoSize({
    src,
  }, {
    onLoadStart: onLoadMetadata,
    onLoadComplete: onLoadMetadataComplete,
    onLoadError: onLoadMetadataError,
  })

  useEffect(() => {
    if (!videoRef.current) return

    if (src.toLowerCase().endsWith('.m3u8')) {
      const canMaybePlay = !!videoRef.current.canPlayType('application/x-mpegURL')
      const Hls = typeof window !== 'undefined' && typeof (window as any).Hls !== 'undefined' ? (window as any).Hls : undefined

      if (!canMaybePlay && Hls?.isSupported()) {
        const hls = new Hls()
        hls.loadSource(src)
        hls.attachMedia(videoRef.current)
      }
    }

    videoRef.current.muted = isMuted
    videoRef.current.load()
    videoRef.current.addEventListener('webkitfullscreenchange', fullscreenChangeHandler)
    videoRef.current.addEventListener('mozfullscreenchange', fullscreenChangeHandler)
    videoRef.current.addEventListener('fullscreenchange', fullscreenChangeHandler)

    return () => {
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
    const el = event.currentTarget

    if (autoPlay && el.paused) {
      play()
    }

    onCanPlay?.()
  }

  const playHandler: ReactEventHandler<HTMLVideoElement> = event => {
    onPlay?.()
  }

  const pauseHandler: ReactEventHandler<HTMLVideoElement> = event => {
    onPause?.()
  }

  const endHandler: ReactEventHandler<HTMLVideoElement> = event => {
    onEnd?.()
  }

  const timeUpdateHandler: ReactEventHandler<HTMLVideoElement> = event => {
    const el = event.currentTarget

    onTimeUpdate?.(el.currentTime, el.duration)
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
      ref={videoRef}
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
      onTimeUpdate={timeUpdateHandler}
    >
      <source src={src}/>
    </video>
  )
})
