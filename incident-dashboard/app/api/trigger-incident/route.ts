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
    const userData: User | undefined = undefined;
    const discount = calculateUserDiscount(userData);
    return NextResponse.json({ discount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Incident triggered:", message);

    return NextResponse.json(
      {
        error: message,
        code: "ERR_UNHANDLED_TYPE_ERROR",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
