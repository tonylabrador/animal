import fs from "fs";
import path from "path";
import type { Animal } from "@/types/animal";

const ANIMALS_DIR = path.join(process.cwd(), "data", "animals");

/** 读取 data/animals/ 下所有 .json 文件，返回 Animal 数组 */
export function getAnimals(): Animal[] {
  const files = fs.readdirSync(ANIMALS_DIR).filter((f) => f.endsWith(".json"));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(ANIMALS_DIR, file), "utf-8");
    return JSON.parse(raw) as Animal;
  });
}

/** 按 id 读取单个动物 */
export function getAnimalById(id: string): Animal | undefined {
  const filePath = path.join(ANIMALS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return undefined;
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Animal;
}
