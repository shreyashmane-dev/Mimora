import { NextResponse } from "next/server";
import { checkAndCleanupExpiredProjects } from "@/app/actions/theme";

// Prevents Next.js caching this API route
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Secure the cron endpoint if CRON_SECRET is configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    console.log("Triggering cron check for expired projects (45 days)...");
    const cleanupResult = await checkAndCleanupExpiredProjects();

    return NextResponse.json({
      success: true,
      message: `Successfully executed cleanup scan.`,
      cleanedCount: cleanupResult.cleanedCount,
      cleanupSuccess: cleanupResult.success,
    });
  } catch (err: any) {
    console.error("Cron project cleanup failed:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Internal server error during cleanup",
      },
      { status: 500 }
    );
  }
}
