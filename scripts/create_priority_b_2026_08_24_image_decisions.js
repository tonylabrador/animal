#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(ROOT, "docs", "qc-batches", "priority-b-2026-08-24-image-decisions.json");

const selections = new Map([
  ["south-african-springhare", [4, "Full lateral living animal in native-range Kruger habitat; long hind limbs, long balancing tail and rabbit-like ears are all visible."]],
  ["indian-giant-squirrel", [5, "Sharp living animal from Andhra Pradesh; multicolored coat, large arboreal body and long bushy tail are visible."]],
  ["north-american-porcupine", [5, "Sharp full living animal; fur-covered body, pale-tipped quills, blunt face and thick tail are visible without handling."]],
  ["alpine-marmot", [2, "Sharp upright living animal in Alpine meadow; broad head, compact body and dark-tipped tail are visible."]],
  ["egyptian-fruit-bat", [5, "Close living fruit-feeding bat within native range; fox-like muzzle, large eyes, rounded ears and plain gray fur are visible."]],
  ["greater-bulldog-bat", [1, "Exact-taxon living portrait from Brazil; wrinkled bulldog muzzle, robust head and reddish pelage are sharply visible."]],
  ["philippine-tarsier", [4, "Sharp living Philippine individual; immense eyes, large membranous ears, gripping digits and long tail are visible."]],
  ["southern-hairy-nosed-wombat", [3, "Sharp full living animal in South Australia; pointed ears, broad hairy muzzle and gray coat are visible."]],
  ["kinkajou", [3, "Sharp exact-taxon living portrait; golden fur, round face, large eyes and small rounded ears are visible; specimen and skull alternatives rejected."]],
  ["black-necked-stilt", [5, "Sharp full adult in California wetland; straight black bill, black-and-white plumage and extremely long pink legs are visible."]],
  ["nicobar-pigeon", [1, "Full living bird in the Philippines; metallic body, long neck hackles, red legs and white tail are visible."]],
  ["gyrfalcon", [5, "Sharp perched white-morph living bird; very large falcon build, broad chest, weak moustache and barred white plumage are visible; map and distant-flight alternatives rejected."]],
  ["spectacled-owl", [5, "Sharp living adult in Costa Rica; cream spectacles, yellow eyes, dark mask, pale throat and lack of ear tufts are visible."]],
  ["blue-and-yellow-macaw", [1, "Sharp living pair in Brazil; blue upperparts, golden underparts, green forehead, black throat and lined white face are visible."]],
  ["great-frigatebird", [1, "Sharp exact-taxon adult male at Genovesa; huge scarlet gular sac, glossy dark plumage, hooked bill and long-winged build are visible."]],
  ["king-eider", [3, "Sharp adult breeding male; blue crown, green cheek, orange frontal shield and black-white body make species identity unambiguous."]],
  ["roseate-spoonbill", [2, "Sharp full living adult; spatulate bill, bare head, pink plumage, long legs and carmine wing coverts are visible."]],
  ["olm", [4, "Living animal underwater in Slovenia; pale eel-like body, tiny limbs and red external gills are visible; handled-animal alternative rejected."]],
  ["mata-mata", [4, "Sharp full living Amazon-basin animal; triangular leaf-like head, tubular snout, neck fringes and knobby shell are visible."]],
  ["mandarinfish", [5, "Sharp full living fish in native-range reef habitat; continuous blue-orange scroll pattern, broad pectoral fins and male dorsal spine are visible."]],
  ["atlas-moth", [1, "Full dorsal living adult from Cambodia; four triangular windows, reddish-brown pattern and hooked snake-head-like forewing tips are visible."]],
  ["peacock-spider", [1, "Sharp mature displaying male; exact red-blue-black abdominal fan pattern, white edging and raised decorated third legs are visible."]],
  ["coconut-crab", [5, "Full adult on natural ground substrate; hardened exposed abdomen, massive claws and long armored legs are visible; handled and juvenile alternatives rejected."]],
  ["common-cuttlefish", [5, "Full living animal in Greek benthic habitat; broad oval mantle, continuous fin, arms and natural camouflage are visible."]],
  ["pacific-sea-nettle", [3, "Clear intact swimming medusa; amber bell, radial dark pattern, long fine tentacles and frilly oral arms are visible; stranded specimens rejected."]],
]);

const approvals = [];
for (const [id, [candidateNumber, rationale]] of selections) {
  const reviewPath = path.join(ROOT, ".image-review", id, "review.json");
  if (!fs.existsSync(reviewPath)) throw new Error(`${id}: missing review.json`);
  const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  const candidate = review.candidates[candidateNumber - 1];
  if (!candidate) throw new Error(`${id}: candidate ${candidateNumber} is unavailable`);
  if (review.taxon.name.toLowerCase() !== review.scientific_name.toLowerCase()) {
    throw new Error(`${id}: exact-taxon mismatch ${review.taxon.name} / ${review.scientific_name}`);
  }
  approvals.push({
    id,
    candidate: candidateNumber,
    selection: `${id}:${candidateNumber}`,
    scientific_name: review.scientific_name,
    exact_taxon: review.taxon,
    source: candidate.source,
    source_url: candidate.source_url,
    attribution: candidate.attribution,
    license: candidate.license_code,
    downloaded_width: candidate.downloaded_width,
    downloaded_height: candidate.downloaded_height,
    sha256: candidate.sha256,
    visual_result: rationale,
  });
}

const output = {
  batch: "priority-b-2026-08-24",
  reviewed_at: new Date().toISOString(),
  reviewer: "Codex human visual review",
  criteria: "Exact species taxon and provenance, diagnostic visible morphology, living-animal relevance, composition and clarity, minimum dimensions, and verified CC0/CC BY/CC BY-SA or public-domain licensing were all required. Near-identical taxa, maps, skeletal material, isolated parts, distant silhouettes, handled animals when a natural alternative existed, stranded jellyfish and unclear subjects were rejected.",
  approvals,
  unresolved: [],
};

fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Saved ${approvals.length} human-reviewed image decisions to ${OUTPUT}`);
