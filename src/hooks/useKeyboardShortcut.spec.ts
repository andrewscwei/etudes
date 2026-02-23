import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useKeyboardShortcut } from './useKeyboardShortcut.js'

function pressKey(key: string, modifiers: { altKey?: boolean; ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...modifiers }))
}

describe('useKeyboardShortcut', () => {
  it('triggers the action when the bound key is pressed', () => {
    const action = vi.fn()
    renderHook(() => useKeyboardShortcut('a', action))

    pressKey('a')
    expect(action).toHaveBeenCalledOnce()
  })

  it('does not trigger for an unbound key', () => {
    const action = vi.fn()
    renderHook(() => useKeyboardShortcut('a', action))

    pressKey('b')
    expect(action).not.toHaveBeenCalled()
  })

  it('triggers for a key chord', () => {
    const action = vi.fn()
    renderHook(() => useKeyboardShortcut(['control', 's'], action))

    pressKey('s', { ctrlKey: true })
    expect(action).toHaveBeenCalledOnce()
  })

  it('does not trigger the chord when a modifier is missing', () => {
    const action = vi.fn()
    renderHook(() => useKeyboardShortcut(['control', 's'], action))

    pressKey('s')
    expect(action).not.toHaveBeenCalled()
  })

  it('does not trigger a single-key shortcut when an extra modifier is held', () => {
    const action = vi.fn()
    renderHook(() => useKeyboardShortcut('a', action))

    pressKey('a', { shiftKey: true })
    expect(action).not.toHaveBeenCalled()
  })

  it('does not trigger when isEnabled is false', () => {
    const action = vi.fn()
    renderHook(() => useKeyboardShortcut('a', action, { isEnabled: false }))

    pressKey('a')
    expect(action).not.toHaveBeenCalled()
  })

  it('removes the listener on unmount', () => {
    const action = vi.fn()
    const { unmount } = renderHook(() => useKeyboardShortcut('a', action))

    unmount()
    pressKey('a')
    expect(action).not.toHaveBeenCalled()
  })

  it('always calls the latest action without re-registering the listener', () => {
    let callCount = 0
    const { rerender } = renderHook(() => {
      useKeyboardShortcut('a', () => {
        callCount++
      })
    })

    pressKey('a')
    expect(callCount).toBe(1)

    rerender()
    pressKey('a')
    expect(callCount).toBe(2)
  })

  it('is case-insensitive for the key', () => {
    const action = vi.fn()
    renderHook(() => useKeyboardShortcut('a', action))

    pressKey('A')
    expect(action).toHaveBeenCalledOnce()
  })
})
