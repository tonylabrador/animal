#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const BATCH = "legacy-qc-batch-05";
const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "qc-batches", `${BATCH}-baseline.json`), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "image-attribution.json"), "utf8"));

// These records keep their existing image for now. The candidates were placeholders,
// drawings, specimens without a useful living-animal view, or too unclear to approve.
const rejected = new Map([
  ["great-cormorant", "Exact-taxon candidates show a distant colony and no identifiable individual; retain the clearer original image pending attribution verification."],
  ["human", "Candidates are anatomy diagrams, museum skeletons, or an unrelated distribution map; retain the original representative collage pending attribution verification."],
  ["ili-pika", "The only candidate is an explicit missing-image placeholder; retain the original photo pending attribution verification."],
  ["immortal-jellyfish", "Only historical line drawings were available and the original photo cannot yet be verified to species level; retain it as replacement-needed."],
  ["ivory-billed-woodpecker", "Only historical illustrations were available; retain the original specimen display pending attribution verification."],
  ["javan-green-magpie", "Candidates are an illustration or dead museum skins; retain the clearer original living-bird image pending attribution verification."],
  ["kings-box-jellyfish", "The licensed specimen-in-vial candidate does not show the animal clearly enough for the hero image; retain the original image as replacement-needed."],
  ["little-spotted-kiwi", "The only candidate is an audio waveform screenshot rather than an animal image; retain the original photo pending attribution verification."],
]);

// Candidate 1 is the default. Overrides record the best visible, species-relevant
// animal after comparing every generated contact sheet.
const selectedCandidate = new Map([
  ["glass-frog", 3],
  ["goblin-shark", 2],
  ["golden-pheasant", 3],
  ["golden-rumped-elephant-shrew", 2],
  ["gopher-snake", 2],
  ["great-dusky-swift", 3],
  ["greater-flamingo", 2],
  ["green-anaconda", 2],
  ["honey-badger", 2],
  ["house-fly", 2],
  ["indian-peafowl", 2],
  ["jaguar", 3],
  ["large-flying-fox", 3],
  ["lion", 2],
  ["mallard", 3],
]);

const approvals = [];
const retained = [];
const unresolved = [];

for (const animal of baseline.animals) {
  const current = manifest[animal.id];
  if (current?.license_status === "verified" && current?.review_status === "human-approved") {
    retained.push({ id: animal.id, result: "existing-verified-image-retained" });
    continue;
  }
  if (rejected.has(animal.id)) {
    unresolved.push({ id: animal.id, result: "replacement-needed", reason: rejected.get(animal.id) });
    continue;
  }
  const reviewPath = path.join(ROOT, ".image-review", animal.id, "review.json");
  if (!fs.existsSync(reviewPath)) throw new Error(`${animal.id}: no image review exists`);
  const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  const candidate = selectedCandidate.get(animal.id) || 1;
  if (!review.candidates[candidate - 1]) throw new Error(`${animal.id}: candidate ${candidate} does not exist`);
  approvals.push({
    id: animal.id,
    candidate,
    selection: `${animal.id}:${candidate}`,
    taxon_name: review.taxon.name,
    source: review.candidates[candidate - 1].source,
    source_url: review.candidates[candidate - 1].source_url,
    license: review.candidates[candidate - 1].license_code,
    visual_result: "species-relevant animal subject approved; placeholders, maps, drawings, objects, dead specimens, unclear silhouettes and wrong-species candidates rejected",
  });
}

const output = {
  batch: BATCH,
  reviewed_at: new Date().toISOString(),
  criteria: "Exact taxon source, visible animal subject, species-level visual plausibility, sufficient clarity and allowed open license all required.",
  approvals,
  retained,
  unresolved,
};
fs.writeFileSync(path.join(ROOT, "docs", "qc-batches", `${BATCH}-image-decisions.json`), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Saved image decisions: ${approvals.length} approvals, ${retained.length} existing verified, ${unresolved.length} unresolved.`);
