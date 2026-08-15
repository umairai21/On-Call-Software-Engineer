import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action = "merge" } = body;

    const routeFilePath = path.join(process.cwd(), "app", "api", "trigger-incident", "route.ts");

    if (!fs.existsSync(routeFilePath)) {
      return NextResponse.json({ success: false, error: "Target route file not found" }, { status: 404 });
    }

    let fileContent = fs.readFileSync(routeFilePath, "utf8");

    const bugString = `const userData = undefined; // Bug: User data is missing!`;
    const fixString = `const userData = { profile: { tier: "VIP" } }; // Fixed by Devin`;

    if (action === "merge") {
      if (fileContent.includes(bugString)) {
        fileContent = fileContent.replace(bugString, fixString);
        fs.writeFileSync(routeFilePath, fileContent, "utf8");
        return NextResponse.json({
          success: true,
          message: "Devin's PR merged successfully. Bug resolved!",
          action: "merged"
        });
      } else if (fileContent.includes(fixString)) {
        return NextResponse.json({
          success: true,
          message: "PR is already merged. System is healthy.",
          action: "already_merged"
        });
      } else {
        return NextResponse.json({
          success: false,
          error: "Could not find target code pattern to patch. Code may have been manually modified."
        }, { status: 400 });
      }
    } else if (action === "revert") {
      if (fileContent.includes(fixString)) {
        fileContent = fileContent.replace(fixString, bugString);
        fs.writeFileSync(routeFilePath, fileContent, "utf8");
        return NextResponse.json({
          success: true,
          message: "Incident reset. Codebase reverted to buggy state.",
          action: "reverted"
        });
      } else if (fileContent.includes(bugString)) {
        return NextResponse.json({
          success: true,
          message: "Bug is already present in code.",
          action: "already_buggy"
        });
      } else {
        return NextResponse.json({
          success: false,
          error: "Could not find target code pattern to revert."
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({ success: false, error: "Invalid action specified" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Resolve incident failure:", err);
    return NextResponse.json({ success: false, error: err?.message || "Internal server error" }, { status: 500 });
  }
}
