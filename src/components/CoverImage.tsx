import { type HTMLAttributes, type Ref, type RefObject, useRef, useState } from 'react'
import { Size } from 'spase'

import { useRect } from '../hooks/useRect.js'
import { Picture } from '../primitives/Picture.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

/**
 * A component that displays an image with a fixed aspect ratio. The image is
 * centered and cropped to fit the container (a.k.a. viewport).
 *
 * @exports CoverImage.Content Component for optional content inside the image.
 * @exports CoverImage.Viewport Component for the viewport.
 */
export function CoverImage({
  ref,
  style,
  alt,
  aspectRatio: externalAspectRatio = NaN,
  children,
  loadingMode,
  sources,
  src,
  onError,
  onLoad,
  onLoadStart,
  ...props
}: Readonly<CoverImage.Props>) {
  const handleSizeChange = (size?: Size.Size) => {
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
    content: CoverImage.Content,
    viewport: CoverImage.Viewport,
  })

  return (
    <div
      {...props}
      ref={rootRef}
      style={styles(style, FIXED_STYLES.root)}
    >
      <Picture
        style={styles(FIXED_STYLES.viewport, {
          height: `${imageSize.height}px`,
          maxWidth: 'unset',
          width: `${imageSize.width}px`,
        })}
        alt={alt}
        sources={sources}
        src={src}
        onError={onError}
        onLoad={onLoad}
        onLoadStart={onLoadStart}
        onSizeChange={size => handleSizeChange(size)}
      />
      {components.viewport && (
        <Styled
          style={styles(FIXED_STYLES.viewport, {
            height: `${imageSize.height}px`,
            pointerEvents: 'none',
            width: `${imageSize.width}px`,
          })}
          element={components.viewport}
        />
      )}
      {components.content}
    </div>
  )
}

export namespace CoverImage {
  /**
   * Type describing the props of {@link CoverImage}.
   */
  export type Props = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLDivElement>

    /**
     * The known aspect ratio of the image, expressed by width / height. If
     * unprovided, it will be inferred after loading the image.
     */
    aspectRatio?: number
  } & Omit<HTMLAttributes<HTMLDivElement>, 'onLoadStart'> & Pick<Picture.Props, 'alt' | 'loadingMode' | 'onError' | 'onLoad' | 'onLoadStart' | 'sources' | 'src'>

  /**
   * Component for optional content inside a {@link CoverImage}.
   */
  export const Content = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>
      {children}
    </div>
  )

  /**
   * Component for the viewport of a {@link CoverImage}.
   */
  export const Viewport = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>
      {children}
    </div>
  )
}

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
  CoverImage.displayName = 'CoverImage'
  CoverImage.Content.displayName = 'CoverImage.Content'
  CoverImage.Viewport.displayName = 'CoverImage.Viewport'
}
