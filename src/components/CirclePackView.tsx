"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import type { TaxonomyNode } from "@/lib/buildTaxonomyTree";

/* ── Colour palette by Class ─────────────────────────────────────── */

const CLASS_COLORS: Record<string, string> = {
  Mammalia:       "#f59e0b",
  Aves:           "#3b82f6",
  Reptilia:       "#10b981",
  Amphibia:       "#8b5cf6",
  Actinopterygii: "#06b6d4",
  Chondrichthyes: "#6366f1",
  Insecta:        "#ec4899",
  Gastropoda:     "#f97316",
  Cephalopoda:    "#14b8a6",
  Malacostraca:   "#e11d48",
  Hydrozoa:       "#a855f7",
};

function getNodeColor(d: d3.HierarchyCircularNode<TaxonomyNode>): string {
  // Walk up to find Class-level ancestor
  let node: d3.HierarchyCircularNode<TaxonomyNode> | null = d;
  while (node) {
    if (node.data.level === "Class") {
      const base = CLASS_COLORS[node.data.name] ?? "#94a3b8";
      const hsl = d3.hsl(base);
      // Lighten deeper nodes
      hsl.l = Math.min(0.92, 0.5 + (d.depth - node.depth) * 0.1);
      hsl.s = Math.max(0.2, 0.7 - (d.depth - node.depth) * 0.08);
      return hsl.formatHex();
    }
    node = node.parent;
  }
  // Root / Phylum levels
  const hsl = d3.hsl("#e2e8f0");
  hsl.l = Math.max(0.8, 0.95 - d.depth * 0.05);
  return hsl.formatHex();
}

function getNodeStroke(d: d3.HierarchyCircularNode<TaxonomyNode>): string {
  let node: d3.HierarchyCircularNode<TaxonomyNode> | null = d;
  while (node) {
    if (node.data.level === "Class") {
      return CLASS_COLORS[node.data.name] ?? "#94a3b8";
    }
    node = node.parent;
  }
  return "#cbd5e1";
}

/* ── Component ────────────────────────────────────────────────────── */

export default function CirclePackView({
  tree,
  lang,
}: {
  tree: TaxonomyNode;
  lang: "en" | "zh";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<string>("Animalia");
  const router = useRouter();

  const render = useCallback(() => {
    const svg = svgRef.current;
    const tooltip = tooltipRef.current;
    const container = containerRef.current;
    if (!svg || !tooltip || !container) return;

    const width = container.clientWidth;
    const height = Math.max(600, window.innerHeight - 320);

    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));

    d3.select(svg).selectAll("*").remove();

    // Hierarchy
    const root = d3
      .hierarchy<TaxonomyNode>(tree)
      .sum((d) => (d.children.length === 0 ? 1 : 0))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    // Pack layout
    const pack = d3
      .pack<TaxonomyNode>()
      .size([width, height])
      .padding(4);

    const packedRoot = pack(root);

    // Find the focus node
    let focusNode = packedRoot;
    if (focus !== "Animalia") {
      packedRoot.each((n) => {
        if (n.data.name === focus) focusNode = n;
      });
    }

    // Zoom transform
    const k = Math.min(width, height) / (focusNode.r * 2 + 40);
    const viewX = focusNode.x;
    const viewY = focusNode.y;

    function tx(x: number) { return (x - viewX) * k + width / 2; }
    function ty(y: number) { return (y - viewY) * k + height / 2; }

    const g = d3.select(svg).append("g");

    // Background click → zoom out
    g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .style("cursor", focus !== "Animalia" ? "pointer" : "default")
      .on("click", () => {
        if (focusNode.parent) {
          setFocus(focusNode.parent.data.name);
        }
      });

    const nodes = packedRoot.descendants();

    // Circles
    g.selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("cx", (d) => tx(d.x))
      .attr("cy", (d) => ty(d.y))
      .attr("r", (d) => Math.max(0, d.r * k))
      .attr("fill", (d) => {
        if (d.data.level === "Species") return getNodeColor(d);
        return d.children ? getNodeColor(d) : getNodeColor(d);
      })
      .attr("fill-opacity", (d) => {
        if (d.data.level === "Species") return 0.85;
        return d === packedRoot ? 0.1 : 0.25;
      })
      .attr("stroke", (d) => {
        if (d === packedRoot) return "#e2e8f0";
        return getNodeStroke(d);
      })
      .attr("stroke-width", (d) => {
        if (d.data.level === "Species") return 0.5;
        return d.depth <= focusNode.depth ? 0.5 : 1.5;
      })
      .attr("stroke-opacity", 0.4)
      .style("cursor", "pointer")
      .style("transition", "fill-opacity 200ms")
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("fill-opacity", d.data.level === "Species" ? 1 : 0.5);
        const name = lang === "en" ? d.data.name : d.data.nameZh;
        const level = lang === "en" ? d.data.level : d.data.levelZh;
        tooltip.style.opacity = "1";
        tooltip.innerHTML = `
          <div class="text-[10px] font-bold uppercase tracking-wider text-amber-500">${level}</div>
          <div class="font-bold text-slate-800 text-sm">${name}</div>
          <div class="text-xs text-slate-400">${lang === "en" ? d.data.nameZh : d.data.name}</div>
          ${d.data.scientificName ? `<div class="text-[11px] text-slate-400 italic">${d.data.scientificName}</div>` : ""}
          <div class="text-xs text-slate-500 mt-1">${d.data.count} ${lang === "en" ? "species" : "种"}</div>
        `;
      })
      .on("mousemove", function (event) {
        const rect = container.getBoundingClientRect();
        tooltip.style.left = `${event.clientX - rect.left + 14}px`;
        tooltip.style.top = `${event.clientY - rect.top - 14}px`;
      })
      .on("mouseleave", function (_, d) {
        d3.select(this).attr("fill-opacity", d.data.level === "Species" ? 0.85 : (d === packedRoot ? 0.1 : 0.25));
        tooltip.style.opacity = "0";
      })
      .on("click", function (event, d) {
        event.stopPropagation();
        if (d.data.level === "Species" && d.data.animalId) {
          router.push(`/animal/${d.data.animalId}`);
        } else if (d.children && d.children.length > 0) {
          setFocus(d.data.name === focus && d.parent ? d.parent.data.name : d.data.name);
        }
      });

    // Labels — show only for nodes that are big enough on screen
    const minLabelR = 18;
    g.selectAll("text.label")
      .data(nodes.filter((d) => d.r * k > minLabelR && d.data.level !== "Species"))
      .join("text")
      .attr("class", "label")
      .attr("x", (d) => tx(d.x))
      .attr("y", (d) => ty(d.y))
      .attr("dy", "-0.3em")
      .attr("text-anchor", "middle")
      .attr("pointer-events", "none")
      .attr("font-size", (d) => {
        const r = d.r * k;
        if (r > 100) return "14px";
        if (r > 60) return "11px";
        return "9px";
      })
      .attr("font-weight", "700")
      .attr("fill", (d) => {
        const s = getNodeStroke(d);
        const hsl = d3.hsl(s);
        hsl.l = Math.min(0.35, hsl.l);
        return hsl.formatHex();
      })
      .text((d) => {
        const name = lang === "en" ? d.data.name : d.data.nameZh;
        const maxLen = d.r * k > 60 ? 16 : 10;
        return name.length > maxLen ? name.slice(0, maxLen) + "…" : name;
      });

    // Count labels
    g.selectAll("text.count")
      .data(nodes.filter((d) => d.r * k > minLabelR && d.data.level !== "Species"))
      .join("text")
      .attr("class", "count")
      .attr("x", (d) => tx(d.x))
      .attr("y", (d) => ty(d.y))
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .attr("pointer-events", "none")
      .attr("font-size", "10px")
      .attr("fill", "#94a3b8")
      .text((d) => `${d.data.count} ${lang === "en" ? "spp." : "种"}`);

    // Species labels (only when zoomed in enough)
    g.selectAll("text.species")
      .data(nodes.filter((d) => d.data.level === "Species" && d.r * k > 22))
      .join("text")
      .attr("class", "species")
      .attr("x", (d) => tx(d.x))
      .attr("y", (d) => ty(d.y))
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("pointer-events", "none")
      .attr("font-size", (d) => {
        const r = d.r * k;
        if (r > 40) return "10px";
        return "8px";
      })
      .attr("font-weight", "600")
      .attr("fill", "#475569")
      .text((d) => {
        const name = lang === "en" ? d.data.name : d.data.nameZh;
        const maxLen = d.r * k > 40 ? 12 : 8;
        return name.length > maxLen ? name.slice(0, maxLen) + "…" : name;
      });

  }, [tree, lang, focus, router]);

  useEffect(() => {
    render();
    const handleResize = () => render();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [render]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Breadcrumb */}
      {focus !== "Animalia" && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <button
            onClick={() => setFocus("Animalia")}
            className="text-amber-500 hover:text-amber-600 font-medium transition-colors"
          >
            {lang === "en" ? "← Back to Root" : "← 返回根节点"}
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium">
            {lang === "en" ? "Focused on:" : "当前焦点："}{" "}
            <span className="text-slate-700 font-bold">{focus}</span>
          </span>
        </div>
      )}

      <div className="relative">
        <svg ref={svgRef} className="w-full" />
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none bg-white/95 backdrop-blur-sm shadow-xl rounded-xl px-4 py-2.5 border border-slate-100 z-50 transition-opacity duration-150"
          style={{ opacity: 0 }}
        />
      </div>

      <p className="text-center text-xs text-slate-400 mt-3">
        {lang === "en"
          ? "Click a bubble to zoom in · Click background to zoom out · Click a species to view details"
          : "点击气泡放大 · 点击背景缩小 · 点击物种查看详情"}
      </p>
    </div>
  );
}
