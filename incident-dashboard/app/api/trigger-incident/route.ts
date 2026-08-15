import { NextResponse } from "next/server";

const VIP_DISCOUNT = 0.20;
const DEFAULT_DISCOUNT = 0.05;

interface User {
  profile?: {
    tier?: string;
  };
}

// Returns the discount for a user, falling back to the default rate when the
// user or their profile data is unavailable.
function calculateUserDiscount(user?: User | null) {
  return user?.profile?.tier === "VIP" ? VIP_DISCOUNT : DEFAULT_DISCOUNT;
}

export async function GET() {
  try {
    const userData = undefined; // Bug: User data is missing!
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
