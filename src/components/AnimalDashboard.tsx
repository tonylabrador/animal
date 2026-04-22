"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Globe, Search, X, MapPin, Tag, TreeDeciduous, ChevronRight, Shuffle, ArrowDownAZ, ArrowUp, Clock } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import type { Animal } from "@/types/animal";
import WishlistSection from "@/components/WishlistSection";
import MessageBoard from "@/components/MessageBoard";

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
  const [sortMode, setSortMode] = useState<"newest" | "alpha" | "random">("newest");
  const [randomSeed, setRandomSeed] = useState(0);
  const [displayCount, setDisplayCount] = useState(24);
  const [showTop, setShowTop] = useState(false);

  // Reset pagination when search or sort changes
  useEffect(() => {
    setDisplayCount(24);
  }, [query, sortMode, randomSeed]);

  // Back to Top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = useMemo(() => {
    let result = animals;

    // 1. Deep Text Search
    const q = query.toLowerCase().trim();
    if (q) {
      result = result.filter((a) => {
        // Create a massive string containing ALL text fields of the animal to ensure comprehensive matching
        const superString = [
          a.name_en, a.name_zh, a.scientific_name,
          ...a.ui_tags,
          a.taxonomy.kingdom.en, a.taxonomy.kingdom.zh,
          a.taxonomy.phylum.en, a.taxonomy.phylum.zh,
          a.taxonomy.class.en, a.taxonomy.class.zh,
          a.taxonomy.order.en, a.taxonomy.order.zh,
          a.taxonomy.family.en, a.taxonomy.family.zh,
          a.taxonomy.genus.en, a.taxonomy.genus.zh,
        ].join(" ").toLowerCase();
        
        return superString.includes(q);
      });
    }

    // 2. Sorting
    result = [...result]; // Clone to prevent mutating props
    if (sortMode === "newest") {
      // Do nothing, effectively keeping the original (newest-first) order from getAnimals
    } else if (sortMode === "alpha") {
      // Sort alphabetically (defaults to English names)
      result.sort((a, b) => a.name_en.localeCompare(b.name_en));
    } else if (sortMode === "random") {
      // Randomly shuffle (Fisher-Yates) triggered by sortSeed change
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
    }

    return result;
  }, [animals, query, sortMode, randomSeed]);

  const visibleAnimals = filtered.slice(0, displayCount);

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

      {/* ── Banner ── */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2 px-4 shadow-sm font-bold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2">
        <span className="animate-pulse">✨</span>
        <span>{lang === "en" ? "NEW ANIMALS ADDED! CHECK IT OUT!" : "新增动物上线！快来看看吧！"}</span>
        <span className="animate-pulse">✨</span>
      </div>

      {/* ── Hero ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 lg:pt-12 lg:pb-12">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-3 lg:gap-0">
          
          {/* Left: Message Board */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:w-[320px] xl:w-[360px] shrink-0 z-10">
            <MessageBoard />
          </div>

          {/* Center Text */}
          <div className="text-center flex-1 max-w-2xl mx-auto lg:pt-4 flex flex-col items-center">
            
            {/* Bilingual Learning Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-3 lg:mb-4 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 text-[11px] sm:text-sm font-bold shadow-sm border border-indigo-100/50">
              <span className="text-sm sm:text-base leading-none">📖</span>
              <span>{lang === "en" ? "Explore Animals while Learning Mandarin!" : "中英双语-探索动物学习英文！"}</span>
            </div>

            <h1 className={`${lang === 'en' ? 'text-3xl sm:text-4xl lg:text-[42px]' : 'text-4xl sm:text-5xl'} font-extrabold text-slate-800 tracking-tight leading-tight`}>
              {lang === "en" ? (
                <>
                  Discover the{" "}
                  <span className="text-amber-500 whitespace-nowrap">Wild World</span>
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
              className="inline-flex items-center gap-2 lg:gap-3 mt-4 lg:mt-6 px-5 py-3 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm lg:text-lg shadow-md lg:shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 group"
            >
              <TreeDeciduous className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={2} />
              <span>{lang === "en" ? "Explore the Tree of Life" : "探索生命之树"}</span>
              <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
            </Link>
          </div>
          
          {/* Right: Wishlist (Compact) */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:w-[320px] xl:w-[360px] shrink-0 z-10">
            <WishlistSection lang={lang} compact />
          </div>
        </div>
      </section>

      {/* ── Sort & Filter Controls ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 flex items-center justify-start gap-3 flex-wrap">
        <button
          onClick={() => setSortMode("newest")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm ${
            sortMode === "newest"
              ? "bg-slate-800 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Clock size={16} strokeWidth={2.5} />
          {lang === "en" ? "Newest" : "最新添加"}
        </button>
        <button
          onClick={() => setSortMode("alpha")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm ${
            sortMode === "alpha"
              ? "bg-slate-800 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <ArrowDownAZ size={16} strokeWidth={2.5} />
          {lang === "en" ? "A-Z" : "按字母表"}
        </button>
        <button
          onClick={() => { setSortMode("random"); setRandomSeed(Date.now()); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm ${
            sortMode === "random"
              ? "bg-amber-400 text-white shadow-md hover:bg-amber-500"
              : "bg-white text-amber-600 hover:bg-amber-50 border border-amber-200"
          }`}
        >
          <Shuffle size={16} strokeWidth={2.5} className={sortMode === "random" ? "animate-pulse" : ""} />
          {lang === "en" ? "Randomize" : "随机打乱"}
        </button>
      </div>

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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleAnimals.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} lang={lang} />
              ))}
            </div>

            {displayCount < filtered.length && (
              <div className="mt-14 mb-4 flex justify-center">
                <button
                  onClick={() => setDisplayCount((prev) => prev + 24)}
                  className="group flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-8 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl shadow-sm hover:shadow-lg hover:border-amber-300 hover:text-amber-600 active:scale-[0.98] transition-all bg-gradient-to-b from-white to-slate-50"
                >
                  <span>{lang === "en" ? "Load More Animals" : "加载更多动物"}</span>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                    {filtered.length - displayCount} {lang === "en" ? "remaining" : "尚未显示"}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        {lang === "en"
          ? "Wild Explorer · Made by Emily & Family"
          : "动物探索 · Emily & Family 制作"}
      </footer>

      {/* ── Back to Top FAB ── */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[60] px-5 py-3.5 bg-slate-800 text-white rounded-2xl shadow-xl shadow-slate-800/20 active:scale-95 hover:bg-slate-700 hover:-translate-y-1 transition-all duration-300 pointer-events-auto flex items-center justify-center gap-2 group ${
          showTop ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 !pointer-events-none"
        }`}
      >
        <ArrowUp size={18} strokeWidth={2.5} className="transition-transform group-hover:-translate-y-0.5" />
        <span className="font-bold text-sm tracking-wide">{lang === "en" ? "Top" : "回到顶部"}</span>
      </button>
    </div>
  );
}
