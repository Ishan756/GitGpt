import { supabase } from './supabase';
import { embeddings } from './embeddings';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';

export async function getRetriever(tableName: string = 'repo_embeddings') {
    const vectorStore = new SupabaseVectorStore(embeddings, {
        client: supabase,
        tableName,
        queryName: 'match_repo_embeddings',
    });

    return vectorStore.asRetriever({
        k: 5
    });
}
