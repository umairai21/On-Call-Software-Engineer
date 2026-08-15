import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("📥 [Twilio Webhook] Call answered. Fetching streaming TwiML from ElevenLabs...");

    const elevenlabsKey = process.env.ELEVENLABS_API_KEY?.trim();
    const agentId = process.env.ELEVENLABS_AGENT_ID?.trim();
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER?.trim();

    if (!elevenlabsKey || !agentId) {
      throw new Error("ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID environment variables are missing.");
    }

    // Call the ElevenLabs Register Call endpoint to get the TwiML connection XML
    const response = await fetch("https://api.elevenlabs.io/v1/convai/twilio/register-call", {
      method: "POST",
      headers: {
        "xi-api-key": elevenlabsKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: agentId,
        from_number: twilioPhone || "+15005550006", // Fallback test Twilio number
      }),
    });

    const twimlXml = await response.text();

    if (!response.ok) {
      throw new Error(`ElevenLabs Register-Call failed: ${response.status} ${twimlXml}`);
    }

    console.log("✅ [Twilio Webhook] Received TwiML from ElevenLabs. Handoff successfully dispatched.");

    // Return TwiML XML directly to Twilio
    return new NextResponse(twimlXml, {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (err: any) {
    console.error("❌ [Twilio Webhook] Handoff failed:", err.message);
    
    // Return a default TwiML error message to hang up the call cleanly if something goes wrong
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>An error occurred connecting your call to the voice assistant. Goodbye.</Say>
  <Reject/>
</Response>`;
    
    return new NextResponse(errorTwiml, {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }
}
