'use client';

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-zinc-950 border-b border-zinc-800">
      <h1 className="text-xl font-bold text-zinc-100 tracking-tight">RepoChat</h1>
      <span className="text-sm text-zinc-500 font-medium">AI-Powered Code Analysis</span>
    </nav>
  );
}
