enum MetricType {
    COMMUTE = 'Commute',
    EMPLOYERS = 'Employment Counts',
    SALARY = 'Salary',
}

type MetricPrediction = {
    response: string
    actual: number
    predicted: number
    error: number
}

type Metric = {
    type: MetricType
    value: number
    metadata: any
    predictions: Array<MetricPrediction>
}

export default Metric
export { MetricType, MetricPrediction }