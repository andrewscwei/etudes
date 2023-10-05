import classNames from 'classnames'
import React, { forwardRef, type HTMLAttributes } from 'react'
import { type Size } from 'spase'
import { useLoadImageEffect } from './hooks/useLoadImageEffect'
import { useDebug } from './utils'
import { asClassNameDict } from './utils/asClassNameDict'
import { asStyleDict } from './utils/asStyleDict'
import { styles } from './utils/styles'

const debug = useDebug('image')

export type ImageProps = HTMLAttributes<HTMLElement> & {
  alt?: string
  loadingMode?: 'none' | 'lazy' | 'preload'
  src?: string
  onImageLoadComplete?: () => void
  onImageLoadError?: () => void
  onImageSizeChange?: (size?: Size) => void
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(({
  className,
  style,
  alt,
  loadingMode = 'preload',
  src,
  onImageLoadComplete,
  onImageLoadError,
  onImageSizeChange,
  ...props
}, ref) => {
  const fixedClassNames = getFixedClassNames()
  const fixedStyles = getFixedStyles()

  if (loadingMode === 'preload') {
    debug('Initiating preload for image...', 'OK', src)

    useLoadImageEffect(src, {
      onImageLoadComplete,
      onImageLoadError,
      onImageSizeChange,
    })
  }

  return (
    <img
      {...props}
      ref={ref}
      className={classNames(className, fixedClassNames.root)}
      style={styles(style, fixedStyles.root)}
      loading={loadingMode === 'lazy' ? 'lazy' : 'eager'}
      src={src}
      alt={alt}
    />
  )
})

Object.defineProperty(Image, 'displayName', { value: 'Image', writable: false })

function getFixedClassNames() {
  return asClassNameDict({
    root: classNames('image'),
  })
}

function getFixedStyles() {
  return asStyleDict({
    root: {
      objectFit: 'cover',
    },
  })
}
