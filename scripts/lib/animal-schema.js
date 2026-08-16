const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const TAXONOMY_LEVELS = ["kingdom", "phylum", "class", "order", "family", "genus"];
const STATUS_LABELS = {
  EX: { en: "Extinct", zh: "灭绝" },
  EW: { en: "Extinct in the Wild", zh: "野外灭绝" },
  CR: { en: "Critically Endangered", zh: "极危" },
  EN: { en: "Endangered", zh: "濒危" },
  VU: { en: "Vulnerable", zh: "易危" },
  NT: { en: "Near Threatened", zh: "近危" },
  LC: { en: "Least Concern", zh: "无危" },
  DD: { en: "Data Deficient", zh: "数据缺乏" },
  NE: { en: "Not Evaluated", zh: "未评估" },
};

const CLASS_TAGS = new Set([
  "Mammal", "Bird", "Reptile", "Amphibian", "Fish", "Insect",
  "Arachnid", "Crustacean", "Mollusk", "Cnidarian", "Invertebrate",
]);
const HABITAT_TAGS = new Set([
  "Forest", "Grassland", "Savanna", "Desert", "Mountains", "Ocean",
  "Freshwater", "Wetland", "Tundra", "Coastal", "Coral Reef", "Urban",
  "Farm", "Cave", "Island", "Global",
]);
const DIET_TAGS = new Set([
  "Carnivore", "Herbivore", "Omnivore", "Insectivore", "Frugivore",
  "Piscivore", "Scavenger", "Filter Feeder", "Nectarivore", "Sanguivore",
  "Detritivore", "Parasitoid", "Fungivore",
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function pointIsValid(point) {
  return Array.isArray(point)
    && point.length === 2
    && Number.isFinite(point[0])
    && Number.isFinite(point[1])
    && point[0] >= -90
    && point[0] <= 90
    && point[1] >= -180
    && point[1] <= 180;
}

function pointsEqual(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function isAxisAlignedRectangle(points) {
  const ring = points.length > 1 && pointsEqual(points[0], points.at(-1))
    ? points.slice(0, -1)
    : points;
  if (ring.length !== 4) return false;
  const lats = new Set(ring.map((point) => point[0]));
  const lngs = new Set(ring.map((point) => point[1]));
  return lats.size === 2 && lngs.size === 2;
}

function validateBilingual(value, field, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${field} must be an object`);
    return;
  }
  if (!isNonEmptyString(value.en)) errors.push(`${field}.en is required`);
  if (!isNonEmptyString(value.zh)) errors.push(`${field}.zh is required`);
}

function validateAnimal(animal, options = {}) {
  const errors = [];
  const warnings = [];
  const fileName = options.fileName;

  if (!isPlainObject(animal)) return { errors: ["record must be an object"], warnings };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(animal.id || "")) {
    errors.push("id must be lowercase kebab-case");
  }
  if (fileName && fileName !== `${animal.id}.json`) {
    errors.push(`filename must be ${animal.id}.json`);
  }
  for (const field of ["name_en", "name_zh", "scientific_name"]) {
    if (!isNonEmptyString(animal[field])) errors.push(`${field} is required`);
  }
  if (isNonEmptyString(animal.scientific_name)) {
    const parts = animal.scientific_name.trim().split(/\s+/);
    if (parts.length !== 2) errors.push("scientific_name must be a species-level binomial");
    if (!/^[A-Z][a-z-]+$/.test(parts[0] || "") || !/^[a-z][a-z-]+$/.test(parts[1] || "")) {
      errors.push("scientific_name must use standard Genus species capitalization");
    }
  }

  if (!Array.isArray(animal.ui_tags) || animal.ui_tags.length !== 3) {
    errors.push("ui_tags must contain exactly [Class, Habitat, Diet]");
  } else {
    if (!CLASS_TAGS.has(animal.ui_tags[0])) errors.push(`unsupported class tag: ${animal.ui_tags[0]}`);
    if (!HABITAT_TAGS.has(animal.ui_tags[1])) errors.push(`unsupported habitat tag: ${animal.ui_tags[1]}`);
    if (!DIET_TAGS.has(animal.ui_tags[2])) errors.push(`unsupported diet tag: ${animal.ui_tags[2]}`);
  }

  if (!isPlainObject(animal.taxonomy)) {
    errors.push("taxonomy is required");
  } else {
    for (const level of TAXONOMY_LEVELS) validateBilingual(animal.taxonomy[level], `taxonomy.${level}`, errors);
    if (animal.taxonomy.kingdom?.en !== "Animalia" || animal.taxonomy.kingdom?.zh !== "动物界") {
      errors.push("taxonomy.kingdom must be Animalia / 动物界");
    }
  }

  const status = animal.conservation_status;
  if (!isPlainObject(status) || !STATUS_LABELS[status.code]) {
    errors.push("conservation_status.code must be a valid IUCN category");
  } else {
    const canonical = STATUS_LABELS[status.code];
    if (status.en !== canonical.en || status.zh !== canonical.zh) {
      errors.push(`conservation_status labels must be ${canonical.en} / ${canonical.zh}`);
    }
  }

  validateBilingual(animal.description, "description", errors);
  if (!isPlainObject(animal.encyclopedia)) {
    errors.push("encyclopedia is required");
  } else {
    for (const section of ["anatomy", "ecology_and_behavior", "habitat_and_distribution"]) {
      validateBilingual(animal.encyclopedia[section], `encyclopedia.${section}`, errors);
    }
  }

  const habitat = animal.habitat;
  if (!isPlainObject(habitat)) {
    errors.push("habitat is required");
  } else {
    if (!isNonEmptyString(habitat.text_en)) errors.push("habitat.text_en is required");
    if (!isNonEmptyString(habitat.text_zh)) errors.push("habitat.text_zh is required");
    if (!pointIsValid(habitat.map_coordinates)) errors.push("habitat.map_coordinates must be [lat, lng]");
    if (!Number.isInteger(habitat.map_zoom_level) || habitat.map_zoom_level < 1 || habitat.map_zoom_level > 18) {
      errors.push("habitat.map_zoom_level must be an integer from 1 to 18");
    }
    if (!Array.isArray(habitat.global_distribution_polygons)) {
      errors.push("habitat.global_distribution_polygons must be an array");
    } else {
      habitat.global_distribution_polygons.forEach((polygon, polygonIndex) => {
        if (!Array.isArray(polygon) || polygon.length < 4 || !polygon.every(pointIsValid)) {
          errors.push(`polygon ${polygonIndex + 1} must contain at least 4 valid [lat, lng] points`);
          return;
        }
        if (!pointsEqual(polygon[0], polygon.at(-1))) errors.push(`polygon ${polygonIndex + 1} must be closed`);
        if (isAxisAlignedRectangle(polygon)) errors.push(`polygon ${polygonIndex + 1} is an unsupported bounding box`);
      });
    }
  }

  if (animal.image !== null && animal.image !== undefined) {
    if (animal.image !== `/images/animals/${animal.id}.jpg`) {
      errors.push(`image must be /images/animals/${animal.id}.jpg or null`);
    }
  }
  if (!animal.sources) warnings.push("sources metadata is missing (legacy record)");

  return { errors, warnings };
}

function getImageInfo(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 24) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2) return null;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { mime: "image/jpeg", height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
  }
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { mime: "image/png", width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  return null;
}

function inspectImage(filePath) {
  const buffer = fs.readFileSync(filePath);
  const info = getImageInfo(buffer);
  return {
    ...info,
    bytes: buffer.length,
    sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
  };
}

function readAnimals(animalsDir) {
  return fs.readdirSync(animalsDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => ({
      file,
      animal: JSON.parse(fs.readFileSync(path.join(animalsDir, file), "utf8")),
    }));
}

module.exports = {
  CLASS_TAGS,
  DIET_TAGS,
  HABITAT_TAGS,
  STATUS_LABELS,
  TAXONOMY_LEVELS,
  inspectImage,
  isAxisAlignedRectangle,
  pointIsValid,
  pointsEqual,
  readAnimals,
  validateAnimal,
};
