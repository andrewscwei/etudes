import { forwardRef, type HTMLAttributes } from 'react'
import { ImageSource } from '../types/ImageSource.js'
import { Image, type ImageProps } from './Image.js'

/**
 * Type describing the props of {@link Picture}.
 */
export type PictureProps = HTMLAttributes<HTMLPictureElement> & Pick<ImageProps, 'alt' | 'loadingMode' | 'src' | 'onLoadStart' | 'onLoadComplete' | 'onLoadError' | 'onSizeChange'> & {
  sources?: ImageSource[]
}

export const Picture = /* #__PURE__ */ forwardRef<HTMLPictureElement, PictureProps>(({
  alt,
  loadingMode,
  sources = [],
  src,
  onLoadComplete,
  onLoadError,
  onLoadStart,
  onSizeChange,
  ...props
}, ref) => {
  return (
    <picture {...props} ref={ref}>
      {sources.map((source, idx) => (
        <source key={idx} {...ImageSource.asProps(source)}/>
      ))}
      <Image
        alt={alt}
        loadingMode={loadingMode}
        src={src}
        style={{ width: '100%', height: '100%' }}
        onLoadComplete={onLoadComplete}
        onLoadError={onLoadError}
        onLoadStart={onLoadStart}
        onSizeChange={onSizeChange}
      />
    </picture>
  )
})

if (process.env.NODE_ENV === 'development') {
  Picture.displayName = 'Picture'
}
