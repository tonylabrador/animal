#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const BATCH = "legacy-qc-batch-04";
const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "qc-batches", `${BATCH}-baseline.json`), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "image-attribution.json"), "utf8"));
const rejected = new Map([
  ["cebu-flowerpecker", "No exact, visually suitable candidate met the minimum image size; retain the original image as replacement-needed."],
  ["galapagos-tortoise", "The old image shows a living Galápagos tortoise, but Chelonoidis niger is the extinct Floreana taxon; hide the image as wrong identity."],
]);
const selectedCandidate = new Map([
  ["california-scrub-jay", 2], ["chambered-nautilus", 4], ["caracal", 2], ["cheetah", 4],
  ["coal-tit", 2], ["chinese-white-dolphin", 5], ["common-bottlenose-dolphin", 5],
  ["common-raven", 4], ["common-swift", 3], ["common-tailorbird", 3], ["coyote", 5],
  ["darwins-fox", 5], ["eurasian-blue-tit", 5], ["european-polecat", 4],
  ["false-killer-whale", 4], ["fennec-fox", 6], ["flathead-grey-mullet", 5],
  ["giant-apple-snail", 4], ["giant-armadillo", 2], ["giant-panda", 3],
  ["chinese-alligator", 4],
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
    unresolved.push({ id: animal.id, result: animal.id === "galapagos-tortoise" ? "hide-wrong-identity" : "replacement-needed", reason: rejected.get(animal.id) });
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
    visual_result: "species-relevant animal subject approved; maps, drawings, objects, signs, toys, unclear silhouettes and wrong-species candidates rejected",
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
