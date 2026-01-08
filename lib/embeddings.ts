import { OpenAIEmbeddings } from '@langchain/openai';

// Ensure OPENAI_API_KEY is set in environment variables
export const embeddings = new OpenAIEmbeddings({
    modelName: 'text-embedding-3-small',
});
