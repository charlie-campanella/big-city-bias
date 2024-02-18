import OpenAI from 'openai'
import AIService, { AIMessage, AIModel } from '../types/AIService.type'

class OpenAIService implements AIService {

    public maxConcurrent: number = 250
    public minTime: number = 300
    public models: AIModel[] = [AIModel.OPENAI_GPT_3_5_TURBO, AIModel.OPENAI_GPT_4]
    
    private timeout: number = 10 * 1000
    private openai: OpenAI

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env['OPENAI_API_KEY'],
            timeout: this.timeout
        })
    }

    async createCompletion(model: AIModel, messages: AIMessage[]) {
        if (!this.models.includes(model)) {
            throw new Error(`Model ${model} not supported`)
        }
        try {
            const completion = await this.openai.chat.completions.create({
                messages: messages as any,
                model,
            })
            const reply = completion.choices[0].message.content
            return reply
        } catch (error) {
            console.error(error)
            return null
        }
    }

    public supports(model: AIModel) {
        return this.models.includes(model)
    }
}

export default OpenAIService