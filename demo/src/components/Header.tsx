import clsx from 'clsx'
import { FlatSVG } from 'etudes/components/FlatSVG'
import type { HTMLAttributes } from 'react'
import $$GitHubIcon from '../assets/github-icon.svg?raw'

type Props = HTMLAttributes<HTMLElement>

export function Header({ className, ...props }: Props) {
  return (
    <header {...props} className={clsx(className, 'vb px-safe-or-4 pt-safe-or-4 border-dark/20 text-dark sticky top-0 z-50 flex items-center justify-between border-b pb-4 text-base')}>
      <div className='flex items-center justify-start gap-3'>
        <h1 className='font-bold uppercase tracking-widest'>Études</h1>
      </div>
      <div className='flex items-center gap-2'>
        <span>{`v${__VERSION__}`}</span>
        <a className='ia flex size-4' href='https://github.com/andrewscwei/etudes' rel='noopener,noreferrer'>
          <FlatSVG className='svg:fill-dark size-full' svg={$$GitHubIcon}/>
        </a>
      </div>
    </header>
  )
}
