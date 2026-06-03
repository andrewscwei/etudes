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

    source: [string, ...ImageSource[]] | string
  } & HTMLAttributes<HTMLPictureElement> & Pick<Image.Props, 'alt' | 'loadingMode' | 'onError' | 'onLoad' | 'onLoadStart' | 'onSizeChange'>
}

export function Picture({ ref, alt, loadingMode, source, onError, onLoad, onLoadStart, onSizeChange, ...props }: Picture.Props) {
  const src = typeof source === 'string' ? source : source[0]
  const sources = typeof source === 'string' ? [] : source.slice(1) as ImageSource[]

  return (
    <picture {...props} ref={ref}>
      {sources.map((s, idx) => (
        <source key={idx} {...ImageSource.asProps(s)}/>
      ))}
      <Image
        style={{ height: '100%', width: '100%' }}
        alt={alt}
        loadingMode={loadingMode}
        source={src}
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
