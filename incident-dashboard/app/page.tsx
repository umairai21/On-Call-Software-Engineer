"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 font-bold text-white shadow-lg shadow-indigo-500/20">
              ⚡
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              On-Call Ops Platform
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <button
              onClick={() => setActiveTab("overview")}
              className={`transition-colors hover:text-white ${activeTab === "overview" ? "text-indigo-400 font-semibold" : ""}`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`transition-colors hover:text-white ${activeTab === "analytics" ? "text-indigo-400 font-semibold" : ""}`}
            >
              System Health
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`transition-colors hover:text-white ${activeTab === "docs" ? "text-indigo-400 font-semibold" : ""}`}
            >
              Documentation
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Systems Operational
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95"
            >
              Launch Portal →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 pt-16 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-8 md:p-16 shadow-2xl">
          {/* Subtle Background Glow */}
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <span>🚀 Automated Incident Handling Engine</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Real-time monitoring & software failure diagnosis.
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 font-normal leading-relaxed">
              Designed for on-call engineers. Monitor production health smoothly on this landing page, and navigate to the interactive workspace to inspect incident diagnostics.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 active:scale-95"
              >
                Go to Workspace Portal →
              </Link>
              
              <button
                onClick={() => alert("System Status: All services are running optimally on the landing page.")}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/60 px-6 font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                Check System Diagnostics
              </button>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-zinc-800/80">
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm">
              <div className="text-2xl mb-3">🛡️</div>
              <h3 className="font-semibold text-white text-base mb-1">Zero Downtime Landing</h3>
              <p className="text-sm text-zinc-400">
                The main landing environment is completely isolated and operates at 99.99% uptime.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm">
              <div className="text-2xl mb-3">⚡</div>
              <h3 className="font-semibold text-white text-base mb-1">Instant Incident Routing</h3>
              <p className="text-sm text-zinc-400">
                Seamlessly jump to the next portal page to inspect simulated production exceptions.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="font-semibold text-white text-base mb-1">Sentry Telemetry</h3>
              <p className="text-sm text-zinc-400">
                Full stack traces captured silently and surfaced cleanly via UI popups.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-500">
        <p>© 2026 On-Call Software Engineer Platform. Built for reliability.</p>
      </footer>
    </div>
  );
}
