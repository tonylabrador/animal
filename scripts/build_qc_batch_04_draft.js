#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const batchArg = process.argv.find((arg) => arg.startsWith("--batch="));
const BATCH = batchArg ? batchArg.split("=")[1] : "legacy-qc-batch-04";
const reviewed = process.argv.includes("--reviewed");
const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "qc-batches", `${BATCH}-baseline.json`), "utf8"));
const CHECKED = baseline.captured_at;
const evidenceFile = JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "qc-batches", `${BATCH}-evidence.json`), "utf8"));
const evidenceById = new Map(evidenceFile.animals.map((animal) => [animal.id, animal]));

const labels = {
  EX: ["Extinct", "灭绝"], EW: ["Extinct in the Wild", "野外灭绝"],
  CR: ["Critically Endangered", "极危"], EN: ["Endangered", "濒危"],
  VU: ["Vulnerable", "易危"], NT: ["Near Threatened", "近危"],
  LC: ["Least Concern", "无危"], DD: ["Data Deficient", "数据缺乏"],
  NE: ["Not Evaluated", "未评估"],
};
const classNames = {
  Mammal: ["mammal", "哺乳动物"], Bird: ["bird", "鸟类"], Reptile: ["reptile", "爬行动物"],
  Amphibian: ["amphibian", "两栖动物"], Fish: ["fish", "鱼类"], Insect: ["insect", "昆虫"],
  Arachnid: ["arachnid", "蛛形动物"], Crustacean: ["crustacean", "甲壳动物"],
  Mollusk: ["mollusk", "软体动物"], Cnidarian: ["cnidarian", "刺胞动物"],
  Invertebrate: ["invertebrate", "无脊椎动物"],
};
const habitatZh = {
  Forest: "森林", Grassland: "草原", Savanna: "稀树草原", Desert: "沙漠", Mountains: "山地",
  Ocean: "海洋", Freshwater: "淡水", Wetland: "湿地", Tundra: "苔原", Coastal: "海岸",
  "Coral Reef": "珊瑚礁", Urban: "城市", Farm: "农场", Cave: "洞穴", Island: "岛屿", Global: "全球",
};
const dietZh = {
  Carnivore: "肉食性", Herbivore: "草食性", Omnivore: "杂食性", Insectivore: "食虫性",
  Frugivore: "食果性", Piscivore: "食鱼性", Scavenger: "食腐性", "Filter Feeder": "滤食性",
  Nectarivore: "食蜜性", Sanguivore: "食血性", Detritivore: "食碎屑性", Parasitoid: "寄生性",
  Fungivore: "食真菌性",
};
const b = (en, zh) => ({ en, zh });
const section = (en, zh, source_keys = ["general"]) => ({ en, zh, source_keys });
const fact = (key, labelEn, labelZh, valueEn, valueZh, source_keys) => ({
  key, label: b(labelEn, labelZh), value: b(valueEn, valueZh), source_keys,
});
const source = (authority, url) => ({ authority, url, checked_at: CHECKED });

const manualIdentityResolutions = {
  "chinese-sturgeon": "GBIF gives an exact accepted species match and CR IUCN mapping; iNaturalist absence does not overturn the accepted identity.",
  "domestic-pig": "The project retains the explicit domestic-binomial convention Sus domesticus, while noting GBIF treats it as a synonym and assigning NE rather than the wild boar status.",
  "dusky-dolphin": "GBIF, IUCN, WoRMS and NOAA support Lagenorhynchus obscurus; iNaturalist currently indexes the revised combination Sagmatias obscurus.",
  "kakapo": "GBIF accepts the spelling Strigops habroptila, while IUCN, iNaturalist and New Zealand conservation usage use Strigops habroptilus; this review adopts the latter spelling.",
  "longsnout-catfish": "IUCN assesses Leiocassis longirostris as a species; GBIF treats that combination as a synonym and iNaturalist has no exact indexed taxon, so the IUCN-assessed combination is retained explicitly.",
  "northern-goshawk": "The 2023 eBird/Clements split restricts this taxon to Eurasia and recognizes American Goshawk separately; the 2024 update places Eurasian Goshawk in Astur gentilis.",
  "pygmy-slow-loris": "The Mammal Diversity Database recognizes Xanthonycticebus pygmaeus as Southern Pygmy Slow Loris and separates X. intermedius.",
  "vicuna": "GBIF and the IUCN-linked category service retain Vicugna vicugna as Least Concern; the Mammal Diversity Database currently uses Lama vicugna, so the IUCN-assessed combination is retained explicitly.",
  "whites-tree-frog": "Amphibian Species of the World currently recognizes Pelodryas caerulea; the global IUCN category remains the assessment published under Ranoidea caerulea.",
  "wild-bactrian-camel": "The Mammal Diversity Database recognizes Camelus ferus and lists the current global category as Endangered; the GBIF category response matched only the genus and is not used.",
  "wilsons-bird-of-paradise": "The 2023 eBird/Clements taxonomy update places Wilson's Bird-of-paradise in Diphyllodes respublica; the IUCN-linked category remains Near Threatened.",
};
const scientificNameOverrides = {
  "kakapo": "Strigops habroptilus",
  "northern-goshawk": "Astur gentilis",
  "pygmy-slow-loris": "Xanthonycticebus pygmaeus",
  "whites-tree-frog": "Pelodryas caerulea",
  "wilsons-bird-of-paradise": "Diphyllodes respublica",
};
const nameOverrides = {
  "northern-goshawk": { en: "Eurasian Goshawk", zh: "苍鹰" },
  "pygmy-slow-loris": { en: "Southern Pygmy Slow Loris", zh: "南小懒猴" },
  "wild-bactrian-camel": { en: "Wild Bactrian Camel", zh: "野骆驼" },
};
const genusOverrides = {
  "northern-goshawk": b("Astur", "苍鹰属"),
  "pygmy-slow-loris": b("Xanthonycticebus", "小懒猴属"),
  "whites-tree-frog": b("Pelodryas", "澳洲树蛙属"),
  "wilsons-bird-of-paradise": b("Diphyllodes", "辉极乐鸟属"),
};
const taxonomySourceOverrides = {
  "northern-goshawk": source("Cornell Lab eBird/Clements taxonomy updates", "https://science.ebird.org/en/use-ebird-data/the-ebird-taxonomy/2024-ebird-taxonomy-update"),
  "pygmy-slow-loris": source("ASM Mammal Diversity Database", "https://www.mammaldiversity.org/taxon/1001069/"),
  "vicuna": source("GBIF Backbone Taxonomy", "https://www.gbif.org/species/2441099"),
  "whites-tree-frog": source("Amphibian Species of the World", "https://amphibiansoftheworld.amnh.org/Amphibia/Anura/Pelodryadidae/Pelodryas/Pelodryas-caerulea"),
  "wild-bactrian-camel": source("ASM Mammal Diversity Database", "https://www.mammaldiversity.org/taxon/1006384/"),
  "wilsons-bird-of-paradise": source("Cornell Lab eBird/Clements taxonomy update", "https://science.ebird.org/en/use-ebird-data/the-ebird-taxonomy/2023-ebird-taxonomy-update"),
};
const habitatTextOverrides = {
  "goblin-shark": {
    en: "Deep sea at depths of 270–1300 m",
    zh: "水深270–1300米的深海海域",
  },
  "lady-amhersts-pheasant": {
    en: "High-altitude evergreen broadleaf forests, coniferous woodlands, and dense bamboo thickets in southwestern China and northern Myanmar, typically at elevations of 2000–4000 m.",
    zh: "中国西南部及缅甸北部的高海拔常绿阔叶林、针叶林和茂密竹林，通常位于海拔2000–4000米。",
  },
  "pelican-eel": {
    en: "Bathypelagic zone of temperate and tropical oceans worldwide, at depths of 500–3,000 m (1,640–9,840 ft). Open ocean, far from continental shelves.",
    zh: "全球温带和热带海洋的深海带，深度500–3,000米（1,640–9,840英尺）。远离大陆架的开放海洋。",
  },
};
const statusOverrides = {
  "giant-otter": {
    code: "EN",
    authority: "IUCN Red List — Amazing Species: Giant Otter",
    url: "https://nc.iucnredlist.org/redlist/amazing-species/pteronura-brasiliensis/pdfs/original/pteronura-brasiliensis.pdf",
    reason: "The direct IUCN species document lists Pteronura brasiliensis as Endangered; the GBIF category endpoint returned NE and was not used.",
  },
  "wild-bactrian-camel": {
    code: "EN",
    authority: "ASM Mammal Diversity Database — Wild Bactrian Camel",
    url: "https://www.mammaldiversity.org/taxon/1006384/",
    reason: "The current species account lists Camelus ferus as Endangered; the GBIF category endpoint queried only genus Camelus and returned NE.",
  },
};

function classLife(classTag) {
  const texts = {
    Mammal: b("Young develop in the mother and depend on milk after birth. Gestation, litter size, weaning and social care are species-specific, so this review does not generalize figures from captivity or another population.", "幼崽在母体内发育，出生后依赖乳汁。妊娠期、每胎数量、断奶和社会照料具有物种特异性，因此本次复核不把圈养或其他种群数字直接泛化。"),
    Bird: b("The life cycle includes egg laying, incubation and a dependent young stage. Nest type, clutch size, migration and breeding dates vary by population and latitude and require species-specific evidence.", "生命周期包括产卵、孵化和幼鸟依赖阶段。巢型、窝卵数、迁徙和繁殖日期会随种群及纬度变化，需要物种级证据。"),
    Reptile: b("Development and reproduction depend strongly on temperature and local conditions. Egg laying or live birth, clutch size and maturity differ among species and are not inferred from the reptile label alone.", "发育和繁殖强烈受温度及当地条件影响。卵生或胎生、窝卵数和成熟时间因物种而异，不能只凭爬行动物标签推断。"),
    Amphibian: b("Egg, larval and adult stages may depend on different aquatic and terrestrial conditions. Exact metamorphosis and breeding timing require evidence for this species and population.", "卵、幼体和成体阶段可能依赖不同的水生与陆生条件。变态过程和繁殖时间必须有该物种及种群的证据。"),
    Fish: b("Egg, larval, juvenile and adult stages may use different depths, currents, salinities or seasons. Spawning mode and timing are kept uncertain unless supported for the named species.", "卵、仔鱼、幼鱼和成鱼阶段可能利用不同水深、水流、盐度或季节。除非有具名物种证据，否则产卵方式和时间保持不确定。"),
    Insect: b("Development passes through species-specific immature stages before the reproductive adult stage. Temperature, food resources and season can change timing, so unsupported precision is avoided.", "发育会经过物种特有的未成熟阶段，再进入可繁殖成虫期。温度、食物资源和季节会改变时间，因此避免缺乏支持的精确数字。"),
    Arachnid: b("Growth requires molts, and reproduction includes species-specific courtship, egg protection and juvenile development. Timing and brood size are not inferred from close relatives.", "生长需要蜕皮，繁殖包括物种特有的求偶、护卵和幼体发育。时间与繁殖数量不能从近缘种直接推断。"),
    Crustacean: b("Growth requires repeated molts, and eggs or larvae can occupy conditions different from adults. Temperature, depth, current and salinity can alter development.", "生长需要反复蜕壳，卵或幼体所处条件可能不同于成体。温度、水深、水流和盐度会改变发育。"),
    Mollusk: b("Eggs and juvenile or larval stages precede the adult body form. Development, dispersal and survival depend on species-specific water or land conditions.", "卵以及幼体阶段先于成体体制出现。发育、扩散和存活依赖物种特有的水域或陆地条件。"),
    Cnidarian: b("Sexual and asexual stages can differ greatly in form and habitat. Colony growth, spawning and larval settlement must be interpreted from species-specific evidence.", "有性与无性阶段在形态和生境上可能差异很大。群体生长、产卵和幼体附着必须依据物种级证据解释。"),
    Invertebrate: b("Reproductive mode and immature development are species-specific. This review avoids assigning timing or brood size from a broad invertebrate category.", "繁殖方式和未成熟期发育具有物种特异性。本次复核不根据宽泛的无脊椎动物类别推断时间或繁殖数量。"),
  };
  return texts[classTag];
}

function classModule(classTag) {
  const titles = {
    Mammal: b("Mammal care", "哺乳类育幼"), Bird: b("Feathers and eggs", "羽毛与卵"),
    Reptile: b("Thermal biology", "体温调节"), Amphibian: b("Amphibian development", "两栖类发育"),
    Fish: b("Aquatic life stages", "水生生活史"), Insect: b("Insect development", "昆虫发育"),
    Arachnid: b("Molting and sensing", "蜕皮与感知"), Crustacean: b("Crustacean molts", "甲壳类蜕壳"),
    Mollusk: b("Mollusk life cycle", "软体动物生活史"), Cnidarian: b("Cnidarian stages", "刺胞动物阶段"),
    Invertebrate: b("Invertebrate life history", "无脊椎动物生活史"),
  };
  return titles[classTag];
}

function build(animalBaseline) {
  const old = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "animals", `${animalBaseline.id}.json`), "utf8"));
  const scientificName = scientificNameOverrides[old.id] || old.scientific_name;
  const displayName = nameOverrides[old.id] || { en: old.name_en, zh: old.name_zh };
  const taxonomy = genusOverrides[old.id] ? { ...old.taxonomy, genus: genusOverrides[old.id] } : old.taxonomy;
  const habitatText = habitatTextOverrides[old.id] || { en: old.habitat.text_en, zh: old.habitat.text_zh };
  const evidence = evidenceById.get(old.id);
  if (!evidence) throw new Error(`${old.id}: missing evidence`);
  if (evidence.identity_gate !== "pass" && !manualIdentityResolutions[old.id]) {
    throw new Error(`${old.id}: unresolved identity gate`);
  }
  const statusOverride = statusOverrides[old.id];
  const code = statusOverride?.code || evidence.iucn?.code || "NE";
  const [statusEn, statusZh] = labels[code];
  const classTag = old.ui_tags[0];
  const habitatTag = old.ui_tags[1];
  const dietTag = old.ui_tags[2];
  const [classEn, classZh] = classNames[classTag];
  const geometryChanged = old.id === "northern-goshawk";
  const geometryReplacedNow = geometryChanged && old.habitat.global_distribution_polygons.length === animalBaseline.habitat.global_distribution_polygons.length;
  const mapPolygons = geometryReplacedNow
    ? old.habitat.global_distribution_polygons.slice(1)
    : old.habitat.global_distribution_polygons;
  const hasPolygon = mapPolygons.length > 0;
  const generalUrl = evidence.inaturalist
    ? `https://api.inaturalist.org/v1/taxa/${evidence.inaturalist.taxon_id}`
    : `https://api.gbif.org/v1/species/${evidence.gbif.usage_key}`;
  const result = {
    ...old,
    name_en: displayName.en,
    name_zh: displayName.zh,
    scientific_name: scientificName,
    taxonomy,
    content_version: 2,
    content_review: reviewed ? {
      factual_qc: "source-checked",
      bilingual_qc: "line-by-line-reviewed",
      reviewed_at: CHECKED,
      reviewer: "Codex source and bilingual audit",
      notes: `${BATCH}. Exact-taxon identity and global category checked; bilingual templates compared line by line; ${geometryChanged ? "the clearly obsolete North American polygon was removed after the Eurasian/American Goshawk split, while the Eurasian and Japanese geometry was retained byte-for-byte" : "previous map geometry retained byte-for-byte"}. ${manualIdentityResolutions[old.id] || statusOverride?.reason || ""}`.trim(),
    } : { factual_qc: "pending", bilingual_qc: "pending" },
    conservation_status: {
      code,
      en: statusEn,
      zh: statusZh,
      note_en: code === "NE"
        ? "No species-level global IUCN assessment was confirmed; Not Evaluated does not mean secure or abundant."
        : `The species-level global category checked for this review is ${statusEn}; regional and legal categories may differ.`,
      note_zh: code === "NE"
        ? "未确认到物种级IUCN全球评估；未评估不代表安全或数量丰富。"
        : `本次复核确认的物种级全球等级为${statusZh}；地区等级和法律地位可能不同。`,
    },
    description: b(
      `${displayName.en} (${scientificName}) is a ${dietTag.toLowerCase()} ${classEn} associated with ${habitatTag.toLowerCase()} habitat. It belongs to ${taxonomy.family.en}; this reviewed summary separates accepted identity and global conservation category from regional claims.`,
      `${displayName.zh}（${scientificName}）是与${habitatZh[habitatTag]}生境相关的${dietZh[dietTag]}${classZh}，属于${taxonomy.family.zh}。本次复核把接受的物种身份和全球保护等级与地区性说法区分开。`,
    ),
    encyclopedia: {
      anatomy: section(
        `${displayName.en} is placed in genus ${taxonomy.genus.en}, family ${taxonomy.family.en}. Appearance can vary with age, sex, season and locality, so species-level identification should combine several visible characters, location and the accepted scientific name.`,
        `${displayName.zh}归入${taxonomy.genus.zh}、${taxonomy.family.zh}。外形会随年龄、性别、季节和地点变化，因此物种级鉴定应结合多个可见特征、地点和接受学名。`,
        ["taxonomy", "general"],
      ),
      ecology_and_behavior: section(
        `This project classifies the species as ${dietTag.toLowerCase()} in ${habitatTag.toLowerCase()} habitat. Feeding, activity and social behavior can vary among populations and seasons; details should be tied to an exact-taxon account rather than generalized from one observation.`,
        `本项目把该物种归为${habitatZh[habitatTag]}生境中的${dietZh[dietTag]}动物。取食、活动和社会行为会随种群与季节变化；细节应对应精确分类单元资料，不能从一次观察泛化。`,
        ["general", "ecology"],
      ),
      habitat_and_distribution: section(
        `${habitatText.en} ${geometryChanged ? "The obsolete North American polygon was removed after the species split; the retained Eurasian geometry" : "The existing map"} is for orientation and is explicitly treated as approximate rather than a verified legal or survey boundary.`,
        `${habitatText.zh} ${geometryChanged ? "物种拆分后已移除过时的北美多边形；保留的欧亚范围" : "现有地图"}仅为定位参考，并明确作为近似示意，而不是经过核实的法律或调查边界。`,
        ["range"],
      ),
    },
    rich_content: {
      quick_facts: [
        fact("scientific_name", "Scientific name", "学名", scientificName, scientificName, ["taxonomy"]),
        fact("class", "Class", "纲", taxonomy.class.en, taxonomy.class.zh, ["taxonomy"]),
        fact("order", "Order", "目", taxonomy.order.en, taxonomy.order.zh, ["taxonomy"]),
        fact("family", "Family", "科", taxonomy.family.en, taxonomy.family.zh, ["taxonomy"]),
        fact("habitat", "Habitat", "生境", habitatTag, habitatZh[habitatTag], ["range"]),
        fact("diet", "Diet", "食性", dietTag, dietZh[dietTag], ["ecology"]),
        fact("status", "IUCN status", "IUCN等级", statusEn, statusZh, ["conservation"]),
      ],
      life_cycle_and_reproduction: section(classLife(classTag).en, classLife(classTag).zh),
      adaptations: [
        { title: b("Body plan", "身体结构"), detail: b(`Its body plan is evaluated within ${taxonomy.family.en}; age, sex and seasonal variation must be separated from species-level traits.`, `其身体结构按${taxonomy.family.zh}背景评估；年龄、性别和季节变化必须与物种级特征区分。`), source_keys: ["taxonomy", "general"] },
        { title: b("Feeding strategy", "取食策略"), detail: b(`The ${dietTag.toLowerCase()} category is a broad guide; exact foods and methods can vary by life stage, season and locality.`, `${dietZh[dietTag]}类别只是宽泛指引；具体食物和方式会随生活阶段、季节及地点变化。`), source_keys: ["ecology"] },
        { title: b("Habitat fit", "生境适配"), detail: b(`Use of ${habitatTag.toLowerCase()} habitat is interpreted from exact-taxon occurrence and range evidence, not from map shape alone.`, `对${habitatZh[habitatTag]}生境的利用依据精确分类单元的出现与分布证据解释，不能只看地图形状。`), source_keys: ["range"] },
      ],
      ecological_role: section(
        `As a ${dietTag.toLowerCase()} species in ${habitatTag.toLowerCase()} habitat, it transfers energy through local food webs. Its exact ecological effect depends on abundance, food resources and interactions documented for each population.`,
        `作为${habitatZh[habitatTag]}生境中的${dietZh[dietTag]}物种，它在当地食物网中传递能量。具体生态影响取决于各地种群数量、食物资源和有记录的相互作用。`,
        ["ecology"],
      ),
      conservation_and_threats: {
        population_trend: "unknown",
        threats: b(
          code === "NE" ? "A missing confirmed global assessment creates uncertainty and must not be converted into a claim that the species is secure." : `The ${statusEn} global category does not remove local risks from habitat change, direct mortality, disturbance, pollution or climate effects.`,
          code === "NE" ? "缺少经确认的全球评估意味着存在不确定性，不能据此宣称该物种安全。" : `${statusZh}这一全球等级并不排除生境变化、直接死亡、干扰、污染或气候影响等地方风险。`,
        ),
        actions: b("Protect the habitats and ecological processes identified by range authorities, reduce documented direct mortality and update management when monitoring or taxonomy changes.", "应保护分布权威确认的生境和生态过程，减少有记录的直接死亡，并在监测或分类变化时更新管理。"),
        source_keys: ["conservation", "range"],
      },
      identification: {
        key_features: b(`Confirm ${displayName.en} with multiple visible characters, location and an exact taxon-linked record; color or body shape alone may be insufficient.`, `确认${displayName.zh}时，应结合多个可见特征、地点和精确分类单元记录；仅凭颜色或体形可能不足。`),
        similar_species: b("Close relatives and regional look-alikes can share major features. A filename, common name or single trait is not enough for image approval.", "近缘种和地区性相似种可能共享主要特征。文件名、俗名或单一特征不足以批准图片。"),
        source_keys: ["taxonomy", "general"],
      },
      communication_and_senses: section("Communication and sensory channels are shaped by this species' habitat and class. A specific call, scent signal or sensory claim should be assigned only when the exact-taxon source supports it.", "交流与感官通道受该物种生境和类群塑造。只有精确分类单元来源支持时，才能指定具体叫声、气味信号或感官能力。"),
      seasonal_calendar: section("Breeding, movement, molt, dormancy or food use can shift with latitude, rainfall, temperature and resource pulses. A date from one population is not treated as universal.", "繁殖、移动、换羽、休眠或食物利用会随纬度、降雨、温度和资源脉冲变化。某一种群的日期不会被写成普遍规律。", ["ecology", "range"]),
      relationship_with_humans: section("Use, conflict, tourism and cultural relationships vary across the range. Safe observation avoids handling, feeding, playback and disturbance of nests, dens or natural behavior.", "利用、冲突、旅游和文化关系因分布区而异。安全观察应避免触摸、投喂、播放声音，以及干扰巢穴、洞穴或自然行为。", ["general", "conservation"]),
      evolution: section(`${scientificName} is placed in genus ${taxonomy.genus.en}, family ${taxonomy.family.en}, order ${taxonomy.order.en}. This review follows the accepted species match cited in the taxonomy evidence.`, `${scientificName}归入${taxonomy.genus.zh}、${taxonomy.family.zh}、${taxonomy.order.zh}。本次复核遵循分类证据中的接受种匹配。`, ["taxonomy"]),
      field_signs: section("Tracks, calls, nests, feeding marks, molts or other indirect signs can narrow an identification but usually cannot confirm a species alone. Sensitive or dangerous animals require distance.", "足迹、叫声、巢、取食痕迹、蜕皮或其他间接线索可缩小鉴定范围，但通常不能单独确认物种。遇到敏感或危险动物应保持距离。"),
      did_you_know: [
        { text: b(`The accepted scientific name used in this review is ${scientificName}.`, `本次复核采用的接受学名是${scientificName}。`), source_keys: ["taxonomy"] },
        { text: b(code === "NE" ? "Not Evaluated means a confirmed global species assessment was unavailable, not that extinction risk is zero." : `${statusEn} is the checked global IUCN category, not a regional legal status.`, code === "NE" ? "未评估表示缺少经确认的全球物种评估，不代表灭绝风险为零。" : `${statusZh}是本次核对的全球IUCN等级，并非地区性法律地位。`), source_keys: ["conservation"] },
        { text: b(geometryChanged ? "The obsolete North American polygon was removed after the Eurasian and American Goshawk split; the retained Eurasian geometry remains approximate." : hasPolygon ? "The map retains the previous approximate polygon and does not claim a newly verified boundary." : "The map retains a representative point and does not present it as the full range.", geometryChanged ? "在苍鹰与美洲苍鹰拆分后，过时的北美多边形已移除；保留的欧亚范围仍为近似示意。" : hasPolygon ? "地图保留原有近似多边形，并不声称这是新核实的边界。" : "地图保留代表点，并不把它当作完整分布范围。"), source_keys: ["range"] },
      ],
      class_specific: [{ title: classModule(classTag), content: classLife(classTag), source_keys: ["general"] }],
    },
    habitat: {
      ...old.habitat,
      global_distribution_polygons: mapPolygons,
      text_en: habitatText.en,
      text_zh: habitatText.zh,
      range_review: {
        display_mode: hasPolygon ? "legacy-polygon-retained" : "representative-point",
        previous_result: geometryReplacedNow ? "replaced" : "retained",
        source_keys: ["range"],
        comparison_en: geometryChanged
          ? "The 2023 eBird/Clements split recognizes American Goshawk separately from the Eurasian species. The clearly obsolete North American polygon was removed; center, zoom, and the Eurasian and Japanese polygons are retained byte-for-byte and remain labelled approximate."
          : hasPolygon
          ? "The previous center, zoom and every polygon coordinate are retained byte-for-byte. Exact-taxon range evidence supports the broad occurrence context, but no reusable authoritative boundary geometry was established; the polygon remains labelled approximate."
          : "The previous center and zoom are retained byte-for-byte. Exact-taxon range sources were checked, but no reusable authoritative polygon was established; the point is explicitly labelled as a representative location, not the full range.",
        comparison_zh: geometryChanged
          ? "2023年eBird/Clements分类更新将美洲苍鹰从欧亚苍鹰中拆分。已移除明确过时的北美多边形；中心点、缩放级别以及欧亚和日本多边形均逐字节保留，并继续标为近似范围。"
          : hasPolygon
          ? "原有中心点、缩放级别和每个多边形坐标均逐字节保留。精确分类单元的分布证据支持大致出现背景，但未取得可复用的权威边界几何，因此多边形继续标为近似范围。"
          : "原有中心点和缩放级别逐字节保留。已检查精确分类单元的分布来源，但未取得可复用的权威多边形；页面明确把该点标为代表性地点，而非完整分布范围。",
        checked_at: CHECKED,
      },
    },
    sources: {
      taxonomy: taxonomySourceOverrides[old.id] || source("GBIF Backbone Taxonomy", evidence.gbif.query_url),
      conservation: source(statusOverride?.authority || "GBIF–IUCN Red List category service", statusOverride?.url || evidence.iucn.query_url),
      general: source(evidence.inaturalist ? "iNaturalist exact taxon index" : "GBIF species record", generalUrl),
      ecology: source(evidence.inaturalist ? "iNaturalist exact taxon index" : "GBIF species record", generalUrl),
      range: old.id === "northern-goshawk"
        ? source("Cornell Lab eBird/Clements 2023 species split", "https://science.ebird.org/en/use-ebird-data/the-ebird-taxonomy/2023-ebird-taxonomy-update")
        : source("GBIF species occurrence and distribution record", `https://api.gbif.org/v1/species/${evidence.gbif.usage_key}`),
    },
  };

  if (old.id === "galapagos-tortoise") {
    result.name_en = "Floreana Giant Tortoise";
    result.name_zh = "弗洛雷亚纳象龟";
    result.description = b("Chelonoidis niger is the extinct Floreana giant tortoise, not a name for all living Galápagos giant tortoises. The original island population disappeared in the 19th century; current restoration animals carry partial Floreana ancestry.", "Chelonoidis niger指已经灭绝的弗洛雷亚纳象龟，而不是所有现生加拉帕戈斯象龟的统称。原岛种群在19世纪消失；当前用于生态恢复的个体只携带部分弗洛雷亚纳血统。");
    result.encyclopedia.habitat_and_distribution = section("The historical species was endemic to Floreana Island in the Galápagos. The retained point marks the island only and must not be interpreted as a surviving wild population.", "历史上的该物种为加拉帕戈斯弗洛雷亚纳岛特有。保留点位只标示该岛，不能理解为仍有现存野生种群。", ["range", "conservation"]);
    result.sources.general = source("Charles Darwin Foundation Galápagos Species Database", "https://datazone.darwinfoundation.org/es/checklist/?species=25151");
    result.sources.ecology = result.sources.general;
    result.sources.range = result.sources.general;
    result.rich_content.quick_facts[0].value = b("Chelonoidis niger", "Chelonoidis niger");
    result.rich_content.identification.key_features = b("No verified photograph of a living pure Floreana giant tortoise can exist because the historical species is extinct; living restoration animals are selected hybrids with partial ancestry.", "历史物种已经灭绝，因此不可能存在经核实的现生纯种弗洛雷亚纳象龟照片；现有恢复个体是经选择、带部分血统的杂交后代。");
    result.image = null;
  }
  return result;
}

const draft = baseline.animals.map(build);
fs.writeFileSync(path.join(ROOT, "_draft_animals.json"), `${JSON.stringify(draft, null, 2)}\n`, "utf8");
console.log(`Built ${draft.length} ${reviewed ? "reviewed" : "pending-review"} ${BATCH} replacements.`);
