import crypto from "crypto";
import { Resend } from "resend";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_LIFETIME_SECONDS = 24 * 60 * 60;

export interface SubscriptionConfig {
  resend: Resend;
  segmentId: string;
  from: string;
  signingSecret: string;
  siteUrl: string;
}

interface ConfirmationPayload {
  action: "confirm";
  email: string;
  exp: number;
}

export class SubscriptionConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubscriptionConfigError";
  }
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 3 || email.length > 254 || !EMAIL_PATTERN.test(email)) return null;
  return email;
}

export function getSubscriptionConfig(): SubscriptionConfig {
  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_SEGMENT_ID;
  const from = process.env.RESEND_FROM_EMAIL;
  const signingSecret = process.env.SUBSCRIBE_SIGNING_SECRET;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://animal.prismbase.org").replace(/\/$/, "");

  if (!apiKey || !segmentId || !from || !signingSecret) {
    throw new SubscriptionConfigError("Subscription service is not configured");
  }

  return {
    resend: new Resend(apiKey),
    segmentId,
    from,
    signingSecret,
    siteUrl,
  };
}

function signatureFor(encodedPayload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

export function createConfirmationToken(email: string, secret: string): string {
  const payload: ConfirmationPayload = {
    action: "confirm",
    email,
    exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signatureFor(encoded, secret)}`;
}

export function verifyConfirmationToken(token: string | null, secret: string): string | null {
  if (!token || token.length > 1024) return null;
  const [encoded, providedSignature, extra] = token.split(".");
  if (!encoded || !providedSignature || extra) return null;

  const expectedSignature = signatureFor(encoded, secret);
  const expected = Buffer.from(expectedSignature);
  const provided = Buffer.from(providedSignature);
  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<ConfirmationPayload>;
    if (payload.action !== "confirm" || typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) return null;
    return normalizeEmail(payload.email);
  } catch {
    return null;
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] || character);
}

export function confirmationEmail(confirmUrl: string) {
  const safeUrl = escapeHtml(confirmUrl);
  return {
    subject: "Confirm your Wild Explorer subscription / 确认订阅野生动物探索",
    text: [
      "Confirm your Wild Explorer subscription",
      "Thanks for subscribing. Open the link below within 24 hours to confirm:",
      confirmUrl,
      "",
      "确认订阅野生动物探索",
      "感谢订阅。请在 24 小时内打开上方链接完成确认。",
      "",
      "If you did not request this, you can safely ignore this email.",
      "如果并非你本人操作，请忽略此邮件。",
    ].join("\n"),
    html: `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,'Noto Sans SC',sans-serif;color:#1e293b"><div style="max-width:620px;margin:0 auto;padding:40px 20px"><div style="background:#fff;border:1px solid #e2e8f0;border-radius:24px;padding:36px;box-shadow:0 8px 30px rgba(15,23,42,.06)"><div style="font-size:34px">🐾</div><h1 style="font-size:26px;margin:16px 0 8px">Confirm your subscription</h1><h2 style="font-size:20px;margin:0 0 20px;color:#059669">确认你的订阅</h2><p style="line-height:1.7;color:#475569">One last step: confirm your email to receive a bilingual update whenever new animals join Wild Explorer.</p><p style="line-height:1.7;color:#475569">只差最后一步：确认邮箱后，每当野生动物探索加入新动物，你都会收到中英双语通知。</p><p style="margin:28px 0"><a href="${safeUrl}" style="display:inline-block;background:#059669;color:white;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:12px">Confirm / 确认订阅</a></p><p style="font-size:13px;color:#64748b;line-height:1.6">This link expires in 24 hours. If you did not request this, simply ignore this email.<br>链接将在 24 小时后失效。如果并非你本人操作，请忽略此邮件。</p></div></div></body></html>`,
  };
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
