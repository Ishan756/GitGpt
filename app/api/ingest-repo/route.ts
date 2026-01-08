import { NextRequest, NextResponse } from 'next/server';
import { getRepoFiles } from '@/lib/github';
import { processAndStoreRepo } from '@/lib/embeddings';

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

        console.log(`Found ${files.length} files.`);

        // Process and store using the helper
        try {
            const chunkCount = await processAndStoreRepo(`${owner}/${repo}`, files);
            return NextResponse.json({ success: true, message: `Ingested ${chunkCount} chunks` });
        } catch (err: any) {
            throw new Error(`Processing failed: ${err.message}`);
        }

    } catch (error: any) {
        console.error('Ingestion error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
