import { NextResponse } from "next/server";
import { ReleaseNotFoundError, sendReleaseBroadcast } from "@/lib/releaseBroadcast";
import { SubscriptionConfigError } from "@/lib/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const sendSecret = process.env.NEWSLETTER_SEND_SECRET;
  if (!sendSecret || request.headers.get("authorization") !== `Bearer ${sendSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const releaseId = body && typeof body === "object" && "releaseId" in body
    ? (body as { releaseId?: unknown }).releaseId
    : null;
  if (typeof releaseId !== "string" || !/^[a-z0-9-]+$/.test(releaseId)) {
    return NextResponse.json({ error: "A valid releaseId is required" }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, ...(await sendReleaseBroadcast(releaseId)) });
  } catch (error) {
    if (error instanceof ReleaseNotFoundError) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 });
    }
    if (error instanceof SubscriptionConfigError) {
      return NextResponse.json({ error: "Subscription service is not configured" }, { status: 503 });
    }
    console.error("Manual release email failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Release email failed" }, { status: 502 });
  }
}
