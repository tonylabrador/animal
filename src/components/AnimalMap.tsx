"use client";

import dynamic from "next/dynamic";
import { Loader } from "lucide-react";
import type { AnimalMapInnerProps } from "./AnimalMapInner";

const AnimalMapInner = dynamic(() => import("./AnimalMapInner"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-100 rounded-2xl">
      <Loader size={24} className="animate-spin text-amber-400" />
    </div>
  ),
});

export default function AnimalMap(props: AnimalMapInnerProps) {
  return <AnimalMapInner {...props} />;
}
