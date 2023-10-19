import React, { forwardRef, type HTMLAttributes } from 'react'
import { type Size } from 'spase'
import { useLoadImageEffect } from '../hooks/useLoadImageEffect'
import { useDebug } from '../utils'

const debug = useDebug('image')

export type ImageSourceDescriptor = {
  constraints?: {
    /**
     * The image's actual width, falls back to the slot width.
     */
    width?: number

    /**
     * The image's slot width associated with the media query satisfying the
     * specified max width. If the width of the viewport is equal to or less
     * than this value, the current src will be used. Otherwise, a src defined
     * for a constraint with a higher width will be used. Falls back to the max
     * width.
     */
    slotWidth?: number

    /**
     * URL of the image for the current constraint.
     */
    src: string

    /**
     * The max width to use as the media query condition.
     */
    maxWidth: number
  }[]

  /**
   * Fallback image URL for browsers that do not support the `srcset` attribute.
   */
  fallback: string
}

export type ImageProps = HTMLAttributes<HTMLElement> & {
  alt?: string
  loadingMode?: 'none' | 'lazy' | 'preload'
  source: ImageSourceDescriptor
  onImageLoadComplete?: () => void
  onImageLoadError?: () => void
  onImageSizeChange?: (size?: Size) => void
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(({
  alt,
  loadingMode = 'preload',
  source,
  onImageLoadComplete,
  onImageLoadError,
  onImageSizeChange,
  ...props
}, ref) => {
  const srcSet = source.constraints?.map(({ slotWidth, maxWidth, width, src }) => `${src} ${width ?? slotWidth ?? maxWidth}w`).join(', ')
  const sizes = source.constraints?.map(({ maxWidth, slotWidth }) => `(max-width: ${maxWidth}px) ${slotWidth ?? maxWidth}px`).join(', ')

  if (loadingMode === 'preload') {
    debug('Initiating preload for image...', 'OK', source)

    useLoadImageEffect(source.fallback, {
      srcSet,
      sizes,
      onImageLoadComplete,
      onImageLoadError,
      onImageSizeChange,
    })
  }

  return (
    <img
      {...props}
      ref={ref}
      alt={alt}
      data-component='image'
      loading={loadingMode === 'lazy' ? 'lazy' : 'eager'}
      srcSet={srcSet}
      sizes={sizes}
      src={source.fallback}
    />
  )
})

Object.defineProperty(Image, 'displayName', { value: 'Image', writable: false })
