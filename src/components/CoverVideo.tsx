import { forwardRef, useRef, useState, type HTMLAttributes, type RefObject } from 'react'
import { Size } from 'spase'
import { useRect } from '../hooks/useRect.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'
import { Video, type VideoProps } from './Video.js'

/**
 * Type describing the props of {@link CoverVideo}.
 */
export type CoverVideoProps = Omit<HTMLAttributes<HTMLDivElement>, 'onCanPlay' | 'onPause' | 'onPlay'> & Pick<VideoProps, 'autoLoop' | 'autoPlay' | 'hasControls' | 'isMuted' | 'playsInline' | 'posterSrc' | 'src' | 'onPause' | 'onPlay' | 'onCanPlay' | 'onEnd' | 'onFullscreenChange' | 'onLoadMetadata' | 'onLoadMetadataComplete' | 'onLoadMetadataError' | 'onSizeChange'> & {
  /**
   * The known aspect ratio of the video, expressed by width / height. If
   * unprovided, it will be inferred after loading the video.
   */
  aspectRatio?: number
}

/**
 * A component that displays a video with a fixed aspect ratio. The video is
 * centered and cropped to fit the container (a.k.a. viewport).
 *
 * @exports CoverVideoContent Component for optional content inside the video.
 * @exports CoverVideoViewport Component for the viewport.
 */
export const CoverVideo = /* #__PURE__ */ forwardRef<HTMLDivElement, Readonly<CoverVideoProps>>(({
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

  const rootRef = ref as RefObject<HTMLDivElement> ?? useRef<HTMLDivElement>(null)
  const rootRect = useRect(rootRef)
  const [localAspectRatio, setLocalAspectRatio] = useState(NaN)
  const aspectRatio = isNaN(externalAspectRatio) ? localAspectRatio : externalAspectRatio
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
    <div
      {...props}
      ref={rootRef}
      className={className}
      style={styles(style, FIXED_STYLES.root)}
    >
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
      {components.viewport && (
        <Styled
          element={components.viewport}
          style={styles(FIXED_STYLES.viewport, {
            height: `${videoSize.height}px`,
            pointerEvents: 'none',
            width: `${videoSize.width}px`,
          })}
        />
      )}
      {components.content}
    </div>
  )
})

/**
 * Component for optional content inside a {@link CoverVideo}.
 */
export const CoverVideoContent = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>
    {children}
  </div>
)

/**
 * Component for the viewport of a {@link CoverVideo}.
 */
export const CoverVideoViewport = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
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

if (process.env.NODE_ENV === 'development') {
  CoverVideo.displayName = 'CoverVideo'
  CoverVideoContent.displayName = 'CoverVideoContent'
  CoverVideoViewport.displayName = 'CoverVideoViewport'
}
