import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WISHLIST_PATH = path.join(process.cwd(), "ANIMAL_WISHLIST.md");

// ── GitHub API / Local File Abstraction ───────────────────────────────────────
async function getWishlistData(): Promise<{ content: string; sha?: string }> {
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    try {
      const res = await fetch("https://api.github.com/repos/tonylabrador/animal/contents/ANIMAL_WISHLIST.md", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        return { content, sha: data.sha };
      }
    } catch (e) {
      console.error("Failed to fetch wishlist from GitHub:", e);
    }
  }
  
  // Fallback to local
  if (fs.existsSync(WISHLIST_PATH)) {
    return { content: fs.readFileSync(WISHLIST_PATH, "utf-8") };
  }
  return { content: "" };
}

// ── Parse the markdown table into structured entries ──────────────────────────
function parseWishlistContent(content: string): { zh: string; en: string; scientific: string }[] {
  if (!content) return [];
  const lines = content.split("\n");
  const entries: { zh: string; en: string; scientific: string }[] = [];
  let inTable = false;
  for (const line of lines) {
    const trimmed = line.trim();
    // Start reading after the header separator row (| --- |)
    if (!inTable && trimmed.startsWith("|") && trimmed.includes("---")) {
      inTable = true;
      continue;
    }
    if (inTable && trimmed.startsWith("|")) {
      const cols = trimmed.split("|").map((c) => c.trim()).filter(Boolean);
      // cols: [#, zh, en, scientific, status]
      if (cols.length >= 4 && cols[1] !== "—" && cols[1] !== "中文名") {
        entries.push({ zh: cols[1], en: cols[2], scientific: cols[3] });
      }
    }
  }
  return entries;
}

// ── Append a new entry to the markdown table ─────────────────────────────────
async function appendToWishlistAsync(zh: string, en: string, scientific: string) {
  let { content, sha } = await getWishlistData();

  // If file is empty or has placeholder, rebuild it
  const existing = parseWishlistContent(content);
  const index = existing.length + 1;

  // Remove placeholder row if present
  content = content.replace(/\| — \| — \| — \| — \| 待填入 \|\n?/, "");

  const newRow = `| ${index} | ${zh} | ${en} | ${scientific} | ⏳ Pending |\n`;

  // If table exists, append before EOF; otherwise build fresh
  if (content.includes("| # |")) {
    // Find end of table and append
    content = content.trimEnd() + "\n" + newRow;
  } else {
    content = `# 🌟 Animal Wishlist (许愿池)\n\n> 通过「许愿池分类学拦截网关」验证的待添加物种清单。\n\n| # | 中文名 | English Name | Scientific Name | 状态 |\n|---|--------|-------------|-----------------|------|\n${newRow}`;
  }

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    await fetch("https://api.github.com/repos/tonylabrador/animal/contents/ANIMAL_WISHLIST.md", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Add ${zh} / ${en} to wishlist via AI`,
        content: Buffer.from(content, "utf-8").toString("base64"),
        sha: sha,
      }),
    });
  } else {
    fs.writeFileSync(WISHLIST_PATH, content, "utf-8");
  }
}

// ── Gemini AI: resolve any input → { zh, en, scientific } ────────────────────
async function resolveWithGemini(
  input: string
): Promise<{ status: string; zh: string; en: string; scientific: string; clarification?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const prompt = `You are a wildlife taxonomist. The user wants to add an animal to a wishlist.
Input: "${input}"

Rules:
1. If the input is a valid species (or can be matched to one), return JSON with status "VALID".
2. If it's a subspecies (like "dog", "dingo"), identify its parent species (like "wolf", "Canis lupus"). Return status "SUBSPECIES", and provide the parent species details in \`zh\`, \`en\`, \`scientific\`. Put a custom message in \`clarification\` like "[Original Input] 是 [Parent Name] 的亚种，系统将以种级记录。" (e.g. "狗是灰狼的亚种").
3. If it's a genus/family/vague group (like "shark", "owl"), return status "NEEDS_CLARIFICATION" with a friendly Chinese message listing 3 representative species.
4. If it's not an animal, return status "INVALID".

Respond ONLY with raw JSON (no markdown):
{
  "status": "VALID" | "SUBSPECIES" | "NEEDS_CLARIFICATION" | "INVALID",
  "zh": "中文俗名 (如果是亚种则填其归属的种名)",
  "en": "English Common Name (如果是亚种则填其归属的种名)",
  "scientific": "Genus species (如果是亚种则填其归属的种名)",
  "clarification": "（用于 NEEDS_CLARIFICATION 或 SUBSPECIES）"
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  // Strip markdown fences if present
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean);
}

// ── Check if animal exists in ANIMALS_LIST.md ───────────────────────────────
function isAnimalInList(scientific: string, zh: string, en: string): boolean {
  const listPath = path.join(process.cwd(), "ANIMALS_LIST.md");
  if (!fs.existsSync(listPath)) return false;
  const content = fs.readFileSync(listPath, "utf-8");

  // Require exact regex matches on the markdown list items to avoid partial matching (e.g. "人")
  if (scientific && new RegExp(`\\*${scientific.trim()}\\*`, 'i').test(content)) return true;
  if (en && new RegExp(`/ ${en.trim()} —`, 'i').test(content)) return true;
  if (zh && new RegExp(`- ${zh.trim()} /`).test(content)) return true;

  return false;
}

// ── GET /api/wishlist ─────────────────────────────────────────────────────────
export async function GET() {
  const { content } = await getWishlistData();
  const entries = parseWishlistContent(content);
  return NextResponse.json(entries);
}

// ── POST /api/wishlist ────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const { input } = await req.json();
  if (!input?.trim()) {
    return NextResponse.json({ error: "Input is required" }, { status: 400 });
  }

  let resolved;
  try {
    resolved = await resolveWithGemini(input.trim());
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
  }

  if (resolved.status === "NEEDS_CLARIFICATION") {
    return NextResponse.json({ status: "NEEDS_CLARIFICATION", clarification: resolved.clarification });
  }
  if (resolved.status === "INVALID") {
    return NextResponse.json({ status: "INVALID", clarification: "这好像不是一种动物哦，请换个名字试试！" });
  }

  // Check if it already exists in the main animal list
  if (isAnimalInList(resolved.scientific, resolved.zh, resolved.en)) {
    let msg = `该动物 (${resolved.zh} / ${resolved.en}) 已经存在于系统中了，去首页搜搜看吧！`;
    if (resolved.status === "SUBSPECIES" && resolved.clarification) {
      msg = `${resolved.clarification} \n` + msg;
    }
    return NextResponse.json({ 
      status: "INVALID", 
      clarification: msg
    });
  }

  // Check if it already exists in the current wishlist
  const { content } = await getWishlistData();
  const currentWishlist = parseWishlistContent(content);
  const alreadyWished = currentWishlist.some(e => 
    e.scientific.toLowerCase() === resolved.scientific.toLowerCase() ||
    e.zh === resolved.zh ||
    e.en.toLowerCase() === resolved.en.toLowerCase()
  );

  if (alreadyWished) {
    return NextResponse.json({ 
      status: "INVALID", 
      clarification: `该动物 (${resolved.zh} / ${resolved.en}) 已经在许愿池中等待处理啦！` 
    });
  }
  
  // If it's a valid subspecies but parent species is NOT in the list, we still add the *parent* species to the wishlist
  const zhName = resolved.status === "SUBSPECIES" && resolved.clarification ? `${resolved.zh} (${resolved.clarification})` : resolved.zh;

  // VALID — append to wishlist
  await appendToWishlistAsync(zhName, resolved.en, resolved.scientific);
  
  if (resolved.status === "SUBSPECIES" && resolved.clarification) {
    return NextResponse.json({ 
      status: "VALID", 
      zh: resolved.zh, 
      en: resolved.en, 
      scientific: resolved.scientific,
      // Optional: We can pass clarification to UI if we upgrade UI in the future, 
      // but for now UI just shows "Added to wishlist! zh / en · scientific"
      // If we want the UI to show the message, we would need to pass it back. Let's just adjust the UI slightly.
    });
  }

  return NextResponse.json({ status: "VALID", zh: resolved.zh, en: resolved.en, scientific: resolved.scientific });
}
