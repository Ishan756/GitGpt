import { NextRequest } from 'next/server';
import { Message as VercelChatMessage, StreamingTextResponse } from 'ai';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from '@langchain/core/prompts';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { retrieveContext } from '@/lib/retriever';

export const runtime = 'edge';

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
        const { messages, repoName } = await req.json();

        // Get the last message as the current question
        const currentMessage = messages[messages.length - 1];
        const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage).join('\n');

        // 1. Retrieve context manually if repoName is provided
        let context = "";
        if (repoName) {
            context = await retrieveContext(currentMessage.content, repoName);
        }

        const model = new ChatGoogleGenerativeAI({
            modelName: 'gemini-1.5-flash', // Fast and efficient model
            temperature: 0,
        });

        const prompt = PromptTemplate.fromTemplate(TEMPLATE);

        // Create the chain
        const chain = RunnableSequence.from([
            {
                context: () => context,
                question: (input) => input.question,
                chat_history: (input) => input.chat_history,
            },
            prompt,
            model,
            new HttpResponseOutputParser(),
        ]);

        const stream = await chain.stream({
            question: currentMessage.content,
            chat_history: formattedPreviousMessages
        });

        return new StreamingTextResponse(stream);

    } catch (e: any) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
