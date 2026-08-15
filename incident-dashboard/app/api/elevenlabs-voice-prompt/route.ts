import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const message =
      searchParams.get("text") ||
      "Hey there! I am your Devin on-call software engineer. I detected a crash in calculateUserDiscount on your website and opened a pull request on GitHub to fix it. Say Yes, or press 1, to automatically merge the fix now.";

    const elevenlabsKey = process.env.ELEVENLABS_API_KEY?.trim();
    // Default to the popular Rachel voice or configured voice
    const voiceId = "21m00Tcm4TlvDq8ikWAM"; 

    if (!elevenlabsKey) {
      return new NextResponse("Missing ELEVENLABS_API_KEY", { status: 500 });
    }

    // Call ElevenLabs TTS API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": elevenlabsKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message,
        model_id: "eleven_flash_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ [ElevenLabs TTS] API error:", errText);
      return new NextResponse(`ElevenLabs error: ${errText}`, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("❌ [ElevenLabs TTS] Exception:", err.message);
    return new NextResponse(err.message, { status: 500 });
  }
}
