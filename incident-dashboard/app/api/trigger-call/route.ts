import { NextRequest, NextResponse } from "next/server";

async function getPublicUrl(origin: string): Promise<string> {
  // 1. Try to fetch from local ngrok client API
  try {
    const res = await fetch("http://127.0.0.1:4040/api/tunnels");
    if (res.ok) {
      const data = await res.json();
      const httpsTunnel = data.tunnels?.find((t: any) => t.proto === "https" || t.public_url?.startsWith("https"));
      if (httpsTunnel?.public_url) {
        console.log("🔗 [Telephony Bridge] Dynamically detected ngrok tunnel URL:", httpsTunnel.public_url);
        return httpsTunnel.public_url;
      }
    }
  } catch (e) {
    // ngrok is either not running or API is unreachable
  }

  // 2. Try to read from environment variable
  const envUrl = process.env.PUBLIC_URL?.trim() || process.env.NGROK_URL?.trim();
  if (envUrl) {
    console.log("🔗 [Telephony Bridge] Using public URL from environment variable:", envUrl);
    return envUrl;
  }

  // 3. Fallback to origin
  console.warn("⚠️ [Telephony Bridge] Public tunnel URL not found. Falling back to request origin:", origin);
  return origin;
}

export async function POST(req: NextRequest) {
  try {
    const origin = new URL(req.url).origin;

    // Twilio credentials
    const twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const twilioToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER?.trim();
    
    // ElevenLabs credentials for verification
    const elevenlabsKey = process.env.ELEVENLABS_API_KEY?.trim();
    const agentId = process.env.ELEVENLABS_AGENT_ID?.trim();
    
    // User Phone
    const toNumber = process.env.USER_PHONE_NUMBER?.trim();

    const isTwilioConfigured = twilioSid && twilioToken && twilioPhone && toNumber;
    const isElevenLabsConfigured = elevenlabsKey && agentId;

    if (isTwilioConfigured && isElevenLabsConfigured) {
      console.log(`📞 [Twilio] Initiating direct outbound call from ${twilioPhone} to ${toNumber}...`);
      
      const basicAuth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
      const publicUrl = await getPublicUrl(origin);
      
      // Form urlencode the body for Twilio Calls API
      const formData = new URLSearchParams();
      formData.append("To", toNumber!);
      formData.append("From", twilioPhone!);
      // Point Twilio to our local voice webhook which bridges to ElevenLabs
      formData.append("Url", `${publicUrl}/api/twilio-voice-webhook`);

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Calls.json`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Failed to parse Twilio response: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data?.message || `Twilio API error: ${response.status} ${response.statusText}`);
      }

      console.log("✅ [Twilio] Outbound call successfully placed! SID:", data.sid);
      return NextResponse.json({
        success: true,
        simulated: false,
        callSid: data.sid,
        message: "Direct Twilio call placed successfully. Awaiting webhook handoff.",
      });
    } else {
      // Simulation mode fallback
      const displayPhone = toNumber || "+1 (555) 019-9921";
      console.log(`📞 [ElevenLabs Simulation] Dialing user phone number at ${displayPhone}...`);
      console.log("📞 [ElevenLabs Simulation] RING... RING... RING...");
      console.log("📞 [ElevenLabs Simulation] User Answered.");
      console.log('🗣️ [ElevenLabs Voice Assistant]: "Hey there! I am your Devin on-call assistant. I detected a TypeError in calculateUserDiscount and opened a pull request on your GitHub. Do you want me to merge it?"');

      return NextResponse.json({
        success: true,
        simulated: true,
        message: "Simulated ElevenLabs outbound call triggered.",
        toNumber: displayPhone,
        prompt: "Do you want to merge the hotfix pull request?",
      });
    }
  } catch (err: any) {
    console.error("❌ [Telephony Bridge] Outbound call failure:", err.message);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to trigger outbound call" },
      { status: 500 }
    );
  }
}
