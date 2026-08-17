#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const BATCH = "legacy-qc-batch-06";
const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "qc-batches", `${BATCH}-baseline.json`), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "image-attribution.json"), "utf8"));

// In each case the published image is visibly clearer and species-relevant, while
// the new exact-taxon candidates are too distant, dead, diagrammatic, misleading,
// or otherwise unsuitable. Keep the original as requested, but do not invent an
// open-license attribution: these remain explicit attribution follow-ups.
const rejected = new Map([
  ["mangrove-box-jellyfish", "Exact-taxon candidates are too murky for a hero image; retain the clearer original pending attribution verification."],
  ["mohol-bushbaby", "Candidates show a distant animal or carcasses; retain the clear original living animal pending attribution verification."],
  ["monarch-butterfly", "Candidates show a chrysalis or distant cluster; retain the clear original adult pending attribution verification."],
  ["moose", "Candidates are a fish close-up and dead moose; retain the clear original living moose pending attribution verification."],
  ["northern-river-terrapin", "Candidates are distant or handling scenes; retain the clearer original pending attribution verification."],
  ["northern-goshawk", "Candidates show a distant aerial interaction; retain the clear original Eurasian Goshawk pending attribution verification."],
  ["platypus", "Candidates obscure most of the animal in water; retain the clearer original pending attribution verification."],
  ["przewalskis-gazelle", "The only candidate is less diagnostic than the published animal; retain the original pending attribution verification."],
  ["red-junglefowl", "Candidates are obscured by a sign or resemble admixed free-ranging chickens; retain the diagnostic original pending attribution verification."],
  ["reindeer", "Candidates are a carcass or distant running animal; retain the clearer original pending attribution verification."],
  ["rueppells-fox", "All candidates show a very distant animal; retain the clear original pending attribution verification."],
  ["saola", "Candidates are a constrained animal, market remains, or an unclear doorway scene; retain the clear original pending attribution verification."],
  ["sea-otter", "All candidates show skulls rather than a living animal; retain the clear original pending attribution verification."],
  ["spectacled-bear", "All candidates are distant or partly obscured; retain the clear original portrait pending attribution verification."],
  ["spotted-hyena", "Candidates are washed out or less diagnostic than the original; retain the clear original pending attribution verification."],
  ["stresemanns-bristlefront", "The only candidate is a distribution map, not an animal; retain the clear original bird pending attribution verification."],
  ["striped-skunk", "Candidates show neonates or distant animals; retain the clear original pending attribution verification."],
  ["swan-goose", "Candidates are distant groups; retain the clear original individual pending attribution verification."],
  ["takin", "All candidates show animals too distant for reliable hero-image identification; retain the clear original pending attribution verification."],
  ["thorn-bug", "All candidates are unrelated birds; retain the correct original thorn bug pending attribution verification."],
  ["tibetan-antelope", "All candidates are very distant; retain the clearer original pending attribution verification."],
  ["vaquita", "Candidates are blank/underexposed or a toy; retain the clear original pending attribution verification."],
  ["wallaces-giant-bee", "Candidates are line drawings; retain the clearer original specimen image pending attribution verification."],
  ["west-indian-manatee", "All candidates show carcasses; retain the clear original living manatee pending attribution verification."],
  ["yangtze-finless-porpoise", "Candidates show only a distant back at low clarity; retain the clear original pending attribution verification."],
  ["yangtze-giant-softshell-turtle", "No sufficiently large open-license exact-taxon candidate was found; retain the original pending attribution verification."],
]);

// Candidate 1 is the default. Overrides are the clearest living, species-relevant
// view after inspecting all overview pages and the expanded candidate sheets.
const selectedCandidate = new Map([
  ["mountain-lion", 3],
  ["mute-swan", 3],
  ["northern-potoo", 3],
  ["pelican-eel", 3],
  ["plains-zebra", 2],
  ["scarlet-macaw", 2],
  ["serval", 3],
  ["upland-buzzard", 3],
  ["western-gorilla", 3],
  ["whale-shark", 2],
  ["whiskered-screech-owl", 2],
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
    visual_result: "exact-taxon candidate approved after overview and expanded visual review; maps, drawings, signs, toys, carcasses, unclear subjects and wrong-species candidates rejected",
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
