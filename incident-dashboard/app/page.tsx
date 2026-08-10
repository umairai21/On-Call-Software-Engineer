"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSimulateCrash = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/trigger-incident");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to trigger incident");
        setIsModalOpen(true);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start gap-8">
        <Image
          className="dark:invert h-5 w-[100px]"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Incident Simulation Dashboard
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Trigger a simulated incident to capture Sentry logs and fetch Context.dev docs.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row w-full">
          <button
            onClick={handleSimulateCrash}
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-full bg-red-600 px-6 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50 md:w-auto cursor-pointer"
          >
            {loading ? "Simulating Crash..." : "Simulate System Crash"}
          </button>
        </div>

        {result && (
          <div className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-700 dark:text-emerald-300">
            <h3 className="font-bold text-lg mb-2">✅ Incident Handled</h3>
            <pre className="font-mono text-xs overflow-auto bg-black/5 dark:bg-white/5 p-3 rounded-lg">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </main>

      {/* Error Popup Modal */}
      {isModalOpen && error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-red-500/40 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-500 font-bold text-xl">
                  🚨
                </div>
                <h3 className="text-xl font-bold text-red-400">System Incident</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-black/50 border border-red-500/20 p-4 font-mono text-sm text-red-300">
              {error}
            </div>

            <p className="text-xs text-zinc-400">
              This failure has been automatically logged and reported to Sentry.
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-zinc-800 hover:bg-zinc-700 px-5 py-2 text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



