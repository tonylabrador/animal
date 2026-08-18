import { NextResponse } from "next/server";
import {
  confirmationEmail,
  createConfirmationToken,
  getSubscriptionConfig,
  isSameOrigin,
  normalizeEmail,
  SubscriptionConfigError,
} from "@/lib/subscriptions";

export const runtime = "nodejs";

const attempts = new Map<string, number>();
const COOLDOWN_MS = 60_000;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const lastAttempt = attempts.get(key) || 0;
  attempts.set(key, now);

  if (attempts.size > 500) {
    for (const [entry, timestamp] of attempts) {
      if (now - timestamp > COOLDOWN_MS) attempts.delete(entry);
    }
  }
  return now - lastAttempt < COOLDOWN_MS;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const values = body as { email?: unknown; website?: unknown };
  if (typeof values.website === "string" && values.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = normalizeEmail(values.email);
  if (!email) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`${forwardedFor}:${email}`)) {
    return NextResponse.json({ error: "Please wait a minute before trying again" }, { status: 429 });
  }

  try {
    const config = getSubscriptionConfig();
    const existing = await config.resend.contacts.get({ email });

    if (existing.data?.unsubscribed === false) {
      const added = await config.resend.contacts.segments.add({ email, segmentId: config.segmentId });
      if (added.error && added.error.statusCode !== 409) {
        throw new Error(`Segment enrollment failed: ${added.error.name}`);
      }
      return NextResponse.json({ ok: true, status: "subscribed" });
    }

    if (existing.error?.statusCode === 404) {
      const created = await config.resend.contacts.create({
        email,
        unsubscribed: true,
        segments: [{ id: config.segmentId }],
      });
      if (created.error) throw new Error(`Contact creation failed: ${created.error.name}`);
    } else if (existing.error) {
      throw new Error(`Contact lookup failed: ${existing.error.name}`);
    } else {
      const added = await config.resend.contacts.segments.add({ email, segmentId: config.segmentId });
      if (added.error && added.error.statusCode !== 409) {
        throw new Error(`Segment enrollment failed: ${added.error.name}`);
      }
    }

    const token = createConfirmationToken(email, config.signingSecret);
    const confirmUrl = `${config.siteUrl}/api/subscribe/confirm?token=${encodeURIComponent(token)}`;
    const message = confirmationEmail(confirmUrl);
    const sent = await config.resend.emails.send({
      from: config.from,
      to: email,
      subject: message.subject,
      html: message.html,
      text: message.text,
    }, {
      idempotencyKey: `subscription-confirm-${createConfirmationToken(email, config.signingSecret).slice(-48)}`,
    });
    if (sent.error) throw new Error(`Confirmation email failed: ${sent.error.name}`);

    return NextResponse.json({ ok: true, status: "confirmation_sent" });
  } catch (error) {
    if (error instanceof SubscriptionConfigError) {
      return NextResponse.json({ error: "Subscriptions are temporarily unavailable" }, { status: 503 });
    }
    console.error("Subscription request failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Could not start subscription. Please try again later." }, { status: 502 });
  }
}
