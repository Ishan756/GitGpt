"use client";

import React from 'react'
import {Import} from './import'
import {List} from './list'
import {Activity, GitBranch, PlusCircle, ShieldAlert} from 'lucide-react';
import type {Repository} from '@/lib/types';

interface RepoPageProps {
    list: Repository[]
}

export function RepoPage(props: RepoPageProps) {
    const [repos, setRepos] = React.useState(props.list);

    async function fetchRepos() {
        const response = await fetch('/api/repositories');
        const data = await response.json();

        if (!response.ok) {
            return;
        }

        const repositories = data.repositories as Repository[];

        const hasLoading = repositories.some(repo => repo.status === "LOADING");

        if (hasLoading) {
            setTimeout(fetchRepos, 3000);
        } else {
            setRepos(repositories);
        }

        setRepos(data.repositories);
    }

    const handleImport = async ({
                                    url,
                                    branch
                                }: {
        url: string;
        branch: string;
    }) => {
        const response = await fetch('/api/repositories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                branch
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(data.error)
            return
        }

        setRepos([...repos, data.repository]);

        await fetchRepos();
    }

    const handleDelete = async (repoId: string) => {
        const response = await fetch(`/api/repositories/${repoId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        await response.json();
        await fetchRepos();
    }

    return (
        <div className="flex w-full flex-col gap-6">
            <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[1.75rem] border border-border/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-stone-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <GitBranch className="h-3.5 w-3.5 text-amber-600" />
                        Repository workspace
                    </div>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">Import, review, and manage repositories</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                        Add a repository, watch it index, and keep track of whether it is ready for chat or needs another pass.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        {[
                            {icon: PlusCircle, title: 'Import fast', text: 'Paste a GitHub URL and branch.'},
                            {icon: Activity, title: 'Track status', text: 'See loading, imported, and error states.'},
                            {icon: ShieldAlert, title: 'Clean recovery', text: 'Delete errored repos and try again.'},
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.title} className="rounded-2xl border border-border/70 bg-stone-50/80 p-4">
                                    <Icon className="h-5 w-5 text-amber-600" />
                                    <h2 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h2>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-[1.75rem] border border-border/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
                    <Import onImport={handleImport}/>
                </div>
            </section>

            <List
                repos={repos}
                onDelete={handleDelete}
            />
        </div>
    )
}