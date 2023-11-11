import React, { forwardRef, useRef, useState, type PropsWithChildren } from 'react'
import { Size } from 'spase'
import { useElementRect } from '../hooks/useElementRect'
import { asStyleDict, styles } from '../utils'
import { Video, type VideoProps } from './Video'

export type CoverVideoProps = VideoProps & PropsWithChildren<{
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
  source,
  renderViewportContent,
  ...props
}, ref) => {
  const handleSizeChange = (size?: Size) => {
    if (!size || !setAspectRatio) return

    setAspectRatio(size.width / size.height)
  }

  const rootRef = ref ?? useRef<HTMLDivElement>(null)
  const [aspectRatio, setAspectRatio] = !isNaN(externalAspectRatio) ? [externalAspectRatio] : useState(NaN)
  const rootRect = useElementRect(rootRef as any)
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
    <div ref={ref ?? rootRef} className={className} style={styles(style, FIXED_STYLES.root)} data-component='cover-video'>
      <Video
        {...props}
        style={styles(FIXED_STYLES.viewport, {
          width: `${videoSize.width}px`,
          height: `${videoSize.height}px`,
        })}
        source={source}
        data-child='video'
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
