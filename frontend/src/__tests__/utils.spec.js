const { sortRectCoords } = require('../utils')

describe('sortRectCoords', () => {
    it('Creates array', () => {
        expect(sortRectCoords([[100, 30], [20, 50]])).toEqual([[20, 30], [100, 50]])
    })
})
