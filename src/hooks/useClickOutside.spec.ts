import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useClickOutside } from './useClickOutside.js'

function clickOn(el: Element) {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}

describe('useClickOutside', () => {
  it('triggers when clicking outside the target', () => {
    const handler = vi.fn()
    const target = document.createElement('div')
    const outside = document.createElement('button')
    document.body.appendChild(target)
    document.body.appendChild(outside)

    renderHook(() => useClickOutside(target, handler))
    clickOn(outside)

    expect(handler).toHaveBeenCalledOnce()

    document.body.removeChild(target)
    document.body.removeChild(outside)
  })

  it('does not trigger when clicking the target itself', () => {
    const handler = vi.fn()
    const target = document.createElement('div')
    document.body.appendChild(target)

    renderHook(() => useClickOutside(target, handler))
    clickOn(target)

    expect(handler).not.toHaveBeenCalled()

    document.body.removeChild(target)
  })

  it('does not trigger when clicking a child of the target', () => {
    const handler = vi.fn()
    const target = document.createElement('div')
    const child = document.createElement('span')
    target.appendChild(child)
    document.body.appendChild(target)

    renderHook(() => useClickOutside(target, handler))
    clickOn(child)

    expect(handler).not.toHaveBeenCalled()

    document.body.removeChild(target)
  })

  it('does not trigger when isEnabled is false', () => {
    const handler = vi.fn()
    const target = document.createElement('div')
    const outside = document.createElement('button')
    document.body.appendChild(target)
    document.body.appendChild(outside)

    renderHook(() => useClickOutside(target, handler, { isEnabled: false }))
    clickOn(outside)

    expect(handler).not.toHaveBeenCalled()

    document.body.removeChild(target)
    document.body.removeChild(outside)
  })

  it('removes the listener on unmount', () => {
    const handler = vi.fn()
    const target = document.createElement('div')
    const outside = document.createElement('button')
    document.body.appendChild(target)
    document.body.appendChild(outside)

    const { unmount } = renderHook(() => useClickOutside(target, handler))
    unmount()
    clickOn(outside)

    expect(handler).not.toHaveBeenCalled()

    document.body.removeChild(target)
    document.body.removeChild(outside)
  })

  it('handles multiple targets', () => {
    const handler = vi.fn()
    const t1 = document.createElement('div')
    const t2 = document.createElement('div')
    const outside = document.createElement('button')
    document.body.appendChild(t1)
    document.body.appendChild(t2)
    document.body.appendChild(outside)

    renderHook(() => useClickOutside([t1, t2], handler))

    clickOn(t1)
    expect(handler).not.toHaveBeenCalled()

    clickOn(t2)
    expect(handler).not.toHaveBeenCalled()

    clickOn(outside)
    expect(handler).toHaveBeenCalledOnce()

    document.body.removeChild(t1)
    document.body.removeChild(t2)
    document.body.removeChild(outside)
  })
})
