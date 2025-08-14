import { forwardRef, useEffect, useRef, type ReactEventHandler, type RefObject, type VideoHTMLAttributes } from 'react'
import { type Size } from 'spase'
import { useVideoSize } from '../hooks/useVideoSize.js'
import { asStyleDict } from '../utils/asStyleDict.js'

/**
 * Type describing the props of {@link Video}.
 */
export type VideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, 'autoPlay' | 'controls' | 'loop' | 'muted' | 'playsInline' | 'poster' | 'onCanPlay' | 'onEnded' | 'onPause' | 'onPlay' | 'onTimeUpdate'> & {
  /**
   * Specifies if the video should loop.
   */
  autoLoop?: boolean

  /**
   * Specifies if the video should play automatically when loaded.
   */
  autoPlay?: boolean

  /**
   * Specifies if video controls are present.
   */
  hasControls?: boolean

  /**
   * Specifies if the video should be muted.
   */
  isMuted?: boolean

  /**
   * Specifies if the video should be played inline.
   */
  playsInline?: boolean

  /**
   * The URL of the video poster when video is unavailable or loading.
   */
  posterSrc?: string

  /**
   * The URL of the video to play.
   */
  src: string

  /**
   * Handler invoked when the video is ready to play.
   */
  onCanPlay?: () => void

  /**
   * Handler invoked when the video ends.
   */
  onEnd?: () => void

  /**
   * Handler invoked when the video is in fullscreen mode.
   *
   * @param isFullscreen `true` if the video is in fullscreen mode, `false`
   *                     otherwise.
   */
  onFullscreenChange?: (isFullscreen: boolean) => void

  /**
   * Handler invoked when the video metadata begins to load.
   */
  onLoadMetadata?: () => void

  /**
   * Handler invoked when the video metadata is loaded.
   */
  onLoadMetadataComplete?: () => void

  /**
   * Handler invoked when the video metadata fails to load.
   */
  onLoadMetadataError?: () => void

  /**
   * Handler invoked when the video is paused.
   */
  onPause?: () => void

  /**
   * Handler invoked when the video is played.
   */
  onPlay?: () => void

  /**
   * Handler invoked when the video size changes.
   *
   * @param size The new size of the video.
   */
  onSizeChange?: (size?: Size) => void

  /**
   * Handler invoked when the video time updates.
   *
   * @param currentTime The current time of the video.
   * @param duration The duration of the video.
   */
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
export const Video = /* #__PURE__ */ forwardRef<HTMLVideoElement, Readonly<VideoProps>>(({
  autoLoop = true,
  autoPlay = true,
  hasControls = false,
  isMuted = true,
  playsInline = true,
  posterSrc,
  src,
  style,
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
  const size = useVideoSize(src, {
    onLoadStart: onLoadMetadata,
    onLoadComplete: onLoadMetadataComplete,
    onLoadError: onLoadMetadataError,
  })

  const fixedStyles = _getFixedStyles()

  useEffect(() => {
    if (!videoRef.current) return

    if (src.toLowerCase().endsWith('.m3u8')) {
      const canMaybePlay = !!videoRef.current.canPlayType('application/x-mpegURL')
      const Hls = typeof (window as any).Hls !== 'undefined' ? (window as any).Hls : undefined

      if (!canMaybePlay && Hls?.isSupported()) {
        const hls = new Hls()
        hls.loadSource(src)
        hls.attachMedia(videoRef.current)
      }
    }

    const handler = (_: Event) => {
      const isFullscreen: boolean | undefined = (window.document as any).fullScreen || (window.document as any).mozFullScreen || (window.document as any).webkitIsFullScreen
      if (isFullscreen === undefined) return

      onFullscreenChange?.(isFullscreen)
    }

    videoRef.current.muted = isMuted
    videoRef.current.load()
    videoRef.current.addEventListener('webkitfullscreenchange', handler)
    videoRef.current.addEventListener('mozfullscreenchange', handler)
    videoRef.current.addEventListener('fullscreenchange', handler)

    return () => {
      pause()

      videoRef.current?.removeEventListener('webkitfullscreenchange', handler)
      videoRef.current?.removeEventListener('mozfullscreenchange', handler)
      videoRef.current?.removeEventListener('fullscreenchange', handler)
    }
  }, [src])

  useEffect(() => {
    onSizeChange?.(size)
  }, [size])

  const canPlayHandler: ReactEventHandler<HTMLVideoElement> = event => {
    const el = event.currentTarget

    if (autoPlay && el.paused) {
      play()
    }

    onCanPlay?.()
  }

  const playHandler: ReactEventHandler<HTMLVideoElement> = _ => {
    onPlay?.()
  }

  const pauseHandler: ReactEventHandler<HTMLVideoElement> = _ => {
    onPause?.()
  }

  const endHandler: ReactEventHandler<HTMLVideoElement> = _ => {
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
      style={{ ...fixedStyles.root, ...style }}
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

function _getFixedStyles() {
  return asStyleDict({
    root: {
      fontSize: '0',
    },
  })
}

if (process.env.NODE_ENV === 'development') {
  Video.displayName = 'Video'
}
