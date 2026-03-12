"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Globe,
  Layers,
  GitBranch,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import DrillDownView from "./DrillDownView";
import type { TaxonomyNode } from "@/lib/buildTaxonomyTree";

// D3-based Tree must be loaded client-side only (no SSR)
const TreeView = dynamic(() => import("./TreeView"), { ssr: false });

type Language = "en" | "zh";
type ViewMode = "cards" | "tree";

interface TaxonomyExplorerProps {
  tree: TaxonomyNode;
}

export default function TaxonomyExplorer({ tree }: TaxonomyExplorerProps) {
  const { lang, toggleLang } = useLanguage();
  const router = useRouter();
  const [mode, _setMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("taxonomy-mode");
      if (saved === "cards" || saved === "tree") return saved;
    }
    return "cards";
  });

  const setMode = (m: ViewMode) => {
    _setMode(m);
    sessionStorage.setItem("taxonomy-mode", m);
  };

  // Stats
  const statsMap: Record<string, Set<string>> = {
    Kingdom: new Set(),
    Phylum: new Set(),
    Class: new Set(),
    Order: new Set(),
    Family: new Set(),
    Species: new Set(),
  };
  function collectStats(node: TaxonomyNode) {
    if (node.level in statsMap) statsMap[node.level].add(node.name);
    for (const c of node.children) collectStats(c);
  }
  collectStats(tree);

  const stats = [
    { label: lang === "en" ? "Kingdoms" : "界", count: statsMap.Kingdom.size, color: "text-amber-500" },
    { label: lang === "en" ? "Phyla" : "门", count: statsMap.Phylum.size, color: "text-violet-500" },
    { label: lang === "en" ? "Classes" : "纲", count: statsMap.Class.size, color: "text-sky-500" },
    { label: lang === "en" ? "Orders" : "目", count: statsMap.Order.size, color: "text-emerald-500" },
    { label: lang === "en" ? "Families" : "科", count: statsMap.Family.size, color: "text-rose-500" },
    { label: lang === "en" ? "Species" : "种", count: statsMap.Species.size, color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3 max-w-7xl mx-auto">
          {/* Left: back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm shrink-0"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">
              {lang === "en" ? "Home" : "首页"}
            </span>
          </button>

          {/* Centre: title */}
          <div className="flex items-center gap-1.5 font-bold text-slate-700 text-sm">
            <span className="select-none">🌳</span>
            {lang === "en" ? "Taxonomy Explorer" : "分类探索"}
          </div>

          {/* Right: lang */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all bg-amber-400 hover:bg-amber-500 text-white shadow-sm active:scale-95"
          >
            <Globe size={13} strokeWidth={2.5} />
            {lang === "en" ? "中文" : "EN"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {/* ── Hero ── */}
        <section className="pt-8 sm:pt-12 pb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            {lang === "en" ? (
              <>
                Explore the{" "}
                <span className="text-amber-500">Tree of Life</span>
              </>
            ) : (
              <>
                探索
                <span className="text-amber-500">生命之树</span>
              </>
            )}
          </h1>
          <p className="mt-2 text-slate-500 text-base max-w-lg mx-auto">
            {lang === "en"
              ? "Navigate the animal kingdom through biological classification"
              : "通过生物分类学层级漫游动物王国"}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-5">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className={`text-2xl font-extrabold ${s.color}`}>
                  {s.count}
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mode toggle ── */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setMode("cards")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md active:scale-95 ${
              mode === "cards"
                ? "bg-white text-slate-800 ring-2 ring-amber-300 shadow-lg"
                : "bg-white/70 text-slate-500 hover:bg-white hover:text-slate-700"
            }`}
          >
            <Layers size={18} strokeWidth={1.8} />
            {lang === "en" ? "Cards" : "卡片"}
          </button>
          <button
            onClick={() => setMode("tree")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md active:scale-95 ${
              mode === "tree"
                ? "bg-white text-slate-800 ring-2 ring-amber-300 shadow-lg"
                : "bg-white/70 text-slate-500 hover:bg-white hover:text-slate-700"
            }`}
          >
            <GitBranch size={18} strokeWidth={1.8} />
            {lang === "en" ? "Tree" : "树状图"}
          </button>
        </div>

        {/* ── Content ── */}
        {mode === "cards" ? (
          <DrillDownView tree={tree} lang={lang} />
        ) : (
          <TreeView tree={tree} lang={lang} />
        )}
      </main>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        {lang === "en"
          ? "Wild Explorer · Made with ❤️ for Emily"
          : "动物探索 · 为 Emily 用心制作 ❤️"}
      </footer>
    </div>
  );
}
