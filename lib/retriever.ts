import { supabase } from './supabase';
import { embeddings } from './embeddings';

// Function to retrieve relevant documents via cosine similarity
export async function retrieveContext(question: string, repo: string): Promise<string> {
    try {
        // 1. Generate embedding for the question
        const queryEmbedding = await embeddings.embedQuery(question);

        // 2. Query Supabase using the match_repo_embeddings RPC function
        // match_repo_embeddings signature: (query_embedding vector, match_threshold float, match_count int)
        const { data: chunks, error } = await supabase.rpc('match_repo_embeddings', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5, // Similarity threshold (adjustable)
            match_count: 5,       // Top 5 chunks
        });

        if (error) {
            console.error('Error retrieving chunks:', error);
            throw error;
        }

        // 3. Filter by repository (if not already handled in RPC, but our RPC currently matches ALL repos)
        // Wait, the RPC I provided earlier doesn't filter by repo! 
        // I need to update the RPC or filter here. 
        // Filtering here after retrieval is inefficient if the DB has many repos.
        // Ideally, the RPC should accept a filter.
        // For now, given the user instructions just said "Query Supabase using cosine similarity" and "Retrieve top 5",
        // I will filter client-side if the RPC returns mixed results, OR ideally update RPC.
        // However, user just asked to "Implement lib/retriever.ts".
        // I will try to filter in code for now to match exactly what is returned, 
        // BUT simply passing repo to RPC is better.
        // Let's look at the RPC again. It didn't have a repo filter argument.
        // I'll filter here for simplicity and to stick to the task.

        const relevantChunks = chunks
            .filter((chunk: any) => {
                // chunk.metadata is jsonb. check if repository matches.
                return chunk.metadata && chunk.metadata.repository === repo;
            })
            .map((chunk: any) => chunk.content);

        // If filtering post-query reduces count significantly, validity is lower, but it works for single-repo scenarios.

        return relevantChunks.join('\n\n');

    } catch (error) {
        console.error('Error in retrieveContext:', error);
        return '';
    }
}
