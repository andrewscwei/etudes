import { Image } from 'etudes'
import $$Image from '../assets/image.png'
import { Frame } from '../components/Frame.js'

export function ImageDemo() {
  return (
    <Frame title='Image'>
      {(_, toast) => (
        <Image
          className='size-full object-cover'
          src={$$Image}
          onLoadComplete={() => toast('Loaded')}
          onLoadStart={() => toast('Loading')}
        />
      )}
    </Frame>
  )
}
