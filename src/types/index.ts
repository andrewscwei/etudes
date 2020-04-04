import { FlattenSimpleInterpolation } from 'styled-components';

export type ExtendedCSSFunction<P = {}> = (props: P) => FlattenSimpleInterpolation;

export type ExtendedCSSProps<P = {}> = Readonly<{ extendedCSS: ExtendedCSSFunction<P>; }>;
