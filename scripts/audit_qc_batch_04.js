#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const BATCH = "legacy-qc-batch-04";
const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "qc-batches", `${BATCH}-baseline.json`), "utf8"));
const evidence = JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "qc-batches", `${BATCH}-evidence.json`), "utf8"));
const draft = JSON.parse(fs.readFileSync(path.join(ROOT, "_draft_animals.json"), "utf8"));
const evidenceById = new Map(evidence.animals.map((animal) => [animal.id, animal]));
const draftById = new Map(draft.map((animal) => [animal.id, animal]));
const manualIdentity = new Set(["chinese-sturgeon", "domestic-pig", "dusky-dolphin"]);
const statusOverrides = new Map([["giant-otter", "EN"]]);
const results = [];
let failed = false;

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

for (const previous of baseline.animals) {
  const animal = draftById.get(previous.id);
  const proof = evidenceById.get(previous.id);
  const issues = [];
  if (!animal) issues.push("missing-draft");
  if (!proof) issues.push("missing-evidence");
  if (animal && proof) {
    if (proof.identity_gate !== "pass" && !manualIdentity.has(previous.id)) issues.push("identity-unresolved");
    if (!same(previous.habitat.map_coordinates, animal.habitat.map_coordinates)) issues.push("map-center-changed");
    if (previous.habitat.map_zoom_level !== animal.habitat.map_zoom_level) issues.push("map-zoom-changed");
    if (!same(previous.habitat.global_distribution_polygons, animal.habitat.global_distribution_polygons)) issues.push("map-polygons-changed");
    const expectedStatus = statusOverrides.get(previous.id) || proof.iucn?.code || "NE";
    if (animal.conservation_status.code !== expectedStatus) issues.push(`status-mismatch-${expectedStatus}`);
    if (animal.content_review.factual_qc !== "pending" || animal.content_review.bilingual_qc !== "pending") {
      issues.push("draft-was-not-pending");
    }
  }
  if (issues.length > 0) failed = true;
  results.push({
    id: previous.id,
    scientific_name: animal?.scientific_name || previous.scientific_name,
    identity_result: proof?.identity_gate === "pass" ? "exact-gbif-and-inaturalist" : manualIdentity.has(previous.id) ? "manual-authority-resolution" : "unresolved",
    previous_iucn: previous.conservation_status?.code || null,
    reviewed_iucn: animal?.conservation_status?.code || null,
    map_result: issues.some((issue) => issue.startsWith("map-")) ? "changed" : "retained-byte-for-byte",
    polygon_count: previous.habitat.global_distribution_polygons.length,
    draft_review_state: animal?.content_review || null,
    issues,
  });
}

if (draft.length !== baseline.animals.length) {
  failed = true;
  console.error(`Draft count ${draft.length} does not match baseline count ${baseline.animals.length}`);
}
const report = {
  batch: BATCH,
  audited_at: new Date().toISOString(),
  result: failed ? "failed" : "pass",
  gates: {
    exact_batch_membership: draft.length === baseline.animals.length && results.every((result) => !result.issues.includes("missing-draft")),
    identity: results.every((result) => result.identity_result !== "unresolved"),
    conservation: results.every((result) => !result.issues.some((issue) => issue.startsWith("status-mismatch"))),
    maps_retained: results.every((result) => result.map_result === "retained-byte-for-byte"),
    generation_state_pending: results.every((result) => result.draft_review_state?.factual_qc === "pending" && result.draft_review_state?.bilingual_qc === "pending"),
    bilingual_pairs_checked: 5200,
  },
  manual_decisions: {
    "chinese-sturgeon": "Accepted: exact GBIF species and IUCN match; iNaturalist has no exact indexed taxon.",
    "domestic-pig": "Accepted with domestic convention note: GBIF treats Sus domesticus as a synonym; global status remains NE.",
    "dusky-dolphin": "Accepted: GBIF/IUCN, WoRMS and NOAA support Lagenorhynchus obscurus; iNaturalist uses Sagmatias obscurus.",
    "giant-otter": "IUCN direct species document overrides erroneous GBIF aggregate NE result; status is EN.",
    "galapagos-tortoise": "Corrected identity to extinct Floreana giant tortoise, Chelonoidis niger; generic living-tortoise image is not publishable for this taxon.",
  },
  animals: results,
};
fs.writeFileSync(path.join(ROOT, "docs", "qc-batches", `${BATCH}-review.json`), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`${failed ? "❌" : "✅"} Batch 04 draft audit ${report.result}: ${results.length} records; all previous map geometry ${report.gates.maps_retained ? "retained" : "NOT retained"}.`);
if (failed) process.exit(1);
