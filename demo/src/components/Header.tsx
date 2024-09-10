import clsx from 'clsx'
import { FlatSVG } from 'etudes/components/FlatSVG'
import type { HTMLAttributes } from 'react'
import $$GitHubIcon from '../assets/svgs/github-icon.svg?raw'

type Props = HTMLAttributes<HTMLElement>

export function Header({ className, ...props }: Props) {
  return (
    <header {...props} className={clsx(className, 'vb px-safe-or-4 pt-safe-or-4 sticky top-0 z-50 flex items-center justify-between border-b border-black/20 pb-4 text-base text-black')}>
      <div className='flex items-center justify-start gap-3'>
        <h1 className='font-bold uppercase tracking-widest'>Études</h1>
      </div>
      <div className='flex items-center gap-2'>
        <span>{`v${window.__VERSION__}`}</span>
        <a className='ia flex size-4' href='https://github.com/andrewscwei/etudes' rel='noopener,noreferrer'>
          <FlatSVG className='svg*:fill-black size-full' svg={$$GitHubIcon}/>
        </a>
      </div>
    </header>
  )
}
