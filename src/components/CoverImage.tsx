import React, { forwardRef, useRef, useState, type HTMLAttributes, type PropsWithChildren, type RefObject } from 'react'
import { Size } from 'spase'
import { useRect } from '../hooks/useRect'
import { asStyleDict, styles } from '../utils'
import { Image, type ImageProps } from './Image'

export type CoverImageProps = Omit<HTMLAttributes<HTMLDivElement>, 'onLoadStart'> & Pick<ImageProps, 'alt' | 'loadingMode' | 'sizes' | 'src' | 'srcSet' | 'onLoadStart' | 'onLoadComplete' | 'onLoadError'> & PropsWithChildren<{
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

export const CoverImage = forwardRef<HTMLDivElement, CoverImageProps>(({
  children,
  style,
  alt,
  aspectRatio: externalAspectRatio = NaN,
  loadingMode,
  renderViewportContent,
  sizes,
  src,
  srcSet,
  onLoadStart,
  onLoadComplete,
  onLoadError,
  ...props
}, ref) => {
  const handleSizeChange = (size?: Size) => {
    setLocalAspectRatio(size ? size.width / size.height : NaN)
  }

  const localRef = useRef<HTMLDivElement>(null)
  const rootRef = ref as RefObject<HTMLDivElement> ?? localRef
  const [localAspectRatio, setLocalAspectRatio] = useState(NaN)
  const aspectRatio = isNaN(externalAspectRatio) ? localAspectRatio : externalAspectRatio
  const rootRect = useRect(rootRef)
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
    <div {...props} ref={rootRef} style={styles(style, FIXED_STYLES.root)} data-component='cover-image'>
      <Image
        style={styles(FIXED_STYLES.viewport, {
          width: `${imageSize.width}px`,
          height: `${imageSize.height}px`,
        })}
        alt={alt}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        onLoadStart={onLoadStart}
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
