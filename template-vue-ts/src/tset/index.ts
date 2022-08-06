import { describe, expect, it } from 'vitest'

describe('suite', () => {
  it('add', () => {
    const rules = (a: number, b: number) => a + b
    expect(rules(1, 1)).toEqual(2)
  })
})
