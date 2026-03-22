import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const COMMENTS_PATH = path.join(process.cwd(), "USER_COMMENTS.md");

async function getCommentsData(): Promise<{ content: string; sha?: string }> {
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    try {
      const res = await fetch("https://api.github.com/repos/tonylabrador/animal/contents/USER_COMMENTS.md", {
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
      console.error("Failed to fetch comments from GitHub:", e);
    }
  }
  
  // Fallback to local
  if (fs.existsSync(COMMENTS_PATH)) {
    return { content: fs.readFileSync(COMMENTS_PATH, "utf-8") };
  }
  return { content: "" };
}

export async function POST(req: Request) {
  const { comment } = await req.json();
  if (!comment?.trim()) {
    return NextResponse.json({ error: "Comment is required" }, { status: 400 });
  }

  let { content, sha } = await getCommentsData();

  if (!content) {
    content = `# 💬 User Comments & Feedback\n\n> Messages left by users from the Wild Explorer dashboard.\n\n`;
  }

  const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const safeComment = comment.trim().replace(/\n/g, "\n> ");
  const newRow = `\n### Comment on ${date}\n> ${safeComment}\n`;

  content = content + newRow;

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    const res = await fetch("https://api.github.com/repos/tonylabrador/animal/contents/USER_COMMENTS.md", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Add user comment`,
        content: Buffer.from(content, "utf-8").toString("base64"),
        sha: sha,
      }),
    });
    if (!res.ok) {
        console.error("Failed to write to GitHub", await res.text());
    }
  } else {
    fs.writeFileSync(COMMENTS_PATH, content, "utf-8");
  }

  return NextResponse.json({ success: true });
}
