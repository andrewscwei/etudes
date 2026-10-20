import { describe, expect, it } from 'vitest'

import { styles } from './styles.js'

describe('styles', () => {
  it('returns an empty object with no arguments', () => {
    expect(styles()).toEqual({})
  })

  it('merges multiple style objects', () => {
    expect(styles({ color: 'red' }, { fontSize: '12px' })).toEqual({ color: 'red', fontSize: '12px' })
  })

  it('later values override earlier values for the same property', () => {
    expect(styles({ color: 'red' }, { color: 'blue' })).toEqual({ color: 'blue' })
  })

  it('ignores undefined entries', () => {
    expect(styles({ color: 'red' }, undefined)).toEqual({ color: 'red' })
  })

  it('ignores false entries', () => {
    expect(styles({ color: 'red' }, false)).toEqual({ color: 'red' })
  })

  it('handles a single argument', () => {
    expect(styles({ color: 'red' })).toEqual({ color: 'red' })
  })
})
