'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

interface Props {
    onIngestSuccess: (repo: string) => void;
}

export default function RepoInput({ onIngestSuccess }: Props) {
    const [repoUrl, setRepoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initial hero mount animation
        gsap.fromTo(
            containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
        );
    }, []);

    const handleIngest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!repoUrl) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/ingest-repo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl }),
            });

            const data = await res.json();

            if (res.ok) {
                // Parse clean repo name
                const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
                const repoName = match ? `${match[1]}/${match[2].replace('.git', '')}` : repoUrl;

                // Animate out before changing state
                gsap.to(containerRef.current, {
                    opacity: 0,
                    y: -20,
                    duration: 0.5,
                    ease: 'power2.in',
                    onComplete: () => onIngestSuccess(repoName)
                });
            } else {
                setError(data.error || 'Failed to process repository');
            }
        } catch (err: any) {
            console.error('Ingest error:', err);
            setError(err.message || 'Something went wrong');
        } finally {
            if (document.body.contains(containerRef.current)) {
                // Verify component is still mounted to avoid set state on unmounted
                setLoading(false);
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-col items-center justify-center w-full max-w-xl mx-auto mt-20 px-4"
        >
            <h2 className="text-3xl font-semibold text-zinc-100 mb-3 text-center">
                Chat with any GitHub repository
            </h2>
            <p className="text-zinc-400 mb-8 text-center text-sm">
                Enter a public GitHub URL to start analyzing the codebase.
            </p>

            <form onSubmit={handleIngest} className="w-full flex flex-col gap-4">
                <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repository"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-zinc-100 text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing Repository...' : 'Load Repository'}
                </button>
            </form>

            {error && (
                <div className="mt-4 p-3 w-full text-center text-sm text-red-400 bg-red-900/10 border border-red-900/20 rounded-lg">
                    {error}
                </div>
            )}
        </div>
    );
}
