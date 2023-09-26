import { type CSSProperties } from 'react'

export function asStyleDict<T>(dict: { [K in keyof T]: CSSProperties }) {
  return dict
}
