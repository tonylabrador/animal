const fs = require("fs");
const path = require("path");
const { readAnimals } = require("./lib/animal-schema");

const ROOT = path.join(__dirname, "..");
const draftMode = process.argv.includes("--draft");
const idsIndex = process.argv.indexOf("--ids");
const requestedIds = idsIndex >= 0
  ? new Set((process.argv[idsIndex + 1] || "").split(",").filter(Boolean))
  : null;

function numberTokens(text) {
  return (String(text).match(/\d+(?:\.\d+)?/g) || []).sort();
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function collectPairs(value, field = "record", pairs = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectPairs(item, `${field}[${index}]`, pairs));
    return pairs;
  }
  if (!value || typeof value !== "object") return pairs;

  if (typeof value.en === "string" || typeof value.zh === "string") {
    pairs.push({ field, en: value.en, zh: value.zh });
  }
  if (typeof value.text_en === "string" || typeof value.text_zh === "string") {
    pairs.push({ field: `${field}.text`, en: value.text_en, zh: value.text_zh });
  }
  if (typeof value.note_en === "string" || typeof value.note_zh === "string") {
    pairs.push({ field: `${field}.note`, en: value.note_en, zh: value.note_zh });
  }

  const pairedSuffixKeys = new Set();
  for (const key of Object.keys(value)) {
    if (!key.endsWith("_en") || ["text_en", "note_en"].includes(key)) continue;
    const stem = key.slice(0, -3);
    const zhKey = `${stem}_zh`;
    pairs.push({ field: `${field}.${stem}`, en: value[key], zh: value[zhKey] });
    pairedSuffixKeys.add(key);
    pairedSuffixKeys.add(zhKey);
  }

  for (const [key, child] of Object.entries(value)) {
    if (["en", "zh", "text_en", "text_zh", "note_en", "note_zh", "sources"].includes(key)) continue;
    if (pairedSuffixKeys.has(key)) continue;
    collectPairs(child, `${field}.${key}`, pairs);
  }
  return pairs;
}

function checkPair(pair, errors, warnings) {
  if (typeof pair.en !== "string" || pair.en.trim() === "") errors.push(`${pair.field}: English is missing`);
  if (typeof pair.zh !== "string" || pair.zh.trim() === "") errors.push(`${pair.field}: Chinese is missing`);
  if (typeof pair.en !== "string" || typeof pair.zh !== "string") return;

  const enNumbers = numberTokens(pair.en);
  const zhNumbers = numberTokens(pair.zh);
  if (!arraysEqual(enNumbers, zhNumbers)) {
    errors.push(`${pair.field}: number mismatch EN=[${enNumbers.join(", ")}] ZH=[${zhNumbers.join(", ")}]`);
  }

  const qualifierRules = [
    { en: /\b(?:roughly|approximately)\b|\babout\s+\d/i, zh: /约|大约|左右/, label: "approximation" },
    { en: /\b(?:up to\s+(?:a|an|\d)|as many as)\b/i, zh: /最多|可达|高达|长达|深达|多达/, label: "upper limit" },
    { en: /\b(?:usually|commonly|typically)\b/i, zh: /通常|一般|往往|多为|常见|常伴|常常/, label: "frequency qualifier" },
    { en: /\bunknown\b/i, zh: /未知|尚不清楚|数据不足/, label: "unknown qualifier" },
  ];
  for (const rule of qualifierRules) {
    if (rule.en.test(pair.en) && !rule.zh.test(pair.zh)) {
      warnings.push(`${pair.field}: check ${rule.label} wording in Chinese`);
    }
  }

  if (/\.\.\.|…{2,}|\bTODO\b|待补|占位/i.test(`${pair.en} ${pair.zh}`)) {
    errors.push(`${pair.field}: placeholder or unfinished text detected`);
  }
}

function readRecords() {
  if (!draftMode) return readAnimals(path.join(ROOT, "data", "animals"));
  const draft = JSON.parse(fs.readFileSync(path.join(ROOT, "_draft_animals.json"), "utf8"));
  return draft.map((animal, index) => ({ file: `draft[${index}]`, animal }));
}

const records = readRecords().filter(({ animal }) => !requestedIds || requestedIds.has(animal.id));
if (requestedIds && records.length !== requestedIds.size) {
  const found = new Set(records.map(({ animal }) => animal.id));
  const missing = [...requestedIds].filter((id) => !found.has(id));
  console.error(`❌ Unknown animal ID(s): ${missing.join(", ")}`);
  process.exit(1);
}

const errors = [];
const warnings = [];
let checkedRecords = 0;
let checkedPairs = 0;
let legacyRecords = 0;

for (const { file, animal } of records) {
  if (animal.content_version !== 2) {
    legacyRecords += 1;
    continue;
  }
  checkedRecords += 1;
  const pairs = [
    { field: "record.names", en: animal.name_en, zh: animal.name_zh },
    ...collectPairs(animal),
  ];
  checkedPairs += pairs.length;
  const recordErrors = [];
  const recordWarnings = [];
  pairs.forEach((pair) => checkPair(pair, recordErrors, recordWarnings));
  errors.push(...recordErrors.map((message) => `${file}: ${message}`));
  warnings.push(...recordWarnings.map((message) => `${file}: ${message}`));
}

if (warnings.length > 0) {
  console.warn(`\nBILINGUAL QC WARNINGS (${warnings.length})`);
  warnings.forEach((warning) => console.warn(`  - ${warning}`));
}
if (errors.length > 0) {
  console.error(`\nBILINGUAL QC ERRORS (${errors.length})`);
  errors.forEach((error) => console.error(`  - ${error}`));
}

console.log(`\nChecked ${checkedPairs} bilingual field pairs across ${checkedRecords} content_version 2 record(s).`);
if (!draftMode && !requestedIds) console.log(`${legacyRecords} legacy record(s) remain in the line-by-line migration queue.`);
if (errors.length > 0) process.exit(1);
console.log("✅ Automated bilingual consistency QC passed.");
