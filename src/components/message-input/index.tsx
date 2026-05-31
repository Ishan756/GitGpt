import React from 'react';
import {Textarea} from "@/components/ui/textarea";
import {
    Select,
    SelectItem,
    SelectContent,
    SelectGroup,
    SelectTrigger,
    SelectLabel,
    SelectValue,
} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Send} from 'lucide-react';
import type {Repository} from "@/lib/types";

interface MessageInputProps {
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
    hasMessages: boolean;
    onClear?: () => void;
    repositories: Repository[];
    selectedRepoId: string | null;
    onSelectedRepoIdChange?: (repoId: string) => void;
}

export function MessageInput({
                                 input,
                                 handleInputChange,
                                 handleSubmit,
                                 isLoading,
                                 hasMessages,
                                 onClear,
                                 repositories,
                                 selectedRepoId,
                                 onSelectedRepoIdChange
                             }: MessageInputProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    const examples = ["What's the tech stack?", "How to set up" +
    " the project?", "How to deploy the project?"];

    return (
        <form onSubmit={handleSubmit}
              className={`flex flex-col gap-4 border border-border/70 bg-white/85 shadow-[0_12px_50px_rgba(0,0,0,0.08)] backdrop-blur-md ${hasMessages ? 'w-full mx-auto rounded-[1.75rem] px-4 py-4 sm:px-5 lg:max-w-4xl' : 'w-full mx-auto max-w-4xl rounded-[1.75rem] px-5 py-5 sm:px-6'}`}>
            <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Repository</p>
                <Select value={selectedRepoId || ''}
                        onValueChange={(nextRepo) => {
                            if (nextRepo) {
                                onSelectedRepoIdChange?.(nextRepo);
                                onClear?.();
                            }
                        }}>
                    <SelectTrigger className="w-full border-border/70 bg-white/90">
                        <SelectValue placeholder="Select a repo"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Available repositories:</SelectLabel>
                            {repositories.map(repo => (
                                <SelectItem
                                    key={repo.id}
                                    value={repo.id}>{repo.name}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            {!hasMessages && (
                <div className="space-y-1 animate-fade-up">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Prompt the repository</p>
                    <h2 className="text-lg font-semibold text-foreground">Start with a question that points the model to something specific.</h2>
                </div>
            )}
            <Textarea
                placeholder="Ask me anything about your repo"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className={`min-h-[120px] resize-none border-border/70 bg-stone-50/70 text-foreground shadow-sm placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-amber-200 ${hasMessages ? '' : 'text-base'}`}
            />
            {!hasMessages && examples.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {examples.map((example, index) => (
                        <div key={index}
                             className="rounded-full border border-border/70 bg-white px-3 py-1 text-sm text-foreground cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                             onClick={() => handleInputChange({target: {value: example}} as React.ChangeEvent<HTMLTextAreaElement>)}>
                            {example}
                        </div>
                    ))}
                </div>
            )}
            <div className="flex flex-row gap-2 self-end justify-end">
                    {hasMessages && onClear && (
                        <Button onClick={onClear} size="sm" disabled={isLoading}
                                className={`flex gap-1 rounded-full border border-border bg-white text-foreground shadow-sm hover:bg-stone-50 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <span className="font-semibold">Clear</span>
                        </Button>
                    )}

                    <Button type="submit" size="sm" disabled={isLoading}
                            className={`flex gap-1 rounded-full bg-foreground text-background shadow-md hover:bg-foreground/90 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <Send className="h-4 w-4"/>
                        <span className="font-semibold">Send</span>
                    </Button>
            </div>
        </form>
    );
}