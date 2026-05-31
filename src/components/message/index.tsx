import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MessageProps {
    id: string;
    role: string;
    content: string;
}

export function Message({ id, role, content }: MessageProps) {
    return (
        <div
            key={id}
            className={`${role === 'user' ? 'text-right' : 'text-left'} animate-fade-up`}
        >
            <span className={`inline-block max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm sm:max-w-[85%] ${role === 'user' ? 'bg-foreground text-background' : 'border border-border/70 bg-white text-foreground'}`}>
                <ReactMarkdown>{content}</ReactMarkdown>
            </span>
        </div>
    );
}