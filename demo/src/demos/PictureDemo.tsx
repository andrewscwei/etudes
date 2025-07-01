import { Picture } from 'etudes'
import $$Image from '../assets/image.png'
import { Frame } from '../components/Frame.js'

export function PictureDemo() {
  return (
    <Frame title='Picture'>
      <Picture
        className=''
        sources={[{
          srcSet: [{
            src: $$Image,
            width: 400,
          }, {
            src: $$Image,
            width: 800,
          }],
          type: 'image/png',
          media: '(min-width: 800px)',
        }]}
        src={$$Image}
      />
    </Frame>
  )
}
