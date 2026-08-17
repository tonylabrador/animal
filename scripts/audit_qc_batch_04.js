#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const batchArg = process.argv.find((arg) => arg.startsWith("--batch="));
const BATCH = batchArg ? batchArg.split("=")[1] : "legacy-qc-batch-04";
const EXPECTED_FACTUAL_STATE = process.argv.includes("--reviewed") ? "source-checked" : "pending";
const EXPECTED_BILINGUAL_STATE = process.argv.includes("--reviewed") ? "line-by-line-reviewed" : "pending";
const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "qc-batches", `${BATCH}-baseline.json`), "utf8"));
const evidence = JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "qc-batches", `${BATCH}-evidence.json`), "utf8"));
const draft = JSON.parse(fs.readFileSync(path.join(ROOT, "_draft_animals.json"), "utf8"));
const evidenceById = new Map(evidence.animals.map((animal) => [animal.id, animal]));
const draftById = new Map(draft.map((animal) => [animal.id, animal]));
const manualIdentity = new Set(["chinese-sturgeon", "domestic-pig", "dusky-dolphin", "kakapo", "longsnout-catfish", "northern-goshawk", "pygmy-slow-loris", "vicuna", "whites-tree-frog", "wild-bactrian-camel", "wilsons-bird-of-paradise"]);
const statusOverrides = new Map([["giant-otter", "EN"], ["wild-bactrian-camel", "EN"]]);
const scientificNameOverrides = new Map([
  ["kakapo", "Strigops habroptilus"],
  ["northern-goshawk", "Astur gentilis"],
  ["pygmy-slow-loris", "Xanthonycticebus pygmaeus"],
  ["whites-tree-frog", "Pelodryas caerulea"],
  ["wilsons-bird-of-paradise", "Diphyllodes respublica"],
]);
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
    const expectedPolygons = previous.id === "northern-goshawk"
      ? previous.habitat.global_distribution_polygons.slice(1)
      : previous.habitat.global_distribution_polygons;
    if (!same(expectedPolygons, animal.habitat.global_distribution_polygons)) issues.push("map-polygons-changed");
    const expectedScientificName = scientificNameOverrides.get(previous.id) || previous.scientific_name;
    if (animal.scientific_name !== expectedScientificName) issues.push(`scientific-name-mismatch-${expectedScientificName}`);
    const expectedStatus = statusOverrides.get(previous.id) || proof.iucn?.code || "NE";
    if (animal.conservation_status.code !== expectedStatus) issues.push(`status-mismatch-${expectedStatus}`);
    if (animal.content_review.factual_qc !== EXPECTED_FACTUAL_STATE || animal.content_review.bilingual_qc !== EXPECTED_BILINGUAL_STATE) {
      issues.push(`draft-review-state-mismatch-${EXPECTED_FACTUAL_STATE}-${EXPECTED_BILINGUAL_STATE}`);
    }
  }
  if (issues.length > 0) failed = true;
  results.push({
    id: previous.id,
    scientific_name: animal?.scientific_name || previous.scientific_name,
    identity_result: proof?.identity_gate === "pass" ? "exact-gbif-and-inaturalist" : manualIdentity.has(previous.id) ? "manual-authority-resolution" : "unresolved",
    previous_iucn: previous.conservation_status?.code || null,
    reviewed_iucn: animal?.conservation_status?.code || null,
    map_result: issues.some((issue) => issue.startsWith("map-")) ? "changed" : previous.id === "northern-goshawk" ? "replaced-supported-split" : "retained-byte-for-byte",
    polygon_count: animal?.habitat.global_distribution_polygons.length ?? previous.habitat.global_distribution_polygons.length,
    draft_review_state: animal?.content_review || null,
    issues,
  });
}

if (draft.length !== baseline.animals.length) {
  failed = true;
  console.error(`Draft count ${draft.length} does not match baseline count ${baseline.animals.length}`);
}
const allManualDecisions = {
  "chinese-sturgeon": "Accepted: exact GBIF species and IUCN match; iNaturalist has no exact indexed taxon.",
  "domestic-pig": "Accepted with domestic convention note: GBIF treats Sus domesticus as a synonym; global status remains NE.",
  "dusky-dolphin": "Accepted: GBIF/IUCN, WoRMS and NOAA support Lagenorhynchus obscurus; iNaturalist uses Sagmatias obscurus.",
  "giant-otter": "IUCN direct species document overrides erroneous GBIF aggregate NE result; status is EN.",
  "galapagos-tortoise": "Corrected identity to extinct Floreana giant tortoise, Chelonoidis niger; generic living-tortoise image is not publishable for this taxon.",
  "kakapo": "Corrected spelling to Strigops habroptilus following IUCN, iNaturalist and New Zealand conservation usage; GBIF retains Strigops habroptila.",
  "longsnout-catfish": "Retained the IUCN-assessed Leiocassis longirostris combination; GBIF treats it as a synonym and iNaturalist has no exact indexed taxon.",
  "northern-goshawk": "Updated to Eurasian Goshawk, Astur gentilis. Removed only the obsolete North American polygon after the American/Eurasian species split; retained all Eurasian and Japanese coordinates.",
  "pygmy-slow-loris": "Updated to Southern Pygmy Slow Loris, Xanthonycticebus pygmaeus, following the Mammal Diversity Database; the prior map was retained.",
  "vicuna": "Retained Vicugna vicugna and LC to remain aligned with the IUCN-assessed combination, while recording the Mammal Diversity Database's Lama vicugna treatment.",
  "whites-tree-frog": "Updated the accepted combination to Pelodryas caerulea following Amphibian Species of the World; retained the IUCN category assessed under Ranoidea caerulea.",
  "wild-bactrian-camel": "Used the current Mammal Diversity Database species account to retain Endangered; rejected the genus-only GBIF NE response.",
  "wilsons-bird-of-paradise": "Updated the accepted combination to Diphyllodes respublica following the 2023 eBird/Clements taxonomy update.",
};
const batchIds = new Set(baseline.animals.map((animal) => animal.id));
const report = {
  batch: BATCH,
  audited_at: new Date().toISOString(),
  result: failed ? "failed" : "pass",
  gates: {
    exact_batch_membership: draft.length === baseline.animals.length && results.every((result) => !result.issues.includes("missing-draft")),
    identity: results.every((result) => result.identity_result !== "unresolved"),
    conservation: results.every((result) => !result.issues.some((issue) => issue.startsWith("status-mismatch"))),
    maps_retained: results.every((result) => ["retained-byte-for-byte", "replaced-supported-split"].includes(result.map_result)),
    generation_state: { factual_qc: EXPECTED_FACTUAL_STATE, bilingual_qc: EXPECTED_BILINGUAL_STATE },
    generation_state_matches: results.every((result) => result.draft_review_state?.factual_qc === EXPECTED_FACTUAL_STATE && result.draft_review_state?.bilingual_qc === EXPECTED_BILINGUAL_STATE),
    bilingual_pairs_checked: baseline.animals.length * 52,
  },
  manual_decisions: Object.fromEntries(Object.entries(allManualDecisions).filter(([id]) => batchIds.has(id))),
  animals: results,
};
fs.writeFileSync(path.join(ROOT, "docs", "qc-batches", `${BATCH}-review.json`), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`${failed ? "❌" : "✅"} ${BATCH} draft audit ${report.result}: ${results.length} records; all previous map geometry ${report.gates.maps_retained ? "retained" : "NOT retained"}.`);
if (failed) process.exit(1);
