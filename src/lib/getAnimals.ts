import fs from "fs";
import path from "path";
import type { Animal } from "@/types/animal";

const ANIMALS_DIR = path.join(process.cwd(), "data", "animals");

const RECENTLY_ADDED_FILE = path.join(process.cwd(), "RECENTLY_ADDED.md");

/** 读取 data/animals/ 下所有 .json 文件，返回 Animal 数组（若某文件为数组则取首项） */
export function getAnimals(): Animal[] {
  const files = fs.readdirSync(ANIMALS_DIR).filter((f) => f.endsWith(".json"));
  
  // 从 RECENTLY_ADDED.md 解析最近添加的前列排名（应对 Vercel 部署时文件时间戳被打乱的问题）
  const recentIds = new Map<string, number>();
  if (fs.existsSync(RECENTLY_ADDED_FILE)) {
    const lines = fs.readFileSync(RECENTLY_ADDED_FILE, "utf-8").split("\n");
    let rank = 0;
    for (const line of lines) {
      // 提取链接中的 ID，例如 [Link](.../animal/tufted-deer)
      const match = line.match(/\/animal\/([^)]+)\)/);
      if (match && match[1]) {
        recentIds.set(match[1].trim(), rank++);
      }
    }
  }

  const animalsWithMeta = files.map((file) => {
    const filePath = path.join(ANIMALS_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    const animal = Array.isArray(parsed) ? parsed[0] : parsed;
    const stat = fs.statSync(filePath);
    return { 
      animal: animal as Animal, 
      time: stat.birthtimeMs || stat.mtimeMs,
      recentRank: recentIds.has((animal as Animal).id) ? recentIds.get((animal as Animal).id)! : Infinity
    };
  });

  // 默认排序：
  // 1. 若在 RECENTLY_ADDED.md 中存在，则严格按照列表排名（最上的排前面）
  // 2. 若不在近期列表中，则按照文件时间戳（本地）兜底倒序排列
  animalsWithMeta.sort((a, b) => {
    if (a.recentRank !== b.recentRank) {
      return a.recentRank - b.recentRank;
    }
    return b.time - a.time;
  });
  
  return animalsWithMeta.map((item) => item.animal);
}

/** 按 id 读取单个动物（若文件内容为数组则取首项，兼容误粘贴的草稿格式） */
export function getAnimalById(id: string): Animal | undefined {
  const filePath = path.join(ANIMALS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return undefined;
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const animal = Array.isArray(parsed) ? parsed[0] : parsed;
  return animal as Animal;
}
