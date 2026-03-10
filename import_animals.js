// import_animals.js
// 从草稿箱 _draft_animals.json 导入动物到 data/animals/[id].json
// 导入完成后自动清空草稿箱
const fs   = require("fs");
const path = require("path");

const DRAFT   = path.join(__dirname, "_draft_animals.json");
const OUT_DIR = path.join(__dirname, "data", "animals");

const animals = JSON.parse(fs.readFileSync(DRAFT, "utf-8"));

if (!Array.isArray(animals) || animals.length === 0) {
  console.log("📭  草稿箱是空的，没有需要导入的动物。");
  process.exit(0);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let count = 0;
for (const animal of animals) {
  if (!animal.id) {
    console.warn(`⚠️  跳过一条缺少 id 的记录:`, JSON.stringify(animal).slice(0, 80));
    continue;
  }
  const dest = path.join(OUT_DIR, `${animal.id}.json`);
  fs.writeFileSync(dest, JSON.stringify(animal, null, 2), "utf-8");
  console.log(`  ✅  ${(animal.name_en || animal.id).padEnd(32)} → data/animals/${animal.id}.json`);
  count++;
}

// 清空草稿箱
fs.writeFileSync(DRAFT, "[]", "utf-8");

console.log(`\n✨ 导入完成！共写入 ${count} 个文件。草稿箱已自动清空。`);
