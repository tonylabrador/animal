"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import type { TaxonomyNode } from "@/lib/buildTaxonomyTree";

/* ── Level colours ────────────────────────────────────────────────── */

const LEVEL_COLOR: Record<string, string> = {
  Kingdom: "#f59e0b",
  Phylum:  "#8b5cf6",
  Class:   "#3b82f6",
  Order:   "#10b981",
  Family:  "#f43f5e",
  Genus:   "#f97316",
  Species: "#64748b",
};

function colorFor(level: string) {
  return LEVEL_COLOR[level] ?? "#94a3b8";
}

/* ── Prune tree to N levels ───────────────────────────────────────── */

function pruneTree(node: TaxonomyNode, maxDepth: number, currentDepth = 0): TaxonomyNode {
  if (currentDepth >= maxDepth) {
    return { ...node, children: [] };
  }
  return {
    ...node,
    children: node.children.map((c) => pruneTree(c, maxDepth, currentDepth + 1)),
  };
}

/* ── Component ────────────────────────────────────────────────────── */

export default function TreeView({
  tree,
  lang,
}: {
  tree: TaxonomyNode;
  lang: "en" | "zh";
}) {
  // Restore from sessionStorage if available
  function findNodeInTree(
    node: TaxonomyNode,
    name: string,
    level: string
  ): TaxonomyNode | null {
    if (node.name === name && node.level === level) return node;
    for (const child of node.children) {
      const found = findNodeInTree(child, name, level);
      if (found) return found;
    }
    return null;
  }

  function getInitialState(): { root: TaxonomyNode; crumbs: TaxonomyNode[] } {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("taxonomy-tree-state");
        if (saved) {
          const { rootKey, crumbKeys } = JSON.parse(saved) as {
            rootKey: { name: string; level: string };
            crumbKeys: { name: string; level: string }[];
          };
          const restoredRoot = findNodeInTree(tree, rootKey.name, rootKey.level);
          if (restoredRoot) {
            const restoredCrumbs = crumbKeys
              .map((k) => findNodeInTree(tree, k.name, k.level))
              .filter(Boolean) as TaxonomyNode[];
            if (restoredCrumbs.length > 0) {
              return { root: restoredRoot, crumbs: restoredCrumbs };
            }
          }
        }
      } catch {}
    }
    return { root: tree, crumbs: [tree] };
  }

  const initial = getInitialState();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [rootNode, setRootNode] = useState<TaxonomyNode>(initial.root);
  const [breadcrumbs, setBreadcrumbs] = useState<TaxonomyNode[]>(initial.crumbs);
  const router = useRouter();

  function saveTreeState(root: TaxonomyNode, crumbs: TaxonomyNode[]) {
    try {
      sessionStorage.setItem(
        "taxonomy-tree-state",
        JSON.stringify({
          rootKey: { name: root.name, level: root.level },
          crumbKeys: crumbs.map((n) => ({ name: n.name, level: n.level })),
        })
      );
    } catch {}
  }

  const navigateTo = useCallback(
    (node: TaxonomyNode) => {
      if (node.level === "Species" && node.animalId) {
        // Save state before leaving
        saveTreeState(rootNode, breadcrumbs);
        router.push(`/animal/${node.animalId}`);
        return;
      }
      if (node.children.length === 0) return;

      setRootNode(node);
      setBreadcrumbs((prev) => {
        const idx = prev.findIndex((n) => n.name === node.name && n.level === node.level);
        const next = idx >= 0 ? prev.slice(0, idx + 1) : [...prev, node];
        saveTreeState(node, next);
        return next;
      });
    },
    [router, rootNode, breadcrumbs]
  );

  const render = useCallback(() => {
    const svg = svgRef.current;
    const tooltip = tooltipRef.current;
    const container = containerRef.current;
    if (!svg || !tooltip || !container) return;

    // Determine visible levels: default 2, try 3 only if manageable
    let visibleLevels = 2;
    const totalAtLevel3 = rootNode.children.reduce(
      (sum, c) => sum + c.children.length,
      0
    );
    // Show 3 levels only when the leaf count is reasonable (< 30)
    if (totalAtLevel3 > 0 && totalAtLevel3 <= 30) visibleLevels = 3;

    const pruned = pruneTree(rootNode, visibleLevels);

    // Build D3 hierarchy
    const hierarchy = d3
      .hierarchy<TaxonomyNode>(pruned)
      .sort((a, b) => (b.data.count - a.data.count));

    // Count all visible nodes to determine height
    const nodeCount = hierarchy.descendants().length;

    const marginTop = 20;
    const marginRight = 200;
    const marginBottom = 20;
    const marginLeft = 120;
    const rowHeight = Math.max(26, Math.min(38, 900 / nodeCount));
    const computedHeight = nodeCount * rowHeight + marginTop + marginBottom;
    const width = container.clientWidth;

    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(Math.max(400, computedHeight)));

    // Tree layout — horizontal (left-to-right)
    const treeLayout = d3
      .tree<TaxonomyNode>()
      .size([computedHeight - marginTop - marginBottom, width - marginLeft - marginRight])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.3));

    const root = treeLayout(hierarchy);

    // Clear
    d3.select(svg).selectAll("*").remove();

    const g = d3
      .select(svg)
      .append("g")
      .attr("transform", `translate(${marginLeft},${marginTop})`);

    // Links (horizontal curves)
    g.selectAll("path.link")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal<d3.HierarchyLink<TaxonomyNode>, d3.HierarchyPointNode<TaxonomyNode>>()
        .x((d) => d.y)
        .y((d) => d.x) as any
      )
      .attr("fill", "none")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.8);

    // Node groups
    const nodes = g
      .selectAll("g.node")
      .data(root.descendants())
      .join("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .style("cursor", "pointer")
      .on("click", function (_, d) {
        // Find the original (unpruned) node in the full tree
        const orig = findNodeInTree(tree, d.data.name, d.data.level);
        if (orig) navigateTo(orig);
      })
      .on("mouseenter", function (event, d) {
        const name = lang === "en" ? d.data.name : d.data.nameZh;
        const level = lang === "en" ? d.data.level : d.data.levelZh;
        tooltip.style.opacity = "1";
        tooltip.innerHTML = `
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${colorFor(d.data.level)}">${level}</div>
          <div style="font-weight:700;color:#1e293b;font-size:13px">${name}</div>
          <div style="font-size:11px;color:#94a3b8">${lang === "en" ? d.data.nameZh : d.data.name}</div>
          ${d.data.scientificName ? `<div style="font-size:11px;color:#94a3b8;font-style:italic">${d.data.scientificName}</div>` : ""}
          <div style="font-size:11px;color:#64748b;margin-top:4px">${d.data.count} ${lang === "en" ? "species" : "种"}</div>
          ${d.data.children.length === 0 && d.data.level !== "Species" ? `<div style="font-size:10px;color:${colorFor(d.data.level)};margin-top:2px">${lang === "en" ? "Click to expand ▸" : "点击展开 ▸"}</div>` : ""}
          ${d.data.level === "Species" ? `<div style="font-size:10px;color:#f59e0b;margin-top:2px">${lang === "en" ? "Click to view details →" : "点击查看详情 →"}</div>` : ""}
        `;
        const rect = container.getBoundingClientRect();
        tooltip.style.left = `${event.clientX - rect.left + 14}px`;
        tooltip.style.top = `${event.clientY - rect.top - 14}px`;
      })
      .on("mousemove", function (event) {
        const rect = container.getBoundingClientRect();
        tooltip.style.left = `${event.clientX - rect.left + 14}px`;
        tooltip.style.top = `${event.clientY - rect.top - 14}px`;
      })
      .on("mouseleave", function () {
        tooltip.style.opacity = "0";
      });

    // Node circles
    nodes
      .append("circle")
      .attr("r", (d) => {
        if (d.data.level === "Species") return 4;
        const r = Math.max(5, Math.min(14, Math.sqrt(d.data.count) * 1.8));
        return r;
      })
      .attr("fill", (d) => {
        const c = d3.hsl(colorFor(d.data.level));
        c.l = 0.92;
        return c.formatHex();
      })
      .attr("stroke", (d) => colorFor(d.data.level))
      .attr("stroke-width", 2);

    // "Has more children" indicator (small + icon for pruned nodes)
    nodes
      .filter((d) => {
        const orig = findNodeInTree(tree, d.data.name, d.data.level);
        return !!(orig && orig.children.length > 0 && d.data.children.length === 0 && d.data.level !== "Species");
      })
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", "10px")
      .attr("font-weight", "700")
      .attr("fill", (d) => colorFor(d.data.level))
      .attr("pointer-events", "none")
      .text("+");

    // Node labels
    nodes
      .append("text")
      .attr("x", (d) => {
        return d.children ? -10 : 10;
      })
      .attr("y", (d) => d.children ? -12 : 0)
      .attr("text-anchor", (d) => (d.children ? "end" : "start"))
      .attr("dominant-baseline", (d) => (d.children ? "auto" : "central"))
      .attr("font-size", (d) => {
        // Dynamic: root=18px, each level decreases
        const sizes = [18, 15, 13, 11, 10, 9];
        return `${sizes[Math.min(d.depth, sizes.length - 1)]}px`;
      })
      .attr("font-weight", (d) => (d.depth <= 1 ? "700" : "600"))
      .attr("fill", (d) => {
        const c = d3.hsl(colorFor(d.data.level));
        c.l = 0.3;
        return c.formatHex();
      })
      .attr("pointer-events", "none")
      .text((d) => {
        const name = lang === "en" ? d.data.name : d.data.nameZh;
        const count = d.data.level !== "Species" ? ` (${d.data.count})` : "";
        const maxLen = d.depth === 0 ? 30 : 22;
        const display = name.length > maxLen ? name.slice(0, maxLen) + "…" : name;
        return display + count;
      });

    // Level badge on root
    if (root.data.level !== "Kingdom") {
      nodes
        .filter((d) => d.depth === 0)
        .append("text")
        .attr("x", -10)
        .attr("y", -28)
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("font-weight", "700")
        .attr("text-transform", "uppercase")
        .attr("fill", colorFor(root.data.level))
        .attr("letter-spacing", "0.05em")
        .text(lang === "en" ? root.data.level.toUpperCase() : root.data.levelZh);
    }

  }, [tree, rootNode, lang, navigateTo]);

  useEffect(() => {
    render();
    const onResize = () => render();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [render]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Breadcrumbs */}
      <nav className="flex flex-wrap items-center gap-1 text-sm mb-5">
        {breadcrumbs.map((node, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <span key={`${node.level}-${node.name}`} className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (!isLast) {
                    setRootNode(node);
                    setBreadcrumbs((prev) => prev.slice(0, i + 1));
                  }
                }}
                disabled={isLast}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all duration-200 ${
                  isLast
                    ? "bg-slate-100 text-slate-700 cursor-default"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <span
                  className="text-[9px] font-bold uppercase tracking-wider mr-1"
                  style={{ color: colorFor(node.level) }}
                >
                  {lang === "en" ? node.level : node.levelZh}
                </span>
                {lang === "en" ? node.name : node.nameZh}
              </button>
              {!isLast && (
                <span className="text-slate-300 text-xs mx-0.5">›</span>
              )}
            </span>
          );
        })}
      </nav>

      {/* SVG tree */}
      <div className="overflow-x-auto rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
        <svg ref={svgRef} className="w-full" />
      </div>

      <div
        ref={tooltipRef}
        className="fixed pointer-events-none bg-white/95 backdrop-blur-sm shadow-xl rounded-xl px-4 py-2.5 border border-slate-100 z-50 transition-opacity duration-150"
        style={{ opacity: 0 }}
      />

      <p className="text-center text-xs text-slate-400 mt-3">
        {lang === "en"
          ? "Click any node to explore deeper · Hover for details"
          : "点击任意节点深入探索 · 悬停查看详情"}
      </p>
    </div>
  );
}


