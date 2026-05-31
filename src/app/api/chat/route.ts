import {NextRequest, NextResponse} from "next/server";
import {Message as VercelChatMessage} from "ai";
import {PrismaVectorStore} from "@langchain/community/vectorstores/prisma";
import {Prisma, PrismaClient} from "@prisma/client";
import {formatDocumentsAsString} from "langchain/util/document";
import {LocalEmbeddings} from "@/lib/local-embeddings";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const messages = body.messages ?? [];
        const repositoryId = body.selectedRepoId;
        const currentMessageContent = messages[messages.length - 1]?.content ?? "";
        const db = new PrismaClient();

        const settings = await db.storeSettings.findFirst({
            orderBy: {createdAt: 'desc'}
        });

        const geminiApiKey = settings?.openAiKey;

        const repository = await db.repository.findUnique({
            where: {
                id: repositoryId
            }
        });

        if (!repository) {
            throw new Error("Repository not found");
        }

        const embeddings = new LocalEmbeddings();

        const vectorStore = PrismaVectorStore.withModel(db).create(
            embeddings,
            {
                prisma: Prisma as never,
                tableName: "Document",
                vectorColumnName: "vector",
                columns: {
                    id: PrismaVectorStore.IdColumn,
                    content: PrismaVectorStore.ContentColumn,
                },
                filter: {
                    namespace: {
                        equals: repository?.id
                    }
                }
            }
        );


        const retriever = vectorStore.asRetriever({
            k: 6,
            searchType: "similarity"
        });

        const docs = await retriever.invoke(currentMessageContent as string);
        const context = formatDocumentsAsString(docs as never);

        if (!geminiApiKey) {
            const responseText = context.length > 0
                ? `No Gemini API key is configured, so here's the most relevant repository context I found:\n\n${context}`
                : "No relevant context found in the repository yet.";

            return new Response(responseText, {
                status: 200,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                },
            });
        }

        const messagesForGemini = [
            {
                role: "user",
                parts: [{ text: `You are RepoGPT. Answer using only the repository context below. If the answer is not in the context, say you could not find it.\n\nRepository context:\n${context || 'No relevant context found.'}` }]
            },
            ...messages.map((message: VercelChatMessage) => ({
                role: message.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: String(message.content ?? '') }]
            }))
        ];

        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': geminiApiKey,
                },
                body: JSON.stringify({
                    contents: messagesForGemini,
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 1024,
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini chat request failed: ${response.status} ${errorText}`);
        }

        const json = await response.json();
        const answer = json?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('') ?? '';

        return new Response(answer || 'No response was returned by Gemini.', {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    } catch (e: unknown) {
        const error = e as { message: string; status?: number };
        return NextResponse.json({error: error.message}, {status: error.status ?? 500});
    }
}