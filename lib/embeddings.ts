import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { supabase } from './supabase';

// Initialize embeddings (assumes OPENAI_API_KEY is in env)
export const embeddings = new OpenAIEmbeddings({
    modelName: 'text-embedding-3-small',
});

// Splitter configuration
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 100,
});

export interface RepoFile {
    filePath: string;
    content: string;
}

export async function processAndStoreRepo(
    repoName: string,
    files: RepoFile[]
) {
    try {
        const docs = [];

        // 1. Create documents for splitting
        for (const file of files) {
            const splitDocs = await splitter.createDocuments(
                [file.content],
                [{ file_path: file.filePath, repo: repoName }]
            );
            docs.push(...splitDocs);
        }

        console.log(`Split into ${docs.length} chunks. Generating embeddings...`);

        // 2. Generate embeddings
        const texts = docs.map((d) => d.pageContent);

        // Embed in batches to avoid payload limits
        const embeddingValues = await embeddings.embedDocuments(texts);

        // 3. Prepare rows for Supabase insertion
        const rows = docs.map((d, i) => ({
            repo: repoName,
            file_path: d.metadata.file_path,
            content: d.pageContent,
            embedding: embeddingValues[i],
        }));

        // 4. Insert into Supabase (in batches if needed, but simple insert for now)
        // Supabase can handle decent batch sizes, lets do chunks of 100 just in case
        const INSERT_BATCH_SIZE = 100;

        for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
            const batch = rows.slice(i, i + INSERT_BATCH_SIZE);
            const { error } = await supabase.from('repo_embeddings').insert(batch);

            if (error) {
                console.error('Error inserting embedding batch:', error);
                throw error;
            }
        }

        console.log('Successfully stored embeddings in Supabase.');
        return docs.length;

    } catch (error) {
        console.error('Error processing repo embeddings:', error);
        throw error;
    }
}
