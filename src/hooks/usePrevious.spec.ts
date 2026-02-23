import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { usePrevious } from './usePrevious.js'

describe('usePrevious', () => {
  it('returns undefined on the first render', () => {
    const { result } = renderHook(() => usePrevious(1))
    expect(result.current).toBeUndefined()
  })

  it('returns the previous value after a rerender', () => {
    let value = 1
    const { rerender, result } = renderHook(() => usePrevious(value))

    value = 2
    rerender()
    expect(result.current).toBe(1)
  })

  it('lags one render behind', () => {
    let value = 'a'
    const { rerender, result } = renderHook(() => usePrevious(value))

    value = 'b'
    rerender()
    expect(result.current).toBe('a')

    value = 'c'
    rerender()
    expect(result.current).toBe('b')
  })
})
