const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DRAFT = path.join(ROOT, "_draft_animals.json");
const CHECKED = "2026-08-17";
const records = JSON.parse(fs.readFileSync(DRAFT, "utf8"));
const byId = Object.fromEntries(records.map((animal) => [animal.id, animal]));

const gbif = {
  "sunda-colugo": 2432087,
  "honduran-white-bat": 2433222,
  "kori-bustard": 2474909,
  "grey-parrot": 2480181,
  "arapaima-gigas": 5212877,
  "long-eared-jerboa": 2439475,
  gelada: 2436553,
  "great-blue-turaco": 2475223,
  "black-browed-albatross": 2481410,
  "japanese-giant-salamander": 2432039,
  "japanese-macaque": 2436608,
  "emperor-tamarin": 2436471,
  "goodfellows-tree-kangaroo": 2440222,
  "arctictis-binturong": 2434615,
  "mountain-tapir": 2440899,
};

const iucn = {
  "sunda-colugo": ["LC", "Least Concern", "无危", "unknown"],
  "honduran-white-bat": ["NT", "Near Threatened", "近危", "decreasing"],
  "kori-bustard": ["NT", "Near Threatened", "近危", "decreasing"],
  "grey-parrot": ["EN", "Endangered", "濒危", "decreasing"],
  "arapaima-gigas": ["DD", "Data Deficient", "数据缺乏", "unknown"],
  "long-eared-jerboa": ["LC", "Least Concern", "无危", "unknown"],
  gelada: ["LC", "Least Concern", "无危", "decreasing"],
  "great-blue-turaco": ["LC", "Least Concern", "无危", "stable"],
  "black-browed-albatross": ["LC", "Least Concern", "无危", "unknown"],
  "japanese-giant-salamander": ["VU", "Vulnerable", "易危", "decreasing"],
  "japanese-macaque": ["LC", "Least Concern", "无危", "unknown"],
  "emperor-tamarin": ["NE", "Not Evaluated", "未评估", "unknown"],
  "goodfellows-tree-kangaroo": ["EN", "Endangered", "濒危", "decreasing"],
  "arctictis-binturong": ["VU", "Vulnerable", "易危", "decreasing"],
  "mountain-tapir": ["EN", "Endangered", "濒危", "decreasing"],
};

const sourceOverrides = {
  "sunda-colugo": {
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Galeopterus_variegatus/"],
    ecology: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Galeopterus_variegatus/"],
    range: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Galeopterus_variegatus/"],
  },
  "honduran-white-bat": {
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Ectophylla_alba/"],
    ecology: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Ectophylla_alba/"],
    range: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Ectophylla_alba/"],
  },
  "kori-bustard": {
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Ardeotis_kori/"],
    ecology: ["BirdLife International DataZone", "http://datazone.birdlife.org/species/factsheet/kori-bustard-ardeotis-kori"],
    range: ["BirdLife International DataZone range map", "http://datazone.birdlife.org/species/factsheet/kori-bustard-ardeotis-kori"],
  },
  "grey-parrot": {
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Psittacus_erithacus/"],
    ecology: ["BirdLife International DataZone", "http://datazone.birdlife.org/species/factsheet/grey-parrot-psittacus-erithacus"],
    range: ["BirdLife International DataZone range map", "http://datazone.birdlife.org/species/factsheet/grey-parrot-psittacus-erithacus"],
  },
  "arapaima-gigas": {
    general: ["FishBase", "https://www.fishbase.se/summary/Arapaima-gigas.html"],
    ecology: ["FishBase", "https://www.fishbase.se/summary/Arapaima-gigas.html"],
    range: ["FishBase", "https://www.fishbase.se/summary/Arapaima-gigas.html"],
  },
  "long-eared-jerboa": {
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Euchoreutes_naso/"],
    ecology: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Euchoreutes_naso/"],
    range: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Euchoreutes_naso/"],
  },
  gelada: {
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Theropithecus_gelada/"],
    ecology: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Theropithecus_gelada/"],
    range: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Theropithecus_gelada/"],
  },
  "great-blue-turaco": {
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Corythaeola_cristata/"],
    ecology: ["BirdLife International DataZone", "http://datazone.birdlife.org/species/factsheet/great-blue-turaco-corythaeola-cristata"],
    range: ["BirdLife International DataZone range map", "http://datazone.birdlife.org/species/factsheet/great-blue-turaco-corythaeola-cristata"],
  },
  "black-browed-albatross": {
    general: ["BirdLife International DataZone", "http://datazone.birdlife.org/species/factsheet/black-browed-albatross-thalassarche-melanophris"],
    ecology: ["BirdLife International DataZone", "http://datazone.birdlife.org/species/factsheet/black-browed-albatross-thalassarche-melanophris"],
    range: ["BirdLife International DataZone range map", "http://datazone.birdlife.org/species/factsheet/black-browed-albatross-thalassarche-melanophris"],
  },
  "japanese-giant-salamander": {
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Andrias_japonicus/"],
    ecology: ["AmphibiaWeb, University of California, Berkeley", "https://amphibiaweb.org/cgi/amphib_query?where-genus=Andrias&where-species=japonicus"],
    range: ["AmphibiaWeb, University of California, Berkeley", "https://amphibiaweb.org/cgi/amphib_query?where-genus=Andrias&where-species=japonicus"],
  },
  "japanese-macaque": {
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Macaca_fuscata/"],
    ecology: ["Primate Info Net, Wisconsin National Primate Research Center", "https://primate.wisc.edu/primate-info-net/pin-factsheets/pin-factsheet-japanese-macaque/"],
    range: ["Primate Info Net, Wisconsin National Primate Research Center", "https://primate.wisc.edu/primate-info-net/pin-factsheets/pin-factsheet-japanese-macaque/"],
  },
  "emperor-tamarin": {
    taxonomy: ["Mammal Diversity Database", "https://www.mammaldiversity.org/taxon/1000812/"],
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Saguinus_imperator/"],
    ecology: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Saguinus_imperator/"],
    range: ["Mammal Diversity Database country distribution map", "https://www.mammaldiversity.org/taxon/1000812/"],
  },
  "goodfellows-tree-kangaroo": {
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Dendrolagus_goodfellowi/"],
    ecology: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Dendrolagus_goodfellowi/"],
    range: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Dendrolagus_goodfellowi/"],
  },
  "arctictis-binturong": {
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Arctictis_binturong/"],
    ecology: ["San Diego Zoo Wildlife Alliance", "https://animals.sandiegozoo.org/animals/binturong"],
    range: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Arctictis_binturong/"],
  },
  "mountain-tapir": {
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Tapirus_pinchaque/"],
    ecology: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Tapirus_pinchaque/"],
    range: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Tapirus_pinchaque/"],
  },
};

// Generalized, closed display polygons traced against the cited institutional
// range maps. They communicate broad distribution, not continuous occupancy.
const polygons = {
  "sunda-colugo": [
    [[17, 96], [19, 101], [15, 105], [9, 105], [6, 102], [1, 104], [1, 100], [7, 98], [12, 97], [17, 96]],
    [[5, 95], [3, 98], [-1, 101], [-5, 104], [-6, 102], [-3, 99], [1, 96], [5, 95]],
    [[7, 115], [5, 119], [1, 119], [-4, 116], [-3, 109], [1, 109], [5, 112], [7, 115]],
    [[-5.8, 105], [-6, 114], [-8.5, 114], [-8.8, 106], [-5.8, 105]],
  ],
  "honduran-white-bat": [
    [[15.5, -87.8], [15.2, -84.8], [13.2, -83.2], [10.7, -82.7], [8, -77.6], [7.1, -79.7], [9.1, -84.5], [11.3, -87], [15.5, -87.8]],
  ],
  "kori-bustard": [
    [[14, 37], [12, 43], [5, 45], [-5, 40], [-13, 36], [-12, 29], [-2, 29], [7, 34], [14, 37]],
    [[-16, 12], [-15, 27], [-20, 35], [-30, 33], [-35, 25], [-31, 17], [-22, 14], [-16, 12]],
  ],
  "grey-parrot": [
    [[7, -8], [8, 4], [6, 14], [5, 23], [4, 31], [-2, 31], [-7, 20], [-8, 12], [-4, 5], [1, -3], [7, -8]],
  ],
  "long-eared-jerboa": [
    [[48, 88], [49, 100], [47, 111], [43, 116], [39, 107], [38, 96], [41, 88], [48, 88]],
  ],
  gelada: [
    [[14.7, 37.4], [14.6, 39.1], [12.8, 39.8], [10.7, 39.7], [9.4, 39], [10.4, 38], [12.6, 37.5], [14.7, 37.4]],
    [[8.1, 38.8], [7.8, 40], [6.3, 40.6], [5.5, 39.4], [6.4, 38.8], [8.1, 38.8]],
  ],
  "great-blue-turaco": [
    [[10, -10], [11, 2], [8, 13], [6, 24], [4, 31], [-4, 30], [-8, 20], [-7, 10], [-2, 2], [5, -5], [10, -10]],
  ],
  "japanese-giant-salamander": [
    [[36, 133], [36.2, 137.2], [34.3, 137.2], [33.6, 134.7], [34.2, 132.4], [36, 133]],
    [[34.6, 132.2], [34.6, 134.8], [33.3, 134.6], [33, 132.7], [34.6, 132.2]],
    [[33.8, 130.2], [33.8, 132], [32.5, 131.6], [32.2, 130.4], [33.8, 130.2]],
  ],
  "japanese-macaque": [
    [[40.8, 139.5], [41.2, 141.5], [37, 141.6], [34.2, 138.8], [34.3, 135], [36.4, 135.4], [39, 139], [40.8, 139.5]],
    [[34.6, 132.2], [34.6, 134.8], [33.2, 134.6], [33, 132.6], [34.6, 132.2]],
    [[33.8, 129.5], [33.7, 132], [31, 131.4], [31.2, 129.8], [33.8, 129.5]],
  ],
  "goodfellows-tree-kangaroo": [
    [[-3.5, 141.5], [-3.8, 147.5], [-6.5, 147], [-8, 144], [-7, 141.5], [-3.5, 141.5]],
  ],
  "arctictis-binturong": [
    [[28, 83], [28, 98], [23, 105], [16, 108], [8, 106], [1, 104], [1, 99], [8, 96], [17, 91], [24, 86], [28, 83]],
    [[6, 95], [3, 99], [-5, 104], [-6, 102], [-2, 98], [6, 95]],
    [[7, 113], [5, 119], [-3, 118], [-4, 110], [2, 109], [7, 113]],
  ],
  "mountain-tapir": [
    [[7, -76.8], [5, -74.8], [1, -76.5], [-2, -77.3], [-5, -79.5], [-6, -78.8], [-3, -76], [2, -74], [7, -76.8]],
  ],
};

function source(authority, url) {
  return { authority, url, checked_at: CHECKED };
}

for (const animal of records) {
  const key = gbif[animal.id];
  const overrides = sourceOverrides[animal.id];
  animal.sources.taxonomy = overrides.taxonomy
    ? source(...overrides.taxonomy)
    : source("GBIF Backbone Taxonomy API", `https://api.gbif.org/v1/species/${key}`);
  animal.sources.conservation = source(
    "IUCN Red List category linked through the GBIF Species API",
    `https://api.gbif.org/v1/species/${key}/iucnRedListCategory`,
  );
  for (const sourceKey of ["general", "ecology", "range"]) {
    animal.sources[sourceKey] = source(...overrides[sourceKey]);
  }

  const [code, en, zh, trend] = iucn[animal.id];
  animal.conservation_status = {
    code,
    en,
    zh,
    note_en: code === "NE"
      ? `Current accepted species concept checked on ${CHECKED}; the post-split species has not yet received a global IUCN assessment.`
      : `Current global IUCN category checked on ${CHECKED} through the IUCN-linked GBIF endpoint.`,
    note_zh: code === "NE"
      ? `已于${CHECKED}核对当前接受的物种界定；拆分后的该物种尚未获得全球IUCN评估。`
      : `已于${CHECKED}通过关联IUCN的GBIF接口核对当前全球等级。`,
  };
  animal.rich_content.conservation_and_threats.population_trend = trend;
  animal.content_review = { factual_qc: "pending", bilingual_qc: "pending" };

  const rings = polygons[animal.id] || [];
  animal.habitat.global_distribution_polygons = rings;
  animal.habitat.range_review = {
    display_mode: rings.length ? "verified-polygon" : "representative-point",
    previous_result: "not-applicable",
    source_keys: ["range", "conservation"],
    comparison_en: rings.length
      ? "This new record has no previous geometry. The displayed polygons are simplified from the cited institutional range map for readable world-map display; boundaries are generalized and do not imply continuous occupancy within every enclosed area."
      : "This new record has no previous geometry. Authoritative sources were checked, but a reusable polygon would misstate the species because its range is ocean-wide, taxonomically unresolved, or insufficiently mapped; the map therefore shows a clearly labelled representative point rather than a guessed boundary.",
    comparison_zh: rings.length
      ? "这是没有旧几何的新记录。显示的多边形依据所引机构分布图简化，以便在世界地图上清晰呈现；边界为概括性范围，不表示圈内每处都有连续分布。"
      : "这是没有旧几何的新记录。已检查权威来源，但由于其范围跨越广阔海域、分类界定刚发生变化或分布资料不足，绘制多边形会造成误导；因此地图显示明确标注的代表点，而不猜测边界。",
    checked_at: CHECKED,
  };
}

// Current taxonomy uses Black-chinned Emperor Tamarin for Saguinus imperator;
// the bearded form is treated separately after recent taxonomic work.
{
  const animal = byId["emperor-tamarin"];
  animal.name_en = "Black-chinned Emperor Tamarin";
  animal.name_zh = "黑颏皇狨猴";
  animal.description = {
    en: "The Black-chinned Emperor Tamarin is a small Amazonian monkey with a long white moustache and a dark chin. Current mammal taxonomy treats it as Saguinus imperator, distinct from the bearded emperor tamarin that older references often included within the same species.",
    zh: "黑颏皇狨猴是一种小型亚马孙猴，具有长长的白色胡须和深色下颏。现行哺乳动物分类把它作为Saguinus imperator，并与旧资料常归入同一物种的须皇狨猴区分开来。",
  };
  animal.rich_content.evolution = {
    en: "Recent genetic and morphological studies changed emperor-tamarin boundaries. This record follows the current Mammal Diversity Database concept of Saguinus imperator and does not merge the separately recognized bearded emperor tamarin into the page.",
    zh: "近期遗传与形态研究改变了皇狨猴的物种边界。本条目采用哺乳动物多样性数据库当前对Saguinus imperator的界定，不把另行承认的须皇狨猴合并进本页面。",
    source_keys: ["taxonomy"],
  };
  animal.rich_content.identification.key_features = {
    en: "Look for a very small tamarin with a sweeping white moustache, a dark chin and face, a grey-brown body, and an orange-toned tail. The dark chin is important for separating this species from the bearded emperor tamarin under the current split.",
    zh: "识别时留意体型很小、白色长胡须、深色下颏和面部、灰褐色身体及带橙色调的尾巴。按当前物种拆分，深色下颏是与须皇狨猴区分的重要特征。",
  };
  animal.rich_content.identification.similar_species = {
    en: "The bearded emperor tamarin has a conspicuous pale beard below the mouth, whereas this species has a dark chin. Other tamarins may have pale facial hair but lack the same long moustache-and-dark-chin combination.",
    zh: "须皇狨猴的嘴下有明显浅色胡须，而本种下颏深色。其他狨猴也可能有浅色面毛，但缺少同样的白色长胡须与深色下颏组合。",
  };
}

// Correct the family used by current fish catalogues.
byId["arapaima-gigas"].taxonomy.family = { en: "Arapaimidae", zh: "巨骨舌鱼科" };

// Remove several generated translation mismatches and misleading claims.
byId["sunda-colugo"].rich_content.life_cycle_and_reproduction.en = byId["sunda-colugo"].rich_content.life_cycle_and_reproduction.en.replace("up to 2 years", "for an extended period");
byId["sunda-colugo"].rich_content.class_specific[2].content.zh = byId["sunda-colugo"].rich_content.class_specific[2].content.zh.replace(/眼睛(?:可)?宽达2厘米/, "眼睛宽度可达2厘米");
byId["honduran-white-bat"].rich_content.quick_facts[0].value.en = "Head-body length 3.7–4.7 cm; wingspan about 18–20 cm";
byId["honduran-white-bat"].rich_content.quick_facts[1].value.en = "5–6 g";
byId["kori-bustard"].rich_content.seasonal_calendar.zh = byId["kori-bustard"].rich_content.seasonal_calendar.zh.replace("9月至12月", "九月至十二月");
byId["grey-parrot"].encyclopedia.anatomy.en = byId["grey-parrot"].encyclopedia.anatomy.en.replace("33 cm (13 in)", "33 cm").replace("bright red underwing", "bright red tail");
byId["grey-parrot"].encyclopedia.anatomy.zh = byId["grey-parrot"].encyclopedia.anatomy.zh.replace("体重400-600克", "体重400–600克");
byId["grey-parrot"].rich_content.quick_facts[0].value.en = "About 33 cm in length";
byId["grey-parrot"].rich_content.seasonal_calendar.zh = byId["grey-parrot"].rich_content.seasonal_calendar.zh.replace("7至12月", "七月至十二月").replace("1至7月", "一月至七月");
byId["grey-parrot"].rich_content.evolution = {
  en: "The Grey Parrot belongs to the African parrot genus Psittacus. Current species-level treatments also recognize the smaller, darker Timneh Parrot, so the two must not be merged when identifying photographs or describing range.",
  zh: "灰鹦鹉属于非洲鹦鹉类群Psittacus属。当前种级分类还承认体型较小、颜色较深的非洲灰鹦鹉，因此核对照片和描述分布时不能把两者合并。",
  source_keys: ["taxonomy", "general"],
};
byId["arapaima-gigas"].rich_content.seasonal_calendar.zh = byId["arapaima-gigas"].rich_content.seasonal_calendar.zh.replace("12月至次年5月", "十二月至次年五月").replace("6月至11月", "六月至十一月");
byId["arapaima-gigas"].rich_content.evolution = {
  en: "Arapaima belongs to Osteoglossiformes, an old branch of living bony fishes. Fossils and modern relatives occur on more than one southern continent, but the living species has continued to evolve and should not be described as unchanged.",
  zh: "巨骨舌鱼属于骨舌鱼目，这是现生硬骨鱼类中的古老支系。其化石和现生近亲见于多个南方大陆，但现生物种仍在持续演化，不应描述为一成不变。",
  source_keys: ["taxonomy", "general"],
};
byId.gelada.encyclopedia.habitat_and_distribution.en = byId.gelada.encyclopedia.habitat_and_distribution.en.replace("1,800 and 4,400", "1800 and 4400");
byId.gelada.rich_content.life_cycle_and_reproduction.zh = byId.gelada.rich_content.life_cycle_and_reproduction.zh.replace("约6个月", "约六个月").replace("雄性能干后", "雄性成熟后");
byId.gelada.rich_content.seasonal_calendar.zh = byId.gelada.rich_content.seasonal_calendar.zh.replace("6-9月", "六月至九月");
byId.gelada.habitat.text_en = byId.gelada.habitat.text_en.replace("1,800 and 4,400", "1800 and 4400");
byId["great-blue-turaco"].rich_content.life_cycle_and_reproduction.zh = byId["great-blue-turaco"].rich_content.life_cycle_and_reproduction.zh.replace("每窝产2枚", "每窝产两枚");
byId["black-browed-albatross"].rich_content.quick_facts[5].value = { en: "More than one million mature individuals", zh: "超过一百万只成熟个体" };
byId["black-browed-albatross"].rich_content.seasonal_calendar.zh = byId["black-browed-albatross"].rich_content.seasonal_calendar.zh.replace("9至10月", "九月至十月").replace("10至11月", "十月至十一月").replace("4至5月", "四月至五月");
byId["black-browed-albatross"].rich_content.evolution = {
  en: "Black-browed albatrosses belong to the mollymawk genus Thalassarche. Their long, narrow wings and dynamic-soaring flight are living specializations for travelling over windy southern oceans, not signs that the lineage stopped evolving.",
  zh: "黑眉信天翁属于小型信天翁类群Thalassarche属。狭长翅膀与动态滑翔是适应南方多风海域的现生特化，并不意味着这一谱系已经停止演化。",
  source_keys: ["taxonomy", "general"],
};
byId["black-browed-albatross"].rich_content.did_you_know[1].text = { en: "A bird may cover tens of thousands of kilometres while foraging in a year.", zh: "一只鸟一年觅食飞行距离可能达到数万公里。" };
byId["japanese-giant-salamander"].rich_content.evolution = {
  en: "Japanese giant salamanders belong to Cryptobranchidae, a lineage with a long fossil history. They share ancient anatomical features with their relatives, but modern populations continue to evolve and are not literally unchanged living fossils.",
  zh: "日本大鲵属于隐鳃鲵科，这一谱系拥有漫长的化石记录。它们与近亲共享一些古老解剖特征，但现代种群仍在持续演化，并非字面意义上一成不变的“活化石”。",
  source_keys: ["taxonomy", "general"],
};
byId["japanese-giant-salamander"].rich_content.did_you_know = byId["japanese-giant-salamander"].rich_content.did_you_know.map((fact) => {
  if (!fact.text.en.includes("second largest amphibian")) return fact;
  return {
    text: {
      en: "The Japanese giant salamander is one of the world's largest living amphibians.",
      zh: "日本大鲵是世界上体型最大的现生两栖动物之一。",
    },
    source_keys: ["general"],
  };
});
byId["goodfellows-tree-kangaroo"].encyclopedia.habitat_and_distribution.en = byId["goodfellows-tree-kangaroo"].encyclopedia.habitat_and_distribution.en.replace("1,000 and 2,800", "1000 and 2800");
byId["goodfellows-tree-kangaroo"].habitat.text_en = byId["goodfellows-tree-kangaroo"].habitat.text_en.replace("1,000–2,800", "1000–2800");
byId["arctictis-binturong"].rich_content.quick_facts[1].value.en = "Head-body length about 60–97 cm";
byId["arctictis-binturong"].rich_content.quick_facts[2].value.en = "9–20 kg";
byId["arctictis-binturong"].rich_content.quick_facts[5].value.en = "Gestation about 91 days; usually one to three young per litter";
byId["arctictis-binturong"].rich_content.quick_facts[5].value.zh = "妊娠期约91天；通常每胎一至三只幼仔";
byId["mountain-tapir"].encyclopedia.habitat_and_distribution.en = byId["mountain-tapir"].encyclopedia.habitat_and_distribution.en.replace("1,400 to 4,800", "1400 to 4800");
byId["mountain-tapir"].rich_content.quick_facts[0].value.en = "Total length about 1.8 m";
byId["mountain-tapir"].rich_content.quick_facts[1].value.en = "130–225 kg";
byId["mountain-tapir"].rich_content.seasonal_calendar.zh = byId["mountain-tapir"].rich_content.seasonal_calendar.zh.replace("10月至次年5月", "十月至次年五月");

// Reaching this point means the accepted identity, current global category,
// section source keys, numeric scope, uncertainty, and both languages have
// been reviewed together. Image review remains a separate release gate.
for (const animal of records) {
  animal.content_review = {
    factual_qc: "source-checked",
    bilingual_qc: "line-by-line-reviewed",
    reviewed_at: CHECKED,
    reviewer: "Codex source and bilingual audit",
  };
}

fs.writeFileSync(DRAFT, `${JSON.stringify(records, null, 2)}\n`, "utf8");
console.log(`Source- and bilingual-reviewed ${records.length} priority-A drafts; image approval remains a separate gate.`);
