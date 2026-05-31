import React from 'react'
import Link from 'next/link'
import {Button} from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {Loader2, CheckCircle, Trash2, MessageSquare} from 'lucide-react'
import type {Repository} from '@/lib/types'

interface ListProps {
    repos: Repository[]
    onDelete: (id: string) => void
}

export function List({repos, onDelete}: ListProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Your repositories</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Review indexing status, open chat when ready, or remove errored imports.</p>
                </div>
                <span className="rounded-full border border-border/70 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {repos.length} total
                </span>
            </div>

            {repos.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-white/70 p-10 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <GitBranch size={20} />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">No repositories yet</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Import your first repository above to start indexing code and chatting with it.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {repos.map((repo) => (
                        <li key={repo.id}
                            className="rounded-[1.5rem] border border-border/70 bg-white/85 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-base font-semibold text-foreground">{repo.name}</span>
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${repo.status === 'ERROR' ? 'bg-red-100 text-red-700' : repo.status === 'LOADING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {repo.status.toLowerCase()}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                        <span className="font-mono text-xs sm:text-sm">{repo.url}</span>
                                        {repo.status === "ERROR" && repo.error && (
                                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                                                {repo.error}
                                            </span>
                                        )}
                                        {repo.status === "LOADING" && (
                                            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                                                <Loader2 className="animate-spin" size={14} />
                                                Indexing in progress
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 lg:justify-end">
                                    <Link href={`/?repoId=${repo.id}`}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={repo.status !== "IMPORTED"}
                                            className="rounded-full border-border/70 bg-white"
                                        >
                                            <MessageSquare className="mr-2" size={16}/>
                                            Chat
                                        </Button>
                                    </Link>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" className="rounded-full">
                                                <Trash2 size={16}/>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-2xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete this repository?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently remove the repository, its indexed documents, and any attached settings reference.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="rounded-full"
                                                    onClick={() => onDelete(repo.id)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}