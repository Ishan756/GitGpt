'use client'

import {useEffect, useState} from "react";
import Link from "next/link";
import {Bot, GitBranch, Sparkles, Wand2} from "lucide-react";
import {useChat} from 'ai/react';
import {MessageList} from '@/components/message-list';
import {MessageInput} from '@/components/message-input';
import type {Repository} from '@/lib/types';

interface ChatProps {
    defaultRepoId?: string,
    repositories: Repository[]
}

export function Chat(props: ChatProps) {
    const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        setMessages,
        isLoading
    } = useChat({
        api: '/api/chat',
        initialMessages: [],
        headers: {
            'Content-Type': 'application/json',
        },
        body: {
            selectedRepoId
        },
        streamProtocol: 'text',
    });

    useEffect(() => {
        if (props.defaultRepoId) {
            setSelectedRepoId(props.defaultRepoId);
        } else if (props.repositories.length > 0) {
            setSelectedRepoId(props.repositories[0].id);
        }
    }, [props.defaultRepoId, props.repositories]);

    const hasMessages = messages.length > 0;

    return (
        <div className="relative flex min-h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-[2rem] border border-border/60 bg-white/40 shadow-[0_20px_80px_rgba(0,0,0,0.08)] chat-glass">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-200/40 blur-3xl animate-soft-pulse" />
                <div className="absolute -right-24 top-40 h-56 w-56 rounded-full bg-white/50 blur-3xl animate-soft-pulse [animation-delay:1.5s]" />
                <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-stone-300/30 blur-3xl animate-soft-pulse [animation-delay:3s]" />
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col">
                {!hasMessages && (
                    <section className="px-6 pt-8 sm:px-10 lg:px-12 lg:pt-10 animate-fade-up">
                        <div className="max-w-3xl space-y-4">
                            <div className="space-y-4 max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/70 px-4 py-2 text-sm font-medium text-foreground shadow-sm">
                                    <Sparkles className="h-4 w-4 text-amber-600" />
                                    RepoGPT for focused repository conversations
                                </div>

                                <div className="space-y-3">
                                    <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[0.98]">
                                        Ask questions, get grounded answers from your codebase.
                                    </h1>
                                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                                        Import a repository, choose it from the selector, and ask about architecture, deployment, setup, or implementation details.
                                        Responses stay anchored to the indexed repository context.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link href="/repositories" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-md transition-transform duration-200 hover:-translate-y-0.5">
                                        <GitBranch className="h-4 w-4" />
                                        Manage repositories
                                    </Link>
                                    <Link href="/settings" className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white">
                                        <Wand2 className="h-4 w-4" />
                                        Review configuration
                                    </Link>
                                </div>

                                <div className="flex flex-wrap gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setMessages([])}
                                        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                                    >
                                        <Bot className="h-4 w-4 text-amber-600" />
                                        Code-aware answers
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMessages([])}
                                        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                                    >
                                        <GitBranch className="h-4 w-4 text-amber-600" />
                                        Repo selection
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMessages([])}
                                        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                                    >
                                        <Sparkles className="h-4 w-4 text-amber-600" />
                                        Quick prompts
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <div className={`${hasMessages ? 'flex-1 min-h-0 px-4 pt-6 sm:px-6 lg:px-10' : 'hidden'}`}>
                    {hasMessages && <MessageList messages={messages} isLoading={isLoading} />}
                </div>

                <div className={`mt-auto px-4 pb-4 pt-3 sm:px-6 lg:px-10 lg:pb-6 ${hasMessages ? 'border-t border-border/40 bg-white/20 backdrop-blur-sm' : ''}`}>
                    <MessageInput
                        input={input}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                        selectedRepoId={selectedRepoId}
                        onSelectedRepoIdChange={(repoId) => {
                            setSelectedRepoId(repoId);
                        }}
                        repositories={props.repositories}
                        hasMessages={hasMessages}
                        onClear={() => setMessages([])}
                    />
                </div>
            </div>
        </div>
    );
}