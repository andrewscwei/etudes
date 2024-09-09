import { CycleButton } from '../../../lib/components/CycleButton'

type Props = {
  options: string[]
  onChange: (value: string, index: number) => void
}

export function OptionSelector({ options, onChange }: Props) {
  return (
    <CycleButton options={options} onChange={onChange}/>
  )
}
