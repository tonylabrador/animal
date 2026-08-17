import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const RECENTLY_ADDED_PATH = path.join(process.cwd(), "RECENTLY_ADDED.md");

function parseRecentlyAdded(content: string) {
  if (!content) return [];
  const lines = content.split("\n");
  const entries: { date: string | null; zh: string; en: string; scientific: string; id: string }[] = [];
  let inTable = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!inTable && trimmed.startsWith("|") && trimmed.includes("---")) {
      inTable = true;
      continue;
    }
    if (inTable && trimmed.startsWith("|")) {
      const cols = trimmed.split("|").slice(1, -1).map((c) => c.trim());
      const hasDateColumn = cols.length >= 6;
      const date = hasDateColumn && cols[1] !== "—" ? cols[1] : null;
      const zh = cols[hasDateColumn ? 2 : 1];
      const en = cols[hasDateColumn ? 3 : 2];
      const scientific = cols[hasDateColumn ? 4 : 3];
      const linkCol = cols[hasDateColumn ? 5 : 4];
      if (cols.length >= 5 && zh && en && scientific && linkCol) {
        const linkMatch = linkCol.match(/\[.*?\]\((.*?)\)/);
        const url = linkMatch ? linkMatch[1] : "";
        const idMatch = url.match(/\/animal\/(.+)$/);
        const id = idMatch ? idMatch[1] : "";
        if (id) entries.push({ date, zh, en, scientific, id });
      }
    }
  }
  return entries;
}

export async function GET() {
  let content = "";
  if (fs.existsSync(RECENTLY_ADDED_PATH)) {
    content = fs.readFileSync(RECENTLY_ADDED_PATH, "utf-8");
  }
  const entries = parseRecentlyAdded(content);
  return NextResponse.json(entries);
}
