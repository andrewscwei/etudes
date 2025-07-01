import { forwardRef, useEffect, type HTMLAttributes } from 'react'
import { type Size } from 'spase'
import { useImageSize } from '../hooks/useImageSize.js'
import { ImageSource } from '../types/ImageSource.js'

/**
 * Type describing the props of {@link Image}.
 */
export type ImageProps = Omit<HTMLAttributes<HTMLImageElement>, 'alt' | 'loading' | 'sizes' | 'src' | 'srcSet' | 'onLoadStart'> & {
  /**
   * Optional alt text.
   */
  alt?: string

  /**
   * Loading mode for the image.
   */
  loadingMode?: 'eager' | 'lazy'

  /**
   * Optional image source. If provided, this will be used to set the `sizes`
   * and `srcSet` attributes of the `<img>` element.
   */
  source?: Omit<ImageSource, 'media' | 'type'>

  /**
   * Fallback image URL for browsers that do not support the `srcSet` attribute.
   */
  src?: string

  /**
   * Handler invoked when image load begins.
   */
  onLoadStart?: () => void

  /**
   * Handler invoked when image load completes.
   */
  onLoadComplete?: () => void

  /**
   * Handler invoked when image load encounters an error.
   */
  onLoadError?: () => void

  /**
   * Handler invoked when the size of the loaded image changes.
   *
   * @param size Size of the loaded image.
   */
  onSizeChange?: (size?: Size) => void
}

/**
 * A component that renders an image with support for lazy loading, `srcSet`,
 * and `sizes` attributes.
 */
export const Image = /* #__PURE__ */ forwardRef<HTMLImageElement, Readonly<ImageProps>>(({
  alt,
  source,
  loadingMode,
  src: fallbackSrc,
  onLoadStart,
  onLoadComplete,
  onLoadError,
  onSizeChange,
  ...props
}, ref) => {
  const resolvedImageSource = source ? ImageSource.asProps(source) : undefined

  const size = useImageSize({
    src: fallbackSrc,
    srcSet: resolvedImageSource?.srcSet,
    sizes: resolvedImageSource?.sizes,
  }, {
    onLoadStart,
    onLoadComplete,
    onLoadError,
  })

  useEffect(() => {
    onSizeChange?.(size)
  }, [size?.width, size?.height])

  return (
    <img
      {...props}
      {...resolvedImageSource}
      ref={ref}
      alt={alt}
      loading={loadingMode}
      src={fallbackSrc}
    />
  )
})

if (process.env.NODE_ENV !== 'production') {
  Image.displayName = 'Image'
}
