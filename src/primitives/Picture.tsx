import { type HTMLAttributes, type Ref } from 'react'

import { ImageSource } from '../types/ImageSource.js'
import { Image } from './Image.js'

export namespace Picture {
  /**
   * Type describing the props of {@link Picture}.
   */
  export type Props = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLPictureElement>

    sources?: ImageSource[]
  } & HTMLAttributes<HTMLPictureElement> & Pick<Image.Props, 'alt' | 'loadingMode' | 'onError' | 'onLoad' | 'onLoadStart' | 'onSizeChange' | 'src'>
}

export function Picture({ ref, alt, loadingMode, sources = [], src, onError, onLoad, onLoadStart, onSizeChange, ...props }: Picture.Props) {
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
}

if (process.env.NODE_ENV === 'development') {
  Picture.displayName = 'Picture'
}
