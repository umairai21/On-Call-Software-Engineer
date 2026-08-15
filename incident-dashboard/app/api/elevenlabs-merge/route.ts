import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { confirm = false } = body;

    console.log("📥 [ElevenLabs Tool Webhook] Received webhook call with payload:", JSON.stringify(body));

    if (confirm) {
      console.log("⚙️ [ElevenLabs Tool Webhook] User confirmed merge. Triggering local codebase PR merge...");
      
      const origin = new URL(req.url).origin;
      const mergeRes = await fetch(`${origin}/api/resolve-incident`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "merge" })
      });
      const mergeData = await mergeRes.json();

      if (mergeData.success) {
        console.log("✅ [ElevenLabs Tool Webhook] Local PR merged and bug resolved successfully!");
        return NextResponse.json({
          success: true,
          message: "Pull request successfully merged. Codebase is now operational."
        });
      } else {
        throw new Error(mergeData.error || "Failed to patch codebase");
      }
    } else {
      console.log("⚠️ [ElevenLabs Tool Webhook] Merge confirmation not received or set to false.");
      return NextResponse.json({
        success: false,
        message: "Merge not confirmed. PR left unchanged."
      });
    }
  } catch (err: any) {
    console.error("❌ [ElevenLabs Tool Webhook] Merge webhook failed:", err.message);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to execute webhook merge" },
      { status: 500 }
    );
  }
}
