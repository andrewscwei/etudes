import { OptionButton } from '../../../lib/components/OptionButton'

type Props = {
  options: string[]
  onChange: (value: string, index: number) => void
}

export function OptionSelector({ options, onChange }: Props) {
  return (
    <OptionButton options={options} onChange={onChange}/>
  )
}
