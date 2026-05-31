const EMBEDDING_DIMENSION = 256;

function hashToken(token: string): number {
    let hash = 2166136261;

    for (let index = 0; index < token.length; index++) {
        hash ^= token.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return Math.abs(hash) % EMBEDDING_DIMENSION;
}

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .match(/[a-z0-9]+/g) ?? [];
}

function normalize(vector: number[]): number[] {
    const norm = Math.sqrt(vector.reduce((sum, value) => sum + (value * value), 0));

    if (!norm) {
        return vector;
    }

    return vector.map((value) => value / norm);
}

export function embedText(text: string): number[] {
    const vector = new Array(EMBEDDING_DIMENSION).fill(0);
    const tokens = tokenize(text);

    if (tokens.length === 0) {
        return vector;
    }

    for (const token of tokens) {
        vector[hashToken(token)] += 1;

        for (let index = 0; index < token.length - 1; index++) {
            vector[hashToken(token.slice(index, index + 2))] += 0.5;
        }
    }

    return normalize(vector);
}

export class LocalEmbeddings {
    async embedDocuments(documents: string[]): Promise<number[][]> {
        return documents.map((document) => embedText(document));
    }

    async embedQuery(query: string): Promise<number[]> {
        return embedText(query);
    }
}