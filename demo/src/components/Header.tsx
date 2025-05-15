import clsx from 'clsx'
import { FlatSVG } from 'etudes'
import $$GitHubIcon from '../assets/github-icon.svg?raw'

type Props = {
  className?: string
}

export function Header({ className }: Props) {
  return (
    <header className={clsx(className, 'vb px-safe-or-4 pt-safe-or-4 border-dark/20 text-dark sticky top-0 z-50 flex items-center justify-between border-b pb-4 text-base')}>
      <div className='flex items-center justify-start gap-3'>
        <h1 className='font-bold uppercase tracking-widest'>Études</h1>
      </div>
      <div className='flex items-center gap-2'>
        <span>{`v${import.meta.env.VERSION}`}</span>
        <a className='ia flex size-4' href='https://github.com/andrewscwei/etudes' rel='noopener,noreferrer'>
          <FlatSVG className='[&_svg]:fill-dark size-full' svg={$$GitHubIcon}/>
        </a>
      </div>
    </header>
  )
}
