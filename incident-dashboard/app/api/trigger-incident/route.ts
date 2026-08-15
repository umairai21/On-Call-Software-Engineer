import { NextResponse } from "next/server";

const VIP_DISCOUNT = 0.2;
const DEFAULT_DISCOUNT = 0.05;

type User = {
  profile?: {
    tier?: string;
  };
};

function calculateUserDiscount(user?: User | null): number {
  return user?.profile?.tier === "VIP" ? VIP_DISCOUNT : DEFAULT_DISCOUNT;
}

export async function GET() {
  try {
    const userData: User = { profile: { tier: "VIP" } };
    const discount = calculateUserDiscount(userData);
    return NextResponse.json({ discount });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : undefined;
    console.error("Incident triggered:", error?.message ?? err);

    return NextResponse.json(
      {
        error: error?.message || "TypeError: Cannot read properties of undefined (reading 'tier')",
        code: "ERR_UNHANDLED_TYPE_ERROR",
        timestamp: new Date().toISOString(),
        location: "calculateUserDiscount (app/api/trigger-incident/route.ts:7:15)",
        stack: error?.stack || "TypeError: Cannot read properties of undefined (reading 'tier')\n    at calculateUserDiscount (app/api/trigger-incident/route.ts:7:15)\n    at GET (app/api/trigger-incident/route.ts:14:22)"
      },
      { status: 500 }
    );
  }
}
