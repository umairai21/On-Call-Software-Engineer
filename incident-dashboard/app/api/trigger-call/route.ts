import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
    const agentId = process.env.ELEVENLABS_AGENT_ID?.trim();
    const phoneId = process.env.ELEVENLABS_PHONE_NUMBER_ID?.trim();
    const toNumber = process.env.USER_PHONE_NUMBER?.trim();

    if (apiKey && agentId && phoneId && toNumber) {
      console.log(`📞 [ElevenLabs] Triggering outbound call to ${toNumber} using Agent ${agentId}...`);
      
      const response = await fetch("https://api.elevenlabs.io/v1/convai/twilio/outbound-call", {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
          agent_phone_number_id: phoneId,
          to_number: toNumber,
        }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Failed to parse ElevenLabs response: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data?.detail?.message || `ElevenLabs error: ${response.status} ${response.statusText}`);
      }

      console.log("✅ [ElevenLabs] Phone call successfully dispatched! Call ID:", data.call_id);
      return NextResponse.json({
        success: true,
        simulated: false,
        callId: data.call_id,
        message: "Outbound call successfully initiated.",
      });
    } else {
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
    console.error("❌ [ElevenLabs Bridge] Failed to place outbound call:", err.message);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to place outbound call" },
      { status: 500 }
    );
  }
}
