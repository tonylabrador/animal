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
const BATCH_SIZE = 5;

const GENERATE_PROMPT = `You create fact-checked bilingual species records for Wild Explorer, a children's wildlife encyclopedia.
Return exactly one raw JSON object, with no Markdown.

Rules:
- The requested scientific name is authoritative. Never silently substitute a fuzzy search result.
- Use species-level binomial nomenclature. Domestic forms may use an explicitly supplied accepted binomial.
- ui_tags must contain exactly [Class, Habitat, Diet].
- Class: Mammal, Bird, Reptile, Amphibian, Fish, Insect, Arachnid, Crustacean, Mollusk, Cnidarian, Invertebrate.
- Habitat: Forest, Grassland, Savanna, Desert, Mountains, Ocean, Freshwater, Wetland, Tundra, Coastal, Coral Reef, Urban, Farm, Cave, Island, Global.
- Diet: Carnivore, Herbivore, Omnivore, Insectivore, Frugivore, Piscivore, Scavenger, Filter Feeder, Nectarivore, Sanguivore, Detritivore, Parasitoid, Fungivore.
- IUCN code must be EX, EW, CR, EN, VU, NT, LC, DD, or NE, with the canonical English and Chinese label.
- All map coordinates are [latitude, longitude]. A polygon must be a closed non-rectangular ring of verified range coordinates. When no trustworthy range geometry is available, use []. Never invent a bounding box.
- Write clear, accurate text for a 9-year-old reader: concise overview plus 2-3 sentences per encyclopedia section.
- image must be null.
- Include sources.taxonomy and sources.conservation with authority, source URL when known, and checked_at.

Schema:
{"id":"kebab-case","name_zh":"...","name_en":"...","scientific_name":"Genus species","ui_tags":["Class","Habitat","Diet"],"taxonomy":{"kingdom":{"en":"Animalia","zh":"动物界"},"phylum":{"en":"...","zh":"..."},"class":{"en":"...","zh":"..."},"order":{"en":"...","zh":"..."},"family":{"en":"...","zh":"..."},"genus":{"en":"...","zh":"..."}},"conservation_status":{"code":"...","en":"...","zh":"..."},"description":{"en":"...","zh":"..."},"encyclopedia":{"anatomy":{"en":"...","zh":"..."},"ecology_and_behavior":{"en":"...","zh":"..."},"habitat_and_distribution":{"en":"...","zh":"..."}},"habitat":{"text_en":"...","text_zh":"...","map_coordinates":[0,0],"map_zoom_level":4,"global_distribution_polygons":[]},"image":null,"sources":{"taxonomy":{"authority":"...","url":"...","checked_at":"YYYY-MM-DD"},"conservation":{"authority":"IUCN Red List","url":"...","checked_at":"YYYY-MM-DD"}}}`;

function parseArgs() {
  const index = process.argv.indexOf("--finalize");
  return { finalize: index >= 0 ? (process.argv[index + 1] || "").split(",").filter(Boolean) : [] };
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
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      messages: [
        { role: "system", content: GENERATE_PROMPT },
        { role: "user", content: `${entry.zh} | ${entry.en} | ${entry.scientific}` },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });
  if (!response.ok) throw new Error(`DeepSeek HTTP ${response.status}`);
  const data = await response.json();
  return JSON.parse(data.choices?.[0]?.message?.content || "");
}

function writeAtomic(filePath, content) {
  const temporary = `${filePath}.tmp`;
  fs.writeFileSync(temporary, content, "utf8");
  fs.renameSync(temporary, filePath);
}

async function prepareDraft() {
  const existingDraft = JSON.parse(fs.readFileSync(DRAFT_PATH, "utf8"));
  if (!Array.isArray(existingDraft) || existingDraft.length > 0) {
    throw new Error("Draft is not empty. Import, archive, or clear it deliberately before preparing another batch.");
  }
  const { entries } = parseWishlist();
  const batch = entries.slice(0, BATCH_SIZE);
  if (batch.length === 0) {
    console.log("✅ No pending wishlist entries.");
    return;
  }

  const generated = [];
  for (const entry of batch) {
    console.log(`Generating draft: ${entry.zh} / ${entry.en}`);
    const animal = await callGenerator(entry);
    if (entry.scientific !== "—" && animal.scientific_name.toLowerCase() !== entry.scientific.toLowerCase()) {
      throw new Error(`${entry.en}: generator changed scientific name from ${entry.scientific} to ${animal.scientific_name}`);
    }
    const result = validateAnimal(animal);
    if (result.errors.length > 0) throw new Error(`${entry.en}: ${result.errors.join("; ")}`);
    generated.push(animal);
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
    const result = validateAnimal(animal, { fileName: `${id}.json` });
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
  const rows = animals.map((animal) => `| - | ${animal.name_zh} | ${animal.name_en} | ${animal.scientific_name} | [Link](https://wild-explorer.vercel.app/animal/${animal.id}) |`).join("\n");
  writeAtomic(RECENT_PATH, `${recentContent.trimEnd()}\n${rows}\n`);
  console.log(`✅ Finalized ${ids.length} approved animals and removed only their exact wishlist rows.`);
}

const args = parseArgs();
Promise.resolve(args.finalize.length > 0 ? finalize(args.finalize) : prepareDraft()).catch((error) => {
  console.error(`❌ ${error.message}`);
  process.exit(1);
});
