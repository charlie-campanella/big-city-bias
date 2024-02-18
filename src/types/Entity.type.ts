import Metric, { MetricType } from "./Metric.type"

enum EntityType {
    METRO = 'Metro'
}

const ENTITY_SUPPORTED_METRICS: Record<EntityType, MetricType[]> = {
    [EntityType.METRO]: [
        MetricType.COMMUTE,
        MetricType.EMPLOYERS,
        MetricType.SALARY,
    ]
}

type Entity = {
    type: EntityType
    name: string
    size: number
    metrics: Array<Metric>
}

export default Entity
export { EntityType, ENTITY_SUPPORTED_METRICS }