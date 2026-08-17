/**
 * Safe wishlist workflow.
 *
 * Prepare the next batch as a validated draft:
 *   node scripts/auto_process_wishlist.js
 *
 * After import and image approval, finalize exact published IDs:
 *   node scripts/auto_process_wishlist.js --finalize arctic-fox,red-panda
 */
require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { validateAnimal } = require("./lib/animal-schema");

const ROOT = path.join(__dirname, "..");
const WISHLIST_PATH = path.join(ROOT, "ANIMAL_WISHLIST.md");
const RECENT_PATH = path.join(ROOT, "RECENTLY_ADDED.md");
const DRAFT_PATH = path.join(ROOT, "_draft_animals.json");
const ANIMALS_DIR = path.join(ROOT, "data", "animals");
const MANIFEST_PATH = path.join(ROOT, "data", "image-attribution.json");
const DEFAULT_BATCH_SIZE = 5;
const EDITORIAL_TAG_OVERRIDES = {
  "Tachyglossus aculeatus": ["Mammal", "Forest", "Insectivore"],
  "Procavia capensis": ["Mammal", "Mountains", "Herbivore"],
  "Rhea americana": ["Bird", "Grassland", "Omnivore"],
  "Fratercula arctica": ["Bird", "Coastal", "Piscivore"],
  "Sphenodon punctatus": ["Reptile", "Island", "Carnivore"],
  "Erinaceus europaeus": ["Mammal", "Urban", "Omnivore"],
  "Condylura cristata": ["Mammal", "Wetland", "Carnivore"],
  "Podiceps cristatus": ["Bird", "Freshwater", "Piscivore"],
  "Buceros bicornis": ["Bird", "Forest", "Frugivore"],
  "Nasikabatrachus sahyadrensis": ["Amphibian", "Forest", "Insectivore"],
  "Galeopterus variegatus": ["Mammal", "Forest", "Herbivore"],
  "Ectophylla alba": ["Mammal", "Forest", "Frugivore"],
  "Ardeotis kori": ["Bird", "Savanna", "Omnivore"],
  "Psittacus erithacus": ["Bird", "Forest", "Frugivore"],
  "Arapaima gigas": ["Fish", "Freshwater", "Piscivore"],
  "Euchoreutes naso": ["Mammal", "Desert", "Omnivore"],
  "Theropithecus gelada": ["Mammal", "Grassland", "Herbivore"],
  "Corythaeola cristata": ["Bird", "Forest", "Frugivore"],
  "Thalassarche melanophris": ["Bird", "Ocean", "Piscivore"],
  "Andrias japonicus": ["Amphibian", "Freshwater", "Carnivore"],
  "Macaca fuscata": ["Mammal", "Forest", "Omnivore"],
  "Saguinus imperator": ["Mammal", "Forest", "Omnivore"],
  "Dendrolagus goodfellowi": ["Mammal", "Forest", "Herbivore"],
  "Arctictis binturong": ["Mammal", "Forest", "Frugivore"],
  "Tapirus pinchaque": ["Mammal", "Mountains", "Herbivore"],
};

const GENERATE_PROMPT = `You create source-backed bilingual species records for Wild Explorer, a children's wildlife encyclopedia.
Return exactly one raw JSON object, with no Markdown. The JSON must use content_version 2 and follow the schema below.

Scientific and editorial rules:
- Keep the requested scientific name exactly unless the request itself is invalid. Use a species-level binomial.
- Verify claims against authoritative or institutional sources. Never invent a URL, measurement, population trend, range polygon, look-alike, or "fun fact".
- Every encyclopedia section, quick fact, adaptation, and rich-content module must include source_keys that exist in the top-level sources object.
- Set content_review factual_qc and bilingual_qc to pending. Generation is not review; a later line-by-line source and translation audit must update them before import.
- Prefer IUCN, Catalogue of Life/GBIF, national museums, zoos with scientific programs, government wildlife agencies, peer-reviewed references, Animal Diversity Web, Birds of the World, FishBase, AmphibiaWeb, Reptile Database, and similarly appropriate authorities.
- Write for a curious 9-year-old: specific, accurate, lively, non-sensational, and 2-4 sentences per prose section. Chinese and English must convey the same facts.
- For unknown or disputed facts, say that they are unknown or disputed. Do not fill gaps with guesses.
- Quick facts: 4-8 sourced items. Use snake_case keys such as lifespan, body_size, weight, diet, activity, social_unit, reproduction, speed, or depth. State a range and context instead of false precision.
- Adaptations: 3-5 items explaining both the feature and its function.
- Did-you-know: 3-5 short, source-backed facts that do not merely repeat another section.
- Class-specific: 1-3 modules suited to the animal (for example bird song/migration/nesting; mammal gestation/lactation/social system; fish depth/salinity/schooling; amphibian metamorphosis/toxins; reptile thermoregulation/venom; insect metamorphosis/host plant/caste; cnidarian sting/life stages).
- ui_tags must contain exactly [Class, Habitat, Diet]. Use only the allowed values enforced by scripts/lib/animal-schema.js.
- IUCN code must use its canonical English and Chinese labels. Population trend is increasing, stable, decreasing, or unknown.
- Coordinates are [latitude, longitude]. Search authoritative spatial sources before falling back to a point. Only include a closed non-rectangular polygon derived from trustworthy range geometry; otherwise use []. Never invent a bounding box.
- habitat.range_review must state whether the map shows verified polygons, an unchanged legacy approximate polygon, or only a representative point; cite the range sources and compare the proposed result with any previous geometry. Preserve old polygons unless clearly wrong. Use legacy-polygon-retained when retaining useful old geometry that has not been replaced by reusable authoritative geometry. New records use previous_result not-applicable; replacement reviews must use retained, replaced, or removed-unverified and explain why in both languages.
- image must be null.

Required shape (all shown fields are required):
{
  "content_version": 2,
  "content_review": {"factual_qc":"pending","bilingual_qc":"pending"},
  "id": "kebab-case",
  "name_zh": "...",
  "name_en": "...",
  "scientific_name": "Genus species",
  "ui_tags": ["Class", "Habitat", "Diet"],
  "taxonomy": {"kingdom":{"en":"Animalia","zh":"动物界"},"phylum":{"en":"...","zh":"..."},"class":{"en":"...","zh":"..."},"order":{"en":"...","zh":"..."},"family":{"en":"...","zh":"..."},"genus":{"en":"...","zh":"..."}},
  "conservation_status": {"code":"...","en":"...","zh":"...","note_en":"optional","note_zh":"optional"},
  "description": {"en":"...","zh":"..."},
  "encyclopedia": {
    "anatomy": {"en":"...","zh":"...","source_keys":["general"]},
    "ecology_and_behavior": {"en":"...","zh":"...","source_keys":["ecology"]},
    "habitat_and_distribution": {"en":"...","zh":"...","source_keys":["range"]}
  },
  "rich_content": {
    "quick_facts": [{"key":"body_size","label":{"en":"Body size","zh":"体型"},"value":{"en":"...","zh":"..."},"source_keys":["general"]}],
    "life_cycle_and_reproduction": {"en":"...","zh":"...","source_keys":["general"]},
    "adaptations": [{"title":{"en":"...","zh":"..."},"detail":{"en":"...","zh":"..."},"source_keys":["general"]}],
    "ecological_role": {"en":"...","zh":"...","source_keys":["ecology"]},
    "conservation_and_threats": {"population_trend":"unknown","threats":{"en":"...","zh":"..."},"actions":{"en":"...","zh":"..."},"source_keys":["conservation"]},
    "identification": {"key_features":{"en":"...","zh":"..."},"similar_species":{"en":"...","zh":"..."},"source_keys":["general"]},
    "communication_and_senses": {"en":"...","zh":"...","source_keys":["general"]},
    "seasonal_calendar": {"en":"...","zh":"...","source_keys":["ecology"]},
    "relationship_with_humans": {"en":"...","zh":"...","source_keys":["general"]},
    "evolution": {"en":"...","zh":"...","source_keys":["taxonomy"]},
    "field_signs": {"en":"...","zh":"...","source_keys":["general"]},
    "did_you_know": [{"text":{"en":"...","zh":"..."},"source_keys":["general"]}],
    "class_specific": [{"title":{"en":"...","zh":"..."},"content":{"en":"...","zh":"..."},"source_keys":["general"]}]
  },
  "habitat": {"text_en":"...","text_zh":"...","map_coordinates":[0,0],"map_zoom_level":4,"global_distribution_polygons":[],"range_review":{"display_mode":"representative-point","previous_result":"not-applicable","source_keys":["range"],"comparison_en":"...","comparison_zh":"...","checked_at":"YYYY-MM-DD"}},
  "image": null,
  "sources": {
    "taxonomy":{"authority":"...","url":"https://...","checked_at":"YYYY-MM-DD"},
    "conservation":{"authority":"IUCN Red List","url":"https://...","checked_at":"YYYY-MM-DD"},
    "general":{"authority":"...","url":"https://...","checked_at":"YYYY-MM-DD"},
    "ecology":{"authority":"...","url":"https://...","checked_at":"YYYY-MM-DD"},
    "range":{"authority":"...","url":"https://...","checked_at":"YYYY-MM-DD"}
  }
}`;

function parseArgs() {
  const index = process.argv.indexOf("--finalize");
  const batchSizeIndex = process.argv.indexOf("--batch-size");
  const requestedBatchSize = batchSizeIndex >= 0 ? Number(process.argv[batchSizeIndex + 1]) : DEFAULT_BATCH_SIZE;
  if (!Number.isInteger(requestedBatchSize) || requestedBatchSize < 1 || requestedBatchSize > 50) {
    throw new Error("--batch-size must be an integer from 1 to 50");
  }
  return {
    finalize: index >= 0 ? (process.argv[index + 1] || "").split(",").filter(Boolean) : [],
    batchSize: requestedBatchSize,
  };
}

function parseWishlist() {
  const content = fs.readFileSync(WISHLIST_PATH, "utf8");
  const entries = [];
  for (const line of content.split("\n")) {
    if (!line.trim().startsWith("|") || line.includes("|---") || line.includes("中文名")) continue;
    const columns = line.split("|").slice(1, -1).map((column) => column.trim());
    if (columns.length < 4 || columns[1] === "—") continue;
    entries.push({ line, zh: columns[1], en: columns[2], scientific: columns[3] });
  }
  return { content, entries };
}

async function callGenerator(entry) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is missing from .env.local");
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages: [
        { role: "system", content: GENERATE_PROMPT },
        { role: "user", content: `${entry.zh} | ${entry.en} | ${entry.scientific}` },
      ],
      temperature: 0.1,
      max_tokens: 20000,
      response_format: { type: "json_object" },
    }),
  });
  if (!response.ok) throw new Error(`DeepSeek HTTP ${response.status}`);
  const data = await response.json();
  const choice = data.choices?.[0];
  if (choice?.finish_reason !== "stop") {
    throw new Error(`DeepSeek generation did not finish cleanly (${choice?.finish_reason || "missing finish reason"})`);
  }
  return JSON.parse(choice.message?.content || "");
}

async function callGeneratorWithRetry(entry, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await callGenerator(entry);
    } catch (error) {
      lastError = error;
      console.warn(`${entry.en}: generation attempt ${attempt}/${attempts} failed (${error.message})`);
    }
  }
  throw lastError;
}

function writeAtomic(filePath, content) {
  const temporary = `${filePath}.tmp`;
  fs.writeFileSync(temporary, content, "utf8");
  fs.renameSync(temporary, filePath);
}

function releaseDateInLosAngeles() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function parseRecentRows(content) {
  const rows = [];
  for (const line of content.split("\n")) {
    if (!line.trim().startsWith("|") || line.includes("|---") || line.includes("加入日期")) continue;
    const columns = line.split("|").slice(1, -1).map((column) => column.trim());
    if (columns.length < 5) continue;
    const hasDate = columns.length >= 6;
    const link = columns[hasDate ? 5 : 4];
    const id = link.match(/\/animal\/([^)]+)/)?.[1];
    if (!id) continue;
    rows.push({
      date: hasDate ? columns[1] : "—",
      zh: columns[hasDate ? 2 : 1],
      en: columns[hasDate ? 3 : 2],
      scientific: columns[hasDate ? 4 : 3],
      id,
    });
  }
  return rows;
}

function renderRecentlyAdded(rows) {
  const header = `# ✅ Recently Added Animals

> Newest additions are listed first. Entries added in the same release use reverse insertion order, so the last animal added appears first.

| # | 加入日期 | 中文名 | English Name | Scientific Name | Link |
|---|----------|--------|--------------|-----------------|------|`;
  const body = rows.map((row, index) =>
    `| ${index + 1} | ${row.date || "—"} | ${row.zh} | ${row.en} | ${row.scientific} | [Link](https://animal.prismbase.org/animal/${row.id}) |`
  ).join("\n");
  return `${header}\n${body}\n`;
}

async function prepareDraft(batchSize) {
  const existingDraft = JSON.parse(fs.readFileSync(DRAFT_PATH, "utf8"));
  if (!Array.isArray(existingDraft) || existingDraft.length > 0) {
    throw new Error("Draft is not empty. Import, archive, or clear it deliberately before preparing another batch.");
  }
  const { entries } = parseWishlist();
  const batch = entries.slice(0, batchSize);
  if (batch.length === 0) {
    console.log("✅ No pending wishlist entries.");
    return;
  }

  const generated = [];
  const generationConcurrency = Math.min(3, batch.length);
  for (let offset = 0; offset < batch.length; offset += generationConcurrency) {
    const entries = batch.slice(offset, offset + generationConcurrency);
    const records = await Promise.all(entries.map(async (entry) => {
      console.log(`Generating draft: ${entry.zh} / ${entry.en}`);
      const animal = await callGeneratorWithRetry(entry);
      if (EDITORIAL_TAG_OVERRIDES[entry.scientific]) {
        animal.ui_tags = EDITORIAL_TAG_OVERRIDES[entry.scientific];
      }
      if (entry.scientific !== "—" && animal.scientific_name.toLowerCase() !== entry.scientific.toLowerCase()) {
        throw new Error(`${entry.en}: generator changed scientific name from ${entry.scientific} to ${animal.scientific_name}`);
      }
      const result = validateAnimal(animal, { requireRichContent: true });
      if (result.errors.length > 0) throw new Error(`${entry.en}: ${result.errors.join("; ")}`);
      return animal;
    }));
    generated.push(...records);
  }
  writeAtomic(DRAFT_PATH, `${JSON.stringify(generated, null, 2)}\n`);
  console.log(`✅ Prepared ${generated.length} validated draft records. Wishlist was not modified.`);
  console.log("Review the draft, then run: node import_animals.js --dry-run");
}

function finalize(ids) {
  if (ids.length === 0) throw new Error("--finalize requires a comma-separated list of exact animal IDs");
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const animals = [];
  for (const id of ids) {
    const filePath = path.join(ANIMALS_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) throw new Error(`${id}: published JSON does not exist`);
    const animal = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const result = validateAnimal(animal, {
      fileName: `${id}.json`,
      requireRichContent: true,
      requireReview: true,
    });
    if (result.errors.length > 0) throw new Error(`${id}: ${result.errors.join("; ")}`);
    if (manifest[id]?.review_status !== "human-approved" || manifest[id]?.license_status !== "verified") {
      throw new Error(`${id}: image has not passed licensed human approval`);
    }
    animals.push(animal);
  }

  execFileSync(process.execPath, [path.join(ROOT, "validate_animals.js")], { stdio: "inherit", cwd: ROOT });
  execFileSync(process.execPath, [path.join(ROOT, "update_animals_list.js")], { stdio: "inherit", cwd: ROOT });
  execFileSync(process.execPath, [path.join(ROOT, "build_taxonomy_tree.js")], { stdio: "inherit", cwd: ROOT });

  const { content, entries } = parseWishlist();
  const removeKeys = new Set(animals.flatMap((animal) => [animal.name_en.toLowerCase(), animal.scientific_name.toLowerCase()]));
  const linesToRemove = new Set(entries
    .filter((entry) => removeKeys.has(entry.en.toLowerCase()) || removeKeys.has(entry.scientific.toLowerCase()))
    .map((entry) => entry.line));
  const nextWishlist = content.split("\n").filter((line) => !linesToRemove.has(line)).join("\n");
  writeAtomic(WISHLIST_PATH, nextWishlist);

  const recentContent = fs.existsSync(RECENT_PATH) ? fs.readFileSync(RECENT_PATH, "utf8") : "";
  const finalizedIds = new Set(animals.map((animal) => animal.id));
  const priorRows = parseRecentRows(recentContent).filter((row) => !finalizedIds.has(row.id));
  const date = releaseDateInLosAngeles();
  const newRows = [...animals].reverse().map((animal) => ({
    date,
    zh: animal.name_zh,
    en: animal.name_en,
    scientific: animal.scientific_name,
    id: animal.id,
  }));
  writeAtomic(RECENT_PATH, renderRecentlyAdded([...newRows, ...priorRows]));
  console.log(`✅ Finalized ${ids.length} approved animals and removed only their exact wishlist rows.`);
}

const args = parseArgs();
Promise.resolve(args.finalize.length > 0 ? finalize(args.finalize) : prepareDraft(args.batchSize)).catch((error) => {
  console.error(`❌ ${error.message}`);
  process.exit(1);
});
