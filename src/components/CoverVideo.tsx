import { forwardRef, useRef, useState, type HTMLAttributes, type RefObject } from 'react'
import { Size } from 'spase'
import { useRect } from '../hooks/useRect.js'
import { asComponentDict, asStyleDict, cloneStyledElement, styles } from '../utils/index.js'
import { Video, type VideoProps } from './Video.js'

export type CoverVideoProps = HTMLAttributes<HTMLDivElement> & Pick<VideoProps, 'autoLoop' | 'autoPlay' | 'hasControls' | 'isMuted' | 'playsInline' | 'posterSrc' | 'src' | 'onPause' | 'onPlay' | 'onCanPlay' | 'onEnd' | 'onFullscreenChange' | 'onLoadMetadata' | 'onLoadMetadataComplete' | 'onLoadMetadataError' | 'onSizeChange'> & {
  /**
   * The known aspect ratio of the video, expressed by width / height. If
   * unprovided, it will be inferred after loading the video.
   */
  aspectRatio?: number
}

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
  const videoSize = Size.make(
    rootAspectRatio > 1
      ? Math.max(rootRect.width, rootRect.height * aspectRatio)
      : Math.max(rootRect.width, (Math.max(rootRect.height, rootRect.width / aspectRatio)) * aspectRatio),
    rootAspectRatio > 1
      ? Math.max(rootRect.height, Math.max(rootRect.width, rootRect.height * aspectRatio) / aspectRatio)
      : Math.max(rootRect.height, rootRect.width / aspectRatio),
  )

  const components = asComponentDict(children, {
    content: CoverVideoContent,
    viewport: CoverVideoViewport,
  })

  return (
    <div {...props} ref={rootRef} className={className} style={styles(style, FIXED_STYLES.root)}>
      <Video
        autoLoop={autoLoop}
        autoPlay={autoPlay}
        hasControls={hasControls}
        isMuted={isMuted}
        playsInline={playsInline}
        posterSrc={posterSrc}
        src={src}
        style={styles(FIXED_STYLES.viewport, {
          width: `${videoSize.width}px`,
          height: `${videoSize.height}px`,
          maxWidth: 'unset',
        })}
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
      {components.viewport && cloneStyledElement(components.viewport, {
        style: styles(FIXED_STYLES.viewport, {
          height: `${videoSize.height}px`,
          pointerEvents: 'none',
          width: `${videoSize.width}px`,
        }),
      })}
      {components.content}
    </div>
  )
})

export const CoverVideoViewport = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>
    {children}
  </div>
)

export const CoverVideoContent = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>
    {children}
  </div>
)

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
})

Object.defineProperty(CoverVideo, 'displayName', { value: 'CoverVideo', writable: false })
