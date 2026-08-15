import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message = "Unknown Error", location = "Unknown Location" } = body;

    const apiKey = process.env.DEVIN_API_KEY?.trim();
    const orgId = process.env.DEVIN_ORG_ID?.trim();

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

      console.log("✅ [Devin Bridge] Devin session successfully triggered:", data.id);
      return NextResponse.json({
        success: true,
        simulated: false,
        sessionId: data.id,
        sessionUrl: `https://devin.ai/sessions/${data.id}`,
        prompt: promptText,
      });
    } else {
      console.log("ℹ️ [Devin Bridge] DEVIN_API_KEY or DEVIN_ORG_ID not configured in .env.local.");
      console.log("ℹ️ [Devin Bridge] Simulated prompt for Devin:\n" + promptText);

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
