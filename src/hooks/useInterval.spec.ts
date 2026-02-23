import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useInterval } from './useInterval.js'

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('invokes the handler at the specified interval', () => {
    const handler = vi.fn()
    renderHook(() => useInterval(100, { onInterval: handler }))

    vi.advanceTimersByTime(300)
    expect(handler).toHaveBeenCalledTimes(3)
  })

  it('does not invoke the handler before the first interval elapses', () => {
    const handler = vi.fn()
    renderHook(() => useInterval(100, { onInterval: handler }))

    vi.advanceTimersByTime(99)
    expect(handler).not.toHaveBeenCalled()
  })

  it('invokes the handler immediately when shouldInvokeInitially is true', () => {
    const handler = vi.fn()
    renderHook(() => useInterval(100, { shouldInvokeInitially: true, onInterval: handler }))

    expect(handler).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('does not auto-start when shouldAutoStart is false', () => {
    const handler = vi.fn()
    renderHook(() => useInterval(100, { shouldAutoStart: false, onInterval: handler }))

    vi.advanceTimersByTime(500)
    expect(handler).not.toHaveBeenCalled()
  })

  it('can be manually started', () => {
    const handler = vi.fn()
    const { result } = renderHook(() => useInterval(100, { shouldAutoStart: false, onInterval: handler }))

    result.current.start()
    vi.advanceTimersByTime(200)
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('can be stopped', () => {
    const handler = vi.fn()
    const { result } = renderHook(() => useInterval(100, { onInterval: handler }))

    vi.advanceTimersByTime(200)
    expect(handler).toHaveBeenCalledTimes(2)

    result.current.stop()
    vi.advanceTimersByTime(200)
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('stops on unmount', () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() => useInterval(100, { onInterval: handler }))

    unmount()
    vi.advanceTimersByTime(300)
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not start when interval is negative', () => {
    const handler = vi.fn()
    renderHook(() => useInterval(-1, { onInterval: handler }))

    vi.advanceTimersByTime(300)
    expect(handler).not.toHaveBeenCalled()
  })
})
