import { Octokit } from '@octokit/rest';

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

export interface FileContent {
    filePath: string;
    content: string;
}

const ALLOWED_EXTENSIONS = ['.ts', '.js', '.tsx', '.md', '.json'];

export async function getRepoFiles(owner: string, repo: string): Promise<FileContent[]> {
    try {
        // 1. Get the default branch
        const { data: repoData } = await octokit.repos.get({ owner, repo });
        const defaultBranch = repoData.default_branch;

        // 2. Fetch the git tree recursively
        const { data: treeData } = await octokit.git.getTree({
            owner,
            repo,
            tree_sha: defaultBranch,
            recursive: 'true',
        });

        if (treeData.truncated) {
            console.warn('Repository tree is too large and was truncated.');
        }

        // 3. Filter files
        const relevantFiles = treeData.tree.filter((item) => {
            // Must be a blob (file)
            if (item.type !== 'blob' || !item.path) return false;

            // Skip node_modules
            if (item.path.includes('node_modules')) return false;

            // Check extension
            const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => item.path!.endsWith(ext));
            return hasValidExt;
        });

        console.log(`Found ${relevantFiles.length} relevant files`);

        // 4. Fetch content in batches to respect rate limits
        const results: FileContent[] = [];
        const BATCH_SIZE = 10;

        for (let i = 0; i < relevantFiles.length; i += BATCH_SIZE) {
            const batch = relevantFiles.slice(i, i + BATCH_SIZE);

            const batchPromises = batch.map(async (file) => {
                try {
                    // Check file size limit if provided in tree (item.size), optional safety
                    // For now, straightforward fetch
                    const { data } = await octokit.git.getBlob({
                        owner,
                        repo,
                        file_sha: file.sha!,
                    });

                    // Git blob content is base64 encoded
                    const content = Buffer.from(data.content, 'base64').toString('utf-8');

                    return {
                        filePath: file.path!,
                        content,
                    };
                } catch (error) {
                    console.error(`Error fetching file: ${file.path}`, error);
                    return null;
                }
            });

            const batchResults = await Promise.all(batchPromises);

            batchResults.forEach((res) => {
                if (res) results.push(res);
            });
        }

        return results;

    } catch (error) {
        console.error('Error in getRepoFiles:', error);
        throw error;
    }
}
