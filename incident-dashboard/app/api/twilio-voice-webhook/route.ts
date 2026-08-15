import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("📥 [Twilio Webhook] Call answered. Preparing ElevenLabs voice alert...");

    // Dynamically detect ngrok public tunnel URL
    let publicUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    try {
      const ngrokRes = await fetch("http://127.0.0.1:4040/api/tunnels");
      if (ngrokRes.ok) {
        const data = await ngrokRes.json();
        const httpsTunnel = data.tunnels?.find((t: any) => t.proto === "https");
        if (httpsTunnel?.public_url) {
          publicUrl = httpsTunnel.public_url;
        }
      }
    } catch {
      // Fallback
    }

    const actionUrl = `${publicUrl}/api/twilio-handle-gather`;
    const audioPromptUrl = `${publicUrl}/api/elevenlabs-voice-prompt`;

    // Return TwiML that plays the real ElevenLabs AI generated audio
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech dtmf" numDigits="1" speechTimeout="auto" action="${actionUrl}" method="POST">
    <Play>${audioPromptUrl}</Play>
  </Gather>
  <Say voice="Polly.Joanna-Neural">
    We didn't receive any confirmation. The pull request remains open for your manual review. Goodbye!
  </Say>
  <Hangup/>
</Response>`;

    console.log(`✅ [Twilio Webhook] Dispatched Gather with ElevenLabs audio: ${audioPromptUrl}`);

    return new NextResponse(twiml, {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (err: any) {
    console.error("❌ [Twilio Webhook] Failed:", err.message);

    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">An error occurred in your on-call system. Goodbye.</Say>
  <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }
}
