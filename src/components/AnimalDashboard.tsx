"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Globe, Search, X, MapPin, Tag, TreeDeciduous, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import type { Animal } from "@/types/animal";

type Language = "en" | "zh";

const TAG_COLORS: Record<string, string> = {
  Mammal:      "bg-amber-100 text-amber-700",
  Grassland:   "bg-lime-100 text-lime-700",
  Forest:      "bg-emerald-100 text-emerald-700",
  Mountains:   "bg-sky-100 text-sky-700",
  Ocean:       "bg-blue-100 text-blue-700",
  River:       "bg-cyan-100 text-cyan-700",
  Desert:      "bg-orange-100 text-orange-700",
  Herbivore:   "bg-green-100 text-green-700",
  Carnivore:   "bg-red-100 text-red-700",
  Omnivore:    "bg-purple-100 text-purple-700",
  Insectivore: "bg-pink-100 text-pink-700",
  Marsupial:   "bg-rose-100 text-rose-700",
};

const DEFAULT_TAG_COLOR = "bg-slate-100 text-slate-600";

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] ?? DEFAULT_TAG_COLOR;
}

interface AnimalCardProps {
  animal: Animal;
  lang: Language;
}

function AnimalCard({ animal, lang }: AnimalCardProps) {
  const [imgError, setImgError] = useState(false);

  const primaryName = lang === "en" ? animal.name_en : animal.name_zh;
  const secondaryName = lang === "en" ? animal.name_zh : animal.name_en;
  const habitatText =
    lang === "en" ? animal.habitat.text_en : animal.habitat.text_zh;

  const imageUrl = animal.image && !imgError ? animal.image : null;

  return (
    <Link href={`/animal/${animal.id}`} className="block">
    <article className="group bg-white rounded-3xl shadow-md overflow-hidden flex flex-col transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
      {/* Image */}
      <div className="relative w-full h-52 overflow-hidden bg-slate-100">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt={animal.name_en}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          /* 占位块：图片缺失或加载失败时显示 */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-4xl opacity-40">🐾</span>
            <span className="text-xs text-slate-400 font-medium">No image</span>
          </div>
        )}
        {/* Gradient overlay（仅图片存在时叠加） */}
        {imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        )}
        {/* Habitat badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/80 backdrop-blur-sm text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">
          <MapPin size={11} strokeWidth={2.5} />
          <span>{habitatText}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Names */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 leading-tight tracking-tight">
            {primaryName}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5 font-medium">
            {secondaryName}
          </p>
          <p className="text-xs text-slate-400 italic mt-1">
            {animal.scientific_name}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {animal.ui_tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${getTagColor(tag)}`}
            >
              <Tag size={9} strokeWidth={2.5} />
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">
          {lang === "en" ? animal.description.en : animal.description.zh}
        </p>
      </div>
    </article>
    </Link>
  );
}

interface AnimalDashboardProps {
  animals: Animal[];
}

export default function AnimalDashboard({ animals }: AnimalDashboardProps) {
  const { lang, toggleLang } = useLanguage();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return animals;
    return animals.filter(
      (a) =>
        a.name_en.toLowerCase().includes(q) ||
        a.name_zh.includes(q) ||
        a.scientific_name.toLowerCase().includes(q) ||
        a.ui_tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [animals, query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo + Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-2xl select-none">🦁</span>
            <div className="leading-tight">
              <span className="font-extrabold text-slate-800 text-lg tracking-tight">
                Wild Explorer
              </span>
              <span className="hidden sm:inline text-slate-300 mx-2">·</span>
              <span className="hidden sm:inline text-slate-500 font-medium text-base">
                动物探索
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm hidden sm:block">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder={lang === "en" ? "Search animals…" : "搜索动物…"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-100 rounded-xl border border-transparent focus:border-amber-300 focus:bg-white focus:ring-2 focus:ring-amber-100 outline-none transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 bg-amber-400 hover:bg-amber-500 text-white shadow-sm hover:shadow-md active:scale-95"
            >
              <Globe size={15} strokeWidth={2.5} />
              <span>{lang === "en" ? "中文" : "EN"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden px-4 pb-3 relative">
          <Search
            size={15}
            className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder={lang === "en" ? "Search animals…" : "搜索动物…"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-100 rounded-xl border border-transparent focus:border-amber-300 focus:bg-white focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
          {lang === "en" ? (
            <>
              Discover the{" "}
              <span className="text-amber-500">Wild World</span>
            </>
          ) : (
            <>
              探索{" "}
              <span className="text-amber-500">野生世界</span>
            </>
          )}
        </h1>
        <p className="mt-3 text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
          {lang === "en"
            ? `${filtered.length} amazing animals — ready to be discovered.`
            : `${filtered.length} 种神奇动物 — 等待你来发现。`}
        </p>

        {/* Taxonomy Banner */}
        <Link
          href="/taxonomy"
          className="inline-flex items-center gap-3 mt-6 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 group"
        >
          <TreeDeciduous size={24} strokeWidth={2} />
          <span>{lang === "en" ? "Explore the Tree of Life" : "探索生命之树"}</span>
          <ChevronRight size={20} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </section>

      {/* ── Grid ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-3">
            <span className="text-6xl">🔍</span>
            <p className="text-lg font-medium">
              {lang === "en"
                ? "No animals found. Try a different search!"
                : "找不到动物，换个关键词试试！"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} lang={lang} />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        {lang === "en"
          ? "Wild Explorer · Made with ❤️ for Emily"
          : "动物探索 · 为 Emily 用心制作 ❤️"}
      </footer>
    </div>
  );
}
