import { forwardRef, type HTMLAttributes, useEffect } from 'react'
import { type Size } from 'spase'

import { useImageSize } from '../hooks/useImageSize.js'
import { ImageSource } from '../types/ImageSource.js'

export namespace Image {
  /**
   * Type describing the props of {@link Image}.
   */
  export type Props = {
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
     * Fallback image URL for browsers that do not support the `srcSet`
     * attribute.
     */
    src: string

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
  } & Omit<HTMLAttributes<HTMLImageElement>, 'alt' | 'loading' | 'onLoadStart' | 'sizes' | 'src' | 'srcSet'>
}

/**
 * A component that renders an image with support for lazy loading, `srcSet`,
 * and `sizes` attributes.
 */
export const Image = /* #__PURE__ */ forwardRef<HTMLImageElement, Readonly<Image.Props>>((
  {
    alt,
    loadingMode,
    source,
    src: fallbackSrc,
    onLoadComplete,
    onLoadError,
    onLoadStart,
    onSizeChange,
    ...props
  },
  ref,
) => {
  const resolvedImageSource = source ? ImageSource.asProps(source) : undefined

  const size = useImageSize({
    sizes: resolvedImageSource?.sizes,
    src: fallbackSrc,
    srcSet: resolvedImageSource?.srcSet,
  }, {
    onLoadComplete,
    onLoadError,
    onLoadStart,
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

if (process.env.NODE_ENV === 'development') {
  Image.displayName = 'Image'
}
