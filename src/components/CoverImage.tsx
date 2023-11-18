import React, { forwardRef, useRef, useState, type HTMLAttributes, type PropsWithChildren } from 'react'
import { Size } from 'spase'
import { useElementRect } from '../hooks/useElementRect'
import { asStyleDict, styles } from '../utils'
import { Image, type ImageProps } from './Image'

export type CoverImageProps = ImageProps & PropsWithChildren<{
  /**
   * The known aspect ratio of the image, expressed by width / height. If
   * unprovided, it will be inferred after loading the image.
   */
  aspectRatio?: number

  /**
   * Content to render in the full-sized viewport (same size as the cover
   * image).
   */
  renderViewportContent?: () => JSX.Element
}>

export const CoverImage = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & CoverImageProps>(({
  children,
  style,
  alt,
  aspectRatio: externalAspectRatio = NaN,
  loadingMode,
  renderViewportContent,
  sizes,
  src,
  srcSet,
  onLoad,
  onLoadComplete,
  onLoadError,
  onSizeChange,
  ...props
}, ref) => {
  const handleSizeChange = (size?: Size) => {
    if (setAspectRatio) setAspectRatio(size ? size.width / size.height : NaN)

    onSizeChange?.(size)
  }

  const rootRef = ref ?? useRef<HTMLDivElement>(null)
  const [aspectRatio, setAspectRatio] = !isNaN(externalAspectRatio) ? [externalAspectRatio] : useState(NaN)
  const rootRect = useElementRect(rootRef as any)
  const rootAspectRatio = rootRect.width / rootRect.height
  const imageSize = new Size([
    rootAspectRatio > 1
      ? Math.max(rootRect.width, rootRect.height * aspectRatio)
      : Math.max(rootRect.width, (Math.max(rootRect.height, rootRect.width / aspectRatio)) * aspectRatio),
    rootAspectRatio > 1
      ? Math.max(rootRect.height, Math.max(rootRect.width, rootRect.height * aspectRatio) / aspectRatio)
      : Math.max(rootRect.height, rootRect.width / aspectRatio),
  ])

  return (
    <div ref={ref ?? rootRef} {...props} style={styles(style, FIXED_STYLES.root)} data-component='cover-image'>
      <Image
        style={styles(FIXED_STYLES.viewport, {
          width: `${imageSize.width}px`,
          height: `${imageSize.height}px`,
        })}
        alt={alt}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        onLoad={onLoad}
        onLoadComplete={onLoadComplete}
        onLoadError={onLoadError}
        data-child='image'
        onSizeChange={size => handleSizeChange(size)}
      />
      {renderViewportContent && (
        <div
          data-child='viewport'
          style={styles(FIXED_STYLES.viewport, {
            height: `${imageSize.height}px`,
            pointerEvents: 'none',
            width: `${imageSize.width}px`,
          })}
        >
          {renderViewportContent()}
        </div>
      )}
      {children}
    </div>
  )
})

Object.defineProperty(CoverImage, 'displayName', { value: 'CoverImage', writable: false })

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
