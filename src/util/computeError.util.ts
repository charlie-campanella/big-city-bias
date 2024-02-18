const computeError = (observed: number, actual: number): number => {
    return Math.abs((observed - actual) / actual * 100)
}

export default computeError