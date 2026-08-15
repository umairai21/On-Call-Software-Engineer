import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const speechResult = (formData.get("SpeechResult")?.toString() || "").toLowerCase();
    const digits = formData.get("Digits")?.toString() || "";

    console.log(`🎙️ [Twilio Gather] Received input - Speech: "${speechResult}", Digits: "${digits}"`);

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

    const isConfirmed =
      digits === "1" ||
      speechResult.includes("yes") ||
      speechResult.includes("merge") ||
      speechResult.includes("sure") ||
      speechResult.includes("yeah") ||
      speechResult.includes("ok") ||
      speechResult.includes("confirm") ||
      speechResult.includes("do it");

    if (isConfirmed) {
      console.log("🚀 [Twilio Gather] User confirmed PR merge via phone voice!");

      // 1. Hotfix the local incident file to immediately fix the bug
      try {
        const filePath = path.join(process.cwd(), "app", "api", "trigger-incident", "route.ts");
        const fixedContent = `import { NextResponse } from "next/server";

// Hardcoded user data for the demo
const mockUser = {
  id: "usr_12345",
  name: "Jane Doe",
  email: "jane.doe@example.com",
  profile: {
    tier: "gold",
    discountRate: 0.15,
  },
};

function calculateUserDiscount(user: any) {
  // Safe navigation prevents TypeError
  const tier = user?.profile?.tier;
  if (tier === "gold") {
    return 0.15;
  }
  return 0.05;
}

export async function GET() {
  try {
    // Correct logic
    const discount = calculateUserDiscount(mockUser);
    return NextResponse.json({
      success: true,
      message: "Discount calculated successfully",
      discount,
      user: mockUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
`;
        fs.writeFileSync(filePath, fixedContent, "utf-8");
        console.log("✅ [Twilio Gather] Local codebase hotfixed successfully.");
      } catch (err: any) {
        console.error("⚠️ [Twilio Gather] Error applying local hotfix:", err.message);
      }

      // Generate ElevenLabs audio URL for confirmation
      const confirmText = encodeURIComponent("Awesome! I am merging the pull request now. The incident is resolved and your app is healthy again. Have a restful night, goodbye!");
      const confirmAudioUrl = `${publicUrl}/api/elevenlabs-voice-prompt?text=${confirmText}`;

      const successTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${confirmAudioUrl}</Play>
  <Hangup/>
</Response>`;

      return new NextResponse(successTwiml, {
        headers: {
          "Content-Type": "text/xml",
        },
      });
    } else {
      console.log("🛑 [Twilio Gather] User declined or said no.");

      // Generate ElevenLabs audio URL for decline
      const declineText = encodeURIComponent("Understood! I have left the pull request open for you to review in the morning. Have a restful night, goodbye!");
      const declineAudioUrl = `${publicUrl}/api/elevenlabs-voice-prompt?text=${declineText}`;

      const declineTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${declineAudioUrl}</Play>
  <Hangup/>
</Response>`;

      return new NextResponse(declineTwiml, {
        headers: {
          "Content-Type": "text/xml",
        },
      });
    }
  } catch (err: any) {
    console.error("❌ [Twilio Gather] Handler error:", err.message);

    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">
    An error occurred while processing your confirmation. Please check your GitHub repository. Goodbye!
  </Say>
  <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }
}
