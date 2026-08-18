"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Mail, Send } from "lucide-react";

type Language = "en" | "zh";
type Notice = "idle" | "sent" | "subscribed" | "confirmed" | "invalid" | "unavailable" | "error";

export default function SubscribeBanner({ lang, enabled }: { lang: Language; enabled: boolean }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [notice, setNotice] = useState<Notice>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const subscription = url.searchParams.get("subscription");
    if (subscription === "confirmed" || subscription === "invalid" || subscription === "unavailable") {
      setNotice(subscription);
      url.searchParams.delete("subscription");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled) return;
    setLoading(true);
    setNotice("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const result = await response.json() as { error?: string; status?: string };
      if (!response.ok) throw new Error(result.error || "Subscription failed");
      setNotice(result.status === "subscribed" ? "subscribed" : "sent");
      setEmail("");
    } catch (error) {
      setNotice("error");
      setErrorMessage(error instanceof Error ? error.message : "Subscription failed");
    } finally {
      setLoading(false);
    }
  }

  const noticeText: Partial<Record<Notice, string>> = {
    sent: lang === "en" ? "Check your inbox and confirm within 24 hours." : "确认邮件已发送，请在 24 小时内完成确认。",
    subscribed: lang === "en" ? "This email is already subscribed." : "这个邮箱已经订阅了。",
    confirmed: lang === "en" ? "Subscription confirmed — welcome to the herd!" : "订阅成功——欢迎加入动物探索队！",
    invalid: lang === "en" ? "That confirmation link is invalid or expired. Please subscribe again." : "确认链接无效或已过期，请重新订阅。",
    unavailable: lang === "en" ? "Confirmation is temporarily unavailable. Please try again later." : "暂时无法完成确认，请稍后再试。",
    error: lang === "en" ? (errorMessage || "Could not subscribe. Please try again.") : "暂时无法订阅，请稍后再试。",
  };
  const positive = notice === "sent" || notice === "subscribed" || notice === "confirmed";

  return (
    <section aria-labelledby="subscribe-heading" className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-700 px-4 py-3 text-white shadow-md shadow-emerald-900/10 sm:px-5">
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:gap-5">
          <div className="flex min-w-0 items-center gap-3 md:max-w-[42%]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <Mail size={19} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="subscribe-heading" className="text-sm font-extrabold leading-tight sm:text-base">
                {lang === "en" ? "New animal email alerts" : "新动物邮件提醒"}
              </h2>
              <p className="mt-0.5 text-[11px] leading-snug text-emerald-50/85 sm:text-xs">
                {enabled
                  ? (lang === "en" ? "One bilingual email per release. Unsubscribe anytime." : "中英双语，每批一封，可随时退订。")
                  : (lang === "en" ? "Email service setup is in progress." : "邮件服务配置中，完成后即可订阅。")}
              </p>
            </div>
          </div>

          <form onSubmit={subscribe} className="min-w-0 flex-1" noValidate>
            <label htmlFor="subscriber-email" className="sr-only">
              {lang === "en" ? "Email address" : "邮箱地址"}
            </label>
            <div className="flex gap-2">
              <input
                id="subscriber-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                disabled={!enabled}
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={lang === "en" ? "you@example.com" : "输入你的邮箱"}
                className="h-10 min-w-0 flex-1 rounded-xl border border-white/20 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-300/25 disabled:cursor-not-allowed disabled:bg-white/80"
              />
              <div className="absolute -left-[10000px]" aria-hidden="true">
                <label htmlFor="subscriber-website">Website</label>
                <input id="subscriber-website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
              </div>
              <button
                type="submit"
                disabled={loading || !enabled}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-amber-400 px-3 text-sm font-extrabold text-slate-900 shadow-sm transition hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/40 disabled:cursor-not-allowed disabled:opacity-70 sm:px-4"
              >
                {loading ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
                {loading
                  ? (lang === "en" ? "Sending…" : "发送中…")
                  : enabled
                    ? (lang === "en" ? "Subscribe" : "订阅")
                    : (lang === "en" ? "Setting up" : "配置中")}
              </button>
            </div>
            <div aria-live="polite">
              {enabled && notice !== "idle" && (
                <span className={`mt-1 inline-flex items-center gap-1.5 text-xs font-medium ${positive ? "text-emerald-50" : "text-amber-100"}`}>
                  {positive && <CheckCircle2 size={16} aria-hidden="true" />}
                  {noticeText[notice]}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
