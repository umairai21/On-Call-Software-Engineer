import { NextResponse } from "next/server";

const DEFAULT_DISCOUNT = 0.05;
const VIP_DISCOUNT = 0.2;

interface User {
  profile?: {
    tier?: string;
  };
}

function calculateUserDiscount(user?: User | null) {
  return user?.profile?.tier === "VIP" ? VIP_DISCOUNT : DEFAULT_DISCOUNT;
}

export async function GET() {
  try {
    const userData: User | undefined = undefined;
    const discount = calculateUserDiscount(userData);
    return NextResponse.json({ discount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("Incident triggered:", message);

    return NextResponse.json(
      {
        error: message,
        code: "ERR_UNHANDLED_TYPE_ERROR",
        timestamp: new Date().toISOString(),
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}
