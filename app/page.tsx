import RepoInput from '@/components/RepoInput';
import ChatUI from '@/components/ChatUI';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-background text-foreground">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Chat with GitHub Repo
        </p>
      </div>

      <div className="w-full flex flex-col gap-8 mt-8">
        <p className="text-center text-muted-foreground max-w-2xl mx-auto">
          Enter a public GitHub repository URL below to ingest its codebase. Once ingested, you can ask questions about the code, structure, or logic.
        </p>
        <RepoInput />
        <ChatUI />
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">

      </div>
    </main>
  );
}
