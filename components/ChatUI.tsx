'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Props {
    repoName: string;
}

export default function ChatUI({ repoName }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Animate container in
        gsap.fromTo(
            containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
    }, []);

    useEffect(() => {
        // Scroll to bottom when messages change
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

        // Animate new message
        if (messagesContainerRef.current && messages.length > 0) {
            const lastMessage = messagesContainerRef.current.lastElementChild;
            if (lastMessage) {
                gsap.fromTo(lastMessage,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
                );
            }
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg], // Send history + new message
                    repoName,
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');
            if (!response.body) throw new Error('No response body');

            // Setup streaming (handling text stream appropriately)
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiContent = '';

            // Add initial AI placeholder
            setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                aiContent += chunk;

                // Update the last message (AI response)
                setMessages((prev) => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'assistant', content: aiContent };
                    return newHistory;
                });
            }
        } catch (err) {
            console.error('Chat error:', err);
            // Optional: Add error message to chat
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="flex flex-col w-full max-w-3xl mx-auto h-[80vh] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/50 border-b border-zinc-800">
                <h3 className="text-zinc-200 font-medium">Chatting context: <span className="text-blue-400">{repoName}</span></h3>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-sm">
                        <p>Ask a question about the code to get started.</p>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'
                                }`}
                        >
                            <div className="whitespace-pre-wrap">{m.content}</div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-800 text-zinc-400 px-4 py-2 rounded-2xl rounded-bl-sm text-sm animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={bottomRef} className="h-0" />
            </div>

            {/* Input */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        placeholder="Type your question..."
                        className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
