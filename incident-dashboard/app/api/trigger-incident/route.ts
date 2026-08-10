import { NextResponse } from "next/server";

// Intentional Bug: This helper function expects a user object with a profile,
// but gets called with null/undefined data when the button is clicked.
function calculateUserDiscount(user: any) {
  // 🚨 REAL CODE BUG: Will throw TypeError: Cannot read properties of undefined (reading 'tier')
  return user.profile.tier === "VIP" ? 0.20 : 0.05;
}

export async function GET() {
  const userData = undefined; // Bug: User data is missing!
  
  // This line will crash with a real Uncaught TypeError
  const discount = calculateUserDiscount(userData);

  return NextResponse.json({ discount });
}




