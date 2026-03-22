"use client";

import { useState, useCallback } from "react";
import { Sparkles, Eye, EyeOff, Send, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

type Lang = "en" | "zh";

interface WishlistEntry {
  zh: string;
  en: string;
  scientific: string;
}

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; zh: string; en: string; scientific: string }
  | { type: "clarification"; message: string }
  | { type: "error"; message: string };

interface WishlistSectionProps {
  lang: Lang;
  compact?: boolean;
}

export default function WishlistSection({ lang, compact = false }: WishlistSectionProps) {
  const [input, setInput] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ type: "idle" });
  const [showList, setShowList] = useState(false);
  const [entries, setEntries] = useState<WishlistEntry[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [showRecentlyAdded, setShowRecentlyAdded] = useState(false);
  const [recentlyAddedEntries, setRecentlyAddedEntries] = useState<{zh: string; en: string; scientific: string; id: string}[]>([]);
  const [loadingRecentlyAdded, setLoadingRecentlyAdded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return;
    setSubmitState({ type: "loading" });
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });
      const data = await res.json();
      if (data.status === "VALID") {
        setSubmitState({ type: "success", zh: data.zh, en: data.en, scientific: data.scientific });
        setInput("");
        // Refresh list if open
        if (showList) fetchList();
      } else if (data.status === "NEEDS_CLARIFICATION" || data.status === "INVALID") {
        setSubmitState({ type: "clarification", message: data.clarification });
      } else {
        setSubmitState({ type: "error", message: data.error ?? "未知错误" });
      }
    } catch {
      setSubmitState({ type: "error", message: "网络错误，请稍后再试" });
    }
  }, [input, showList]);

  // ── Load wish list ──────────────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      setEntries(data as WishlistEntry[]);
    } catch {
      setEntries([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const toggleList = () => {
    if (!showList) fetchList();
    setShowList((v) => !v);
    if (showRecentlyAdded) setShowRecentlyAdded(false);
  };

  const fetchRecentlyAdded = useCallback(async () => {
    setLoadingRecentlyAdded(true);
    try {
      const res = await fetch("/api/recently-added");
      const data = await res.json();
      setRecentlyAddedEntries(data);
    } catch {
      setRecentlyAddedEntries([]);
    } finally {
      setLoadingRecentlyAdded(false);
    }
  }, []);

  const toggleRecentlyAdded = () => {
    if (!showRecentlyAdded) fetchRecentlyAdded();
    setShowRecentlyAdded((v) => !v);
    if (showList) setShowList(false);
  };

  const resetState = () => {
    setSubmitState({ type: "idle" });
  };

  return (
    <section className={compact ? "w-full" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"}>
      {/* ── Banner card ─────────────────────────────────────────────────────── */}
      <div className={`relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 shadow-xl lg:shadow-2xl transition-all duration-300 ${compact ? (isOpen ? 'p-4 sm:p-5 lg:p-5' : 'py-3 px-4 lg:p-5') : 'p-8 sm:p-10'}`}>
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-10 w-40 h-40 rounded-full bg-indigo-300/20 blur-2xl" />

        {/* Header */}
        <button 
          onClick={() => compact && setIsOpen(!isOpen)}
          className={`relative w-full flex items-center justify-between text-left ${compact ? 'cursor-pointer lg:cursor-default group mb-0' : 'cursor-default pointer-events-none mb-6'}`}
        >
          <div className={`flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3`}>
            <span className={`${compact ? 'text-3xl hidden lg:inline-block' : 'text-4xl'} select-none ${compact && !isOpen ? '' : 'animate-bounce'}`}>🌟</span>
            <div>
              <h2 className={`text-white font-extrabold leading-tight tracking-tight transition-colors ${compact ? 'text-sm lg:text-lg group-hover:text-indigo-100 lg:group-hover:text-white' : 'text-xl sm:text-2xl'}`}>
                {lang === "en"
                  ? "Can't find your favourite animal?"
                  : "找不到你心中的动物？"}
              </h2>
              <p className={`text-indigo-200 mt-0.5 font-medium ${compact ? 'text-xs' : 'text-sm'} ${compact && !isOpen ? 'hidden lg:block' : 'block'}`}>
                {lang === "en"
                  ? "Submit it to the Animal Wishing Pool — AI will identify it for you 🤖"
                  : "填写加入动物许愿池 — AI 自动为你识别物种 🤖"}
              </p>
            </div>
          </div>
          {compact && (
            <div className={`lg:hidden text-white/70 bg-white/10 p-1 rounded-full shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-white/20' : ''}`}>
              <ChevronDown size={18} />
            </div>
          )}
        </button>

        {/* ── Collapsible Wrapper ───────────────────────────────────────────── */}
        <div className={`grid transition-all duration-300 ease-in-out ${compact ? 'lg:!grid-rows-[1fr] lg:!opacity-100 lg:!mt-4' : 'grid-rows-[1fr] opacity-100 mt-0'} ${
          compact && isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : compact && !isOpen ? 'grid-rows-[0fr] opacity-0 mt-0' : ''
        }`}>
          <div className="overflow-hidden min-h-0">

        {/* ── Input area ────────────────────────────────────────────────────── */}
        <div className="relative flex gap-3">
          <div className="flex-1 relative">
            <Sparkles
              size={16}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none ${compact ? 'hidden' : ''}`}
            />
            <input
              id="wishlist-input"
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (submitState.type !== "idle") resetState();
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={
                lang === "en"
                  ? (compact ? "Animal name…" : "Type any animal name in Chinese or English…")
                  : (compact ? "输入动物名称…" : "输入任意动物名称（中英文皆可）…")
              }
              className={`w-full ${compact ? 'pl-4' : 'pl-10'} pr-4 ${compact ? 'py-2.5' : 'py-3.5'} rounded-2xl bg-white/15 backdrop-blur-sm text-white placeholder-indigo-300 border border-white/20 focus:border-white/50 focus:bg-white/20 focus:ring-2 focus:ring-white/20 outline-none transition-all ${compact ? 'text-[13px]' : 'text-sm'} font-medium`}
            />
          </div>
          <button
            id="wishlist-submit-btn"
            onClick={handleSubmit}
            disabled={submitState.type === "loading" || !input.trim()}
            className={`flex items-center gap-1.5 px-4 ${compact ? 'py-2.5 text-[13px]' : 'py-3.5 px-5 text-sm'} rounded-2xl bg-white text-indigo-700 font-bold shadow-lg hover:bg-indigo-50 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0`}
          >
            {submitState.type === "loading" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} strokeWidth={2.5} />
            )}
            <span className="hidden sm:inline">
              {lang === "en" ? "Submit" : "提交"}
            </span>
          </button>
        </div>

        {/* ── Feedback messages ─────────────────────────────────────────────── */}
        {submitState.type === "success" && (
          <div className="mt-4 flex items-start gap-3 bg-white/15 rounded-2xl px-4 py-3 border border-white/20 animate-fadeIn">
            <CheckCircle2 size={18} className="text-green-300 mt-0.5 shrink-0" />
            <div className="text-sm text-white">
              <span className="font-bold text-green-300">
                {lang === "en" ? "Added to wishlist! " : "已加入许愿池！"}
              </span>
              <span className="text-indigo-100">
                {submitState.zh} / {submitState.en} ·{" "}
                <em>{submitState.scientific}</em>
              </span>
            </div>
          </div>
        )}
        {(submitState.type === "clarification" || submitState.type === "error") && (
          <div className="mt-4 flex items-start gap-3 bg-amber-400/20 rounded-2xl px-4 py-3 border border-amber-300/30 animate-fadeIn">
            <AlertCircle size={18} className="text-amber-300 mt-0.5 shrink-0" />
            <p className="text-sm text-white leading-relaxed">{submitState.message}</p>
          </div>
        )}

        {/* ── View buttons ───────────────────────────────────────────── */}
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            id="wishlist-view-btn"
            onClick={toggleList}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-200 group ${showList ? 'text-white' : 'text-indigo-200 hover:text-white'}`}
          >
            {showList ? (
              <EyeOff size={16} strokeWidth={2} />
            ) : (
              <Eye size={16} strokeWidth={2} />
            )}
            <span>
              {showList
                ? lang === "en" ? "Hide wishlist" : "收起许愿池"
                : lang === "en" ? "View current wishlist" : "查看现有许愿池"}
            </span>
            {showList ? (
              <ChevronUp size={14} className="transition-transform group-hover:-translate-y-0.5" />
            ) : (
              <ChevronDown size={14} className="transition-transform group-hover:translate-y-0.5" />
            )}
          </button>

          <button
            id="recently-added-view-btn"
            onClick={toggleRecentlyAdded}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-200 group ${showRecentlyAdded ? 'text-green-300' : 'text-indigo-200 hover:text-green-300'}`}
          >
            {showRecentlyAdded ? (
              <EyeOff size={16} strokeWidth={2} />
            ) : (
              <CheckCircle2 size={16} strokeWidth={2} />
            )}
            <span>
              {showRecentlyAdded
                ? lang === "en" ? "Hide recently added" : "收起最近完成"
                : lang === "en" ? "View recently added" : "查看最近完成"}
            </span>
            {showRecentlyAdded ? (
              <ChevronUp size={14} className="transition-transform group-hover:-translate-y-0.5" />
            ) : (
              <ChevronDown size={14} className="transition-transform group-hover:translate-y-0.5" />
            )}
          </button>
        </div>

        {/* ── Expanded list ─────────────────────────────────────────────────── */}
        {showList && (
          <div className="mt-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden animate-fadeIn">
            {loadingList ? (
              <div className="flex items-center justify-center py-8 gap-2 text-indigo-200">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">{lang === "en" ? "Loading…" : "加载中…"}</span>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-indigo-300 text-sm">
                {lang === "en" ? "No wishes yet — be the first! 🌟" : "许愿池还是空的，来许第一个愿吧 🌟"}
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {/* Header row */}
                <div className="grid grid-cols-3 px-4 py-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                  <span>{lang === "en" ? "Chinese" : "中文名"}</span>
                  <span>{lang === "en" ? "English" : "英文名"}</span>
                  <span>{lang === "en" ? "Scientific" : "学名"}</span>
                </div>
                {entries.map((e, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-3 px-4 py-3 text-sm hover:bg-white/10 transition-colors"
                  >
                    <span className="text-white font-semibold">{e.zh}</span>
                    <span className="text-indigo-100">{e.en}</span>
                    <span className="text-indigo-300 italic text-xs self-center">{e.scientific}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Recently Added list ───────────────────────────────────────────── */}
        {showRecentlyAdded && (
          <div className="mt-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden animate-fadeIn shadow-inner">
            {loadingRecentlyAdded ? (
              <div className="flex items-center justify-center py-8 gap-2 text-indigo-200">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">{lang === "en" ? "Loading…" : "加载中…"}</span>
              </div>
            ) : recentlyAddedEntries.length === 0 ? (
              <div className="text-center py-8 text-indigo-300 text-sm">
                {lang === "en" ? "No animals added recently." : "最近没有添加新的动物。"}
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {/* Header row */}
                <div className="grid grid-cols-3 px-4 py-2 text-green-200 text-xs font-semibold uppercase tracking-wider bg-green-900/20">
                  <span>{lang === "en" ? "Chinese" : "中文名"}</span>
                  <span>{lang === "en" ? "English" : "英文名"}</span>
                  <span>{lang === "en" ? "Scientific" : "学名"}</span>
                </div>
                {recentlyAddedEntries.map((e, i) => (
                  <Link
                    href={`/animal/${e.id}`}
                    key={i}
                    className="grid grid-cols-3 px-4 py-3 text-sm hover:bg-white/20 transition-colors cursor-pointer group"
                  >
                    <span className="text-white font-semibold group-hover:text-green-300 transition-colors flex items-center gap-1">
                      {e.zh}
                    </span>
                    <span className="text-indigo-100">{e.en}</span>
                    <span className="text-indigo-300 italic text-xs self-center flex items-center justify-between">
                      {e.scientific}
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </section>
  );
}
