"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuditing, setIsAuditing] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Simulated phone call states
  const [callState, setCallState] = useState<"idle" | "ringing" | "answered" | "merged" | "rejected">("idle");
  const [isMerging, setIsMerging] = useState(false);

  // Run the Context.dev audit scan and print logs directly to the browser console
  const runLandingAudit = async (stage: "initial" | "after_click" | "after_merge") => {
    if (isAuditing) return;
    setIsAuditing(true);

    console.log(`🚀 [Context.dev] Running page audit scan (${stage === "initial" ? "initial load" : stage === "after_click" ? "after action" : "after hotfix merge"})...`);
    console.log("🔌 [Context.dev] Connecting to local origin: " + window.location.origin);
    console.log("📄 [Context.dev] Scanning document layout from top to bottom...");

    // Simulated short delay for scanning visualization in logs
    await new Promise((r) => setTimeout(r, 600));

    try {
      const res = await fetch("/api/analyze-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: window.location.origin }),
      });
      const data = await res.json();
      
      if (data.errorDetected) {
        setHasError(true);
        console.error("💥 [Context.dev] Unhandled Exception DETECTED on page!");
        console.error(`🐞 Error details: "${data.errorDetails?.message}"`);
        console.warn(`📍 Code Location: ${data.errorDetails?.location}`);
        
        if (data.devinResult) {
          if (data.devinResult.success) {
            if (data.devinResult.simulated) {
              console.log("🚀 [Devin Bridge] Simulated Devin session logged to server console.");
              
              // Trigger the simulated phone call flow in 5 seconds
              setTimeout(() => {
                setCallState("ringing");
              }, 5000);
            } else {
              console.log("🚀 [Devin Bridge] Devin session successfully triggered!");
              console.log("🔗 Track session here: " + data.devinResult.sessionUrl);
            }
          } else {
            console.error("❌ [Devin Bridge] Devin trigger failed: " + data.devinResult.error);
          }
        }
      } else {
        setHasError(false);
        console.log("✅ [Context.dev] Audit complete: 0 errors detected. Page is fully operational.");
      }
    } catch (err: any) {
      console.error("❌ [Context.dev] Audit failed: " + err.message);
    } finally {
      setIsAuditing(false);
    }
  };

  const initialized = useRef(false);

  // On page mount: Ensure page starts in a clean/healthy state, then auto-scan
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializePage = async () => {
      try {
        // Reset the codebase bug to healthy state for initial load
        await fetch("/api/resolve-incident", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "merge" }),
        });
      } catch (e) {
        console.error("Failed to initialize system health status:", e);
      }
      
      // Auto run scan on page load
      runLandingAudit("initial");
    };

    initializePage();
  }, []);

  const handleAddToCart = async () => {
    console.log("🛒 [Action] User clicked 'Add to Cart'. Processing transaction...");
    setCallState("idle");

    try {
      // 1. Break the codebase backend endpoint to simulate the bug triggering
      await fetch("/api/resolve-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revert" }),
      });
    } catch (e) {
      console.error("Failed to trigger codebase incident:", e);
    }

    // 2. Show native browser alert popup with the exception
    alert("Error: Cannot read properties of undefined (reading 'profile')");
    console.error("Uncaught TypeError: Cannot read properties of undefined (reading 'profile') at handleAddToCart (app/page.tsx:71:11)");

    // 3. Automatically trigger Context.dev scan to detect the error
    runLandingAudit("after_click");
  };

  // Simulating user answering call or clicking Merge from Phone/UI
  const handlePRDecision = async (approve: boolean) => {
    if (approve) {
      setIsMerging(true);
      console.log("📞 [Call Loop] PR Merge approved. Call webhook /api/elevenlabs-merge...");
      try {
        const res = await fetch("/api/elevenlabs-merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirm: true })
        });
        const data = await res.json();
        
        if (data.success) {
          setCallState("merged");
          console.log("✅ [Call Loop] Webhook merge completed successfully. Code is operational!");
          
          // Recheck system health state
          await new Promise((r) => setTimeout(r, 1000));
          await runLandingAudit("after_merge");
        } else {
          console.error("❌ [Call Loop] Webhook merge failed: " + data.error);
        }
      } catch (err: any) {
        console.error("❌ [Call Loop] Resolution error: " + err.message);
      } finally {
        setIsMerging(false);
      }
    } else {
      setCallState("rejected");
      console.log("❌ [Call Loop] PR Merge rejected by user. Standing down.");
    }
  };

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
            <button
              onClick={handleAddToCart}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95 cursor-pointer"
            >
              🛒 Add to Cart
            </button>
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
              Designed for on-call engineers. Monitor production health smoothly on this landing page, and click &quot;Add to Cart&quot; to test active failure auditing.
            </p>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={handleAddToCart}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 active:scale-95 cursor-pointer"
              >
                Trigger Add to Cart Incident 🛒
              </button>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-zinc-800/80">
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm">
              <div className="text-2xl mb-3">🛡️</div>
              <h3 className="font-semibold text-white text-base mb-1">Clean Environment</h3>
              <p className="text-sm text-zinc-400">
                The main landing environment operates at 99.99% uptime and audits itself automatically.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm">
              <div className="text-2xl mb-3">⚡</div>
              <h3 className="font-semibold text-white text-base mb-1">Instant Audit Scan</h3>
              <p className="text-sm text-zinc-400">
                Any click interactions that cause a crash trigger a background scan automatically.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm">
              <div className="text-2xl mb-3">🔍</div>
              <h3 className="font-semibold text-white text-base mb-1">Background Audit Logs</h3>
              <p className="text-sm text-zinc-400">
                Context.dev actively monitors landing page health in the background. Open DevTools (Ctrl+Shift+I) to view live logs.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ELEVENLABS FLOATING TELEPHONY SIMULATOR PANEL */}
      {callState !== "idle" && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-2xl border border-violet-500/50 bg-zinc-900/95 backdrop-blur-md p-6 shadow-2xl text-white space-y-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3">
            {callState === "ringing" && (
              <span className="flex h-3 w-3 rounded-full bg-violet-400 animate-ping"></span>
            )}
            {callState === "answered" && (
              <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
            {callState === "merged" && (
              <span className="flex h-3 w-3 rounded-full bg-emerald-400"></span>
            )}
            {callState === "rejected" && (
              <span className="flex h-3 w-3 rounded-full bg-red-500"></span>
            )}
            
            <h3 className="text-xs uppercase tracking-wider font-bold text-violet-400">
              {callState === "ringing" ? "Incoming Voice Call..." : "ElevenLabs Voice Assistant"}
            </h3>
          </div>

          {callState === "ringing" && (
            <div className="flex flex-col items-center py-4 space-y-3">
              <div className="text-3xl animate-bounce">📞</div>
              <div className="text-sm font-bold">Devin On-Call Agent</div>
              <div className="text-xs text-zinc-400 italic">Dialing your phone number...</div>
              
              <button
                onClick={() => setCallState("answered")}
                className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-2 text-xs font-bold text-white shadow-md cursor-pointer mt-2"
              >
                Answer Call
              </button>
            </div>
          )}

          {callState === "answered" && (
            <div className="space-y-4">
              <p className="text-xs italic text-zinc-300 leading-relaxed bg-zinc-950/50 p-3 rounded-xl border border-zinc-800">
                &quot;Hey there! I am your Devin on-call assistant. I detected a TypeError in calculateUserDiscount and opened a pull request on your GitHub. Do you want me to merge it?&quot;
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handlePRDecision(false)}
                  disabled={isMerging}
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 py-2 text-xs font-semibold text-zinc-300 cursor-pointer"
                >
                  No, Reject PR
                </button>
                <button
                  onClick={() => handlePRDecision(true)}
                  disabled={isMerging}
                  className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-500 py-2 text-xs font-bold text-white shadow-lg cursor-pointer"
                >
                  {isMerging ? "Merging..." : "Yes, Merge PR"}
                </button>
              </div>
            </div>
          )}

          {callState === "merged" && (
            <div className="text-center py-2 space-y-2">
              <div className="text-emerald-400 font-bold text-sm">✓ PR Merged Successfully</div>
              <p className="text-xs text-zinc-400">
                The hotfix was applied and the local server reloaded. The system is verified healthy!
              </p>
              <button
                onClick={() => setCallState("idle")}
                className="text-[10px] text-zinc-500 hover:text-zinc-400 underline font-semibold mt-2 cursor-pointer"
              >
                Dismiss Call Panel
              </button>
            </div>
          )}

          {callState === "rejected" && (
            <div className="text-center py-2 space-y-2">
              <div className="text-red-400 font-bold text-sm">PR Rejected</div>
              <p className="text-xs text-zinc-400">
                Stand down. The pull request remains open for your manual review.
              </p>
              <button
                onClick={() => setCallState("idle")}
                className="text-[10px] text-zinc-500 hover:text-zinc-400 underline font-semibold mt-2 cursor-pointer"
              >
                Dismiss Call Panel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-500">
        <p>© 2026 On-Call Software Engineer Platform. Built for reliability.</p>
      </footer>
    </div>
  );
}
