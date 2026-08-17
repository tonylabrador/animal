const assert = require("node:assert/strict");
const { validateAnimal } = require("./lib/animal-schema");

const text = { en: "Verified example text.", zh: "已核对的示例文字。" };
const sourced = (sourceKeys = ["general"]) => ({ ...text, source_keys: sourceKeys });
const source = (authority) => ({
  authority,
  url: "https://example.org/source",
  checked_at: "2026-08-16",
});

const fixture = {
  content_version: 2,
  content_review: {
    factual_qc: "source-checked",
    bilingual_qc: "line-by-line-reviewed",
    reviewed_at: "2026-08-16",
    reviewer: "schema-test",
  },
  id: "schema-test-animal",
  name_zh: "测试动物",
  name_en: "Schema Test Animal",
  scientific_name: "Testus animalis",
  ui_tags: ["Mammal", "Forest", "Omnivore"],
  taxonomy: {
    kingdom: { en: "Animalia", zh: "动物界" },
    phylum: { en: "Chordata", zh: "脊索动物门" },
    class: { en: "Mammalia", zh: "哺乳纲" },
    order: { en: "Testudines", zh: "测试目" },
    family: { en: "Testidae", zh: "测试科" },
    genus: { en: "Testus", zh: "测试属" },
  },
  conservation_status: { code: "NE", en: "Not Evaluated", zh: "未评估" },
  description: text,
  encyclopedia: {
    anatomy: sourced(),
    ecology_and_behavior: sourced(["ecology"]),
    habitat_and_distribution: sourced(["range"]),
  },
  rich_content: {
    quick_facts: ["body_size", "weight", "diet", "activity"].map((key) => ({
      key,
      label: text,
      value: text,
      source_keys: ["general"],
    })),
    life_cycle_and_reproduction: sourced(),
    adaptations: [1, 2, 3].map(() => ({ title: text, detail: text, source_keys: ["general"] })),
    ecological_role: sourced(["ecology"]),
    conservation_and_threats: {
      population_trend: "unknown",
      threats: text,
      actions: text,
      source_keys: ["conservation"],
    },
    identification: { key_features: text, similar_species: text, source_keys: ["general"] },
    communication_and_senses: sourced(),
    seasonal_calendar: sourced(["ecology"]),
    relationship_with_humans: sourced(),
    evolution: sourced(["taxonomy"]),
    field_signs: sourced(),
    did_you_know: [1, 2, 3].map(() => ({ text, source_keys: ["general"] })),
    class_specific: [{ title: text, content: text, source_keys: ["general"] }],
  },
  habitat: {
    text_en: "Verified range",
    text_zh: "已核对分布",
    map_coordinates: [0, 0],
    map_zoom_level: 4,
    global_distribution_polygons: [],
    range_review: {
      display_mode: "representative-point",
      previous_result: "not-applicable",
      source_keys: ["range"],
      comparison_en: "No previous geometry; a sourced representative point is shown.",
      comparison_zh: "没有旧范围几何；地图显示有来源支持的代表点。",
      checked_at: "2026-08-16",
    },
  },
  image: null,
  sources: {
    taxonomy: source("Taxonomy authority"),
    conservation: source("Conservation authority"),
    general: source("General authority"),
    ecology: source("Ecology authority"),
    range: source("Range authority"),
  },
};

const valid = validateAnimal(fixture, { requireRichContent: true, requireReview: true });
assert.deepEqual(valid.errors, [], `valid v2 fixture failed: ${valid.errors.join("; ")}`);

const invalid = JSON.parse(JSON.stringify(fixture));
invalid.rich_content.quick_facts.pop();
delete invalid.sources.general;
invalid.content_review.bilingual_qc = "pending";
const rejected = validateAnimal(invalid, { requireRichContent: true, requireReview: true });
assert(rejected.errors.some((error) => error.includes("quick_facts must contain 4 to 8")));
assert(rejected.errors.some((error) => error.includes("missing sources.general")));
assert(rejected.errors.some((error) => error.includes("line-by-line-reviewed")));

const mismatchedRange = JSON.parse(JSON.stringify(fixture));
mismatchedRange.habitat.range_review.display_mode = "verified-polygon";
const rejectedRange = validateAnimal(mismatchedRange, { requireRichContent: true, requireReview: true });
assert(rejectedRange.errors.some((error) => error.includes("requires at least one polygon")));

const retainedLegacyRange = JSON.parse(JSON.stringify(fixture));
retainedLegacyRange.habitat.global_distribution_polygons = [[
  [10, 10], [11, 12], [9, 13], [8, 11], [10, 10],
]];
retainedLegacyRange.habitat.range_review.display_mode = "legacy-polygon-retained";
retainedLegacyRange.habitat.range_review.previous_result = "retained";
const acceptedLegacyRange = validateAnimal(retainedLegacyRange, { requireRichContent: true, requireReview: true });
assert.deepEqual(acceptedLegacyRange.errors, [], `retained legacy range failed: ${acceptedLegacyRange.errors.join("; ")}`);

console.log("✅ Rich Content v2 schema accepts complete records and rejects incomplete/source-broken records.");
