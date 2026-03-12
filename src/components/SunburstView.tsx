"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import type { TaxonomyNode } from "@/lib/buildTaxonomyTree";

/* ── Colour scale ─────────────────────────────────────────────────── */

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

function getArcColor(d: d3.HierarchyRectangularNode<TaxonomyNode>): string {
  // Walk up until we find the Class level
  let node: d3.HierarchyRectangularNode<TaxonomyNode> | null = d;
  while (node) {
    if (node.data.level === "Class") {
      const base = CLASS_COLORS[node.data.name] ?? "#94a3b8";
      // Vary brightness by depth
      const hsl = d3.hsl(base);
      hsl.l = Math.min(0.85, hsl.l + (d.depth - node.depth) * 0.08);
      hsl.s = Math.max(0.25, hsl.s - (d.depth - node.depth) * 0.05);
      return hsl.formatHex();
    }
    node = node.parent;
  }
  // Kingdom / Phylum level
  const hsl = d3.hsl("#f59e0b");
  hsl.l = 0.92 - d.depth * 0.06;
  return hsl.formatHex();
}

/* ── Main component ───────────────────────────────────────────────── */

export default function SunburstView({
  tree,
  lang,
}: {
  tree: TaxonomyNode;
  lang: "en" | "zh";
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [currentRoot, setCurrentRoot] = useState<string>("Animalia");
  const router = useRouter();

  const render = useCallback(() => {
    const svg = svgRef.current;
    const tooltip = tooltipRef.current;
    if (!svg || !tooltip) return;

    const container = svg.parentElement;
    if (!container) return;
    const width = container.clientWidth;
    const height = Math.min(width, 650);
    const radius = Math.min(width, height) / 2;

    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));

    // Clear
    d3.select(svg).selectAll("*").remove();

    const g = d3
      .select(svg)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Build hierarchy
    const hierarchy = d3
      .hierarchy<TaxonomyNode>(tree)
      .sum((d) => (d.children.length === 0 ? 1 : 0))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    // Find current root node
    let baseNode = hierarchy;
    if (currentRoot !== "Animalia") {
      hierarchy.each((n) => {
        if (n.data.name === currentRoot) baseNode = n;
      });
    }

    const partition = d3.partition<TaxonomyNode>().size([2 * Math.PI, radius]);
    const rootPartitioned = partition(baseNode);

    type PartNode = d3.HierarchyRectangularNode<TaxonomyNode>;

    const arc = d3
      .arc<PartNode>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .innerRadius((d) => Math.max(0, d.y0 * 0.7))
      .outerRadius((d) => Math.max(0, d.y1 * 0.7 - 1.5))
      .padAngle(0.003)
      .padRadius(radius / 2);

    const descendants = rootPartitioned.descendants().filter((d) => d.depth > 0) as PartNode[];

    // Arcs
    g.selectAll("path")
      .data(descendants)
      .join("path")
      .attr("d", arc as any)
      .attr("fill", (d) => getArcColor(d))
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer")
      .style("transition", "opacity 150ms")
      .on("mouseenter", function (event, d) {
        d3.select(this).style("opacity", 0.8);
        const name = lang === "en" ? d.data.name : d.data.nameZh;
        const level = lang === "en" ? d.data.level : d.data.levelZh;
        tooltip.style.opacity = "1";
        tooltip.innerHTML = `
          <div class="text-[10px] font-bold uppercase tracking-wider text-amber-500">${level}</div>
          <div class="font-bold text-slate-800">${name}</div>
          <div class="text-xs text-slate-400">${lang === "en" ? d.data.nameZh : d.data.name}</div>
          <div class="text-xs text-slate-500 mt-1">${d.data.count} ${lang === "en" ? "species" : "种"}</div>
        `;
      })
      .on("mousemove", function (event) {
        const rect = svg.getBoundingClientRect();
        tooltip.style.left = `${event.clientX - rect.left + 12}px`;
        tooltip.style.top = `${event.clientY - rect.top - 10}px`;
      })
      .on("mouseleave", function () {
        d3.select(this).style("opacity", 1);
        tooltip.style.opacity = "0";
      })
      .on("click", function (_event, d) {
        if (d.data.level === "Species" && d.data.animalId) {
          router.push(`/animal/${d.data.animalId}`);
        } else if (d.children && d.children.length > 0) {
          setCurrentRoot(d.data.name);
        }
      });

    // Labels for wider arcs
    g.selectAll("text")
      .data(
        descendants.filter(
          (d) =>
            d.x1 - d.x0 > 0.04 &&
            d.depth <= (currentRoot === "Animalia" ? 4 : 3)
        )
      )
      .join("text")
      .attr("transform", (d) => {
        const x = ((d.x0 + d.x1) / 2) * (180 / Math.PI);
        const y = ((d.y0 + d.y1) / 2) * 0.7;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => {
        const angle = d.x1 - d.x0;
        if (angle > 0.3) return "10px";
        if (angle > 0.12) return "8px";
        return "7px";
      })
      .attr("fill", "#374151")
      .attr("pointer-events", "none")
      .text((d) => {
        const name = lang === "en" ? d.data.name : d.data.nameZh;
        const maxLen = d.x1 - d.x0 > 0.15 ? 14 : 8;
        return name.length > maxLen ? name.slice(0, maxLen) + "…" : name;
      });

    // Centre label
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.3em")
      .attr("font-size", "15px")
      .attr("font-weight", "800")
      .attr("fill", "#1e293b")
      .text(lang === "en" ? rootPartitioned.data.name : rootPartitioned.data.nameZh);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .attr("font-size", "11px")
      .attr("fill", "#94a3b8")
      .text(`${rootPartitioned.data.count} ${lang === "en" ? "species" : "种"}`);

    if (currentRoot !== "Animalia") {
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "2.8em")
        .attr("font-size", "10px")
        .attr("fill", "#f59e0b")
        .style("cursor", "pointer")
        .text(lang === "en" ? "⬆ Zoom Out" : "⬆ 缩小")
        .on("click", () => {
          // Go up one level
          let parent = hierarchy;
          hierarchy.each((n) => {
            if (n.data.name === currentRoot && n.parent) {
              parent = n.parent;
            }
          });
          setCurrentRoot(parent.data.name);
        });
    }
  }, [tree, lang, currentRoot, router]);

  useEffect(() => {
    render();
    const handleResize = () => render();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [render]);

  return (
    <div className="relative w-full">
      {/* Breadcrumb for sunburst */}
      {currentRoot !== "Animalia" && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <button
            onClick={() => setCurrentRoot("Animalia")}
            className="text-amber-500 hover:text-amber-600 font-medium transition-colors"
          >
            {lang === "en" ? "← Back to Root" : "← 返回根节点"}
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium">
            {lang === "en" ? "Viewing:" : "当前层级："}{" "}
            <span className="text-slate-700 font-bold">{currentRoot}</span>
          </span>
        </div>
      )}

      <div className="relative flex justify-center">
        <svg ref={svgRef} className="w-full" />
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none bg-white/95 backdrop-blur-sm shadow-xl rounded-xl px-4 py-2.5 border border-slate-100 z-50 transition-opacity duration-150"
          style={{ opacity: 0 }}
        />
      </div>

      <p className="text-center text-xs text-slate-400 mt-3">
        {lang === "en"
          ? "Click a segment to zoom in · Click a species to view details"
          : "点击扇区可放大 · 点击物种可查看详情"}
      </p>
    </div>
  );
}
