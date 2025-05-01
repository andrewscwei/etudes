import { forwardRef, useEffect, type HTMLAttributes } from 'react'
import { type Size } from 'spase'
import { useImageSize } from '../hooks/index.js'

export type ImageProps = Omit<HTMLAttributes<HTMLImageElement>, 'alt' | 'loading' | 'sizes' | 'src' | 'srcSet' | 'onLoadStart'> & {
  /**
   * Optional alt text.
   */
  alt?: string

  /**
   * Loading mode for the image.
   */
  loadingMode?: 'none' | 'lazy' | 'preload'

  /**
   * Descriptor for the `srcset` attribute of the `<img>` element. If `sizes` is
   * also provided, then each entry in this list must have a `width` value and
   * no `pixelDensity` value.
   */
  srcSet?: {
    /**
     * A URL specifying an image location.
     */
    src: string

    /**
     * Optional intrinsic width (in pixels) of the image expressed as a positive
     * integer. If set, leave `pixelDensity` unspecified (only one of `width` or
     * `pixelDensity` can be specified).
     */
    width?: number

    /**
     * Optional pixel density of the image expressed as a positive floating
     * number. If set, leave `width` unspecified (only one of `width` or
     * `pixelDensity` can be specified.
     */
    pixelDensity?: number
  }[]

  /**
   * Descriptor for the `sizes` attribute of the `<img>` element.
   */
  sizes?: {
    /**
     * Optional media query condition (without brackets, i.e. `max-width:
     * 100px`). Note that this must be omitted for the last item in this list of
     * sizes.
     */
    mediaCondition?: string

    /**
     * A CSS size value indicating the size of the image's slot on the page,
     * i.e. `100px`, `100vw`, `50%`, etc.
     */
    width: string
  }[]

  /**
   * Fallback image URL for browsers that do not support the `srcset` attribute.
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

export const Image = /* #__PURE__ */ forwardRef<HTMLImageElement, Readonly<ImageProps>>(({
  alt,
  loadingMode = 'preload',
  sizes,
  src: fallbackSrc,
  srcSet,
  onLoadStart,
  onLoadComplete,
  onLoadError,
  onSizeChange,
  ...props
}, ref) => {
  const srcSetValue = srcSet?.map(({ pixelDensity, src, width }) => {
    if (sizes && width === undefined) throw Error('`width` must be specified if `sizes` is specified')
    if (width !== undefined && pixelDensity !== undefined) throw Error('Only one of `width` or `pixelDensity` can be specified.')

    let t = src

    if (width !== undefined) {
      const w = Math.floor(width)

      if (!isFinite(w) || String(w) !== String(width) || w <= 0) throw Error('The specified width must be a positive integer greater than 0')

      t += ` ${w}w`
    }
    else if (pixelDensity !== undefined) {
      if (!isFinite(pixelDensity) || pixelDensity <= 0) throw Error('The specified pixel density must be a positive floating number than 0')

      t += ` ${pixelDensity}x`
    }

    return t
  }).join(', ')

  const sizesValue = sizes?.map(({ mediaCondition, width }, idx) => {
    const isLast = idx === sizes.length - 1
    let t = width

    if (isLast && mediaCondition) throw Error('The last item in `sizes` must not have a `mediaCondition` specified.')
    if (mediaCondition) t = `${mediaCondition} ${t}`

    return t
  }).join(', ')

  const size = useImageSize({
    src: fallbackSrc,
    srcSet: srcSetValue,
    sizes: sizesValue,
  }, {
    onLoadStart,
    onLoadComplete,
    onLoadError,
  })

  useEffect(() => {
    onSizeChange?.(size)
  }, [size])

  return (
    <img
      {...props}
      ref={ref}
      alt={alt}
      loading={loadingMode === 'lazy' ? 'lazy' : 'eager'}
      sizes={sizesValue}
      src={fallbackSrc}
      srcSet={srcSetValue}
    />
  )
})

Image.displayName = 'Image'
