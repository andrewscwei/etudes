import { Image } from 'etudes/components/Image'
import $$GitHubIcon from '../assets/svgs/github-icon.svg'
import { Frame } from '../components/Frame.js'

export function ImageDemo() {
  return (
    <Frame title='Image'>
      {(_, toast) => (
        <Image
          className='size-32'
          src={$$GitHubIcon}
          onLoadComplete={() => toast('Loaded')}
          onLoadStart={() => toast('Loading')}
        />
      )}
    </Frame>
  )
}
