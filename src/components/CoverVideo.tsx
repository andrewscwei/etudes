import React, { forwardRef, useRef, useState, type HTMLAttributes, type PropsWithChildren, type RefObject } from 'react'
import { Size } from 'spase'
import { useRect } from '../hooks/useRect'
import { asStyleDict, styles } from '../utils'
import { Video, type VideoProps } from './Video'

export type CoverVideoProps = HTMLAttributes<HTMLDivElement> & Pick<VideoProps, 'autoLoop' | 'autoPlay' | 'hasControls' | 'isMuted' | 'playsInline' | 'posterSrc' | 'src' | 'onPause' | 'onPlay' | 'onCanPlay' | 'onEnd' | 'onFullscreenChange' | 'onLoadMetadata' | 'onLoadMetadataComplete' | 'onLoadMetadataError' | 'onSizeChange'> & PropsWithChildren<{
  /**
   * The known aspect ratio of the video, expressed by width / height. If
   * unprovided, it will be inferred after loading the video.
   */
  aspectRatio?: number

  /**
   * Content to render in the full-sized viewport (same size as the cover
   * video).
   */
  renderViewportContent?: () => JSX.Element
}>

export const CoverVideo = forwardRef<HTMLDivElement, CoverVideoProps>(({
  className,
  children,
  style,
  aspectRatio: externalAspectRatio = NaN,
  autoLoop,
  autoPlay,
  hasControls,
  isMuted,
  playsInline,
  posterSrc,
  renderViewportContent,
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
  const handleSizeChange = (size?: Size) => {
    setLocalAspectRatio(size ? size.width / size.height : NaN)
    onSizeChange?.(size)
  }

  const localRef = useRef<HTMLDivElement>(null)
  const rootRef = ref as RefObject<HTMLDivElement> ?? localRef
  const [localAspectRatio, setLocalAspectRatio] = useState(NaN)
  const aspectRatio = isNaN(externalAspectRatio) ? localAspectRatio : externalAspectRatio
  const rootRect = useRect(rootRef)
  const rootAspectRatio = rootRect.width / rootRect.height
  const videoSize = new Size([
    rootAspectRatio > 1
      ? Math.max(rootRect.width, rootRect.height * aspectRatio)
      : Math.max(rootRect.width, (Math.max(rootRect.height, rootRect.width / aspectRatio)) * aspectRatio),
    rootAspectRatio > 1
      ? Math.max(rootRect.height, Math.max(rootRect.width, rootRect.height * aspectRatio) / aspectRatio)
      : Math.max(rootRect.height, rootRect.width / aspectRatio),
  ])

  return (
    <div {...props} ref={rootRef} className={className} style={styles(style, FIXED_STYLES.root)} data-component='cover-video'>
      <Video
        style={styles(FIXED_STYLES.viewport, {
          width: `${videoSize.width}px`,
          height: `${videoSize.height}px`,
        })}
        data-child='video'
        autoLoop={autoLoop}
        autoPlay={autoPlay}
        hasControls={hasControls}
        isMuted={isMuted}
        playsInline={playsInline}
        posterSrc={posterSrc}
        src={src}
        onCanPlay={onCanPlay}
        onEnd={onEnd}
        onFullscreenChange={onFullscreenChange}
        onLoadMetadata={onLoadMetadata}
        onLoadMetadataComplete={onLoadMetadataComplete}
        onLoadMetadataError={onLoadMetadataError}
        onPause={onPause}
        onPlay={onPlay}
        onSizeChange={size => handleSizeChange(size)}
      />
      {renderViewportContent && (
        <div
          data-child='viewport'
          style={styles(FIXED_STYLES.viewport, {
            height: `${videoSize.height}px`,
            pointerEvents: 'none',
            width: `${videoSize.width}px`,
          })}
        >
          {renderViewportContent()}
        </div>
      )}
      {children}
    </div>
  )
})

Object.defineProperty(CoverVideo, 'displayName', { value: 'CoverVideo', writable: false })

const FIXED_STYLES = asStyleDict({
  root: {
    overflow: 'hidden',
  },
  viewport: {
    fontSize: '0',
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
  viewportContent: {
    height: '100%',
    left: '0',
    position: 'absolute',
    top: '0',
    width: '100%',
  },
})
