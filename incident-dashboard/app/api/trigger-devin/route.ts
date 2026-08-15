import { NextRequest, NextResponse } from "next/server";

// Background poller to monitor GitHub PRs and trigger the phone call ONLY when a NEW PR is open
async function pollGitHubAndCall(origin: string, initialLatestPRNumber: number, sessionStartTime: Date) {
  console.log(`🕵️‍♂️ [Devin Bridge] Starting background polling for new GitHub Pull Requests (tracking after PR #${initialLatestPRNumber})...`);
  
  const maxAttempts = 60; // 15 minutes total (60 attempts * 15 seconds)
  let attempts = 0;
  
  const interval = setInterval(async () => {
    attempts++;
    if (attempts > maxAttempts) {
      console.log("⚠️ [Devin Bridge] Polling timed out. No new Pull Request detected after 15 minutes.");
      clearInterval(interval);
      return;
    }
    
    try {
      console.log(`🕵️‍♂️ [Devin Bridge] Polling GitHub PRs (attempt ${attempts}/${maxAttempts})...`);
      const response = await fetch("https://api.github.com/repos/umairai21/On-Call-Software-Engineer/pulls?state=all&sort=created&direction=desc", {
        headers: {
          "User-Agent": "NextJs-Devin-Bridge",
          "Accept": "application/vnd.github.v3+json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API returned status: ${response.status} ${response.statusText}`);
      }
      
      const pulls = await response.json();
      
      // Check if there is a NEW PR opened after this incident started
      const newPR = pulls.find((pr: any) => 
        pr.state === "open" && 
        pr.number > initialLatestPRNumber &&
        new Date(pr.created_at) >= sessionStartTime
      );
      
      if (newPR) {
        console.log(`🚀 [Devin Bridge] DETECTED brand new Devin Pull Request: "${newPR.title}" (PR #${newPR.number})!`);
        clearInterval(interval);
        
        // Wait 3 seconds to let Devin finish any initial PR checks, then call
        setTimeout(async () => {
          console.log("📞 [Devin Bridge] Initiating outbound on-call telephony...");
          await fetch(`${origin}/api/trigger-call`, { method: "POST" });
        }, 3000);
      }
    } catch (e: any) {
      console.error("❌ [Devin Bridge] Error polling GitHub PRs:", e.message);
    }
  }, 15000);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message = "Unknown Error", location = "Unknown Location" } = body;

    const apiKey = process.env.DEVIN_API_KEY?.trim();
    const orgId = process.env.DEVIN_ORG_ID?.trim();
    const origin = new URL(req.url).origin;
    const sessionStartTime = new Date();

    // Check existing latest PR number so we don't trigger prematurely on old PRs
    let latestPRNumber = 0;
    try {
      const existingPRsRes = await fetch("https://api.github.com/repos/umairai21/On-Call-Software-Engineer/pulls?state=all&per_page=5", {
        headers: {
          "User-Agent": "NextJs-Devin-Bridge",
          "Accept": "application/vnd.github.v3+json"
        }
      });
      if (existingPRsRes.ok) {
        const existingPRs = await existingPRsRes.json();
        if (existingPRs.length > 0) {
          latestPRNumber = Math.max(...existingPRs.map((p: any) => p.number || 0));
        }
      }
    } catch (e: any) {
      console.warn("⚠️ [Devin Bridge] Could not fetch initial PR list:", e.message);
    }

    console.log(`📊 [Devin Bridge] Initial baseline PR number is #${latestPRNumber}`);

    const promptText = `Please fix the following runtime error in the repository:
Error details: ${message}
Found at stack location: ${location}

Instructions:
1. Locate the file and function containing the bug.
2. Resolve the error (e.g. handle undefined objects or missing fields gracefully).
3. Verify that the project compiles cleanly (e.g., run npm run build).
4. Commit your changes and push them as a GitHub Pull Request.`;

    if (apiKey && orgId) {
      console.log(`🚀 [Devin Bridge] Triggering Devin session for org ${orgId}...`);
      
      const response = await fetch(`https://api.devin.ai/v3/organizations/${orgId}/sessions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: promptText,
        }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Failed to parse Devin API response: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data?.message || `Devin API error: ${response.status} ${response.statusText}`);
      }

      const sessionId = data.session_id || data.id;
      const sessionUrl = data.url || `https://devin.ai/sessions/${sessionId}`;

      console.log("✅ [Devin Bridge] Devin session successfully triggered:", sessionId);
      
      // Start polling for the newly created PR
      pollGitHubAndCall(origin, latestPRNumber, sessionStartTime);

      return NextResponse.json({
        success: true,
        simulated: false,
        sessionId,
        sessionUrl,
        prompt: promptText,
      });
    } else {
      console.log("ℹ️ [Devin Bridge] DEVIN_API_KEY or DEVIN_ORG_ID not configured in .env.local.");
      console.log("ℹ️ [Devin Bridge] Running in Simulation Mode.");
      
      // Simulate Devin fixing code in the background (waits 15 seconds, then triggers call)
      setTimeout(async () => {
        console.log("🕵️‍♂️ [Devin Bridge Simulation] Simulated Devin PR created: 'Fix TypeError in calculateUserDiscount'");
        console.log("📞 [Devin Bridge Simulation] Triggering outbound call...");
        await fetch(`${origin}/api/trigger-call`, { method: "POST" });
      }, 15000);

      return NextResponse.json({
        success: true,
        simulated: true,
        message: "Simulated Devin trigger logged successfully.",
        prompt: promptText,
      });
    }
  } catch (err: any) {
    console.error("❌ [Devin Bridge] Error calling Devin API:", err.message);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to trigger Devin session" },
      { status: 500 }
    );
  }
}
