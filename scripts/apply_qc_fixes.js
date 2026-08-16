const fs = require("fs");
const path = require("path");
const {
  STATUS_LABELS,
  inspectImage,
  isAxisAlignedRectangle,
  pointIsValid,
  pointsEqual,
  readAnimals,
} = require("./lib/animal-schema");

const ROOT = path.join(__dirname, "..");
const ANIMALS_DIR = path.join(ROOT, "data", "animals");
const IMAGES_DIR = path.join(ROOT, "public", "images", "animals");
const QUARANTINE_DIR = path.join(ROOT, "public", "images", "quarantine");
const MANIFEST_PATH = path.join(ROOT, "data", "image-attribution.json");
const CHECKED_AT = "2026-08-16";

const scientificNameFixes = {
  "blue-footed-booby": "Sula nebouxii",
  "giraffe-stag-beetle": "Prosopocoilus girafa",
  "white-winged-vampire-bat": "Diaemus youngii",
  "indian-flying-fox": "Pteropus medius",
  "yangtze-finless-porpoise": "Neophocaena asiaeorientalis",
  "domestic-pig": "Sus domesticus",
};

const statusFixes = {
  "green-sea-turtle": "LC",
  "bearded-bellbird": "NT",
  "black-backed-kingfisher": "NT",
  "boulder-brain-coral": "VU",
  "chinese-high-fin-banded-shark": "VU",
  "grooved-brain-coral": "CR",
  "indian-flying-fox": "NT",
  koala: "VU",
  "pacific-angelshark": "VU",
  "red-crowned-crane": "VU",
  "saiga-antelope": "NT",
  "swan-goose": "EN",
  "wild-bactrian-camel": "EN",
};

const classByTaxonomy = {
  Mammalia: "Mammal",
  Aves: "Bird",
  Reptilia: "Reptile",
  Amphibia: "Amphibian",
  Actinopterygii: "Fish",
  Chondrichthyes: "Fish",
  Elasmobranchii: "Fish",
  Insecta: "Insect",
  Arachnida: "Arachnid",
  Malacostraca: "Crustacean",
  Cephalopoda: "Mollusk",
  Gastropoda: "Mollusk",
  Bivalvia: "Mollusk",
  Anthozoa: "Cnidarian",
  Cubozoa: "Cnidarian",
  Hydrozoa: "Cnidarian",
  Scyphozoa: "Cnidarian",
};

const habitatOverrides = {
  "american-crow": "Urban",
  "barn-swallow": "Farm",
  "bearded-bellbird": "Forest",
  "big-brown-bat": "Urban",
  "black-swallowtail": "Grassland",
  "chinese-cobra": "Wetland",
  "common-loon": "Freshwater",
  "common-pheasant": "Grassland",
  "common-raven": "Global",
  "common-swift": "Global",
  "eastern-diamondback-rattlesnake": "Savanna",
  "emerald-cockroach-wasp": "Forest",
  "gopher-snake": "Grassland",
  "grey-headed-flying-fox": "Forest",
  "hawaiian-bobtail-squid": "Coastal",
  "house-cricket": "Urban",
  "house-sparrow": "Urban",
  "indian-flying-fox": "Forest",
  "little-brown-bat": "Forest",
  "monarch-butterfly": "Grassland",
  "north-american-deer-mouse": "Grassland",
  "ring-legged-earwig": "Forest",
  "turkey-vulture": "Grassland",
  "virginia-opossum": "Forest",
  "white-winged-vampire-bat": "Forest",
  "whites-tree-frog": "Forest",
};

const dietOverrides = {
  "bearded-vulture": "Carnivore",
  "black-winged-subterranean-termite": "Fungivore",
  "eastern-diamondback-rattlesnake": "Carnivore",
  "elkhorn-coral": "Omnivore",
  "hawaiian-bobtail-squid": "Carnivore",
  hoatzin: "Herbivore",
  "namaqua-sandgrouse": "Herbivore",
  "northern-river-terrapin": "Herbivore",
  "proboscis-monkey": "Herbivore",
  "pygmy-slow-loris": "Omnivore",
  "spot-fin-porcupinefish": "Carnivore",
  "tiger-shark": "Carnivore",
};

function normalizeHabitat(id, value) {
  if (habitatOverrides[id]) return habitatOverrides[id];
  const tag = String(value || "").toLowerCase();
  if (/coral|reef|珊瑚/.test(tag)) return "Coral Reef";
  if (/mangrove|wetland|wetlands|swamp|estuar|湿地/.test(tag)) return "Wetland";
  if (/river|freshwater|anadrom|riparian|淡水|江河|aquatic/.test(tag)) return "Freshwater";
  if (/coast/.test(tag)) return "Coastal";
  if (/ocean|marine|pelagic|benthic|deep.?sea|海洋|深海/.test(tag)) return "Ocean";
  if (/rainforest|forest|woodland|arboreal|boreal|森林|雨林|林地/.test(tag)) return "Forest";
  if (/savanna|稀树草原/.test(tag)) return "Savanna";
  if (/desert|arid|荒漠/.test(tag)) return "Desert";
  if (/mountain|montane|alpine|karst|山地/.test(tag)) return "Mountains";
  if (/tundra|arctic|antarctic/.test(tag)) return "Tundra";
  if (/grass|steppe|plain|scrub|chaparral|outback|terrestrial|草地|草原|灌木|陆生/.test(tag)) return "Grassland";
  if (/urban|city|garden/.test(tag)) return "Urban";
  if (/farm/.test(tag)) return "Farm";
  if (/cave|subterranean/.test(tag)) return "Cave";
  if (/island|海岛/.test(tag)) return "Island";
  if (/global|aerial/.test(tag)) return "Global";
  throw new Error(`${id}: cannot normalize habitat tag "${value}"`);
}

function normalizeDiet(id, value) {
  if (dietOverrides[id]) return dietOverrides[id];
  const tag = String(value || "").toLowerCase();
  if (/insect|食虫/.test(tag)) return "Insectivore";
  if (/fruit|frug|食果/.test(tag)) return "Frugivore";
  if (/pisc/.test(tag)) return "Piscivore";
  if (/scav/.test(tag)) return "Scavenger";
  if (/filter|滤食/.test(tag)) return "Filter Feeder";
  if (/nectar|食蜜/.test(tag)) return "Nectarivore";
  if (/sangu/.test(tag)) return "Sanguivore";
  if (/detrit/.test(tag)) return "Detritivore";
  if (/parasitoid/.test(tag)) return "Parasitoid";
  if (/fung/.test(tag)) return "Fungivore";
  if (/carn|肉食|venom|predator|duroph|osteophage/.test(tag)) return "Carnivore";
  if (/herb|foliv|graniv|植食|草食|食草/.test(tag)) return "Herbivore";
  if (/omniv|杂食/.test(tag)) return "Omnivore";
  throw new Error(`${id}: cannot normalize diet tag "${value}"`);
}

function normalizePolygons(polygons) {
  if (!Array.isArray(polygons)) return [];
  const normalized = [];
  for (let polygon of polygons) {
    while (Array.isArray(polygon) && polygon.length === 1 && Array.isArray(polygon[0]) && !pointIsValid(polygon[0])) {
      polygon = polygon[0];
    }
    if (!Array.isArray(polygon) || polygon.length < 3 || !polygon.every(pointIsValid)) continue;
    const closed = polygon.map((point) => [point[0], point[1]]);
    if (!pointsEqual(closed[0], closed.at(-1))) closed.push([...closed[0]]);
    if (isAxisAlignedRectangle(closed)) continue;
    normalized.push(closed);
  }
  return normalized;
}

function mergeSource(animal, key, value) {
  animal.sources = { ...(animal.sources || {}), [key]: value };
}

const records = readAnimals(ANIMALS_DIR);
let removedRectangles = 0;
let repairedMaps = 0;

for (const { file, animal } of records) {
  const originalPolygonCount = Array.isArray(animal.habitat?.global_distribution_polygons)
    ? animal.habitat.global_distribution_polygons.length
    : 0;
  const normalized = normalizePolygons(animal.habitat?.global_distribution_polygons);
  if (JSON.stringify(normalized) !== JSON.stringify(animal.habitat?.global_distribution_polygons)) repairedMaps += 1;
  removedRectangles += Math.max(0, originalPolygonCount - normalized.length);
  animal.habitat.global_distribution_polygons = normalized;

  const taxonomyClass = animal.taxonomy?.class?.en;
  animal.ui_tags = [
    classByTaxonomy[taxonomyClass] || "Invertebrate",
    normalizeHabitat(animal.id, animal.ui_tags?.[1]),
    normalizeDiet(animal.id, animal.ui_tags?.[2]),
  ];
  mergeSource(animal, "record", {
    status: "legacy-structure-checked",
    checked_at: CHECKED_AT,
  });
  if (animal.sources.record.status === "legacy-content-reviewed") {
    animal.sources.record.status = "legacy-structure-checked";
  }

  if (scientificNameFixes[animal.id]) {
    animal.scientific_name = scientificNameFixes[animal.id];
    mergeSource(animal, "taxonomy", {
      authority: animal.id === "indian-flying-fox" ? "Mammal Diversity Database" : "GBIF Backbone",
      checked_at: CHECKED_AT,
    });
  }
  if (animal.id === "philippine-flying-lemur") animal.name_en = "Philippine Flying Lemur";
  if (animal.id === "thorn-bug") animal.taxonomy.kingdom.zh = "动物界";

  if (statusFixes[animal.id]) {
    animal.conservation_status = { code: statusFixes[animal.id], ...STATUS_LABELS[statusFixes[animal.id]] };
    mergeSource(animal, "conservation", {
      authority: "IUCN Red List",
      release: "2026-1",
      checked_at: CHECKED_AT,
    });
  } else if (STATUS_LABELS[animal.conservation_status?.code]) {
    const old = animal.conservation_status;
    const canonical = STATUS_LABELS[old.code];
    if (old.en !== canonical.en || old.zh !== canonical.zh) {
      animal.conservation_status = { code: old.code, ...canonical };
      if (animal.id === "baiji" || animal.id === "ivory-billed-woodpecker") {
        animal.conservation_status.note_en = "Possibly extinct; retained in CR pending formal IUCN reassessment.";
        animal.conservation_status.note_zh = "可能已经灭绝；在 IUCN 正式重新评估前仍保留为极危。";
      }
      if (animal.id === "emperor-scorpion") {
        animal.legal_status = { code: "CITES-II", en: "CITES Appendix II", zh: "《濒危野生动植物种国际贸易公约》附录 II" };
      }
    }
  }

  fs.writeFileSync(path.join(ANIMALS_DIR, file), `${JSON.stringify(animal, null, 2)}\n`, "utf8");
}

const existingManifest = fs.existsSync(MANIFEST_PATH)
  ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
  : {};
const manifest = Object.fromEntries(
  Object.entries(existingManifest).filter(([, entry]) => entry.review_status === "hidden-unverified")
);
for (const { animal } of records) {
  const imagePath = path.join(IMAGES_DIR, `${animal.id}.jpg`);
  if (!animal.image || !fs.existsSync(imagePath)) continue;
  const info = inspectImage(imagePath);
  const existingEntry = existingManifest[animal.id];
  manifest[animal.id] = existingEntry || {
    source: "legacy-import",
    source_url: null,
    taxon_id: null,
    photo_id: null,
    attribution: null,
    license_code: null,
    license_status: "unknown",
    review_status: "legacy-unverified",
    reviewed_at: CHECKED_AT,
    sha256: info.sha256,
    width: info.width || null,
    height: info.height || null,
  };
  if (
    manifest[animal.id].review_status === "legacy-reviewed"
    && manifest[animal.id].license_status !== "verified"
  ) {
    manifest[animal.id].review_status = "legacy-unverified";
  }
  if (
    manifest[animal.id].review_status === "human-approved"
    && manifest[animal.id].photo_id
    && !manifest[animal.id].source_url
  ) {
    manifest[animal.id].source = "iNaturalist";
    manifest[animal.id].source_url = `https://www.inaturalist.org/photos/${manifest[animal.id].photo_id}`;
  }
}
fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const orphan = path.join(IMAGES_DIR, "chameleon.jpg");
if (fs.existsSync(orphan)) {
  fs.mkdirSync(QUARANTINE_DIR, { recursive: true });
  fs.renameSync(orphan, path.join(QUARANTINE_DIR, "chameleon.jpg"));
}

console.log(`✅ Updated ${records.length} records; repaired ${repairedMaps} map records; removed ${removedRectangles} misleading/invalid polygons.`);
console.log("✅ Normalized tags and initialized data/image-attribution.json.");
