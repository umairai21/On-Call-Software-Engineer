import { NextResponse } from "next/server";

type UserProfile = {
  tier?: string;
};

type User = {
  profile?: UserProfile;
};

const VIP_DISCOUNT = 0.2;
const DEFAULT_DISCOUNT = 0.05;

function calculateUserDiscount(user?: User | null): number {
  return user?.profile?.tier === "VIP" ? VIP_DISCOUNT : DEFAULT_DISCOUNT;
}

export async function GET() {
  const userData: User | undefined = undefined;
  const discount = calculateUserDiscount(userData);

  return NextResponse.json({ discount });
}
