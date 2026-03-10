// split_data.js
// 将 animal_source.json 拆分为 data/animals/[id].json（一物一文件）
const fs   = require("fs");
const path = require("path");

// 数据源（历史迁移用；若已删除 animal_source.json 则本脚本仅作参考）
const SRC     = path.join(__dirname, "animal_source.json");
const OUT_DIR = path.join(__dirname, "data", "animals");

const animals = JSON.parse(fs.readFileSync(SRC, "utf-8"));

fs.mkdirSync(OUT_DIR, { recursive: true });

let count = 0;
for (const animal of animals) {
  const dest = path.join(OUT_DIR, `${animal.id}.json`);
  fs.writeFileSync(dest, JSON.stringify(animal, null, 2), "utf-8");
  console.log(`  ✅  ${animal.name_en.padEnd(32)} → data/animals/${animal.id}.json`);
  count++;
}

console.log(`\n✨ 完成！共拆分 ${count} 个动物文件到 data/animals/`);
