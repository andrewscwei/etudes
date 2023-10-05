import classNames from 'classnames'
import React, { forwardRef, useEffect, type HTMLAttributes } from 'react'
import { useDebug } from './utils'
import { asClassNameDict } from './utils/asClassNameDict'
import { asStyleDict } from './utils/asStyleDict'
import { styles } from './utils/styles'

const debug = useDebug('image')

export type ImageProps = HTMLAttributes<HTMLElement> & {
  loading?: 'none' | 'lazy' | 'preload'
  alt?: string
  src?: string
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(({
  className,
  style,
  alt,
  loading = 'preload',
  src,
  ...props
}, ref) => {
  const fixedClassNames = getFixedClassNames()
  const fixedStyles = getFixedStyles()

  useEffect(() => {
    if (!src || loading !== 'preload') return

    debug('Initiating preload for image...', 'OK', src)

    const preloadImage = new window.Image()
    preloadImage.src = src
  }, [src])

  return (
    <img
      {...props}
      ref={ref}
      className={classNames(className, fixedClassNames.root)}
      style={styles(style, fixedStyles.root)}
      loading={loading === 'lazy' ? 'lazy' : 'eager'}
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
