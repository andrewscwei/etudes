import { type ImgHTMLAttributes, type Ref, useEffect } from 'react'
import { type Size } from 'spase'

import { useImageSize } from '../hooks/useImageSize.js'
import { ImageSource } from '../types/ImageSource.js'

export namespace Image {
  /**
   * Type describing the props of {@link Image}.
   */
  export type Props = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLImageElement>

    /**
     * Optional alt text.
     */
    alt?: string

    /**
     * Loading mode for the image.
     */
    loadingMode?: 'eager' | 'lazy'

    /**
     * Either a string URL or a tuple of the form `[src, ImageSource]`, where
     * `src` is a fallback image URL and `ImageSource` provides additional
     * information for responsive images. If a tuple is provided, the `src` will
     * be used as the `src` attribute of the `<img>` element, while the
     * properties of `ImageSource` will be used to set the `sizes` and `srcSet`
     * attributes.
     */
    source: [string, Omit<ImageSource, 'media' | 'type'>] | string

    /**
     * Handler invoked when image load begins.
     */
    onLoadStart?: () => void

    /**
     * Handler invoked when image load completes.
     */
    onLoad?: () => void

    /**
     * Handler invoked when image load encounters an error.
     */
    onError?: () => void

    /**
     * Handler invoked when the size of the loaded image changes.
     *
     * @param size Size of the loaded image.
     */
    onSizeChange?: (size?: Size.Size) => void
  } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'loading' | 'onError' | 'onLoad' | 'onLoadStart' | 'sizes' | 'src' | 'srcSet'>
}

/**
 * A component that renders an image with support for lazy loading, `srcSet`,
 * and `sizes` attributes.
 */
export function Image({
  ref,
  alt,
  loadingMode,
  source,
  onError,
  onLoad,
  onLoadStart,
  onSizeChange,
  ...props
}: Image.Props) {
  const fallbackSrc = typeof source === 'string' ? source : source[0]
  const imageSource = typeof source === 'string' ? undefined : source[1]
  const resolvedImageSource = imageSource ? ImageSource.asProps(imageSource) : undefined

  const size = useImageSize(source, {
    onError,
    onLoad,
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
}

if (process.env.NODE_ENV === 'development') {
  Image.displayName = 'Image'
}
