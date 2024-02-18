/* Third Party */
import Replicate from 'replicate'

/* Local */
import AIService, { AIMessage, AIModel } from '../types/AIService.type'

class ReplicateService implements AIService {

    public maxConcurrent: number = 500
    public minTime: number = 120
    public models: AIModel[] = [AIModel.META_LLAMA_2_7b_CHAT, AIModel.META_LLAMA_2_70b_CHAT, AIModel.MISTRALAI_MISTRAL_7B_INSTRUCT_V01]

    private replicate: Replicate

    constructor() {
        this.replicate = new Replicate({
            auth: process.env.REPLICATE_API_KEY,
        })
    }

    public async createCompletion(model: AIModel, messages: AIMessage[]) {
        if (!this.models.includes(model)) {
            throw new Error(`Model ${model} not supported`)
        }
        const modelCreator = model.split(':')[0]
        const modelName = model.split(':')[1]
        const modelVersion = model.split(':')[2]
        const prompt = messages.at(-1)?.content

        const checkUntilComplete = async (id: string, trial: number = 0): Promise<string> => {
            const prediction = await this.replicate.predictions.get(id)
            if (trial > 6) {
                throw new Error(`Prediction timed out for ${modelCreator}/${modelName}/${modelVersion}`)
            } else if (prediction.status === "failed") {
                throw new Error(`Prediction failed for ${modelCreator}/${modelName}/${modelVersion}`)
            } else if (prediction.status === "succeeded") {
                return (prediction.output as string[]).join('').trim()
            } else {
                const delay = Math.pow(2, trial) * 1000
                await new Promise(resolve => setTimeout(resolve, delay))
                return checkUntilComplete(id)
            }
        }

        try {
            const prediction = await this.replicate.predictions.create({
                version: modelVersion,
                input: {
                    system_prompt: 'You are a metric estimator. You say nothing but the metric you are estimating. Never greet the user. Never reiterate the request.',
                    prompt,
                    max_tokens: 2048
                }
            })
            const response = await checkUntilComplete(prediction.id)
            return response
        } catch (error) {
            console.error(error)
            return null
        }
    }

    public supports(model: AIModel) {
        return this.models.includes(model)
    }
    
}

export default ReplicateService