import computeError from "../computeError.util"

describe('computeError', () => {
    it('should return the percentage error', () => {
        const observed = 10
        const actual = 5
        const error = computeError(observed, actual)
        expect(error).toEqual(100)
    })
    it('should return the error, actual is greater than observed', () => {
        const observed = 100
        const actual = 494
        const error = computeError(observed, actual)
        expect(error).toEqual(79.75708502024291)
    })
    it('should return the error, actual is greater than observed', () => {
        const observed = 110
        const actual = 100
        const error = computeError(observed, actual)
        expect(error).toEqual(10)
    })
})
