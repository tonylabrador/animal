#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const argv = process.argv.slice(2);
const batchFlag = argv.indexOf("--batch");
const batch = batchFlag >= 0 ? argv[batchFlag + 1] : "legacy-qc-pilot-01";
if (batchFlag >= 0) argv.splice(batchFlag, 2);
const pendingCountFlag = argv.indexOf("--pending-count");
const pendingCount = pendingCountFlag >= 0 ? Number(argv[pendingCountFlag + 1]) : null;
if (pendingCountFlag >= 0) argv.splice(pendingCountFlag, 2);
const root = path.resolve(__dirname, "..");
const localDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const ids = pendingCount !== null
  ? fs.readdirSync(path.join(root, "data", "animals"))
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(fs.readFileSync(path.join(root, "data", "animals", file), "utf8")))
    .filter((animal) => animal.content_version !== 2)
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(0, pendingCount)
    .map((animal) => animal.id)
  : argv;
if (ids.length === 0) {
  console.error("Usage: node scripts/create_qc_batch_baseline.js [--batch batch-name] [--pending-count N | <animal-id> ...]");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, "data/image-attribution.json"), "utf8"));
const animals = ids.map((id) => {
  const file = path.join(root, "data/animals", `${id}.json`);
  const raw = fs.readFileSync(file, "utf8");
  const animal = JSON.parse(raw);
  return {
    id,
    record_sha256: crypto.createHash("sha256").update(raw).digest("hex"),
    name_en: animal.name_en,
    name_zh: animal.name_zh,
    scientific_name: animal.scientific_name,
    conservation_status: animal.conservation_status,
    habitat: animal.habitat,
    image: animal.image,
    image_manifest: manifest[id] || null,
  };
});

const output = {
  batch,
  captured_at: localDate,
  preservation_rule: "Keep map_coordinates and global_distribution_polygons unchanged unless a clearly documented error is supported by authoritative range evidence.",
  animals,
};

const outputDir = path.join(root, "docs/qc-batches");
fs.mkdirSync(outputDir, { recursive: true });
const outputFile = path.join(outputDir, `${batch}-baseline.json`);
fs.writeFileSync(outputFile, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Saved ${animals.length} baselines to ${path.relative(root, outputFile)}`);
