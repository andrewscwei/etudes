import GitHubIcon from '../assets/github-icon.svg?react'

export function Header() {
  return (
    <header className='sticky top-safe z-50 pt-safe px-safe'>
      <div className='px-4 py-4 tab:px-10 note:px-20'>
        <div className='flex items-center justify-between rounded-lg border border-dark/20 p-4 text-base text-dark backdrop-blur-md'>
          <div className='flex items-center justify-start gap-3'>
            <h1 className='font-bold tracking-widest uppercase'>Études</h1>
          </div>
          <div className='flex items-center gap-2'>
            <span>{`v${import.meta.env.VERSION}`}</span>
            <a
              className='ia flex size-4 items-center justify-center **:fill-dark!'
              href='https://github.com/andrewscwei/etudes'
              rel='noopener,noreferrer'
            >
              <GitHubIcon className='size-full'/>
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
