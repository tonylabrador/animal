"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Crown,
  Layers,
  ArrowLeft,
  Search,
  X,
} from "lucide-react";
import type { TaxonomyNode } from "@/lib/buildTaxonomyTree";

/* ── Colour palette per level ─────────────────────────────────────── */

const LEVEL_STYLES: Record<string, { bg: string; ring: string; icon: string; badge: string }> = {
  Kingdom: { bg: "bg-amber-50",  ring: "ring-amber-200",  icon: "text-amber-500",  badge: "bg-amber-100 text-amber-700" },
  Phylum:  { bg: "bg-violet-50", ring: "ring-violet-200", icon: "text-violet-500", badge: "bg-violet-100 text-violet-700" },
  Class:   { bg: "bg-sky-50",    ring: "ring-sky-200",    icon: "text-sky-500",    badge: "bg-sky-100 text-sky-700" },
  Order:   { bg: "bg-emerald-50",ring: "ring-emerald-200",icon: "text-emerald-500",badge: "bg-emerald-100 text-emerald-700" },
  Family:  { bg: "bg-rose-50",   ring: "ring-rose-200",   icon: "text-rose-500",   badge: "bg-rose-100 text-rose-700" },
  Genus:   { bg: "bg-orange-50", ring: "ring-orange-200", icon: "text-orange-500", badge: "bg-orange-100 text-orange-700" },
  Species: { bg: "bg-slate-50",  ring: "ring-slate-200",  icon: "text-slate-500",  badge: "bg-slate-100 text-slate-600" },
};

function styleFor(level: string) {
  return LEVEL_STYLES[level] ?? LEVEL_STYLES.Species;
}

/* ── Breadcrumb ───────────────────────────────────────────────────── */

function Breadcrumbs({
  path,
  onJump,
  lang,
}: {
  path: TaxonomyNode[];
  onJump: (index: number) => void;
  lang: "en" | "zh";
}) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm mb-6">
      {path.map((node, i) => {
        const isLast = i === path.length - 1;
        const s = styleFor(node.level);
        return (
          <span key={i} className="flex items-center gap-1">
            <button
              onClick={() => onJump(i)}
              disabled={isLast}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all duration-200 ${
                isLast
                  ? `${s.badge} cursor-default`
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mr-1">
                {lang === "en" ? node.level : node.levelZh}
              </span>
              {lang === "en" ? node.name : node.nameZh}
            </button>
            {!isLast && (
              <ChevronRight size={12} className="text-slate-300 mx-0.5" />
            )}
          </span>
        );
      })}
    </nav>
  );
}

/* ── Species card (leaf node) ─────────────────────────────────────── */

function SpeciesCard({
  node,
  lang,
}: {
  node: TaxonomyNode;
  lang: "en" | "zh";
}) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <Link
      href={`/animal/${node.animalId}`}
      className="group bg-white rounded-2xl shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative w-full h-40 overflow-hidden bg-slate-100">
        {node.image && !imgErr ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={node.image}
            alt={node.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-3xl opacity-30">🐾</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-base leading-tight">
          {lang === "en" ? node.name : node.nameZh}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {lang === "en" ? node.nameZh : node.name}
        </p>
        <p className="text-[11px] text-slate-400 italic mt-0.5">
          {node.scientificName}
        </p>
      </div>
    </Link>
  );
}

/* ── Group card (non-leaf node) ───────────────────────────────────── */

function GroupCard({
  node,
  onClick,
  lang,
}: {
  node: TaxonomyNode;
  onClick: () => void;
  lang: "en" | "zh";
}) {
  const s = styleFor(node.level);
  // Gather up to 4 species images for preview
  const previews: string[] = [];
  function collectImages(n: TaxonomyNode) {
    if (previews.length >= 4) return;
    if (n.image) {
      previews.push(n.image);
    }
    for (const c of n.children) collectImages(c);
  }
  collectImages(node);

  return (
    <button
      onClick={onClick}
      className={`group text-left bg-white rounded-2xl shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ring-1 ${s.ring}`}
    >
      {/* Image mosaic preview */}
      <div className="relative w-full h-20 overflow-hidden bg-slate-50">
        {previews.length > 0 ? (
          <div className={`w-full h-full grid ${
            previews.length === 1 ? "grid-cols-1" :
            previews.length === 2 ? "grid-cols-2" :
            previews.length === 3 ? "grid-cols-3" : "grid-cols-2 grid-rows-2"
          } gap-px`}>
            {previews.map((src, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={i}
                src={src}
                alt=""
                className="w-full h-full object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers size={32} className={`${s.icon} opacity-30`} />
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 right-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.badge}`}>
            {node.count} {node.count === 1 ? "species" : "species"}
          </span>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col gap-0.5">
        <span className={`text-[9px] font-bold uppercase tracking-wider ${s.icon}`}>
          {lang === "en" ? node.level : node.levelZh}
        </span>
        <h3 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-amber-600 transition-colors">
          {lang === "en" ? node.name : node.nameZh}
        </h3>
        <p className="text-[11px] text-slate-400">
          {lang === "en" ? node.nameZh : node.name}
        </p>
      </div>

      <div className="px-3 pb-2">
        <span className="flex items-center gap-1 text-[11px] text-amber-500 font-medium group-hover:translate-x-1 transition-transform">
          {lang === "en" ? "Explore" : "探索"} <ChevronRight size={12} />
        </span>
      </div>
    </button>
  );
}

/* ── Main DrillDown component ─────────────────────────────────────── */

export default function DrillDownView({
  tree,
  lang,
}: {
  tree: TaxonomyNode;
  lang: "en" | "zh";
}) {
  // Restore path from sessionStorage or auto-drill into biggest phylum
  function getInitialPath(root: TaxonomyNode): TaxonomyNode[] {
    // Try to restore from sessionStorage
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("taxonomy-drill-path");
        if (saved) {
          const keys: { name: string; level: string }[] = JSON.parse(saved);
          if (keys.length > 0) {
            const restored: TaxonomyNode[] = [];
            let cursor = root;
            // First entry should be root
            restored.push(cursor);
            for (let i = 1; i < keys.length; i++) {
              const match = cursor.children.find(
                (c) => c.name === keys[i].name && c.level === keys[i].level
              );
              if (!match) break;
              restored.push(match);
              cursor = match;
            }
            if (restored.length > 1) return restored;
          }
        }
      } catch {}
    }
    // Default: drill into biggest phylum
    if (root.children.length > 0 && root.children[0].level === "Phylum") {
      const biggest = root.children.reduce((a, b) => a.count >= b.count ? a : b);
      return [root, biggest];
    }
    return [root];
  }

  const [pathStack, setPathStack] = useState<TaxonomyNode[]>(() => getInitialPath(tree));
  const [search, setSearch] = useState("");
  const current = pathStack[pathStack.length - 1];

  // Save path to sessionStorage whenever it changes
  function savePath(stack: TaxonomyNode[]) {
    try {
      const keys = stack.map((n) => ({ name: n.name, level: n.level }));
      sessionStorage.setItem("taxonomy-drill-path", JSON.stringify(keys));
    } catch {}
  }

  const drillInto = (child: TaxonomyNode) => {
    setPathStack((prev) => {
      const next = [...prev, child];
      savePath(next);
      return next;
    });
    setSearch("");
  };

  const jumpTo = (index: number) => {
    setPathStack((prev) => {
      const next = prev.slice(0, index + 1);
      savePath(next);
      return next;
    });
    setSearch("");
  };

  // Filter children by search query
  const q = search.toLowerCase().trim();
  const displayed = q
    ? current.children.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.nameZh.includes(q) ||
          (c.scientificName && c.scientificName.toLowerCase().includes(q))
      )
    : current.children;

  const isSpeciesLevel = current.children.length > 0 && current.children[0].level === "Species";

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumbs path={pathStack} onJump={jumpTo} lang={lang} />

      {/* Back + Title row */}
      <div className="flex items-center gap-3 mb-4">
        {pathStack.length > 1 && (
          <button
            onClick={() => jumpTo(pathStack.length - 2)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium shrink-0"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            {lang === "en" ? "Back" : "返回"}
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Crown size={18} className={styleFor(current.level).icon} />
            <h2 className="text-2xl font-extrabold text-slate-800 truncate">
              {lang === "en" ? current.name : current.nameZh}
            </h2>
            <span className="text-sm text-slate-400 shrink-0">
              ({current.count} {lang === "en" ? "species" : "种"})
            </span>
          </div>
        </div>
      </div>

      {/* Search within current level */}
      {current.children.length > 6 && (
        <div className="relative max-w-xs mb-5">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder={lang === "en" ? "Filter…" : "筛选…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-sm bg-slate-100 rounded-xl border border-transparent focus:border-amber-300 focus:bg-white focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-slate-400 gap-2">
          <span className="text-4xl">🔍</span>
          <p className="text-sm">{lang === "en" ? "No matches" : "无结果"}</p>
        </div>
      ) : isSpeciesLevel ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayed.map((child) => (
            <SpeciesCard key={child.animalId} node={child} lang={lang} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {displayed.map((child) => (
            <GroupCard
              key={child.name}
              node={child}
              onClick={() => drillInto(child)}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  );
}
