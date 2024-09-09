import clsx from 'clsx'
import { FlatSVG } from 'etudes/components/FlatSVG'
import { WithTooltip } from 'etudes/components/WithTooltip'
import type { HTMLAttributes } from 'react'
import $$GitHubIcon from '../assets/svgs/github-icon.svg?raw'

type Props = HTMLAttributes<HTMLElement>

export function Header({ className, ...props }: Props) {
  return (
    <header {...props} className={clsx(className, 'text-md px-safe-or-8 pt-safe-or-4 sticky top-0 flex items-center justify-between border-b border-black/20 pb-4 text-black')}>
      <div className='flex items-center justify-start gap-3'>
        <h1 className='font-bold'>Études</h1>
        <span className='text-sm'>[a study of headless React components]</span>
      </div>
      <div className='flex items-center gap-3'>
        <span className='text-sm'>{`v${__VERSION__}`}</span>
        <WithTooltip hint='This is wrapped with WithTooltip!'>
          <a className='relative flex size-5' href='https://github.com/andrewscwei/etudes' rel='noopener,noreferrer'>
            <FlatSVG className='svg*:fill-black size-full' svg={$$GitHubIcon}/>
          </a>
        </WithTooltip>
      </div>
    </header>
  )
}
