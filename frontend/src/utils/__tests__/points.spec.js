const { describe, it, expect } = require('@jest/globals')

const { sortRectCoords } = require('../points')

describe('sortRectCoords', () => {
    it('Creates array', () => {
        expect(sortRectCoords([[100, 30], [20, 50]])).toEqual([[20, 30], [100, 50]])
    })
})
