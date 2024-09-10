import clsx from 'clsx'
import type { HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLElement>

export function Footer({ className, ...props }: Props) {
  return (
    <footer {...props} className={clsx(className, 'vb px-safe-or-4 pb-safe-or-8 sticky top-0 z-50 flex items-center justify-center border-t border-black/20 pt-8 text-base text-black')}>
      <span className='text-sm'>a study of styleless React components</span>
    </footer>
  )
}
