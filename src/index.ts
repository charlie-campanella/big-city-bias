/* Third Party */
import dotenv from 'dotenv'

/* Local */
import Analysis from './Analysis'
import { AIModel } from './types/AIService.type'
import CSVService from './service/CSV.service'
import Evaluation from './Evaluation'
import Entity, { EntityType } from './types/Entity.type'
import { cacheData, loadCachedData } from './util/cache.util'

dotenv.config()
const REFERENCE_CACHE = process.env.CACHE !== 'FALSE'

const main = async () => {
    const EVAL_MODELS: AIModel[] = [
        AIModel.OPENAI_GPT_4,
        AIModel.META_LLAMA_2_7b_CHAT,
        AIModel.OPENAI_GPT_3_5_TURBO,
        AIModel.META_LLAMA_2_70b_CHAT, 
        AIModel.MISTRALAI_MISTRAL_7B_INSTRUCT_V01
    ]
    for (const model of EVAL_MODELS) {
        const CACHE_KEY = `evaluation-${model}.json`
        const analysis = new Analysis()
        for (const entityType of Object.values(EntityType)) {
            const csvService = new CSVService(entityType)
            const cachedData = loadCachedData(CACHE_KEY)
            const cacheIndex = Object.keys(cachedData).length
            const entities: Array<Entity> = REFERENCE_CACHE ? cachedData[`trial_${cacheIndex}`] : await csvService.getData()
            if (!REFERENCE_CACHE) {
                const evaluation = new Evaluation(model, entityType, entities)
                await evaluation.evaluate()
                cachedData[`trial_${cacheIndex + 1}`] = entities
                cacheData(CACHE_KEY, cachedData)
            }
            analysis.run(model, entityType, entities)
        }
    }
}

main()