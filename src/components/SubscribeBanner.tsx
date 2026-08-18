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
    <section aria-labelledby="subscribe-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-700 px-5 py-5 sm:px-7 sm:py-6 text-white shadow-xl shadow-emerald-900/10">
        <div aria-hidden="true" className="absolute -right-12 -top-20 h-48 w-48 rounded-full bg-white/10" />
        <div aria-hidden="true" className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-300/10" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 lg:max-w-xl">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <Mail size={25} aria-hidden="true" />
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
                {lang === "en" ? "New animal alerts" : "新动物上线通知"}
              </p>
              <h2 id="subscribe-heading" className="text-xl font-extrabold leading-tight sm:text-2xl">
                {lang === "en" ? "Meet every new animal, right from your inbox" : "每次新动物加入，第一时间发到你的邮箱"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-emerald-50/90">
                {lang === "en"
                  ? "One bilingual email per release. Confirm once, unsubscribe anytime."
                  : "每次更新发送一封中英双语邮件；确认后生效，可随时退订。"}
              </p>
            </div>
          </div>

          <form onSubmit={subscribe} className="w-full lg:max-w-xl" noValidate>
            <label htmlFor="subscriber-email" className="sr-only">
              {lang === "en" ? "Email address" : "邮箱地址"}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
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
                className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-300/25 disabled:cursor-not-allowed disabled:bg-white/80"
              />
              <div className="absolute -left-[10000px]" aria-hidden="true">
                <label htmlFor="subscriber-website">Website</label>
                <input id="subscriber-website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
              </div>
              <button
                type="submit"
                disabled={loading || !enabled}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-extrabold text-slate-900 shadow-md transition hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/40 disabled:cursor-wait disabled:opacity-70"
              >
                {loading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
                {loading
                  ? (lang === "en" ? "Sending…" : "发送中…")
                  : enabled
                    ? (lang === "en" ? "Subscribe" : "订阅通知")
                    : (lang === "en" ? "Coming soon" : "即将开放")}
              </button>
            </div>
            <div aria-live="polite" className={`mt-2 min-h-5 text-sm font-medium ${positive ? "text-emerald-50" : "text-amber-100"}`}>
              {!enabled ? (
                <span>{lang === "en" ? "Email alerts are being configured." : "邮件通知服务正在配置中。"}</span>
              ) : notice !== "idle" && (
                <span className="inline-flex items-center gap-1.5">
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
