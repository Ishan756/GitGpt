import { NextRequest, NextResponse } from 'next/server';
import { Message as VercelChatMessage, StreamingTextResponse } from 'ai';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from '@langchain/core/prompts';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { retrieveContext } from '@/lib/retriever';

export const runtime = 'nodejs';

const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`;
};

const TEMPLATE = `You are an expert software engineer explaining a GitHub repository.
Answer the user's question based only on the following context. If the answer is not in the context, say you don't know.

Context:
{context}

Current conversation:
{chat_history}

User: {question}
Answer:`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, repoName } = body;

        console.log('Chat request for repo:', repoName);

        if (!process.env.GOOGLE_API_KEY) {
            console.error('GOOGLE_API_KEY is missing from environment');
            return Response.json({ error: 'Gemini API key is not configured' }, { status: 500 });
        }

        // Get the last message as the current question
        const currentMessage = messages[messages.length - 1];
        const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage).join('\n');

        // 1. Retrieve context manually if repoName is provided
        let context = "";
        if (repoName) {
            console.log('Retrieving context for:', currentMessage.content);
            context = await retrieveContext(currentMessage.content, repoName);
            console.log('Context retrieved (length):', context.length);
        }

        const model = new ChatGoogleGenerativeAI({
            model: 'gemini-2.0-flash',
            temperature: 0,
            apiKey: process.env.GOOGLE_API_KEY
        });

        const prompt = PromptTemplate.fromTemplate(TEMPLATE);

        // Create the chain
        const chain = RunnableSequence.from([
            {
                context: () => context,
                question: (input: any) => input.question,
                chat_history: (input: any) => input.chat_history,
            },
            prompt,
            model,
            new HttpResponseOutputParser(),
        ]);

        console.log('Starting chain stream...');
        const stream = await chain.stream({
            question: currentMessage.content,
            chat_history: formattedPreviousMessages
        });

        return new StreamingTextResponse(stream);

    } catch (e: any) {
        console.error('Detailed API Chat Error:', e);

        // Construct a clean, serializable object
        const errorResponse = {
            error: e?.message || 'Internal Server Error',
            details: e?.toString() || 'Unknown error details'
        };

        return NextResponse.json(errorResponse, { status: 500 });
    }
}
