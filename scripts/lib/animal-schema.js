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
const POPULATION_TRENDS = new Set(["increasing", "stable", "decreasing", "unknown"]);
const REQUIRED_RICH_SECTIONS = [
  "life_cycle_and_reproduction",
  "ecological_role",
  "communication_and_senses",
  "seasonal_calendar",
  "relationship_with_humans",
  "evolution",
  "field_signs",
];

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

function validateSourceKeys(value, field, animal, errors) {
  if (!Array.isArray(value) || value.length === 0 || !value.every(isNonEmptyString)) {
    errors.push(`${field} must contain at least one source key`);
    return;
  }
  for (const sourceKey of value) {
    if (!animal.sources?.[sourceKey]) errors.push(`${field} references missing sources.${sourceKey}`);
  }
}

function validateSourcedBilingual(value, field, animal, errors) {
  validateBilingual(value, field, errors);
  if (isPlainObject(value)) validateSourceKeys(value.source_keys, `${field}.source_keys`, animal, errors);
}

function validateRichContent(animal, errors) {
  const rich = animal.rich_content;
  if (!isPlainObject(rich)) {
    errors.push("rich_content is required for content_version 2");
    return;
  }

  if (!Array.isArray(rich.quick_facts) || rich.quick_facts.length < 4 || rich.quick_facts.length > 8) {
    errors.push("rich_content.quick_facts must contain 4 to 8 sourced facts");
  } else {
    const keys = new Set();
    rich.quick_facts.forEach((fact, index) => {
      const field = `rich_content.quick_facts[${index}]`;
      if (!isPlainObject(fact)) {
        errors.push(`${field} must be an object`);
        return;
      }
      if (!/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(fact.key || "")) errors.push(`${field}.key must be snake_case`);
      if (keys.has(fact.key)) errors.push(`${field}.key must be unique`);
      keys.add(fact.key);
      validateBilingual(fact.label, `${field}.label`, errors);
      validateBilingual(fact.value, `${field}.value`, errors);
      validateSourceKeys(fact.source_keys, `${field}.source_keys`, animal, errors);
    });
  }

  for (const section of REQUIRED_RICH_SECTIONS) {
    validateSourcedBilingual(rich[section], `rich_content.${section}`, animal, errors);
  }

  if (!Array.isArray(rich.adaptations) || rich.adaptations.length < 3 || rich.adaptations.length > 5) {
    errors.push("rich_content.adaptations must contain 3 to 5 sourced adaptations");
  } else {
    rich.adaptations.forEach((item, index) => {
      const field = `rich_content.adaptations[${index}]`;
      if (!isPlainObject(item)) {
        errors.push(`${field} must be an object`);
        return;
      }
      validateBilingual(item.title, `${field}.title`, errors);
      validateBilingual(item.detail, `${field}.detail`, errors);
      validateSourceKeys(item.source_keys, `${field}.source_keys`, animal, errors);
    });
  }

  const conservation = rich.conservation_and_threats;
  if (!isPlainObject(conservation)) {
    errors.push("rich_content.conservation_and_threats is required");
  } else {
    if (!POPULATION_TRENDS.has(conservation.population_trend)) {
      errors.push("rich_content.conservation_and_threats.population_trend is invalid");
    }
    validateBilingual(conservation.threats, "rich_content.conservation_and_threats.threats", errors);
    validateBilingual(conservation.actions, "rich_content.conservation_and_threats.actions", errors);
    validateSourceKeys(conservation.source_keys, "rich_content.conservation_and_threats.source_keys", animal, errors);
  }

  const identification = rich.identification;
  if (!isPlainObject(identification)) {
    errors.push("rich_content.identification is required");
  } else {
    validateBilingual(identification.key_features, "rich_content.identification.key_features", errors);
    validateBilingual(identification.similar_species, "rich_content.identification.similar_species", errors);
    validateSourceKeys(identification.source_keys, "rich_content.identification.source_keys", animal, errors);
  }

  if (!Array.isArray(rich.did_you_know) || rich.did_you_know.length < 3 || rich.did_you_know.length > 5) {
    errors.push("rich_content.did_you_know must contain 3 to 5 sourced facts");
  } else {
    rich.did_you_know.forEach((item, index) => {
      const field = `rich_content.did_you_know[${index}]`;
      if (!isPlainObject(item)) {
        errors.push(`${field} must be an object`);
        return;
      }
      validateBilingual(item.text, `${field}.text`, errors);
      validateSourceKeys(item.source_keys, `${field}.source_keys`, animal, errors);
    });
  }

  if (!Array.isArray(rich.class_specific) || rich.class_specific.length < 1 || rich.class_specific.length > 3) {
    errors.push("rich_content.class_specific must contain 1 to 3 sourced modules");
  } else {
    rich.class_specific.forEach((item, index) => {
      const field = `rich_content.class_specific[${index}]`;
      if (!isPlainObject(item)) {
        errors.push(`${field} must be an object`);
        return;
      }
      validateBilingual(item.title, `${field}.title`, errors);
      validateBilingual(item.content, `${field}.content`, errors);
      validateSourceKeys(item.source_keys, `${field}.source_keys`, animal, errors);
    });
  }
}

function validateSources(animal, errors, warnings) {
  if (!isPlainObject(animal.sources)) {
    warnings.push("sources metadata is missing (legacy record)");
    return;
  }
  for (const [key, sourceOrSources] of Object.entries(animal.sources)) {
    const sources = Array.isArray(sourceOrSources) ? sourceOrSources : [sourceOrSources];
    if (sources.length === 0) errors.push(`sources.${key} must not be empty`);
    sources.forEach((source, index) => {
      const field = `sources.${key}${sources.length > 1 ? `[${index}]` : ""}`;
      if (!isPlainObject(source)) {
        errors.push(`${field} must be an object`);
        return;
      }
      if (animal.content_version === 2 && !isNonEmptyString(source.authority)) {
        errors.push(`${field}.authority is required for content_version 2`);
      }
      if (animal.content_version === 2 && !isNonEmptyString(source.url)) {
        errors.push(`${field}.url is required for content_version 2`);
      }
      if (!isNonEmptyString(source.checked_at) || !/^\d{4}-\d{2}-\d{2}$/.test(source.checked_at)) {
        errors.push(`${field}.checked_at must be YYYY-MM-DD`);
      }
      if (source.url !== undefined && (!isNonEmptyString(source.url) || !/^https?:\/\//.test(source.url))) {
        errors.push(`${field}.url must be an http(s) URL`);
      }
    });
  }
}

function validateContentReview(animal, errors, requireReview) {
  const review = animal.content_review;
  if (!isPlainObject(review)) {
    errors.push("content_review is required for content_version 2");
    return;
  }
  if (!["pending", "source-checked"].includes(review.factual_qc)) {
    errors.push("content_review.factual_qc must be pending or source-checked");
  }
  if (!["pending", "line-by-line-reviewed"].includes(review.bilingual_qc)) {
    errors.push("content_review.bilingual_qc must be pending or line-by-line-reviewed");
  }
  if (requireReview) {
    if (review.factual_qc !== "source-checked") {
      errors.push("content_review.factual_qc must be source-checked before import or publication");
    }
    if (review.bilingual_qc !== "line-by-line-reviewed") {
      errors.push("content_review.bilingual_qc must be line-by-line-reviewed before import or publication");
    }
    if (!isNonEmptyString(review.reviewer)) errors.push("content_review.reviewer is required after review");
    if (!isNonEmptyString(review.reviewed_at) || !/^\d{4}-\d{2}-\d{2}$/.test(review.reviewed_at)) {
      errors.push("content_review.reviewed_at must be YYYY-MM-DD after review");
    }
  }
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

  if (options.requireRichContent && animal.content_version !== 2) {
    errors.push("content_version must be 2 for every new or replaced record");
  }
  if (animal.content_version === 2) {
    validateContentReview(animal, errors, options.requireReview === true);
    for (const section of ["anatomy", "ecology_and_behavior", "habitat_and_distribution"]) {
      validateSourceKeys(
        animal.encyclopedia?.[section]?.source_keys,
        `encyclopedia.${section}.source_keys`,
        animal,
        errors,
      );
    }
    validateRichContent(animal, errors);
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
    if (animal.content_version === 2) {
      const review = habitat.range_review;
      if (!isPlainObject(review)) {
        errors.push("habitat.range_review is required for content_version 2");
      } else {
        const displayModes = new Set(["verified-polygon", "legacy-polygon-retained", "representative-point"]);
        const previousResults = new Set(["not-applicable", "retained", "replaced", "removed-unverified"]);
        if (!displayModes.has(review.display_mode)) errors.push("habitat.range_review.display_mode is invalid");
        if (!previousResults.has(review.previous_result)) errors.push("habitat.range_review.previous_result is invalid");
        validateSourceKeys(review.source_keys, "habitat.range_review.source_keys", animal, errors);
        if (!isNonEmptyString(review.comparison_en)) errors.push("habitat.range_review.comparison_en is required");
        if (!isNonEmptyString(review.comparison_zh)) errors.push("habitat.range_review.comparison_zh is required");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(review.checked_at || "")) {
          errors.push("habitat.range_review.checked_at must use YYYY-MM-DD");
        }
        const hasPolygons = Array.isArray(habitat.global_distribution_polygons)
          && habitat.global_distribution_polygons.length > 0;
        if (["verified-polygon", "legacy-polygon-retained"].includes(review.display_mode) && !hasPolygons) {
          errors.push(`${review.display_mode} range review requires at least one polygon`);
        }
        if (review.display_mode === "representative-point" && hasPolygons) {
          errors.push("representative-point range review requires an empty polygon array");
        }
      }
    }
  }

  if (animal.image !== null && animal.image !== undefined) {
    if (animal.image !== `/images/animals/${animal.id}.jpg`) {
      errors.push(`image must be /images/animals/${animal.id}.jpg or null`);
    }
  }
  validateSources(animal, errors, warnings);

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
  POPULATION_TRENDS,
  STATUS_LABELS,
  TAXONOMY_LEVELS,
  inspectImage,
  isAxisAlignedRectangle,
  pointIsValid,
  pointsEqual,
  readAnimals,
  validateAnimal,
};
