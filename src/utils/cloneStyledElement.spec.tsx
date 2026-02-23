import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { cloneStyledElement } from './cloneStyledElement.js'

describe('cloneStyledElement', () => {
  it('merges classNames from both element and props', () => {
    const el = <div className='original'/>
    const { container } = render(cloneStyledElement(el, { className: 'extra' }))
    expect((container.firstChild as HTMLElement).className).toContain('original')
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })

  it('works when element has no className', () => {
    const el = <div/>
    const { container } = render(cloneStyledElement(el, { className: 'added' }))
    expect((container.firstChild as HTMLElement).className).toBe('added')
  })

  it('merges styles from both element and props', () => {
    const el = <div style={{ color: 'red' }}/>
    const { container } = render(cloneStyledElement(el, { style: { fontSize: '12px' } }))
    const style = (container.firstChild as HTMLElement).style
    expect(style.color).toBe('red')
    expect(style.fontSize).toBe('12px')
  })

  it('props style overrides element style for the same property', () => {
    const el = <div style={{ color: 'red' }}/>
    const { container } = render(cloneStyledElement(el, { style: { color: 'blue' } }))
    expect((container.firstChild as HTMLElement).style.color).toBe('blue')
  })

  it('passes through other props', () => {
    const el = <div/>
    const { container } = render(cloneStyledElement(el, { id: 'test-id' }))
    expect((container.firstChild as HTMLElement).id).toBe('test-id')
  })

  it('appends additional children', () => {
    const el = <div/>
    const { container } = render(cloneStyledElement(el, {}, <span>child</span>))
    expect(container.querySelector('span')).not.toBeNull()
  })
})
