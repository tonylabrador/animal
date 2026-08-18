import fs from "fs";
import path from "path";
import type { Animal } from "@/types/animal";

const RELEASES_FILE = path.join(process.cwd(), "data", "releases.json");
const ANIMALS_DIR = path.join(process.cwd(), "data", "animals");

export interface AnimalRelease {
  id: string;
  date: string;
  animal_ids: string[];
}

export interface HydratedRelease extends AnimalRelease {
  animals: Animal[];
}

export function getReleases(): AnimalRelease[] {
  if (!fs.existsSync(RELEASES_FILE)) return [];
  const parsed: unknown = JSON.parse(fs.readFileSync(RELEASES_FILE, "utf8"));
  if (!Array.isArray(parsed)) throw new Error("data/releases.json must be an array");

  return parsed.map((release, index) => {
    if (
      !release || typeof release !== "object" ||
      typeof release.id !== "string" || !/^[a-z0-9-]+$/.test(release.id) ||
      typeof release.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(release.date) ||
      !Array.isArray(release.animal_ids) || release.animal_ids.some((id: unknown) => typeof id !== "string")
    ) {
      throw new Error(`Invalid release at index ${index}`);
    }
    return release as AnimalRelease;
  });
}

export function hydrateRelease(release: AnimalRelease): HydratedRelease {
  const animals = release.animal_ids.map((id) => {
    const filePath = path.join(ANIMALS_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) throw new Error(`Release ${release.id} references missing animal ${id}`);
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return (Array.isArray(parsed) ? parsed[0] : parsed) as Animal;
  });
  return { ...release, animals };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] || character);
}

export function releaseEmail(release: HydratedRelease, siteUrl: string) {
  const count = release.animals.length;
  const rows = release.animals.map((animal) => {
    const url = `${siteUrl}/animal/${encodeURIComponent(animal.id)}`;
    return `<tr><td style="padding:14px 0;border-bottom:1px solid #e2e8f0"><a href="${url}" style="font-size:18px;font-weight:700;color:#047857;text-decoration:none">${escapeHtml(animal.name_en)} · ${escapeHtml(animal.name_zh)}</a><div style="font-size:13px;font-style:italic;color:#64748b;margin-top:3px">${escapeHtml(animal.scientific_name)}</div><div style="font-size:14px;line-height:1.6;color:#475569;margin-top:7px">${escapeHtml(animal.description.en)}</div><div style="font-size:14px;line-height:1.6;color:#475569;margin-top:4px">${escapeHtml(animal.description.zh)}</div></td></tr>`;
  }).join("");
  const textAnimals = release.animals.map((animal) => `${animal.name_en} · ${animal.name_zh} (${animal.scientific_name})\n${siteUrl}/animal/${animal.id}`).join("\n\n");

  return {
    subject: `${count} new animals have arrived / 新增${count}种动物`,
    previewText: `Meet ${count} new animals on Wild Explorer · 探索新增的${count}种动物`,
    text: `Wild Explorer has ${count} new animals!\n野生动物探索新增了${count}种动物！\n\n${textAnimals}\n\nExplore all animals / 探索全部动物：${siteUrl}\n\nUnsubscribe / 退订：{{{RESEND_UNSUBSCRIBE_URL}}}`,
    html: `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,'Noto Sans SC',sans-serif;color:#1e293b"><div style="max-width:680px;margin:0 auto;padding:32px 18px"><div style="background:linear-gradient(135deg,#047857,#0f766e);color:white;border-radius:24px 24px 0 0;padding:32px"><div style="font-size:34px">🌿🐾</div><h1 style="font-size:28px;margin:14px 0 6px">Meet ${count} new animals</h1><p style="font-size:20px;margin:0">来认识${count}位动物新朋友</p></div><div style="background:white;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 24px 24px;padding:14px 30px 30px"><table role="presentation" style="width:100%;border-collapse:collapse">${rows}</table><p style="margin:28px 0 10px"><a href="${siteUrl}" style="display:inline-block;background:#f59e0b;color:#fff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:12px">Explore all animals / 探索全部动物</a></p><p style="font-size:12px;color:#94a3b8;line-height:1.6;margin-top:28px">You received this because you confirmed a Wild Explorer subscription.<br>你收到此邮件，是因为你确认订阅了野生动物探索。<br><a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#64748b">Unsubscribe / 退订</a></p></div></div></body></html>`,
  };
}
