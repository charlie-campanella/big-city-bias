/* Third Party */
import Bottleneck from 'bottleneck'

/* Local */
// Types
import AIService, { AIModel } from './types/AIService.type'
import Entity, { EntityType } from "./types/Entity.type"
import Metric, { MetricType } from "./types/Metric.type"

// Services
import OpenAIService from "./service/OpenAI.service"
import ReplicateService from './service/Replicate.service'

// Util
import computeError from './util/computeError.util'
import getPrompt from "./util/getPrompt.util"

class Evaluation {
    
    private model: AIModel
    private entityType: EntityType
    private data: Entity[]
    private aiService: AIService

    constructor(model: AIModel, entityType: EntityType, data: Entity[]) {
        this.model = model
        this.entityType = entityType
        this.data = data
        this.aiService = this.getAIService(this.model)
    }

    public async evaluate() {
        console.log(`Evaluating ${this.entityType} with ${this.model}`)
        const limiter = new Bottleneck({
            maxConcurrent: this.aiService instanceof ReplicateService ? 500 : 2500,
            minTime: this.aiService instanceof ReplicateService ? 110 : 11
        })
        const promises = this.data.flatMap(entity => entity.metrics.flatMap(metric => limiter.schedule(() => this.predict(entity, metric))))
        await Promise.all(promises)
    }

    private async predict(entity: Entity, metric: Metric) {

        const messages = [{content: getPrompt(metric, entity), role: 'user'}]
        const raw = await this.aiService.createCompletion(this.model, messages)

        if (metric.value === -1 || metric.value === undefined) {
            console.error(`No actual value for ${entity.name} ${metric.type}. Actual: ${metric.value}`)
            return
        } else if (!raw) {
            console.error(`No prediction for ${entity.name} ${metric.type}. Raw: ${raw}`)
            return
        }

        const predicted: number = this.parseNumericPrediction(raw)
        const error: number = computeError(predicted, metric.value)
        
        if (Number.isNaN(predicted)) {
            console.error(`Prediction for ${entity.name} ${metric.type} is NaN`)
            return
        }

        console.dir(`
            ${entity.name} ${metric.type}:
            Actual: ${metric.value}
            Raw Output: ${raw}
            Parsed: ${predicted}
        `)

        metric.predictions.push({
            response: raw,
            actual: metric.value,
            predicted,
            error
        })
    }

    private getAIService(model: AIModel): AIService {
        const services = [new OpenAIService(), new ReplicateService()]
        const supportedService = services.find(service => service.supports(model))
        if (!supportedService) {
            throw new Error(`No AI service found for model ${model}`)
        }
        return supportedService
    }

    private parseNumericPrediction(raw: string): number {
        return Number(raw.replace(/[^0-9\.]+/g,""))
    }

}

export default Evaluation