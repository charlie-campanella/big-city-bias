enum AIModel {
    OPENAI_GPT_3_5_TURBO = 'gpt-3.5-turbo',
    OPENAI_GPT_4 = 'gpt-4',
    META_LLAMA_2_7b_CHAT = 'meta:llama-2-7b-chat:13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0',
    META_LLAMA_2_70b_CHAT = 'meta:llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3',
    MISTRALAI_MISTRAL_7B_INSTRUCT_V01 = 'mistralai:mistral-7b-instruct-v0.1:5fe0a3d7ac2852264a25279d1dfb798acbc4d49711d126646594e212cb821749'
}

type AIMessage = {
    role: string,
    content: string
}

type AIService = {
    maxConcurrent: number,
    minTime: number,
    createCompletion: (model: AIModel, messages: AIMessage[]) => Promise<string | null>,
    models: AIModel[],
    supports: (model: AIModel) => boolean
}

export default AIService
export { AIModel, AIMessage }