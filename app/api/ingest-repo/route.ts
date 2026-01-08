import { NextRequest, NextResponse } from 'next/server';
import { getRepoFiles } from '@/lib/github';
import { supabase } from '@/lib/supabase';
import { embeddings } from '@/lib/embeddings';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';

export const runtime = 'nodejs'; // GitHub API might be slow, nodejs runtime is safer for timeouts than edge

export async function POST(req: NextRequest) {
    try {
        const { repoUrl } = await req.json();

        if (!repoUrl) {
            return NextResponse.json({ error: 'Missing repoUrl' }, { status: 400 });
        }

        // Extract owner and repo from URL
        // Expected format: https://github.com/owner/repo
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
        }

        const owner = match[1];
        const repo = match[2].replace('.git', '');

        console.log(`Fetching files for ${owner}/${repo}...`);
        const files = await getRepoFiles(owner, repo);

        console.log(`Found ${files.length} files.`);

        // Split text into chunks
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const docs = [];
        for (const file of files) {
            const chunks = await splitter.createDocuments(
                [file.content],
                [{ source: file.path, repository: `${owner}/${repo}` }]
            );
            docs.push(...chunks);
        }

        console.log(`Generated ${docs.length} chunks.`);

        // Store in Supabase
        // Note: This relies on the table 'documents' existing with appropriate schema
        await SupabaseVectorStore.fromDocuments(
            docs,
            embeddings,
            {
                client: supabase,
                tableName: 'documents',
                queryName: 'match_documents'
            }
        );

        return NextResponse.json({ success: true, message: `Ingested ${docs.length} chunks` });

    } catch (error: any) {
        console.error('Ingestion error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
