const fs = require("fs");
const path = require("path");
const { readAnimals, validateAnimal } = require("./scripts/lib/animal-schema");

const ROOT = __dirname;
const DRAFT_PATH = path.join(ROOT, "_draft_animals.json");
const ANIMALS_DIR = path.join(ROOT, "data", "animals");
const BACKUP_ROOT = path.join(ROOT, ".import-backups");
const replace = process.argv.includes("--replace");
const dryRun = process.argv.includes("--dry-run");

function duplicateErrors(records) {
  const errors = [];
  for (const field of ["id", "name_en", "name_zh", "scientific_name"]) {
    const values = new Map();
    for (const animal of records) {
      const value = String(animal[field] || "").trim().toLowerCase();
      if (!values.has(value)) values.set(value, []);
      values.get(value).push(animal.id || "unknown");
    }
    for (const [value, ids] of values) {
      if (value && ids.length > 1) errors.push(`duplicate ${field} "${value}": ${ids.join(", ")}`);
    }
  }
  return errors;
}

const draft = JSON.parse(fs.readFileSync(DRAFT_PATH, "utf8"));
if (!Array.isArray(draft) || draft.length === 0) {
  console.log("📭 _draft_animals.json is empty.");
  process.exit(0);
}

const errors = [];
for (const [index, animal] of draft.entries()) {
  const result = validateAnimal(animal, { requireRichContent: true, requireReview: true });
  errors.push(...result.errors.map((message) => `draft[${index}] (${animal.id || "no-id"}): ${message}`));
}

const published = readAnimals(ANIMALS_DIR).map(({ animal }) => animal);
const publishedById = new Map(published.map((animal) => [animal.id, animal]));
const draftIds = new Set(draft.map((animal) => animal.id));
for (const animal of draft) {
  const destination = path.join(ANIMALS_DIR, `${animal.id}.json`);
  const exists = fs.existsSync(destination);
  const previous = publishedById.get(animal.id);
  const rangeReview = animal.habitat?.range_review;
  if (exists && !replace) {
    errors.push(`${animal.id}: already exists; use --replace only after reviewing the diff`);
  }
  if (!exists && rangeReview?.previous_result !== "not-applicable") {
    errors.push(`${animal.id}: a new record must use range_review.previous_result not-applicable`);
  }
  if (exists && replace && previous) {
    const priorResult = rangeReview?.previous_result;
    if (priorResult === "not-applicable") {
      errors.push(`${animal.id}: replacement must compare old and new range geometry`);
      continue;
    }
    const oldGeometry = JSON.stringify({
      center: previous.habitat?.map_coordinates,
      polygons: previous.habitat?.global_distribution_polygons,
    });
    const newGeometry = JSON.stringify({
      center: animal.habitat?.map_coordinates,
      polygons: animal.habitat?.global_distribution_polygons,
    });
    if (priorResult === "retained" && oldGeometry !== newGeometry) {
      errors.push(`${animal.id}: range marked retained but coordinates or polygons changed`);
    }
    if (priorResult === "replaced" && oldGeometry === newGeometry) {
      errors.push(`${animal.id}: range marked replaced but coordinates and polygons are unchanged`);
    }
    if (priorResult === "removed-unverified") {
      const oldPolygonCount = previous.habitat?.global_distribution_polygons?.length || 0;
      const newPolygonCount = animal.habitat?.global_distribution_polygons?.length || 0;
      if (oldPolygonCount === 0 || newPolygonCount !== 0) {
        errors.push(`${animal.id}: removed-unverified requires old polygons and an empty new polygon array`);
      }
    }
  }
}
const combined = replace
  ? [...published.filter((animal) => !draftIds.has(animal.id)), ...draft]
  : [...published, ...draft];
errors.push(...duplicateErrors(combined));

if (errors.length > 0) {
  console.error(`❌ Import blocked by ${errors.length} validation error(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`✅ ${draft.length} draft records passed schema and uniqueness checks.`);
if (dryRun) {
  console.log("Dry run complete; no files changed.");
  process.exit(0);
}

fs.mkdirSync(ANIMALS_DIR, { recursive: true });
let backupDir = null;
if (replace) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  backupDir = path.join(BACKUP_ROOT, timestamp);
  fs.mkdirSync(backupDir, { recursive: true });
}

const staged = [];
for (const animal of draft) {
  const destination = path.join(ANIMALS_DIR, `${animal.id}.json`);
  if (replace && fs.existsSync(destination)) fs.copyFileSync(destination, path.join(backupDir, `${animal.id}.json`));
  const temporary = `${destination}.import-tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(animal, null, 2)}\n`, "utf8");
  staged.push({ temporary, destination, id: animal.id });
}
for (const file of staged) fs.renameSync(file.temporary, file.destination);
fs.writeFileSync(DRAFT_PATH, "[]\n", "utf8");

console.log(`✅ Imported ${staged.length} records atomically; draft cleared after success.`);
if (backupDir) console.log(`Existing records were backed up to ${path.relative(ROOT, backupDir)}.`);
console.log(`Next: node download_images.js --ids ${staged.map((file) => file.id).join(",")}`);
