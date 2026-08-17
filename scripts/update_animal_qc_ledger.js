#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { readAnimals } = require("./lib/animal-schema");

const ROOT = path.resolve(__dirname, "..");
const ANIMALS_DIR = path.join(ROOT, "data", "animals");
const BATCH_DIR = path.join(ROOT, "docs", "qc-batches");
const MANIFEST_PATH = path.join(ROOT, "data", "image-attribution.json");
const JSON_OUTPUT = path.join(BATCH_DIR, "animal-qc-ledger.json");
const MARKDOWN_OUTPUT = path.join(ROOT, "docs", "ANIMAL_QC_TODO.md");

function batchMembership() {
  const membership = new Map();
  if (!fs.existsSync(BATCH_DIR)) return membership;
  const files = fs.readdirSync(BATCH_DIR)
    .filter((file) => file.endsWith("-baseline.json"))
    .sort();
  for (const file of files) {
    const baseline = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, file), "utf8"));
    for (const animal of baseline.animals || []) {
      const batches = membership.get(animal.id) || [];
      batches.push(baseline.batch || file.replace(/-baseline\.json$/, ""));
      membership.set(animal.id, batches);
    }
  }
  return membership;
}

function imageState(animal, attribution) {
  if (!animal.image) return "missing";
  if (!attribution) return "missing-attribution";
  if (attribution.license_status === "verified" && attribution.review_status === "human-approved") {
    return "verified";
  }
  if (attribution.review_status === "replacement-needed") return "replacement-needed";
  if (attribution.review_status === "hidden-unverified") return "hidden-unverified";
  return "legacy-unverified";
}

const records = readAnimals(ANIMALS_DIR)
  .map(({ animal }) => animal)
  .sort((a, b) => a.id.localeCompare(b.id));
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const membership = batchMembership();
const entries = records.map((animal) => {
  const contentComplete = animal.content_version === 2
    && animal.content_review?.factual_qc === "source-checked"
    && animal.content_review?.bilingual_qc === "line-by-line-reviewed";
  const mapState = contentComplete
    ? animal.habitat?.range_review?.display_mode || "missing-range-review"
    : "pending-review";
  const image = imageState(animal, manifest[animal.id]);
  const releaseComplete = contentComplete
    && mapState !== "missing-range-review"
    && image === "verified";
  const issues = [];
  if (!contentComplete) issues.push("content-v2-pending");
  if (mapState === "pending-review" || mapState === "missing-range-review") issues.push("map-review-pending");
  if (image !== "verified") issues.push(`image-${image}`);
  return {
    id: animal.id,
    name_en: animal.name_en,
    name_zh: animal.name_zh,
    scientific_name: animal.scientific_name,
    class: animal.ui_tags?.[0] || "Unknown",
    content_status: contentComplete ? "reviewed-v2" : "pending",
    map_status: mapState,
    image_status: image,
    release_status: releaseComplete ? "complete" : "todo",
    reviewed_at: contentComplete ? animal.content_review.reviewed_at : null,
    reviewer: contentComplete ? animal.content_review.reviewer : null,
    batches: membership.get(animal.id) || [],
    issues,
  };
});

const summary = {
  total: entries.length,
  content_reviewed: entries.filter((entry) => entry.content_status === "reviewed-v2").length,
  content_pending: entries.filter((entry) => entry.content_status === "pending").length,
  images_verified: entries.filter((entry) => entry.image_status === "verified").length,
  release_complete: entries.filter((entry) => entry.release_status === "complete").length,
  release_todo: entries.filter((entry) => entry.release_status === "todo").length,
};
const ledger = {
  generated_at: new Date().toISOString(),
  completion_rule: "A record is complete only when Rich Content v2 factual/bilingual review, map review, and a human-approved verified-license image all pass.",
  summary,
  animals: entries,
};
fs.writeFileSync(JSON_OUTPUT, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");

const rows = entries.map((entry) => {
  const batch = entry.batches.length > 0 ? entry.batches.join(", ") : "—";
  const issues = entry.issues.length > 0 ? entry.issues.join(", ") : "—";
  return `| ${entry.id} | ${entry.name_en} | ${entry.name_zh} | ${entry.content_status} | ${entry.map_status} | ${entry.image_status} | ${entry.release_status} | ${batch} | ${issues} |`;
}).join("\n");
const markdown = `# Animal QC master to-do list

此台账由 \`npm run report:animal-qc\` 生成，是 426 只现有动物逐条 QC 的唯一进度来源。\`complete\` 必须同时通过 Rich Content v2 事实与中英逐条审核、地图审核，以及人工确认且许可可验证的图片审核。

## Summary

- Total animals: ${summary.total}
- Content v2 reviewed: ${summary.content_reviewed}
- Content still pending: ${summary.content_pending}
- Images with verified license and human approval: ${summary.images_verified}
- Fully release-gated complete: ${summary.release_complete}
- Still on master to-do list: ${summary.release_todo}

## Per-animal ledger

| ID | English | 中文 | Content | Map | Image | Overall | Batch | Outstanding issues |
|---|---|---|---|---|---|---|---|---|
${rows}
`;
fs.writeFileSync(MARKDOWN_OUTPUT, markdown, "utf8");
console.log(`✅ Animal QC ledger updated: ${summary.release_complete}/${summary.total} fully complete; ${summary.content_reviewed}/${summary.total} content-reviewed.`);
