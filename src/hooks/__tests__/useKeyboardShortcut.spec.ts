import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useKeyboardShortcut } from '../useKeyboardShortcut.js'

describe('useKeyboardShortcut', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

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

  it('ignores auto-repeated key events by default', () => {
    const action = vi.fn()
    renderHook(() => useKeyboardShortcut('a', action))

    pressKey('a')
    pressKey('a', { repeat: true })
    expect(action).toHaveBeenCalledOnce()
  })

  it('triggers on auto-repeated key events when ignoresRepeat is false', () => {
    const action = vi.fn()
    renderHook(() => useKeyboardShortcut('a', action, { ignoresRepeat: false }))

    pressKey('a')
    pressKey('a', { repeat: true })
    expect(action).toHaveBeenCalledTimes(2)
  })

  it('ignores a typing shortcut while a text input has focus', () => {
    const action = vi.fn()
    const input = mountElement<HTMLInputElement>('<input type="text">')
    renderHook(() => useKeyboardShortcut('p', action))

    pressKey('p', {}, input)
    expect(action).not.toHaveBeenCalled()
  })

  it('ignores a typing shortcut while a textarea has focus', () => {
    const action = vi.fn()
    const textarea = mountElement<HTMLTextAreaElement>('<textarea></textarea>')
    renderHook(() => useKeyboardShortcut('p', action))

    pressKey('p', {}, textarea)
    expect(action).not.toHaveBeenCalled()
  })

  it('ignores a typing shortcut while a contenteditable element has focus', () => {
    const action = vi.fn()
    const editable = mountElement<HTMLDivElement>('<div contenteditable="true"></div>')
    renderHook(() => useKeyboardShortcut('p', action))

    pressKey('p', {}, editable)
    expect(action).not.toHaveBeenCalled()
  })

  it('triggers a typing shortcut on a non-text input', () => {
    const action = vi.fn()
    const checkbox = mountElement<HTMLInputElement>('<input type="checkbox">')
    renderHook(() => useKeyboardShortcut('p', action))

    pressKey('p', {}, checkbox)
    expect(action).toHaveBeenCalledOnce()
  })

  it('triggers a typing shortcut on a read-only text input', () => {
    const action = vi.fn()
    const input = mountElement<HTMLInputElement>('<input type="text" readonly>')
    renderHook(() => useKeyboardShortcut('p', action))

    pressKey('p', {}, input)
    expect(action).toHaveBeenCalledOnce()
  })

  it('triggers a non-printable key while a text input has focus', () => {
    const action = vi.fn()
    const input = mountElement<HTMLInputElement>('<input type="text">')
    renderHook(() => useKeyboardShortcut('escape', action))

    pressKey('Escape', {}, input)
    expect(action).toHaveBeenCalledOnce()
  })

  it('ignores an editing key while a text input has focus', () => {
    const action = vi.fn()
    const input = mountElement<HTMLInputElement>('<input type="text">')
    renderHook(() => useKeyboardShortcut('backspace', action))

    pressKey('Backspace', {}, input)
    expect(action).not.toHaveBeenCalled()
  })

  it('triggers a modified chord while a text input has focus', () => {
    const action = vi.fn()
    const input = mountElement<HTMLInputElement>('<input type="text">')
    renderHook(() => useKeyboardShortcut(['meta', 's'], action))

    pressKey('s', { metaKey: true }, input)
    expect(action).toHaveBeenCalledOnce()
  })

  it('triggers a typing shortcut in a text input when shouldYieldToTextInput is false', () => {
    const action = vi.fn()
    const input = mountElement<HTMLInputElement>('<input type="text">')
    renderHook(() => useKeyboardShortcut('p', action, { shouldYieldToTextInput: false }))

    pressKey('p', {}, input)
    expect(action).toHaveBeenCalledOnce()
  })

  it('ignores a non-printable key in a text input when shouldYieldToTextInput is true', () => {
    const action = vi.fn()
    const input = mountElement<HTMLInputElement>('<input type="text">')
    renderHook(() => useKeyboardShortcut('escape', action, { shouldYieldToTextInput: true }))

    pressKey('Escape', {}, input)
    expect(action).not.toHaveBeenCalled()
  })
})

function pressKey(
  key: string,
  init: {
    altKey?: boolean
    ctrlKey?: boolean
    metaKey?: boolean
    repeat?: boolean
    shiftKey?: boolean
  } = {},
  target: EventTarget = window,
) {
  target.dispatchEvent(new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  }))
}

function mountElement<T extends HTMLElement>(html: string): T {
  document.body.innerHTML = html

  return document.body.firstElementChild as T
}
