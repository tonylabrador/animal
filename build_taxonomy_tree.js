/**
 * build_taxonomy_tree.js
 *
 * 从 data/animals/*.json 预构建分类树 → data/taxonomy-tree.json
 * 在每次新增/修改动物后由 Workflow B 自动调用。
 *
 * Usage: node build_taxonomy_tree.js
 */

const fs = require("fs");
const path = require("path");

const ANIMALS_DIR = path.join(__dirname, "data", "animals");
const OUTPUT_FILE = path.join(__dirname, "data", "taxonomy-tree.json");

const LEVELS = [
  { key: "kingdom", label: "Kingdom", labelZh: "界" },
  { key: "phylum",  label: "Phylum",  labelZh: "门" },
  { key: "class",   label: "Class",   labelZh: "纲" },
  { key: "order",   label: "Order",   labelZh: "目" },
  { key: "family",  label: "Family",  labelZh: "科" },
  { key: "genus",   label: "Genus",   labelZh: "属" },
];

// Read all animal JSONs
const files = fs.readdirSync(ANIMALS_DIR).filter((f) => f.endsWith(".json"));
const animals = files.map((f) => {
  const raw = fs.readFileSync(path.join(ANIMALS_DIR, f), "utf-8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed[0] : parsed;
});

// Build tree
const root = {
  name: "Animalia",
  nameZh: "动物界",
  level: "Kingdom",
  levelZh: "界",
  count: animals.length,
  children: [],
};

for (const animal of animals) {
  let current = root;

  for (let i = 1; i < LEVELS.length; i++) {
    const lvl = LEVELS[i];
    const nameEn = animal.taxonomy[lvl.key].en;
    const nameZh = animal.taxonomy[lvl.key].zh;

    let child = current.children.find((c) => c.name === nameEn);
    if (!child) {
      child = {
        name: nameEn,
        nameZh: nameZh,
        level: lvl.label,
        levelZh: lvl.labelZh,
        count: 0,
        children: [],
      };
      current.children.push(child);
    }
    child.count++;
    current = child;
  }

  // Leaf = species
  current.children.push({
    name: animal.name_en,
    nameZh: animal.name_zh,
    level: "Species",
    levelZh: "种",
    count: 1,
    children: [],
    animalId: animal.id,
    image: animal.image || null,
    scientificName: animal.scientific_name,
  });
}

// Sort recursively: bigger groups first, then alphabetically
function sortNode(node) {
  node.children.sort((a, b) => {
    if (a.count !== b.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });
  node.children.forEach(sortNode);
}
sortNode(root);

// Write
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(root, null, 2), "utf-8");
console.log(`✅ 分类树已构建 → ${OUTPUT_FILE}（${animals.length} 种动物）`);
