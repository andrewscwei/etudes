import { Image } from 'etudes'
import { useCallback } from 'react'
import $$Image from '../assets/image.png'
import { Frame } from '../components/Frame.js'

export function ImageDemo() {
  return (
    <Frame title='Image'>
      {(_, toast) => {
        const loadCompleteHandler = useCallback(() => toast('Loaded'), [toast])
        const loadStartHandler = useCallback(() => toast('Loading'), [toast])

        return (
          <Image
            className='size-full object-cover'
            src={$$Image}
            onLoadComplete={loadCompleteHandler}
            onLoadStart={loadStartHandler}
          />
        )
      }}
    </Frame>
  )
}
