import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useTimeout } from './useTimeout.js'

describe('useTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('invokes the handler after the specified timeout', () => {
    const handler = vi.fn()
    renderHook(() => useTimeout(100, { onTimeout: handler }))

    vi.advanceTimersByTime(100)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not invoke the handler before the timeout elapses', () => {
    const handler = vi.fn()
    renderHook(() => useTimeout(100, { onTimeout: handler }))

    vi.advanceTimersByTime(99)
    expect(handler).not.toHaveBeenCalled()
  })

  it('only invokes the handler once', () => {
    const handler = vi.fn()
    renderHook(() => useTimeout(100, { onTimeout: handler }))

    vi.advanceTimersByTime(500)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not auto-start when shouldAutoStart is false', () => {
    const handler = vi.fn()
    renderHook(() => useTimeout(100, { shouldAutoStart: false, onTimeout: handler }))

    vi.advanceTimersByTime(300)
    expect(handler).not.toHaveBeenCalled()
  })

  it('can be manually started', () => {
    const handler = vi.fn()
    const { result } = renderHook(() => useTimeout(100, { shouldAutoStart: false, onTimeout: handler }))

    result.current.start()
    vi.advanceTimersByTime(100)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('can be stopped before firing', () => {
    const handler = vi.fn()
    const { result } = renderHook(() => useTimeout(100, { onTimeout: handler }))

    result.current.stop()
    vi.advanceTimersByTime(200)
    expect(handler).not.toHaveBeenCalled()
  })

  it('stops on unmount', () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() => useTimeout(100, { onTimeout: handler }))

    unmount()
    vi.advanceTimersByTime(200)
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not start when timeout is negative', () => {
    const handler = vi.fn()
    renderHook(() => useTimeout(-1, { onTimeout: handler }))

    vi.advanceTimersByTime(300)
    expect(handler).not.toHaveBeenCalled()
  })
})
