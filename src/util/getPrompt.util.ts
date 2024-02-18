import Entity from "../types/Entity.type"
import Metric, { MetricType } from "../types/Metric.type"

const getPrompt = (metric: Metric, entity: Entity): string => {
    switch (metric.type) {
        case MetricType.SALARY:
            const jobTitle = metric.metadata.jobTitle
            return `What is the average annual salary for a ${jobTitle} in ${entity.name}? Return one estimate with no other text, do not return a range. Salary:`
        case MetricType.COMMUTE:
            const origin = metric.metadata?.origin
            const destination = metric.metadata?.destination
            return `What is the average driving commute time from ${origin} to ${destination} in ${entity.name}? Provide an estimate even though you are not a GPS. Return an estimate in minutes with no other text. Commute Estimate:`
        case MetricType.EMPLOYERS:
            const employerName = metric.metadata?.name
            return `How many people does ${employerName} employ in ${entity.name}? Provide an estimate even if this information is not publicly available. Return one estimate with no other text, do not return a range. Number employed:`
    }
}

export default getPrompt