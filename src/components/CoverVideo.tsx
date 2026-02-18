import { forwardRef, type HTMLAttributes, type RefObject, useRef, useState } from 'react'
import { Size } from 'spase'

import { useRect } from '../hooks/useRect.js'
import { Video } from '../primitives/Video.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

const _CoverVideo = /* #__PURE__ */ forwardRef<HTMLDivElement, Readonly<CoverVideo.Props>>(({
  className,
  style,
  aspectRatio: externalAspectRatio = NaN,
  autoLoop,
  autoPlay,
  children,
  playsInline,
  posterSrc,
  src,
  hasControls,
  isMuted,
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
    content: _Content,
    viewport: _Viewport,
  })

  return (
    <div
      {...props}
      className={className}
      ref={rootRef}
      style={styles(style, FIXED_STYLES.root)}
    >
      <Video
        style={styles(FIXED_STYLES.viewport, {
          height: `${videoSize.height}px`,
          maxWidth: 'unset',
          width: `${videoSize.width}px`,
        })}
        autoLoop={autoLoop}
        autoPlay={autoPlay}
        playsInline={playsInline}
        posterSrc={posterSrc}
        src={src}
        hasControls={hasControls}
        isMuted={isMuted}
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
          style={styles(FIXED_STYLES.viewport, {
            height: `${videoSize.height}px`,
            pointerEvents: 'none',
            width: `${videoSize.width}px`,
          })}
          element={components.viewport}
        />
      )}
      {components.content}
    </div>
  )
})

/**
 * Component for optional content inside a {@link CoverVideo}.
 */
const _Content = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>
    {children}
  </div>
)

/**
 * Component for the viewport of a {@link CoverVideo}.
 */
const _Viewport = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>
    {children}
  </div>
)

export namespace CoverVideo {
  /**
   * Type describing the props of {@link CoverVideo}.
   */
  export type Props = {
    /**
     * The known aspect ratio of the video, expressed by width / height. If
     * unprovided, it will be inferred after loading the video.
     */
    aspectRatio?: number
  } & Omit<HTMLAttributes<HTMLDivElement>, 'onCanPlay' | 'onPause' | 'onPlay'> & Pick<Video.Props, 'autoLoop' | 'autoPlay' | 'hasControls' | 'isMuted' | 'onCanPlay' | 'onEnd' | 'onFullscreenChange' | 'onLoadMetadata' | 'onLoadMetadataComplete' | 'onLoadMetadataError' | 'onPause' | 'onPlay' | 'onSizeChange' | 'playsInline' | 'posterSrc' | 'src'>
}

/**
 * A component that displays a video with a fixed aspect ratio. The video is
 * centered and cropped to fit the container (a.k.a. viewport).
 *
 * @exports CoverVideo.Content Component for optional content inside the video.
 * @exports CoverVideo.Viewport Component for the viewport.
 */
export const CoverVideo = /* #__PURE__ */ Object.assign(_CoverVideo, {
  /**
   * Component for optional content inside a {@link CoverVideo}.
   */
  Content: _Content,

  /**
   * Component for the viewport of a {@link CoverVideo}.
   */
  Viewport: _Viewport,
})

const FIXED_STYLES = asStyleDict({
  root: {
    overflow: 'hidden',
  },
  viewport: {
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
})

if (process.env.NODE_ENV === 'development') {
  _CoverVideo.displayName = 'CoverVideo'

  _Content.displayName = 'CoverVideo.Content'
  _Viewport.displayName = 'CoverVideo.Viewport'
}
