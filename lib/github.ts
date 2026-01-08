import { Octokit } from '@octokit/rest';

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

export interface FileContent {
    path: string;
    content: string;
}

export async function getRepoFiles(
    owner: string,
    repo: string,
    path: string = ''
): Promise<FileContent[]> {
    try {
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path,
        });

        let files: FileContent[] = [];

        if (Array.isArray(data)) {
            for (const item of data) {
                if (item.type === 'file') {
                    // Skip non-text files or huge files if necessary for simplicity
                    // For now, let's try to fetch content.
                    // Note: getContent for file returns base64 encoded content usually.
                    const fileContent = await fetchFileContent(owner, repo, item.path);
                    if (fileContent) {
                        files.push(fileContent);
                    }
                } else if (item.type === 'dir') {
                    const subFiles = await getRepoFiles(owner, repo, item.path);
                    files = files.concat(subFiles);
                }
            }
        }

        return files;
    } catch (error) {
        console.error(`Error fetching repo content for ${owner}/${repo}/${path}:`, error);
        return [];
    }
}

async function fetchFileContent(owner: string, repo: string, path: string): Promise<FileContent | null> {
    try {
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path
        });

        if (!Array.isArray(data) && data.type === 'file' && data.content) {
            // Content is base64 encoded
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            return {
                path,
                content
            };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching file content for ${path}:`, error);
        return null;
    }
}
