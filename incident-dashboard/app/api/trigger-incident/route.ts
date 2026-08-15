import { NextResponse } from "next/server";

// Intentional Bug: This helper function expects a user object with a profile,
// but gets called with null/undefined data when accessed.
function calculateUserDiscount(user: any) {
  // 🚨 REAL CODE BUG: Will throw TypeError: Cannot read properties of undefined (reading 'tier')
  return user.profile.tier === "VIP" ? 0.20 : 0.05;
}

export async function GET() {
  try {
    const userData = { profile: { tier: "VIP" } }; // Fixed by Devin
    const discount = calculateUserDiscount(userData);
    return NextResponse.json({ discount });
  } catch (err: any) {
    console.error("Incident triggered:", err.message);

    return NextResponse.json(
      {
        error: err?.message || "TypeError: Cannot read properties of undefined (reading 'tier')",
        code: "ERR_UNHANDLED_TYPE_ERROR",
        timestamp: new Date().toISOString(),
        location: "calculateUserDiscount (app/api/trigger-incident/route.ts:7:15)",
        stack: err?.stack || "TypeError: Cannot read properties of undefined (reading 'tier')\n    at calculateUserDiscount (app/api/trigger-incident/route.ts:7:15)\n    at GET (app/api/trigger-incident/route.ts:14:22)"
      },
      { status: 500 }
    );
  }
}
