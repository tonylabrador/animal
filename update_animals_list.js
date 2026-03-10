// update_animals_list.js
// 读取 data/animals/*.json，按生物分类整理，输出到根目录 ANIMALS_LIST.md
const fs   = require("fs");
const path = require("path");

const ANIMALS_DIR = path.join(__dirname, "data", "animals");
const OUT_FILE    = path.join(__dirname, "ANIMALS_LIST.md");

const files = fs.readdirSync(ANIMALS_DIR).filter((f) => f.endsWith(".json"));
const animals = files.map((f) => {
  const raw = fs.readFileSync(path.join(ANIMALS_DIR, f), "utf-8");
  return JSON.parse(raw);
});

// 按 纲(class) → 目(order) → 科(family) 分组
const byClass = {};
for (const a of animals) {
  const c = a.taxonomy?.class?.zh || a.taxonomy?.class?.en || "未分类";
  const o = a.taxonomy?.order?.zh || a.taxonomy?.order?.en || "—";
  const fam = a.taxonomy?.family?.zh || a.taxonomy?.family?.en || "—";
  if (!byClass[c]) byClass[c] = {};
  if (!byClass[c][o]) byClass[c][o] = {};
  if (!byClass[c][o][fam]) byClass[c][o][fam] = [];
  byClass[c][o][fam].push({
    id: a.id,
    name_en: a.name_en,
    name_zh: a.name_zh,
    scientific_name: a.scientific_name || "—",
  });
}

// 确定纲的显示顺序（常见顺序）
const classOrder = [
  "哺乳纲", "鸟纲", "爬行纲", "两栖纲", "鱼纲",
  "Mammalia", "Aves", "Reptilia", "Amphibia",
];
const sortClasses = (a, b) => {
  const i = classOrder.indexOf(a);
  const j = classOrder.indexOf(b);
  if (i !== -1 && j !== -1) return i - j;
  if (i !== -1) return -1;
  if (j !== -1) return 1;
  return a.localeCompare(b);
};

const lines = [
  "# Wild Explorer — 已收录动物列表",
  "",
  "按生物分类整理，便于追踪已添加的物种。",
  "",
  "**统计**：共 **" + animals.length + "** 种动物",
  "",
  "---",
  "",
];

const sortedClasses = Object.keys(byClass).sort(sortClasses);

for (const classZh of sortedClasses) {
  lines.push("## " + classZh);
  lines.push("");

  const orders = byClass[classZh];
  const orderKeys = Object.keys(orders).sort();

  for (const orderZh of orderKeys) {
    lines.push("### " + orderZh);
    lines.push("");

    const families = orders[orderZh];
    const familyKeys = Object.keys(families).sort();

    for (const familyZh of familyKeys) {
      const list = families[familyZh];
      list.sort((a, b) => (a.name_en || a.id).localeCompare(b.name_en || b.id));
      lines.push("**" + familyZh + "**");
      lines.push("");
      for (const item of list) {
        lines.push("- " + item.name_zh + " / " + item.name_en + " — *" + item.scientific_name + "* `" + item.id + "`");
      }
      lines.push("");
    }
  }
  lines.push("---");
  lines.push("");
}

lines.push("");
lines.push("*由 `node update_animals_list.js` 自动生成*");

fs.writeFileSync(OUT_FILE, lines.join("\n"), "utf-8");
console.log("✅ 已更新 " + OUT_FILE + "，共 " + animals.length + " 种动物。");
