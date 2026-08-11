"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchIncident = async () => {
    setLoading(true);
    setErrorDetails(null);
    try {
      const res = await fetch("/api/trigger-incident");
      const data = await res.json();
      
      if (!res.ok || data.error) {
        setErrorDetails(data);
        setIsModalOpen(true);
        Sentry.captureException(new Error(data.error || "Portal incident triggered"));
      }
    } catch (err: any) {
      Sentry.captureException(err);
      setErrorDetails({
        error: err?.message || "Failed to contact incident server",
        code: "NETWORK_ERROR",
        timestamp: new Date().toISOString(),
      });
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Trigger error automatically when navigating to this page
  useEffect(() => {
    fetchIncident();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-red-500 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              ← Back to Home
            </Link>
            <span className="text-sm font-semibold text-zinc-400">/ Workspace Portal</span>
          </div>

          <button
            onClick={fetchIncident}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-red-600/30 transition-all hover:bg-red-500 disabled:opacity-50"
          >
            {loading ? "Testing API..." : "Re-trigger Incident"}
          </button>
        </div>
      </header>

      {/* Main Portal Body */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">System Workspace & Diagnostics</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Active node inspection environment. Any backend uncaught exceptions on this node are surfaced immediately.
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-2">Portal Status</div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-amber-500 animate-ping"></span>
                <span className="text-xl font-bold text-amber-400">Active Exception</span>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-2">Telemetry Backend</div>
              <div className="text-xl font-bold text-zinc-200">Sentry Logger</div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-2">Landing Status</div>
              <div className="text-xl font-bold text-emerald-400">100% Isolated & Clean</div>
            </div>
          </div>

          {/* Prompt card if modal is dismissed */}
          {!isModalOpen && errorDetails && (
            <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-red-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-400">An incident was detected on this page.</h3>
                <p className="text-xs text-red-300/80 mt-1">Click the button to view details again.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
              >
                View Error Pop-up
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ERROR POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-zinc-900 border border-red-500/50 shadow-2xl overflow-hidden text-white space-y-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-red-500/20 bg-red-950/40 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/20 text-red-400 font-bold text-lg border border-red-500/30">
                  🚨
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-400">System Runtime Incident</h2>
                  <p className="text-xs text-red-300/70">Uncaught exception captured on page navigation</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Error Message</label>
                <div className="rounded-xl bg-black/60 border border-red-500/30 p-3.5 font-mono text-xs text-red-300">
                  {errorDetails?.error || "TypeError: Cannot read properties of undefined (reading 'tier')"}
                </div>
              </div>

              {errorDetails?.location && (
                <div className="flex justify-between items-center text-xs text-zinc-400 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                  <span>Location:</span>
                  <span className="font-mono text-zinc-300">{errorDetails.location}</span>
                </div>
              )}

              {errorDetails?.stack && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Stack Trace</label>
                  <pre className="rounded-xl bg-black/80 border border-zinc-800 p-3 font-mono text-[11px] text-zinc-400 overflow-x-auto max-h-32">
                    {errorDetails.stack}
                  </pre>
                </div>
              )}

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-xs text-zinc-400 flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Logged automatically to Sentry monitoring pipeline.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-zinc-800 bg-zinc-950/80 px-6 py-4 flex items-center justify-between">
              <Link
                href="/"
                className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                ← Return to Landing Page
              </Link>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={fetchIncident}
                  className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-md shadow-red-600/20 cursor-pointer"
                >
                  Re-test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
