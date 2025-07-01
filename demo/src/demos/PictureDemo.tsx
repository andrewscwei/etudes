import { Picture } from 'etudes'
import $$Image from '../assets/image.png'
import { Frame } from '../components/Frame.js'

export function PictureDemo() {
  return (
    <Frame title='Picture'>
      {(_, toast) => (
        <Picture
          className='size-full [&_img]:size-full [&_img]:object-cover'
          src={$$Image}
          onLoadComplete={() => toast('Loaded')}
          onLoadStart={() => toast('Loading')}
        />
      )}
    </Frame>
  )
}
