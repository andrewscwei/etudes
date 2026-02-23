import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useLatest } from './useLatest.js'

describe('useLatest', () => {
  it('returns a ref containing the initial value', () => {
    const { result } = renderHook(() => useLatest(42))
    expect(result.current.current).toBe(42)
  })

  it('reflects the latest value after rerender', () => {
    let value = 1
    const { rerender, result } = renderHook(() => useLatest(value))
    expect(result.current.current).toBe(1)

    value = 2
    rerender()
    expect(result.current.current).toBe(2)
  })

  it('returns the same ref object across rerenders', () => {
    const { rerender, result } = renderHook(() => useLatest(0))
    const ref = result.current
    rerender()
    expect(result.current).toBe(ref)
  })
})
