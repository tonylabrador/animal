import fs from "fs";
import path from "path";
import type { Animal } from "@/types/animal";

const ANIMALS_DIR = path.join(process.cwd(), "data", "animals");

/** 读取 data/animals/ 下所有 .json 文件，返回 Animal 数组（若某文件为数组则取首项） */
export function getAnimals(): Animal[] {
  const files = fs.readdirSync(ANIMALS_DIR).filter((f) => f.endsWith(".json"));
  const animalsWithTime = files.map((file) => {
    const filePath = path.join(ANIMALS_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    const animal = Array.isArray(parsed) ? parsed[0] : parsed;
    const stat = fs.statSync(filePath);
    return { animal: animal as Animal, time: stat.birthtimeMs || stat.mtimeMs };
  });

  // 默认排序：根据文件创建时间（或修改时间）倒序，实现最新添加在前
  animalsWithTime.sort((a, b) => b.time - a.time);
  
  return animalsWithTime.map((item) => item.animal);
}

/** 按 id 读取单个动物（若文件内容为数组则取首项，兼容误粘贴的草稿格式） */
export function getAnimalById(id: string): Animal | undefined {
  const filePath = path.join(ANIMALS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return undefined;
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const animal = Array.isArray(parsed) ? parsed[0] : parsed;
  return animal as Animal;
}
