import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const RECENTLY_ADDED_PATH = path.join(process.cwd(), "RECENTLY_ADDED.md");

function parseRecentlyAdded(content: string) {
  if (!content) return [];
  const lines = content.split("\n");
  const entries: { zh: string; en: string; scientific: string; id: string }[] = [];
  let inTable = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!inTable && trimmed.startsWith("|") && trimmed.includes("---")) {
      inTable = true;
      continue;
    }
    if (inTable && trimmed.startsWith("|")) {
      const cols = trimmed.split("|").map((c) => c.trim()).filter(Boolean);
      if (cols.length >= 5 && cols[1] !== "—" && cols[1] !== "中文名") {
        const linkCol = cols[4];
        const linkMatch = linkCol.match(/\[.*?\]\((.*?)\)/);
        const url = linkMatch ? linkMatch[1] : "";
        const idMatch = url.match(/\/animal\/(.+)$/);
        const id = idMatch ? idMatch[1] : "";
        
        entries.push({ 
          zh: cols[1], 
          en: cols[2], 
          scientific: cols[3],
          id: id
        });
      }
    }
  }
  return entries.reverse(); // Show newest first
}

export async function GET() {
  let content = "";
  if (fs.existsSync(RECENTLY_ADDED_PATH)) {
    content = fs.readFileSync(RECENTLY_ADDED_PATH, "utf-8");
  }
  const entries = parseRecentlyAdded(content);
  return NextResponse.json(entries);
}
