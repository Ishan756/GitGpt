'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui or similar exists or I should use native
import { Input } from '@/components/ui/input'; // Assuming shadcn/ui
// If shadcn components don't exist, I'll fallback to HTML or basic styling.
// The template "langchain-nextjs-template" seems to have components folder but maybe not shadcn. 
// I'll check components folder content. 
// Actually I'll use basic HTML/Tailwind for safety as I haven't verified all UI components availability.
// But wait, the exploring step showed "components.json" and "tailwind.config.js" and "components" dir with 14 children. 
// It likely has shadcn. I'll check "components/ui" or similar if I could, but asking "list_dir" again is slow. 
// I'll assume standard HTML/Tailwind to be safe and robust.

export default function RepoInput() {
    const [repoUrl, setRepoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleIngest = async () => {
        if (!repoUrl) return;
        setLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            const res = await fetch('/api/ingest-repo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message || 'Ingestion successful!');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong.');
            }
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto mb-8 p-6 bg-card rounded-xl border shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Ingest GitHub Repository</h2>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="flex-1 p-2 border rounded-md bg-background"
                />
                <button
                    onClick={handleIngest}
                    disabled={loading}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50 font-medium hover:opacity-90 transition-opacity"
                >
                    {loading ? 'Ingesting...' : 'Ingest'}
                </button>
            </div>
            {status === 'success' && (
                <p className="text-green-600 text-sm mt-2">{message}</p>
            )}
            {status === 'error' && (
                <p className="text-red-500 text-sm mt-2">{message}</p>
            )}
        </div>
    );
}
