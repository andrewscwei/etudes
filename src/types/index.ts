import { FlattenSimpleInterpolation } from 'styled-components'

export type ExtendedCSSFunction<P = Record<string, never>> = (props: P) => FlattenSimpleInterpolation

export type ExtendedCSSProps<P = Record<string, never>> = Readonly<{ extendedCSS: ExtendedCSSFunction<P> }>

export type Range = Readonly<[number, number]>

export type Orientation = 'horizontal' | 'vertical'
