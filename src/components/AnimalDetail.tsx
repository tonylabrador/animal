"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Globe,
  MapPin,
  Tag,
  BookOpen,
  Compass,
  Microscope,
  Leaf,
  Map,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import AnimalMap from "./AnimalMap";
import type { Animal } from "@/types/animal";

type Language = "en" | "zh";
type TopView = "info" | "map";
type InfoTab = "anatomy" | "ecology" | "habitat";

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

const IUCN_COLORS: Record<string, string> = {
  LC: "bg-green-100 text-green-700 border-green-200",
  NT: "bg-lime-100 text-lime-700 border-lime-200",
  VU: "bg-amber-100 text-amber-700 border-amber-200",
  EN: "bg-orange-100 text-orange-700 border-orange-200",
  CR: "bg-red-100 text-red-700 border-red-200",
};

const INFO_TABS: {
  key: InfoTab;
  labelEn: string;
  labelZh: string;
  icon: typeof BookOpen;
}[] = [
  { key: "anatomy",  labelEn: "Anatomy",            labelZh: "形态特征",   icon: Microscope },
  { key: "ecology",  labelEn: "Ecology & Behavior",  labelZh: "生态与行为", icon: Leaf },
  { key: "habitat",  labelEn: "Habitat & Range",     labelZh: "栖息地与分布", icon: Compass },
];

function TaxonomyBreadcrumbs({
  taxonomy,
  lang,
}: {
  taxonomy: Animal["taxonomy"];
  lang: Language;
}) {
  const levels = [
    { label: lang === "en" ? "Kingdom" : "界", value: taxonomy.kingdom },
    { label: lang === "en" ? "Phylum"  : "门", value: taxonomy.phylum  },
    { label: lang === "en" ? "Class"   : "纲", value: taxonomy.class   },
    { label: lang === "en" ? "Order"   : "目", value: taxonomy.order   },
    { label: lang === "en" ? "Family"  : "科", value: taxonomy.family  },
    { label: lang === "en" ? "Genus"   : "属", value: taxonomy.genus   },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
      {levels.map((lvl, i) => (
        <span key={lvl.label} className="flex items-center gap-1">
          <span className="font-medium text-slate-400">{lvl.label}</span>
          <span className="text-slate-600" lang={lang}>{lvl.value[lang]}</span>
          <span className="text-slate-400 ml-0.5" lang={lang === "en" ? "zh" : "en"}>
            ({lang === "en" ? lvl.value.zh : lvl.value.en})
          </span>
          {i < levels.length - 1 && (
            <ChevronRight size={10} className="text-slate-300 mx-0.5" />
          )}
        </span>
      ))}
    </div>
  );
}

function EncyclopediaPanel({
  titleEn,
  titleZh,
  content,
}: {
  titleEn: string;
  titleZh: string;
  content: { en: string; zh: string };
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100" lang="en">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2">
          {titleEn}
        </h3>
        <p className="text-slate-700 leading-relaxed text-[15px]">{content.en}</p>
      </div>
      <div className="bg-stone-50 rounded-2xl p-5 shadow-sm border border-stone-100" lang="zh">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
          {titleZh}
        </h3>
        <p className="text-slate-600 leading-relaxed text-[15px]">{content.zh}</p>
      </div>
    </div>
  );
}

export default function AnimalDetail({ animal }: { animal: Animal }) {
  const { lang, toggleLang }    = useLanguage();
  const router                  = useRouter();
  const [imgError, setImgError] = useState(false);
  const [view, setView]         = useState<TopView>("info");
  const [infoTab, setInfoTab]   = useState<InfoTab>("anatomy");

  const primaryName   = lang === "en" ? animal.name_en : animal.name_zh;
  const secondaryName = lang === "en" ? animal.name_zh : animal.name_en;
  const iucn          = animal.conservation_status;

  /* ── Shared Header ────────────────────────────────────────────────── */
  const header = (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3 max-w-7xl mx-auto">

        {/* Left: back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm shrink-0"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">
            {lang === "en" ? "Back" : "返回"}
          </span>
        </button>

        {/* Centre: app name */}
        <div className="hidden sm:flex items-center gap-1.5 font-bold text-slate-700 text-sm">
          <span className="select-none">🦁</span>Wild Explorer
        </div>

        {/* Right: lang */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all bg-amber-400 hover:bg-amber-500 text-white shadow-sm active:scale-95"
          >
            <Globe size={13} strokeWidth={2.5} />
            {lang === "en" ? "中文" : "EN"}
          </button>
        </div>
      </div>
    </header>
  );

  /* ── Single unified return ────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50">
      {header}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">

        {/* ── Hero: image (left) + view switcher (right) — always visible ── */}
        <section className="mt-6 sm:mt-8 flex gap-4 items-stretch">

          {/* Image */}
          <div className="relative flex-1 min-w-0 aspect-video max-h-[380px] rounded-3xl overflow-hidden shadow-xl bg-slate-900">
            {animal.image && !imgError ? (
              <>
                {/* Layer 1: Blurred Background Ambient Fill */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={animal.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 scale-110 pointer-events-none"
                />
                
                {/* Layer 2: Main Image (Ensures 100% visibility) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={animal.image}
                  alt={animal.name_en}
                  className="relative z-10 w-full h-full object-contain"
                  onError={() => setImgError(true)}
                />
              </>
            ) : (
              <div className="relative z-10 w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <span className="text-6xl opacity-30">🐾</span>
              </div>
            )}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 z-30 p-5 sm:p-7">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-lg leading-tight" lang={lang}>
                {primaryName}
              </h1>
              <p className="text-white/80 text-base sm:text-lg font-medium mt-0.5 drop-shadow" lang={lang === "en" ? "zh" : "en"}>
                {secondaryName}
              </p>
              <p className="text-white/55 text-xs italic mt-0.5">
                {animal.scientific_name}
              </p>
            </div>
          </div>

          {/* View switcher — right column, always visible */}
          <div className="flex flex-col gap-3 justify-center shrink-0 w-28 sm:w-36">
            <button
              onClick={() => setView("info")}
              className={`flex flex-col items-center justify-center gap-2.5 rounded-2xl py-5 px-3 font-semibold text-sm transition-all duration-200 shadow-md active:scale-95 ${
                view === "info"
                  ? "bg-white text-slate-800 ring-2 ring-amber-300 shadow-lg"
                  : "bg-white/70 text-slate-500 hover:bg-white hover:text-slate-700"
              }`}
            >
              <BookOpen size={26} strokeWidth={1.8} />
              <span className="leading-tight text-center">
                {lang === "en" ? "Info" : "简介"}
              </span>
            </button>

            <button
              onClick={() => setView("map")}
              className={`flex flex-col items-center justify-center gap-2.5 rounded-2xl py-5 px-3 font-semibold text-sm transition-all duration-200 shadow-md active:scale-95 ${
                view === "map"
                  ? "bg-amber-400 text-white ring-2 ring-amber-500 shadow-lg"
                  : "bg-white/70 text-slate-500 hover:bg-white hover:text-slate-700"
              }`}
            >
              <Map size={26} strokeWidth={1.8} />
              <span className="leading-tight text-center">
                {lang === "en" ? "Live Map" : "互动地图"}
              </span>
            </button>
          </div>

        </section>

        {/* ── MAP panel — shown below hero when view === "map" ────────── */}
        {view === "map" && (
          <section className="mt-5">
            <div className="flex items-center gap-1.5 mb-3 text-sm text-slate-500">
              <MapPin size={13} strokeWidth={2.5} className="text-amber-500" />
              <span>{animal.habitat.text_en} / {animal.habitat.text_zh}</span>
            </div>
            <div
              className="w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200"
              style={{ height: "calc(100vh - 420px)", minHeight: "380px" }}
            >
              <AnimalMap
                center={animal.habitat.map_coordinates}
                habitatEn={animal.habitat.text_en}
                habitatZh={animal.habitat.text_zh}
                animalNameEn={animal.name_en}
                animalNameZh={animal.name_zh}
                polygons={animal.habitat.global_distribution_polygons}
                lang={lang}
              />
            </div>
          </section>
        )}

        {/* ── INFO panels — shown below hero when view === "info" ──────── */}
        {view === "info" && (
          <>
            {/* Tags + IUCN */}
            <section className="mt-5 flex flex-wrap items-center gap-2">
              {animal.ui_tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full ${TAG_COLORS[tag] ?? "bg-slate-100 text-slate-600"}`}
                >
                  <Tag size={10} strokeWidth={2.5} />
                  {tag}
                </span>
              ))}
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border ${IUCN_COLORS[iucn.code] ?? "bg-slate-100 text-slate-600"}`}
              >
                <ShieldCheck size={11} strokeWidth={2.5} />
                {iucn.code} &middot; {lang === "en" ? iucn.en : iucn.zh}
              </span>
            </section>

            {/* Taxonomy breadcrumbs */}
            <section className="mt-4 bg-white/60 rounded-xl px-4 py-3 border border-slate-100">
              <TaxonomyBreadcrumbs taxonomy={animal.taxonomy} lang={lang} />
            </section>

            {/* Short description */}
            <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100" lang="en">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={14} className="text-amber-500" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Overview (EN)
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[15px]">
                  {animal.description.en}
                </p>
              </div>
              <div className="bg-stone-50 rounded-2xl p-5 shadow-sm border border-stone-100" lang="zh">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={14} className="text-amber-400" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    简介 (中文)
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[15px]">
                  {animal.description.zh}
                </p>
              </div>
            </section>

            {/* Encyclopedia tabs */}
            <section className="mt-8">
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {INFO_TABS.map((tab) => {
                  const Icon     = tab.icon;
                  const isActive = infoTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setInfoTab(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? "bg-amber-400 text-white shadow-md"
                          : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
                      }`}
                    >
                      <Icon size={14} strokeWidth={2.5} />
                      {lang === "en" ? tab.labelEn : tab.labelZh}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                {infoTab === "anatomy" && (
                  <EncyclopediaPanel
                    titleEn="Anatomy & Physical Features"
                    titleZh="形态特征"
                    content={animal.encyclopedia.anatomy}
                  />
                )}
                {infoTab === "ecology" && (
                  <EncyclopediaPanel
                    titleEn="Ecology & Behavior"
                    titleZh="生态与行为"
                    content={animal.encyclopedia.ecology_and_behavior}
                  />
                )}
                {infoTab === "habitat" && (
                  <EncyclopediaPanel
                    titleEn="Habitat & Distribution"
                    titleZh="栖息地与分布"
                    content={animal.encyclopedia.habitat_and_distribution}
                  />
                )}
              </div>
            </section>
          </>
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
