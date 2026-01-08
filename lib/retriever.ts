import { supabase } from './supabase';
import { embeddings } from './embeddings';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';

export async function getRetriever(tableName: string = 'documents') {
    const vectorStore = new SupabaseVectorStore(embeddings, {
        client: supabase,
        tableName,
        queryName: 'match_documents',
    });

    return vectorStore.asRetriever({
        k: 5
    });
}
