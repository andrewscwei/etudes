import { type CSSProperties } from 'react'

export default function asStyleDict<T>(dict: { [K in keyof T]: CSSProperties }) {
  return dict
}
