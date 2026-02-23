import { forwardRef, type HTMLAttributes } from 'react'

import { ImageSource } from '../types/ImageSource.js'
import { Image } from './Image.js'

export namespace Picture {
  /**
   * Type describing the props of {@link Picture}.
   */
  export type Props = {
    sources?: ImageSource[]
  } & HTMLAttributes<HTMLPictureElement> & Pick<Image.Props, 'alt' | 'loadingMode' | 'onError' | 'onLoad' | 'onLoadStart' | 'onSizeChange' | 'src'>
}

export const Picture = /* #__PURE__ */ forwardRef<HTMLPictureElement, Picture.Props>((
  {
    alt,
    loadingMode,
    sources = [],
    src,
    onError,
    onLoad,
    onLoadStart,
    onSizeChange,
    ...props
  },
  ref,
) => {
  return (
    <picture {...props} ref={ref}>
      {sources.map((source, idx) => (
        <source key={idx} {...ImageSource.asProps(source)}/>
      ))}
      <Image
        style={{ height: '100%', width: '100%' }}
        alt={alt}
        loadingMode={loadingMode}
        src={src}
        onError={onError}
        onLoad={onLoad}
        onLoadStart={onLoadStart}
        onSizeChange={onSizeChange}
      />
    </picture>
  )
})

if (process.env.NODE_ENV === 'development') {
  Picture.displayName = 'Picture'
}
