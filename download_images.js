const fs = require("fs");
const path = require("path");
const {
  inspectImage,
  readAnimals,
} = require("./scripts/lib/animal-schema");

const ROOT = __dirname;
const ANIMALS_DIR = path.join(ROOT, "data", "animals");
const OUTPUT_DIR = path.join(ROOT, "public", "images", "animals");
const REVIEW_DIR = path.join(ROOT, ".image-review");
const MANIFEST_PATH = path.join(ROOT, "data", "image-attribution.json");
const DELAY_MS = 1100;
const ALLOWED_LICENSES = new Set(["cc0", "cc-by", "cc-by-sa"]);
const TAXON_SEARCH_ALIASES = new Map([
  ["acipenser sinensis", "Sinosturio sinensis"],
  ["accipiter gentilis", "Astur gentilis"],
  ["cicinnurus respublica", "Diphyllodes respublica"],
  ["lagenorhynchus obscurus", "Aethalodelphis obscurus"],
  ["nycticebus pygmaeus", "Xanthonycticebus pygmaeus"],
  ["ranoidea caerulea", "Litoria caerulea"],
  ["strigops habroptila", "Strigops habroptilus"],
  ["sus domesticus", "Sus scrofa"],
]);
const USER_AGENT = `WildExplorer/2.0 (${process.env.INAT_CONTACT || "https://animal.prismbase.org"})`;

function parseArgs(argv) {
  const args = { ids: [], exclude: [], batch: null, decisions: null, candidateCount: 5, force: false, unverifiedOnly: false, wikimediaOnly: false, approve: [], reject: [], hide: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--ids") args.ids = (argv[++index] || "").split(",").filter(Boolean);
    else if (value === "--exclude") args.exclude = (argv[++index] || "").split(",").filter(Boolean);
    else if (value === "--batch") args.batch = argv[++index] || null;
    else if (value === "--decisions") args.decisions = argv[++index] || null;
    else if (value === "--candidate-count") args.candidateCount = Number(argv[++index] || 5);
    else if (value === "--force") args.force = true;
    else if (value === "--unverified-only") args.unverifiedOnly = true;
    else if (value === "--wikimedia-only") args.wikimediaOnly = true;
    else if (value === "--approve") args.approve = (argv[++index] || "").split(",").filter(Boolean);
    else if (value === "--reject") args.reject = (argv[++index] || "").split(",").filter(Boolean);
    else if (value === "--hide") args.hide = (argv[++index] || "").split(",").filter(Boolean);
    else if (value === "--help") args.help = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  return args;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
    if (response.ok) return response.json();
    if (response.status !== 429 || attempt === 3) throw new Error(`HTTP ${response.status}: ${url}`);
    await delay(attempt * 2000);
  }
  throw new Error(`Failed to fetch ${url}`);
}

async function download(url, destination) {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT }, redirect: "follow" });
  if (!response.ok) throw new Error(`Image HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) throw new Error(`Unexpected content type: ${contentType}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const temporary = `${destination}.tmp`;
  fs.writeFileSync(temporary, buffer);
  const info = inspectImage(temporary);
  if (!info.mime || (info.width || 0) < 600 || (info.height || 0) < 400) {
    fs.unlinkSync(temporary);
    throw new Error(`Candidate is invalid or too small (${info.width || "?"}x${info.height || "?"})`);
  }
  fs.renameSync(temporary, destination);
  return info;
}

function normalizedName(value) {
  return String(value || "").trim().toLowerCase();
}

async function resolveExactTaxon(scientificName) {
  const queryName = TAXON_SEARCH_ALIASES.get(normalizedName(scientificName)) || scientificName;
  const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(queryName)}&rank=species&per_page=30`;
  const data = await fetchJson(url);
  const target = normalizedName(queryName);
  const exact = data.results?.find((taxon) =>
    normalizedName(taxon.name) === target
    || (taxon.matched_term && normalizedName(taxon.matched_term) === target)
  );
  if (!exact) throw new Error(`No exact iNaturalist species match for ${scientificName}`);
  return exact;
}

async function getCandidates(taxon, count) {
  const url = "https://api.inaturalist.org/v1/observations"
    + `?taxon_id=${taxon.id}&photos=true&quality_grade=research&per_page=100`
    + "&order_by=votes&order=desc";
  const data = await fetchJson(url);
  const photos = [];
  const seen = new Set();
  for (const observation of data.results || []) {
    for (const photo of observation.photos || []) {
      if (seen.has(photo.id) || !ALLOWED_LICENSES.has(normalizedName(photo.license_code))) continue;
      const dimensions = photo.original_dimensions || {};
      if ((dimensions.width || 0) < 600 || (dimensions.height || 0) < 400) continue;
      seen.add(photo.id);
      photos.push({
        source: "iNaturalist",
        source_url: `https://www.inaturalist.org/observations/${observation.id}`,
        photo_id: photo.id,
        observation_id: observation.id,
        url: photo.url.replace(/\/square\./, "/large."),
        original_url: photo.url.replace(/\/square\./, "/original."),
        attribution: photo.attribution || null,
        license_code: normalizedName(photo.license_code),
        width: dimensions.width,
        height: dimensions.height,
        observed_on: observation.observed_on || null,
        place_guess: observation.place_guess || null,
      });
      if (photos.length >= count) return photos;
    }
  }
  return photos;
}

function stripHtml(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function getWikimediaCandidates(scientificName, count) {
  const url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search"
    + `&gsrsearch=${encodeURIComponent(scientificName)}&gsrnamespace=6&gsrlimit=30`
    + "&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiurlwidth=1600&format=json&origin=*";
  const data = await fetchJson(url);
  const candidates = [];
  for (const page of Object.values(data.query?.pages || {})) {
    const info = page.imageinfo?.[0];
    if (!info?.thumburl || !String(info.mime || "").startsWith("image/")) continue;
    if ((info.thumbwidth || info.width || 0) < 600 || (info.thumbheight || info.height || 0) < 400) continue;
    const metadata = info.extmetadata || {};
    const license = stripHtml(metadata.LicenseShortName?.value).toLowerCase().replace(/\s+/g, "-");
    const permitted = license.includes("cc0")
      || license.includes("cc-by")
      || license.includes("public-domain")
      || license === "pd";
    if (!permitted) continue;
    candidates.push({
      source: "Wikimedia Commons",
      source_url: info.descriptionurl,
      photo_id: String(page.pageid),
      observation_id: null,
      url: info.thumburl,
      original_url: info.url,
      attribution: stripHtml(metadata.Artist?.value || metadata.Credit?.value || page.title),
      license_code: license,
      width: info.thumbwidth || info.width,
      height: info.thumbheight || info.height,
      observed_on: null,
      place_guess: "Wikimedia Commons",
    });
    if (candidates.length >= count) break;
  }
  return candidates;
}

function htmlEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[character]));
}

function writeReviewPage(animal, taxon, candidates, directory) {
  const cards = candidates.map((candidate, index) => `
    <article>
      <img src="${index + 1}.jpg" alt="Candidate ${index + 1}">
      <h2>Candidate ${index + 1}</h2>
      <p>${htmlEscape(candidate.attribution)} · ${htmlEscape(candidate.license_code.toUpperCase())}</p>
      <p>${candidate.width}×${candidate.height} · ${htmlEscape(candidate.place_guess || "Unknown location")}</p>
      <p><a href="${htmlEscape(candidate.source_url)}">Open source</a></p>
      <code>node download_images.js --approve ${animal.id}:${index + 1}</code>
    </article>`).join("\n");
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>${htmlEscape(animal.name_en)} image review</title>
  <style>body{font:16px system-ui;margin:32px;background:#f8fafc;color:#172033}header{max-width:900px;margin:auto}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;margin-top:24px}article{background:white;padding:16px;border-radius:16px;box-shadow:0 3px 16px #0001}img{width:100%;height:280px;object-fit:contain;background:#111;border-radius:10px}code{display:block;overflow:auto;background:#eef2ff;padding:10px;border-radius:8px}</style>
  <header><h1>${htmlEscape(animal.name_en)} / ${htmlEscape(animal.name_zh)}</h1><p>Target: <i>${htmlEscape(animal.scientific_name)}</i> · Exact iNaturalist taxon: ${htmlEscape(taxon.name)} (#${taxon.id})</p><strong>Do not publish until a candidate is visually confirmed as the target species.</strong></header><main>${cards}</main></html>`;
  fs.writeFileSync(path.join(directory, "review.html"), html, "utf8");
}

async function prepareAnimal(animal, count, { wikimediaOnly = false } = {}) {
  const directory = path.join(REVIEW_DIR, animal.id);
  fs.mkdirSync(directory, { recursive: true });
  const taxon = await resolveExactTaxon(animal.scientific_name);
  await delay(DELAY_MS);
  const candidates = wikimediaOnly ? [] : await getCandidates(taxon, count);
  if (wikimediaOnly || candidates.length < count) {
    await delay(DELAY_MS);
    const wikimedia = await getWikimediaCandidates(animal.scientific_name, count - candidates.length);
    candidates.push(...wikimedia);
  }
  if (candidates.length === 0) throw new Error("No sufficiently large CC0/CC BY/CC BY-SA research-grade candidates");
  const downloaded = [];
  for (const candidate of candidates) {
    const destination = path.join(directory, `${downloaded.length + 1}.jpg`);
    try {
      const info = await download(candidate.url, destination);
      downloaded.push({ ...candidate, sha256: info.sha256, downloaded_width: info.width, downloaded_height: info.height });
    } catch (error) {
      console.warn(`  ⚠️ Skipped photo ${candidate.photo_id}: ${error.message}`);
    }
    await delay(DELAY_MS);
  }
  if (downloaded.length === 0) throw new Error("All candidate downloads failed QC");
  const review = {
    animal_id: animal.id,
    scientific_name: animal.scientific_name,
    taxon: { id: taxon.id, name: taxon.name, url: `https://www.inaturalist.org/taxa/${taxon.id}` },
    prepared_at: new Date().toISOString(),
    candidates: downloaded,
  };
  fs.writeFileSync(path.join(directory, "review.json"), `${JSON.stringify(review, null, 2)}\n`, "utf8");
  writeReviewPage(animal, taxon, downloaded, directory);
  console.log(`✅ ${animal.id}: prepared ${downloaded.length} candidates → ${path.relative(ROOT, path.join(directory, "review.html"))}`);
}

function loadManifest() {
  return fs.existsSync(MANIFEST_PATH) ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) : {};
}

function approveSelection(selection, animalsById) {
  const match = selection.match(/^([a-z0-9-]+):(\d+)$/);
  if (!match) throw new Error(`Approval must look like animal-id:1, received ${selection}`);
  const [, id, rawIndex] = match;
  const animal = animalsById.get(id);
  if (!animal) throw new Error(`Unknown animal id: ${id}`);
  const reviewPath = path.join(REVIEW_DIR, id, "review.json");
  if (!fs.existsSync(reviewPath)) throw new Error(`No prepared review for ${id}`);
  const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  const index = Number(rawIndex) - 1;
  const candidate = review.candidates[index];
  if (!candidate) throw new Error(`Candidate ${rawIndex} does not exist for ${id}`);
  if (normalizedName(review.scientific_name) !== normalizedName(animal.scientific_name)) {
    throw new Error(`${id}: scientific name changed after candidate preparation; prepare again`);
  }

  const sourcePath = path.join(REVIEW_DIR, id, `${index + 1}.jpg`);
  const sourceInfo = inspectImage(sourcePath);
  for (const file of fs.readdirSync(OUTPUT_DIR).filter((name) => name.endsWith(".jpg") && name !== `${id}.jpg`)) {
    if (inspectImage(path.join(OUTPUT_DIR, file)).sha256 === sourceInfo.sha256) {
      throw new Error(`${id}: selected image duplicates ${file}`);
    }
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const destination = path.join(OUTPUT_DIR, `${id}.jpg`);
  const temporary = `${destination}.tmp`;
  fs.copyFileSync(sourcePath, temporary);
  fs.renameSync(temporary, destination);

  animal.image = `/images/animals/${id}.jpg`;
  fs.writeFileSync(path.join(ANIMALS_DIR, `${id}.json`), `${JSON.stringify(animal, null, 2)}\n`, "utf8");
  const manifest = loadManifest();
  manifest[id] = {
    source: candidate.source,
    source_url: candidate.source_url,
    taxon_url: review.taxon.url,
    taxon_id: review.taxon.id,
    taxon_name: review.taxon.name,
    photo_id: candidate.photo_id,
    attribution: candidate.attribution,
    license_code: candidate.license_code,
    license_status: "verified",
    review_status: "human-approved",
    reviewed_at: new Date().toISOString(),
    sha256: sourceInfo.sha256,
    width: sourceInfo.width,
    height: sourceInfo.height,
  };
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`✅ ${id}: candidate ${rawIndex} published with attribution metadata.`);
}

function rejectSelections(ids, animalsById) {
  const manifest = loadManifest();
  for (const id of ids) {
    if (!animalsById.has(id)) throw new Error(`Unknown animal id: ${id}`);
    manifest[id] = {
      ...(manifest[id] || {}),
      review_status: "replacement-needed",
      review_note: "No exact, visually suitable, sufficiently large openly licensed replacement was approved.",
      reviewed_at: new Date().toISOString(),
    };
    console.log(`⚠️ ${id}: retained current image and marked it as replacement-needed.`);
  }
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function hideUnverifiedImages(ids, animalsById) {
  const manifest = loadManifest();
  const quarantineDirectory = path.join(ROOT, "public", "images", "quarantine");
  fs.mkdirSync(quarantineDirectory, { recursive: true });
  for (const id of ids) {
    const animal = animalsById.get(id);
    if (!animal) throw new Error(`Unknown animal id: ${id}`);
    const publishedPath = path.join(OUTPUT_DIR, `${id}.jpg`);
    const quarantinePath = path.join(quarantineDirectory, `${id}.jpg`);
    if (fs.existsSync(publishedPath)) {
      if (fs.existsSync(quarantinePath)) {
        throw new Error(`${id}: quarantine target already exists; resolve it before hiding the published image`);
      }
      fs.renameSync(publishedPath, quarantinePath);
    }
    animal.image = null;
    fs.writeFileSync(path.join(ANIMALS_DIR, `${id}.json`), `${JSON.stringify(animal, null, 2)}\n`, "utf8");
    manifest[id] = {
      ...(manifest[id] || {}),
      review_status: "hidden-unverified",
      review_note: "The previous image could not be verified to species level and was moved to quarantine.",
      reviewed_at: new Date().toISOString(),
    };
    console.log(`🚫 ${id}: removed the unverified image from publication and moved it to quarantine.`);
  }
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log("Prepare: node download_images.js --ids arctic-fox,red-panda --force");
    console.log("Wikimedia only: node download_images.js --ids american-crow --force --wikimedia-only");
    console.log("Approve: node download_images.js --approve arctic-fox:1,red-panda:2");
    console.log("Reject: node download_images.js --reject arctic-fox,red-panda");
    console.log("Hide unverified: node download_images.js --hide arctic-fox,red-panda");
    console.log("Batch unverified: node download_images.js --batch legacy-qc-batch-04 --unverified-only --force --exclude animal-id");
    return;
  }
  const records = readAnimals(ANIMALS_DIR);
  const animalsById = new Map(records.map(({ animal }) => [animal.id, animal]));
  if (args.decisions) {
    const decisionsPath = path.isAbsolute(args.decisions) ? args.decisions : path.join(ROOT, args.decisions);
    const decisions = JSON.parse(fs.readFileSync(decisionsPath, "utf8"));
    args.approve = (decisions.approvals || []).map((decision) => decision.selection);
  }
  if (args.batch) {
    const baselinePath = path.join(ROOT, "docs", "qc-batches", `${args.batch}-baseline.json`);
    const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
    args.ids = baseline.animals.map((animal) => animal.id);
  }
  if (args.reject.length > 0) {
    rejectSelections(args.reject, animalsById);
    return;
  }
  if (args.hide.length > 0) {
    hideUnverifiedImages(args.hide, animalsById);
    return;
  }
  if (args.approve.length > 0) {
    for (const selection of args.approve) approveSelection(selection, animalsById);
    return;
  }
  const manifest = loadManifest();
  const selected = records.map(({ animal }) => animal).filter((animal) => {
    if (args.ids.length > 0 && !args.ids.includes(animal.id)) return false;
    if (args.exclude.includes(animal.id)) return false;
    if (args.unverifiedOnly && manifest[animal.id]?.license_status === "verified" && manifest[animal.id]?.review_status === "human-approved") return false;
    return args.force || !animal.image || !fs.existsSync(path.join(OUTPUT_DIR, `${animal.id}.jpg`));
  });
  if (selected.length === 0) {
    console.log("No animals need image preparation. Use --ids ... --force to replace existing images.");
    return;
  }
  for (const animal of selected) {
    try {
      await prepareAnimal(animal, args.candidateCount, { wikimediaOnly: args.wikimediaOnly });
    } catch (error) {
      console.error(`❌ ${animal.id}: ${error.message}`);
    }
    await delay(DELAY_MS);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
