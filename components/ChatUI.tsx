'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect } from 'react';

export default function ChatUI() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border rounded-xl overflow-hidden bg-card shadow-sm">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground mt-10">
                        <p>Ask a question about the ingested repository.</p>
                    </div>
                )}
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${m.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                        >
                            <div className="text-xs opacity-50 mb-1 capitalize">{m.role}</div>
                            <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-muted max-w-[80%] rounded-lg p-3">
                            <span className="animate-pulse">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask specific questions about the code..."
                        className="flex-1 p-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50 font-medium hover:opacity-90 transition-opacity"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}
