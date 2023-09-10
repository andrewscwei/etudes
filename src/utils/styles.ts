import { type CSSProperties } from 'react'

export default function styles(...args: (CSSProperties | undefined | false)[]): CSSProperties {
  return args.reduce<CSSProperties>((out, curr) => ({
    ...out,
    ...curr || {},
  }), {})
}
