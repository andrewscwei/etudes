import React, { forwardRef, useRef, useState } from 'react'
import { Size } from 'spase'
import { Image, type ImageProps } from './Image'
import { useElementRect } from './hooks/useElementRect'
import { asStyleDict, styles } from './utils'

type Props = ImageProps & {
  /**
   * The known aspect ratio of the image, expressed by width / height. If
   * unprovided, it will be inferred after loading the image.
   */
  aspectRatio?: number
}

export const CoverImage = forwardRef<HTMLDivElement, Props>(({
  style,
  alt,
  aspectRatio: externalAspectRatio = NaN,
  source,
  ...props
}, ref) => {
  const handleImageSizeChange = (size?: Size) => {
    if (!size || !setAspectRatio) return

    setAspectRatio(size.width / size.height)
  }

  const rootRef = ref ?? useRef<HTMLDivElement>(null)
  const [aspectRatio, setAspectRatio] = !isNaN(externalAspectRatio) ? [externalAspectRatio] : useState(NaN)
  const rootRect = useElementRect(rootRef as any)
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
    <div ref={ref ?? rootRef} {...props} style={styles(style, FIXED_STYLES.root)}>
      <Image
        style={{
          width: `${imageSize.width}px`,
          height: `${imageSize.height}px`,
        }}
        alt={alt}
        source={source}
        onImageSizeChange={size => handleImageSizeChange(size)}
      />
    </div>
  )
})

Object.defineProperty(CoverImage, 'displayName', { value: 'CoverImage', writable: false })

const FIXED_STYLES = asStyleDict({
  root: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    overflow: 'hidden',
    fontSize: '0',
  },
})
