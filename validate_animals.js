const fs = require("fs");
const path = require("path");
const {
  inspectImage,
  readAnimals,
  validateAnimal,
} = require("./scripts/lib/animal-schema");

const ROOT = __dirname;
const ANIMALS_DIR = path.join(ROOT, "data", "animals");
const IMAGES_DIR = path.join(ROOT, "public", "images", "animals");
const MANIFEST_PATH = path.join(ROOT, "data", "image-attribution.json");
const draftMode = process.argv.includes("--draft");
const strictSources = process.argv.includes("--strict-sources");

function add(map, value, id) {
  const key = String(value || "").trim().toLowerCase();
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(id);
}

function printIssues(title, issues) {
  if (issues.length === 0) return;
  console.error(`\n${title} (${issues.length})`);
  for (const issue of issues) console.error(`  - ${issue}`);
}

function validateRecords(records, options = {}) {
  const errors = [];
  const warnings = [];
  const unique = { id: new Map(), nameEn: new Map(), nameZh: new Map(), scientific: new Map() };

  for (const { file, animal } of records) {
    const result = validateAnimal(animal, { fileName: options.checkFileName ? file : undefined });
    errors.push(...result.errors.map((message) => `${file}: ${message}`));
    warnings.push(...result.warnings.map((message) => `${file}: ${message}`));
    add(unique.id, animal.id, file);
    add(unique.nameEn, animal.name_en, file);
    add(unique.nameZh, animal.name_zh, file);
    add(unique.scientific, animal.scientific_name, file);
  }

  for (const [label, values] of Object.entries(unique)) {
    for (const [value, files] of values) {
      if (files.length > 1) errors.push(`duplicate ${label} "${value}": ${files.join(", ")}`);
    }
  }
  return { errors, warnings };
}

function validateImages(records) {
  const errors = [];
  const warnings = [];
  const hashes = new Map();
  const expected = new Set();
  const manifest = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
    : {};

  for (const { animal } of records) {
    if (!animal.image) {
      const status = manifest[animal.id]?.review_status;
      warnings.push(`${animal.id}: no published image${status ? ` (${status})` : ""}`);
      continue;
    }
    const fileName = `${animal.id}.jpg`;
    const filePath = path.join(IMAGES_DIR, fileName);
    expected.add(fileName);
    if (!fs.existsSync(filePath)) {
      errors.push(`${animal.id}: image file is missing`);
      continue;
    }
    const info = inspectImage(filePath);
    if (!info.mime) errors.push(`${animal.id}: file is not a supported JPEG/PNG image`);
    if ((info.width || 0) < 400 || (info.height || 0) < 300) {
      warnings.push(`${animal.id}: low-resolution image ${info.width || "?"}x${info.height || "?"}`);
    }
    if (!hashes.has(info.sha256)) hashes.set(info.sha256, []);
    hashes.get(info.sha256).push(animal.id);
    if (!manifest[animal.id]) errors.push(`${animal.id}: image attribution manifest entry is missing`);
    if (strictSources && manifest[animal.id]?.license_status !== "verified") {
      errors.push(`${animal.id}: image license has not been verified`);
    }
  }

  for (const ids of hashes.values()) {
    if (ids.length > 1) errors.push(`duplicate image content: ${ids.join(", ")}`);
  }
  if (fs.existsSync(IMAGES_DIR)) {
    for (const file of fs.readdirSync(IMAGES_DIR).filter((name) => name.endsWith(".jpg"))) {
      if (!expected.has(file)) warnings.push(`orphan image: ${file}`);
    }
  }
  return { errors, warnings };
}

let records;
if (draftMode) {
  const draftPath = path.join(ROOT, "_draft_animals.json");
  const parsed = JSON.parse(fs.readFileSync(draftPath, "utf8"));
  if (!Array.isArray(parsed)) throw new Error("_draft_animals.json must contain an array");
  records = parsed.map((animal, index) => ({ file: `draft[${index}]`, animal }));
} else {
  records = readAnimals(ANIMALS_DIR);
}

const result = validateRecords(records, { checkFileName: !draftMode });
if (!draftMode) {
  const imageResult = validateImages(records);
  result.errors.push(...imageResult.errors);
  result.warnings.push(...imageResult.warnings);
}

printIssues("ERRORS", result.errors);
printIssues("WARNINGS", result.warnings);
console.log(`\nChecked ${records.length} ${draftMode ? "draft" : "published"} animal records.`);
if (result.errors.length > 0) process.exit(1);
console.log("✅ Animal data validation passed.");
