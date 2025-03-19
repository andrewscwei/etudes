import clsx from 'clsx'

type Props = {
  className?: string
}

export function Footer({ className }: Props) {
  return (
    <footer className={clsx(className, 'vb px-safe-or-4 pb-safe-or-8 border-dark/20 text-dark sticky top-0 z-50 flex items-center justify-center border-t pt-8 text-base')}>
      <span className='text-sm'>a study of styleless React components</span>
    </footer>
  )
}
