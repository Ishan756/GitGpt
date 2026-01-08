'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import RepoInput from '@/components/RepoInput';
import ChatUI from '@/components/ChatUI';

export default function Home() {
  const [currentRepo, setCurrentRepo] = useState<string>('');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto px-4">
        {!currentRepo ? (
          <RepoInput onIngestSuccess={setCurrentRepo} />
        ) : (
          <div className="w-full mt-8">
            <ChatUI repoName={currentRepo} />
          </div>
        )}
      </main>
    </div>
  );
}
