import React, { useEffect, useRef } from 'react';
import { Message } from '@/components/message';

interface Message {
    id: string;
    role: string;
    content: string;
}

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    if (messages.length === 0 && !isLoading) {
        return null;
    }

    return (
        <div className="mx-auto max-w-5xl overflow-y-auto rounded-[1.75rem] border border-border/70 bg-white/75 p-4 shadow-[0_14px_50px_rgba(0,0,0,0.06)] backdrop-blur-sm sm:p-6">
            <div className="flex flex-col gap-3">
                {messages.map((message) => (
                    <Message key={message.id} id={message.id} role={message.role} content={message.content} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            {isLoading && (
                <div className="mt-5 text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        AI is thinking...
                    </span>
                </div>
            )}
        </div>
    );
}