import { NextResponse } from "next/server";
import {
  getSubscriptionConfig,
  SubscriptionConfigError,
  verifyConfirmationToken,
} from "@/lib/subscriptions";

export const runtime = "nodejs";

function redirectHome(request: Request, status: "confirmed" | "invalid" | "unavailable") {
  const destination = new URL("/", request.url);
  destination.searchParams.set("subscription", status);
  return NextResponse.redirect(destination, 303);
}

export async function GET(request: Request) {
  try {
    const config = getSubscriptionConfig();
    const token = new URL(request.url).searchParams.get("token");
    const email = verifyConfirmationToken(token, config.signingSecret);
    if (!email) return redirectHome(request, "invalid");

    const updated = await config.resend.contacts.update({ email, unsubscribed: false });
    if (updated.error) throw new Error(`Contact confirmation failed: ${updated.error.name}`);

    const added = await config.resend.contacts.segments.add({ email, segmentId: config.segmentId });
    if (added.error && added.error.statusCode !== 409) {
      throw new Error(`Segment enrollment failed: ${added.error.name}`);
    }

    return redirectHome(request, "confirmed");
  } catch (error) {
    if (!(error instanceof SubscriptionConfigError)) {
      console.error("Subscription confirmation failed", error instanceof Error ? error.message : "unknown error");
    }
    return redirectHome(request, "unavailable");
  }
}
