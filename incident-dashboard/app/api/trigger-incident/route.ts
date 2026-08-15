import { NextResponse } from "next/server";

type User = {
  profile?: {
    tier?: string;
  };
};

const VIP_DISCOUNT = 0.2;
const DEFAULT_DISCOUNT = 0.05;

function calculateUserDiscount(user?: User | null) {
  return user?.profile?.tier === "VIP" ? VIP_DISCOUNT : DEFAULT_DISCOUNT;
}

export async function GET() {
  try {
    const userData = { profile: { tier: "VIP" } }; // Fixed by Devin
    const discount = calculateUserDiscount(userData);
    return NextResponse.json({ discount });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : undefined;
    console.error("Incident triggered:", error?.message);

    return NextResponse.json(
      {
        error: error?.message || "Unexpected error while calculating the user discount",
        code: "ERR_UNHANDLED_TYPE_ERROR",
        timestamp: new Date().toISOString(),
        location: "calculateUserDiscount (app/api/trigger-incident/route.ts)",
        stack: error?.stack
      },
      { status: 500 }
    );
  }
}
