import { forwardRef, useRef, useState, type HTMLAttributes, type RefObject } from 'react'
import { Size } from 'spase'
import { useRect } from '../hooks/useRect.js'
import { Styled } from '../operators/Styled.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { styles } from '../utils/styles.js'
import { Picture, type PictureProps } from './Picture.js'

/**
 * Type describing the props of {@link CoverImage}.
 */
export type CoverImageProps = Omit<HTMLAttributes<HTMLDivElement>, 'onLoadStart'> & Pick<PictureProps, 'alt' | 'loadingMode' | 'sources' | 'src' | 'onLoadStart' | 'onLoadComplete' | 'onLoadError'> & {
  /**
   * The known aspect ratio of the image, expressed by width / height. If
   * unprovided, it will be inferred after loading the image.
   */
  aspectRatio?: number
}

/**
 * A component that displays an image with a fixed aspect ratio. The image is
 * centered and cropped to fit the container (a.k.a. viewport).
 *
 * @exports CoverImageContent Component for optional content inside the image.
 * @exports CoverImageViewport Component for the viewport.
 */
export const CoverImage = /* #__PURE__ */ forwardRef<HTMLDivElement, Readonly<CoverImageProps>>(({
  children,
  alt,
  aspectRatio: externalAspectRatio = NaN,
  sources,
  loadingMode,
  src,
  style,
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

  const imageSize = Size.make(
    rootAspectRatio > 1
      ? Math.max(rootRect.width, rootRect.height * aspectRatio)
      : Math.max(rootRect.width, (Math.max(rootRect.height, rootRect.width / aspectRatio)) * aspectRatio),
    rootAspectRatio > 1
      ? Math.max(rootRect.height, Math.max(rootRect.width, rootRect.height * aspectRatio) / aspectRatio)
      : Math.max(rootRect.height, rootRect.width / aspectRatio),
  )
  const components = asComponentDict(children, {
    content: CoverImageContent,
    viewport: CoverImageViewport,
  })

  return (
    <div
      {...props}
      ref={rootRef}
      style={styles(style, FIXED_STYLES.root)}
    >
      <Picture
        alt={alt}
        sources={sources}
        src={src}
        style={styles(FIXED_STYLES.viewport, {
          height: `${imageSize.height}px`,
          maxWidth: 'unset',
          width: `${imageSize.width}px`,
        })}
        onLoadComplete={onLoadComplete}
        onLoadError={onLoadError}
        onLoadStart={onLoadStart}
        onSizeChange={size => handleSizeChange(size)}
      />
      {components.viewport && (
        <Styled
          element={components.viewport}
          style={styles(FIXED_STYLES.viewport, {
            height: `${imageSize.height}px`,
            pointerEvents: 'none',
            width: `${imageSize.width}px`,
          })}
        />
      )}
      {components.content}
    </div>
  )
})

/**
 * Component for optional content inside a {@link CoverImage}.
 */
export const CoverImageContent = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>
    {children}
  </div>
)

/**
 * Component for the viewport of a {@link CoverImage}.
 */
export const CoverImageViewport = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
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
  CoverImage.displayName = 'CoverImage'
  CoverImageContent.displayName = 'CoverImageContent'
  CoverImageViewport.displayName = 'CoverImageViewport'
}
