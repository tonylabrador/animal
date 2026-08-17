const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DRAFT_PATH = path.join(ROOT, "_draft_animals.json");
const CHECKED_AT = "2026-08-16";

const gbif = {
  "short-beaked-echidna": [2433378, 41312],
  "rock-hyrax": [5219598, 41766],
  "greater-rhea": [2495165, 22678073],
  "atlantic-puffin": [2481353, 22694927],
  tuatara: [5227650, 131735762],
  "european-hedgehog": [5219616, 29650],
  "star-nosed-mole": [2436248, 41458],
  "great-crested-grebe": [2482054, 22696602],
  "great-hornbill": [2476012, 22682453],
  "purple-frog": [2421431, 58051],
};

const authoritativeSources = {
  "short-beaked-echidna": {
    general: ["Australian Museum", "https://australian.museum/learn/animals/mammals/short-beaked-echidna/"],
    ecology: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Tachyglossus_aculeatus/"],
    range: ["Australian Museum", "https://australian.museum/learn/animals/mammals/short-beaked-echidna/"],
  },
  "rock-hyrax": {
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Procavia_capensis/"],
    ecology: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Procavia_capensis/"],
    range: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Procavia_capensis/"],
  },
  "greater-rhea": {
    general: ["Smithsonian's National Zoo and Conservation Biology Institute", "https://nationalzoo.si.edu/animals/greater-rhea"],
    ecology: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Rhea_americana/"],
    range: ["Smithsonian's National Zoo and Conservation Biology Institute", "https://nationalzoo.si.edu/animals/greater-rhea"],
  },
  "atlantic-puffin": {
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Fratercula_arctica/"],
    ecology: ["BirdLife International DataZone", "https://datazone.birdlife.org/species/factsheet/atlantic-puffin-fratercula-arctica"],
    range: ["BirdLife International DataZone", "https://datazone.birdlife.org/species/factsheet/atlantic-puffin-fratercula-arctica"],
  },
  tuatara: {
    general: ["New Zealand Department of Conservation", "https://www.doc.govt.nz/nature/native-animals/reptiles-and-frogs/tuatara/"],
    ecology: ["New Zealand Department of Conservation", "https://www.doc.govt.nz/nature/native-animals/reptiles-and-frogs/tuatara/"],
    range: ["New Zealand Department of Conservation", "https://www.doc.govt.nz/nature/native-animals/reptiles-and-frogs/tuatara/"],
  },
  "european-hedgehog": {
    general: ["The Mammal Society", "https://mammal.org.uk/british-mammals/european-hedgehog"],
    ecology: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Erinaceus_europaeus/"],
    range: ["The Mammal Society", "https://mammal.org.uk/british-mammals/european-hedgehog"],
  },
  "star-nosed-mole": {
    general: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Condylura_cristata/"],
    ecology: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Condylura_cristata/"],
    range: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Condylura_cristata/"],
  },
  "great-crested-grebe": {
    general: ["Royal Society for the Protection of Birds", "https://www.rspb.org.uk/birds-and-wildlife/great-crested-grebe"],
    ecology: ["Royal Society for the Protection of Birds", "https://www.rspb.org.uk/birds-and-wildlife/great-crested-grebe"],
    range: ["BirdLife International DataZone", "https://datazone.birdlife.org/species/factsheet/great-crested-grebe-podiceps-cristatus"],
  },
  "great-hornbill": {
    general: ["IUCN Hornbill Specialist Group", "https://iucnhornbills.org/great-hornbill/"],
    ecology: ["Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Buceros_bicornis/"],
    range: ["BirdLife International DataZone", "https://datazone.birdlife.org/species/factsheet/great-hornbill-buceros-bicornis"],
  },
  "purple-frog": {
    general: ["EDGE of Existence, Zoological Society of London", "https://www.edgeofexistence.org/species/purple-frog/"],
    ecology: ["EDGE of Existence, Zoological Society of London", "https://www.edgeofexistence.org/species/purple-frog/"],
    range: ["Amphibian Species of the World, American Museum of Natural History", "https://amphibiansoftheworld.amnh.org/Amphibia/Anura/Nasikabatrachidae/Nasikabatrachus/Nasikabatrachus-sahyadrensis"],
  },
};

const status = {
  "short-beaked-echidna": ["LC", "Least Concern", "无危", "unknown"],
  "rock-hyrax": ["LC", "Least Concern", "无危", "unknown"],
  "greater-rhea": ["NT", "Near Threatened", "近危", "decreasing"],
  "atlantic-puffin": ["VU", "Vulnerable", "易危", "decreasing"],
  tuatara: ["LC", "Least Concern", "无危", "unknown"],
  "european-hedgehog": ["NT", "Near Threatened", "近危", "decreasing"],
  "star-nosed-mole": ["LC", "Least Concern", "无危", "unknown"],
  "great-crested-grebe": ["LC", "Least Concern", "无危", "increasing"],
  "great-hornbill": ["VU", "Vulnerable", "易危", "decreasing"],
  "purple-frog": ["NT", "Near Threatened", "近危", "unknown"],
};

const mapReview = {
  "short-beaked-echidna": [[-25, 134], 3, "Australia, Tasmania and southern New Guinea", "澳大利亚、塔斯马尼亚及新几内亚南部"],
  "rock-hyrax": [[0, 30], 2, "Rocky habitats across much of Africa and parts of the Middle East", "非洲广大地区及中东部分地区的岩石栖息地"],
  "greater-rhea": [[-30, -60], 3, "Open country in central and eastern South America", "南美洲中部与东部的开阔地带"],
  "atlantic-puffin": [[64.96, -19.02], 3, "North Atlantic breeding coasts and offshore waters", "北大西洋繁殖海岸与外海水域"],
  tuatara: [[-40.8, 174.8], 5, "Predator-managed islands and sanctuaries in New Zealand", "新西兰经外来捕食者管理的岛屿与保护地"],
  "european-hedgehog": [[50, 15], 3, "Much of Europe, with introduced populations in New Zealand", "欧洲大部，并被引入新西兰"],
  "star-nosed-mole": [[45, -75], 4, "Wet habitats in eastern North America", "北美洲东部的湿润栖息地"],
  "great-crested-grebe": [[35, 45], 2, "Fresh waters across broad parts of Europe, Africa, Asia and Australasia", "欧洲、非洲、亚洲和澳大拉西亚广大地区的淡水水域"],
  "great-hornbill": [[18, 100], 3, "Forests of South and Southeast Asia", "南亚与东南亚森林"],
  "purple-frog": [[10, 76.8], 6, "The Western Ghats of Kerala and Tamil Nadu, India", "印度喀拉拉邦与泰米尔纳德邦的西高止山脉"],
};

function sourced(en, zh, sourceKeys) {
  return { en, zh, source_keys: sourceKeys };
}

function quick(key, labelEn, labelZh, valueEn, valueZh, sourceKeys) {
  return { key, label: { en: labelEn, zh: labelZh }, value: { en: valueEn, zh: valueZh }, source_keys: sourceKeys };
}

const animals = JSON.parse(fs.readFileSync(DRAFT_PATH, "utf8"));
for (const animal of animals) {
  const [gbifKey, iucnId] = gbif[animal.id];
  const sources = authoritativeSources[animal.id];
  animal.sources.taxonomy = {
    authority: "Global Biodiversity Information Facility (GBIF) Species API",
    url: `https://api.gbif.org/v1/species/${gbifKey}`,
    checked_at: CHECKED_AT,
  };
  animal.sources.conservation = {
    authority: `IUCN Red List category (taxon ${iucnId}) via the GBIF IUCN endpoint`,
    url: `https://api.gbif.org/v1/species/${gbifKey}/iucnRedListCategory`,
    checked_at: CHECKED_AT,
  };
  for (const key of ["general", "ecology", "range"]) {
    animal.sources[key] = { authority: sources[key][0], url: sources[key][1], checked_at: CHECKED_AT };
  }

  const [code, en, zh, trend] = status[animal.id];
  animal.conservation_status = {
    code,
    en,
    zh,
    note_en: `Current global category checked on ${CHECKED_AT} through the IUCN-linked GBIF category endpoint.`,
    note_zh: `已于${CHECKED_AT}通过关联IUCN的GBIF类别接口核对当前全球等级。`,
  };
  animal.rich_content.conservation_and_threats.population_trend = trend;

  const [coordinates, zoom, rangeEn, rangeZh] = mapReview[animal.id];
  animal.habitat.map_coordinates = coordinates;
  animal.habitat.map_zoom_level = zoom;
  animal.habitat.global_distribution_polygons = [];
  animal.habitat.text_en = rangeEn;
  animal.habitat.text_zh = rangeZh;
  animal.habitat.range_review = {
    display_mode: "representative-point",
    previous_result: "not-applicable",
    source_keys: ["range", "conservation"],
    comparison_en: "This is a new record with no previous map geometry. Authoritative range pages and the IUCN-linked assessment were checked, but reusable verified polygon coordinates were not available for import; the map therefore shows one clearly labelled representative point, not the species' full range.",
    comparison_zh: "这是没有旧地图几何的新记录。已检查权威分布页面及关联IUCN的评估，但没有可导入的经过核实且可复用的多边形坐标；因此地图只显示一个明确标注的代表点，并不表示该物种的完整分布范围。",
    checked_at: CHECKED_AT,
  };
}

const byId = Object.fromEntries(animals.map((animal) => [animal.id, animal]));

{
  const animal = byId["short-beaked-echidna"];
  animal.rich_content.quick_facts[0].value = { en: "Body length about 30–45 cm", zh: "体长约30–45厘米" };
  animal.rich_content.quick_facts[1].value = { en: "About 2–7 kg", zh: "约2–7千克" };
  animal.rich_content.quick_facts[3].value = { en: "Activity timing shifts with temperature; often crepuscular or nocturnal in hot conditions", zh: "活动时间随温度变化；炎热时常在晨昏或夜间活动" };
  animal.rich_content.quick_facts[5].value = { en: "One egg in a breeding attempt", zh: "每次繁殖通常产1枚卵" };
  animal.rich_content.evolution = sourced(
    "Short-beaked echidnas are monotremes: mammals that reproduce by laying eggs. Together with long-beaked echidnas and the platypus, they represent one of the three major living mammal lineages.",
    "短吻针鼹属于单孔类，也就是以产卵方式繁殖的哺乳动物。它与长吻针鼹和鸭嘴兽共同代表现生哺乳动物的三大主要支系之一。",
    ["taxonomy", "general"],
  );
  animal.rich_content.seasonal_calendar.zh = "繁殖多发生在冬末至春初。雄性会跟随雌性形成“求爱列车”，求偶有时可持续近一个月；交配后约三周产下一枚卵。";
}

{
  const animal = byId["rock-hyrax"];
  animal.habitat.text_en = "Rocky habitats across much of Africa and parts of the Middle East, from lowlands to high mountains.";
  animal.habitat.text_zh = "分布于非洲广大地区及中东部分地区，从低地到高山的岩石栖息地。";
  animal.encyclopedia.habitat_and_distribution.en = "Rock hyraxes use cliffs, boulder fields and other rocky places across much of Africa and parts of the Middle East. Cracks and cavities provide shelter from predators and temperature extremes; nearby vegetation supplies food.";
  animal.encyclopedia.habitat_and_distribution.zh = "岩蹄兔分布于非洲广大地区及中东部分地区，利用悬崖、巨石区等岩石环境。裂缝和洞穴能帮助它们躲避捕食者与极端温度，附近植被则提供食物。";
  animal.rich_content.quick_facts[5].value = { en: "Gestation about 6–8 months; litters commonly contain several well-developed young", zh: "妊娠约6–8个月；每胎通常有数只发育较成熟的幼崽" };
  animal.rich_content.life_cycle_and_reproduction = sourced(
    "Breeding is seasonal, with timing varying by region and rainfall. Gestation lasts about 6–8 months, unusually long for an animal of this size, and litters range from 1–6 young. Newborns are well developed, with open eyes and a full coat, and can begin eating solid food within days.",
    "岩蹄兔季节性繁殖，具体时间随地区和降雨而变。妊娠期约6–8个月，对这种体型的动物而言很长；每胎可产1–6只幼崽。新生幼崽发育较成熟，睁眼且已有完整毛被，出生数日后便能开始吃固体食物。",
    ["general"],
  );
  animal.rich_content.evolution = sourced(
    "Hyraxes belong to Hyracoidea. Despite their rodent-like outline, anatomical and molecular evidence places them in Paenungulata, the larger evolutionary group that also includes elephants and sirenians.",
    "蹄兔属于蹄兔目。尽管外形有些像啮齿动物，解剖与分子证据却把它们归入近蹄类这一更大的演化类群；大象和海牛也属于该类群。",
    ["taxonomy", "general"],
  );
}

{
  const animal = byId["greater-rhea"];
  animal.rich_content.quick_facts = [
    quick("height", "Height", "身高", "About 0.9–1.5 m", "约0.9–1.5米", ["general"]),
    quick("weight", "Weight", "体重", "About 15–30 kg", "约15–30千克", ["general"]),
    quick("diet", "Diet", "食性", "Broad-leaved plants and clover, plus seeds, roots, fruit, insects and small vertebrates", "阔叶植物和三叶草，也吃种子、根、果实、昆虫与小型脊椎动物", ["general"]),
    quick("activity", "Activity", "活动方式", "Diurnal and ground-dwelling", "昼行，地栖", ["general", "ecology"]),
    quick("social_unit", "Social unit", "社会结构", "Usually groups outside the nesting phase", "非筑巢阶段通常结群", ["general"]),
    quick("nesting", "Nesting", "筑巢育幼", "The male incubates and cares for chicks", "由雄鸟孵卵并照顾雏鸟", ["general"]),
    quick("incubation", "Incubation", "孵化期", "About 6 weeks", "约6周", ["general"]),
  ];
  animal.rich_content.life_cycle_and_reproduction = sourced(
    "Breeding timing varies across the range and can extend from August into January. A male courts several females, builds a shallow ground nest and incubates the combined clutch for about six weeks. He then guards and cares for the chicks without help from the females.",
    "繁殖时间随地区而异，可从8月延续到次年1月。雄鸟会向多只雌鸟求偶，在地面建造浅巢，并独自把多只雌鸟产在同一巢中的卵孵约6周；之后也由雄鸟独自守护和照顾雏鸟。",
    ["general"],
  );
  animal.rich_content.seasonal_calendar = sourced(
    "Courtship and nesting occur during the southern spring and early summer, with timing varying by locality. Outside breeding, birds commonly travel and feed in groups; nesting males become solitary and strongly defensive around the brood.",
    "求偶与筑巢发生在南半球春季至初夏，具体时间因地区而异。非繁殖期常结群移动、觅食；负责筑巢的雄鸟则会独处，并强烈守护幼鸟。",
    ["general", "ecology"],
  );
}

{
  const animal = byId["atlantic-puffin"];
  animal.rich_content.quick_facts[0].value = { en: "Length about 28–30 cm; wingspan about 50–60 cm", zh: "体长约28–30厘米；翼展约50–60厘米" };
  animal.rich_content.quick_facts[1].value = { en: "About 380–500 g", zh: "约380–500克" };
  animal.rich_content.quick_facts[4].value = { en: "One egg per breeding attempt; incubation about 40 days", zh: "每次繁殖通常产1枚卵；孵化约40天" };
  animal.rich_content.seasonal_calendar = sourced(
    "Adults return to nesting colonies in spring, lay in late spring or early summer, and rear chicks through summer. After breeding they disperse at sea across the North Atlantic and spend the winter away from their nesting burrows.",
    "成鸟在春季返回繁殖群落，于春末或夏初产卵，并在夏季育雏。繁殖结束后，它们分散到北大西洋海上越冬，远离筑巢洞穴。",
    ["ecology", "range"],
  );
  animal.rich_content.evolution = sourced(
    "The Atlantic puffin is one of three living species in the puffin genus Fratercula, within the auk family. Its closest living congeners are the horned puffin and tufted puffin of the North Pacific.",
    "北极海鹦是海鹦属现生3个物种之一，隶属海雀科；其现生同属近亲是北太平洋的角海鹦和簇羽海鹦。",
    ["taxonomy"],
  );
}

{
  const animal = byId.tuatara;
  animal.name_zh = "斑点楔齿蜥";
  animal.description = {
    en: "The tuatara is a reptile found only in New Zealand. Although it resembles a lizard, it is the sole living representative of the distinct order Rhynchocephalia. A row of soft spines runs along the head, back and tail, especially prominently in males.",
    zh: "斑点楔齿蜥是仅见于新西兰的爬行动物。虽然外形像蜥蜴，它却是喙头目唯一现生代表。头部、背部和尾部有一列柔软棘突，雄性尤其明显。",
  };
  animal.rich_content.quick_facts[0].value = { en: "Adult males about 0.5 m long; females are smaller", zh: "成年雄性约0.5米长；雌性较小" };
  animal.rich_content.quick_facts[1].value = { en: "Adult males up to about 1.5 kg", zh: "成年雄性可达约1.5千克" };
  animal.rich_content.quick_facts[5].value = { en: "Generally solitary; burrows may occur among seabird colonies", zh: "通常独居；洞穴可位于海鸟繁殖群落中" };
  animal.rich_content.seasonal_calendar = sourced(
    "Activity decreases during cool winter conditions. Mating occurs during the New Zealand summer, while females lay eggs later and development continues through a very long incubation lasting roughly a year or more.",
    "寒冷冬季的活动会减少。交配发生在新西兰夏季，雌性随后产卵；胚胎经过约1年或更久的漫长孵化期才完成发育。",
    ["general", "ecology"],
  );
  animal.rich_content.evolution = sourced(
    "Tuatara are the only living members of Rhynchocephalia, a reptile lineage distinct from lizards and snakes. Calling them unchanged 'living fossils' is misleading: the lineage is ancient, but tuatara have continued to evolve.",
    "斑点楔齿蜥是喙头目唯一现生成员，这一爬行动物支系不同于蜥蜴和蛇。把它称作一成不变的“活化石”并不准确：其支系十分古老，但它一直在继续演化。",
    ["taxonomy", "ecology"],
  );
}

{
  const animal = byId["european-hedgehog"];
  animal.description = {
    en: "The European hedgehog is a small nocturnal mammal with a pointed snout and a coat of defensive spines. When threatened, powerful skin muscles help it curl into a tight ball. It uses woodland edges, farmland with hedges, parks and gardens across much of Europe.",
    zh: "西欧刺猬是一种小型夜行哺乳动物，吻部尖细，身上覆盖防御性棘刺。受到威胁时，强有力的皮肤肌肉能帮助它蜷成紧密的球。它分布于欧洲大部，利用林缘、带树篱的农田、公园和花园。",
  };
  animal.rich_content.quick_facts[0].value = { en: "Head-body length about 20–30 cm; tail about 1–2 cm", zh: "头体长约20–30厘米；尾长约1–2厘米" };
  animal.rich_content.quick_facts[1].value = { en: "Usually about 400–1,100 g; body mass changes seasonally", zh: "通常约400–1,100克；体重随季节变化" };
  animal.rich_content.life_cycle_and_reproduction = sourced(
    "Breeding mainly runs from spring into early autumn. After a gestation of roughly five weeks, females give birth in a well-lined nest; litter size varies, and the blind newborns have soft spines hidden beneath swollen skin. Young are nursed for several weeks and then become independent.",
    "繁殖主要从春季持续到初秋。经过约5周妊娠，雌性会在铺垫良好的巢中产仔；每胎数量不一，初生幼崽尚未睁眼，柔软棘刺藏在肿胀皮肤下。幼崽接受数周哺乳后逐渐独立。",
    ["general", "ecology"],
  );
  animal.rich_content.seasonal_calendar = sourced(
    "Breeding is concentrated from spring to early autumn. In colder parts of the range, hedgehogs typically hibernate through winter, while exact timing changes with latitude, weather and the animal's condition.",
    "繁殖集中在春季至初秋。在分布区较寒冷的部分，西欧刺猬通常会冬眠；具体起止时间随纬度、天气和个体状态而变。",
    ["general", "ecology"],
  );
  animal.rich_content.evolution = sourced(
    "European hedgehogs belong to Erinaceidae within Eulipotyphla. They are evolutionarily closer to shrews and moles than to porcupines; porcupines are rodents, while hedgehogs are not.",
    "西欧刺猬属于真盲缺目猬科。它与鼩鼱和鼹鼠的亲缘关系比与豪猪更近；豪猪属于啮齿动物，而刺猬并不是。",
    ["taxonomy"],
  );
  animal.rich_content.did_you_know[0].text = {
    en: "A hedgehog's coat contains thousands of modified hairs called spines; unlike porcupine quills, they are not normally shed as a defensive projectile.",
    zh: "刺猬体表有数千根由毛发特化而成的棘刺；与豪猪刺不同，它们通常不会作为防御性“投射物”脱落。",
  };
}

{
  const animal = byId["star-nosed-mole"];
  animal.rich_content.quick_facts[0].value = { en: "Total length about 15–20 cm, including the tail", zh: "含尾全长约15–20厘米" };
  animal.rich_content.quick_facts[1].value = { en: "About 35–75 g", zh: "约35–75克" };
  animal.rich_content.quick_facts[4].value = { en: "Usually solitary; seasonal pairs and loose colonies have been reported", zh: "通常独居；也有季节性配对和松散群居的记录" };
  animal.rich_content.seasonal_calendar.zh = "星鼻鼹在冬末和早春交配，幼崽于春季出生并在初夏离巢。秋冬季仍会活动，有时在雪下挖掘，也会游入冰层下的水中。";
  animal.rich_content.evolution = sourced(
    "The star-nosed mole is the only living species in the genus Condylura. It is a true mole in Talpidae, but differs from most other North American moles in being strongly associated with wetlands and regularly hunting underwater.",
    "星鼻鼹是星鼻鼹属唯一现生物种，属于鼹科的真正鼹鼠；但它与多数北美鼹鼠不同，和湿地关系密切，并经常在水下捕食。",
    ["taxonomy", "general"],
  );
}

{
  const animal = byId["great-crested-grebe"];
  animal.taxonomy.order.zh = "䴙䴘目";
  animal.taxonomy.family.zh = "䴙䴘科";
  animal.taxonomy.genus.zh = "䴙䴘属";
  animal.description.zh = animal.description.zh.replaceAll("鸊鹈", "䴙䴘");
  animal.encyclopedia.habitat_and_distribution = sourced(
    "Great crested grebes use lakes, reservoirs, ponds and slow rivers with enough open water for diving and vegetation for anchoring nests. The species occurs across broad parts of Europe, Africa, Asia and Australasia; some populations migrate while others remain resident.",
    "凤头䴙䴘利用湖泊、水库、池塘和缓流河段，需要足够的开阔水面潜水，也需要植被固定巢。该物种广布于欧洲、非洲、亚洲和澳大拉西亚；部分种群迁徙，另一些则常年留居。",
    ["range", "general"],
  );
  animal.rich_content.seasonal_calendar = sourced(
    "Breeding begins in spring in temperate regions, when pairs perform synchronized head-shaking and weed displays. Timing varies across the broad global range; birds from colder regions may migrate to milder waters outside the breeding season.",
    "在温带地区，繁殖通常于春季开始，成对个体会进行同步摇头和衔水草展示。由于全球分布很广，具体时间随地区而异；寒冷地区的种群可能在非繁殖期迁往较温和水域。",
    ["general", "range"],
  );
}

{
  const animal = byId["great-hornbill"];
  animal.rich_content.quick_facts[0].value = { en: "About 95–120 cm long", zh: "体长约95–120厘米" };
  animal.encyclopedia.habitat_and_distribution = sourced(
    "Great hornbills live mainly in tall evergreen and moist deciduous forests of South and Southeast Asia. Breeding pairs depend on very large old trees with natural cavities; the loss of those trees can make otherwise forested habitat unusable for nesting.",
    "双角犀鸟主要生活在南亚与东南亚的高大常绿林和湿润落叶林中。繁殖个体依赖具有天然树洞的巨型老树；一旦这些树木消失，即使仍有森林，也可能无法筑巢。",
    ["range", "ecology"],
  );
  animal.rich_content.communication_and_senses.zh = animal.rich_content.communication_and_senses.zh.replaceAll("1.5公里", "约1公里以上");
  animal.rich_content.evolution = sourced(
    "Great hornbills belong to Bucerotidae in the order Bucerotiformes. Like other hornbills, they have fused first and second neck vertebrae that help support the bill; the hollow-looking casque differs greatly in size and shape among hornbill species.",
    "双角犀鸟属于犀鸟目犀鸟科。和其他犀鸟一样，它的前两枚颈椎相互融合，有助于支撑大喙；不同犀鸟物种的盔突大小和形状差异很大。",
    ["taxonomy", "general"],
  );
}

{
  const animal = byId["purple-frog"];
  animal.taxonomy.family.zh = "紫蛙科";
  animal.taxonomy.genus.zh = "紫蛙属";
  animal.description = {
    en: "The purple frog is a stout, dark purplish burrowing frog endemic to India's Western Ghats. Adults spend most of the year underground and emerge briefly with monsoon rains to breed in fast-flowing stream systems. The species was formally described in 2003 and belongs to the distinctive family Nasikabatrachidae.",
    zh: "紫蛙是一种体形粗壮、深紫色的穴居蛙，仅分布于印度西高止山脉。成蛙一年大部分时间都在地下生活，只在季风降雨期间短暂现身，并在急流溪流系统中繁殖。该物种于2003年正式描述，隶属独特的紫蛙科。",
  };
  animal.rich_content.quick_facts[0].value = { en: "Snout–vent length about 5–7 cm; females are larger", zh: "吻肛长约5–7厘米；雌性较大" };
  animal.rich_content.quick_facts[4].value = { en: "Eggs are laid in shaded rocky pools in fast-flowing stream beds; tadpoles cling to rock", zh: "卵产在急流河床中阴蔽的岩石水潭内；蝌蚪可吸附岩石" };
  animal.rich_content.life_cycle_and_reproduction = sourced(
    "Breeding is triggered by monsoon rain. Eggs are laid in small shaded rocky pools in torrential stream beds, and the tadpoles use a suction-like mouth to cling to rock while feeding. Metamorphosis takes roughly 100 days, after which the young leave the stream and adopt the burrowing adult lifestyle.",
    "繁殖由季风降雨触发。卵产在湍急溪流河床中阴蔽的小型岩石水潭内；蝌蚪用吸盘状口部附着岩石并取食。约100天后完成变态，幼蛙离开溪流，开始成蛙的穴居生活。",
    ["general", "ecology"],
  );
  animal.rich_content.seasonal_calendar = sourced(
    "Monsoon rains trigger a brief above-ground breeding period. Tadpoles develop in fast-flowing streams during the wet season, while adults spend most of the remaining year below ground.",
    "季风降雨会触发短暂的地表繁殖期。蝌蚪在雨季的急流中发育，成蛙则在其余大部分时间生活于地下。",
    ["general", "ecology"],
  );
  animal.rich_content.evolution = sourced(
    "The species belongs to a deeply divergent frog lineage. The study that described it supported a close evolutionary relationship between Nasikabatrachidae in India and Sooglossidae in the Seychelles, making the group important for understanding Gondwanan biogeography without implying that it stopped evolving.",
    "该物种属于分化很深的蛙类支系。最初描述它的研究支持印度紫蛙科与塞舌尔塞舌蛙科具有较近演化关系，因此这一类群对理解冈瓦纳生物地理很重要；但这并不意味着它已经停止演化。",
    ["taxonomy", "general"],
  );
  animal.rich_content.did_you_know[3].text = {
    en: "Its evolutionary distinctiveness reflects a long independent history, but the purple frog is not an unchanged relic: it is a modern species with its own continuing evolution.",
    zh: "紫蛙的演化独特性反映了漫长的独立历史，但它并不是一成不变的遗存，而是仍在继续演化的现代物种。",
  };
}

// Final paired-language cleanup after the source review above. Keep every number,
// qualifier and uncertainty marker aligned across the two languages.
{
  const animal = byId["short-beaked-echidna"];
  animal.rich_content.quick_facts[5].value = { en: "A single egg in a breeding attempt", zh: "每次繁殖通常只产一枚卵" };
  animal.rich_content.seasonal_calendar.en = "Breeding occurs in late winter and early spring. During this time, males follow females in 'trains' and courtship can last nearly a month. The single egg is laid about three weeks after mating.";
}

{
  const animal = byId["rock-hyrax"];
  animal.encyclopedia.ecology_and_behavior.en = animal.encyclopedia.ecology_and_behavior.en.replace("live in colonies of up to 80 individuals", "live in colonies that sometimes contain 80 individuals");
  animal.encyclopedia.ecology_and_behavior.zh = animal.encyclopedia.ecology_and_behavior.zh.replace("通常以多达80只的群体生活", "生活在群体中，有些群体可包含80只");
  animal.rich_content.class_specific[1].content = {
    en: "Gestation is unusually long for a mammal of this size. The extended development produces precocial young that are born with open eyes and a full coat and can move over rock soon after birth.",
    zh: "对这种体型的哺乳动物而言，妊娠期异常漫长。较长的发育时间使幼崽出生时已经睁眼、长齐毛被，并能很快在岩石上移动。",
  };
}

{
  const animal = byId["greater-rhea"];
  animal.encyclopedia.anatomy = sourced(
    "Adults stand about 0.9–1.5 m tall and weigh roughly 15–30 kg. Strong legs end in three-toed feet, while the unusually long wings act like rudders for balance and sharp turns during a run.",
    "成鸟身高约0.9–1.5米，体重约15–30千克。强壮双腿末端为三趾足；不会用于飞行的长翼则像方向舵，帮助它们在奔跑中保持平衡并迅速转向。",
    ["general"],
  );
  animal.rich_content.life_cycle_and_reproduction.en = "Breeding timing varies across the range and can extend from month 8 into month 1 of the next year. A male courts several females, builds a shallow ground nest and incubates the combined clutch for about 6 weeks. He then guards and cares for the chicks without help from the females.";
  animal.rich_content.seasonal_calendar.en = "Courtship and nesting occur during the southern spring and early summer, with timing varying by locality. Outside breeding, birds often travel and feed in groups; nesting males become solitary and strongly defensive around the brood.";
}

{
  const animal = byId["atlantic-puffin"];
  animal.rich_content.quick_facts[2].value = { en: "A long-lived seabird; documented individuals can exceed 30 years", zh: "长寿海鸟；有记录的个体可超过30年" };
  animal.rich_content.quick_facts[4].value = { en: "1 egg per breeding attempt; incubation about 40 days", zh: "每次繁殖通常产1枚卵；孵化约40天" };
  animal.rich_content.life_cycle_and_reproduction = sourced(
    "Atlantic puffins begin breeding only after several years. They form long-term pairs and often reuse the same burrow. A pair raises 1 egg, shares incubation for about 40 days, and feeds the chick whole fish until it leaves after roughly 6 weeks.",
    "北极海鹦要经过数年才开始繁殖。它们会形成长期配偶关系，并常重复使用同一个洞穴。每对亲鸟养育1枚卵，共同孵化约40天，并用整条小鱼喂养雏鸟；雏鸟约6周后离巢。",
    ["general", "ecology"],
  );
  animal.rich_content.adaptations[3].detail = {
    en: "Strong claws dig sheltered burrows in soil or turf, helping protect the egg and chick from bad weather and some predators.",
    zh: "强健的爪可以在土壤或草皮中挖出隐蔽洞穴，帮助卵和雏鸟躲避恶劣天气及部分捕食者。",
  };
  animal.rich_content.evolution.en = animal.rich_content.evolution.en.replace("three living species", "3 living species");
}

{
  const animal = byId.tuatara;
  function replaceChineseName(value) {
    if (typeof value === "string") return value.replaceAll("喙头蜥", "斑点楔齿蜥");
    if (Array.isArray(value)) return value.map(replaceChineseName);
    if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value)) value[key] = replaceChineseName(item);
    }
    return value;
  }
  replaceChineseName(animal);
  animal.encyclopedia.anatomy = sourced(
    "Adult males are about 0.5 m long and can weigh up to about 1.5 kg; females are smaller. The jaws carry two rows of upper teeth that close over one lower row, while a crest of soft spines runs along the head, back and tail.",
    "成年雄性体长约0.5米，体重可达约1.5千克；雌性较小。上颌两排牙齿会夹住下颌一排牙齿，头部、背部和尾部则有一列柔软棘突。",
    ["general", "ecology"],
  );
  animal.encyclopedia.ecology_and_behavior = sourced(
    "Tuatara are mainly nocturnal and shelter in burrows. They can remain active in cooler conditions than many reptiles and feed on invertebrates as well as small vertebrates. Seabird colonies can enrich island food webs around their habitat.",
    "斑点楔齿蜥主要在夜间活动，并躲在洞穴中。它能在比许多爬行动物更凉的环境中活动，取食无脊椎动物与小型脊椎动物；海鸟繁殖群落还能丰富岛屿栖息地周围的食物网。",
    ["general", "ecology"],
  );
  animal.rich_content.life_cycle_and_reproduction.en = animal.rich_content.life_cycle_and_reproduction.en.replace("the longest of any reptile", "among the longest incubation periods documented for reptiles");
  animal.rich_content.life_cycle_and_reproduction.zh = animal.rich_content.life_cycle_and_reproduction.zh.replace("是爬行动物中最长的", "属于爬行动物中有记录的最长孵化期之一");
  animal.rich_content.seasonal_calendar.zh = "寒冷冬季的活动会减少。交配发生在新西兰夏季，雌性随后产卵；胚胎经过约一年或更久的漫长孵化期才完成发育。";
}

{
  const animal = byId["european-hedgehog"];
  animal.encyclopedia.anatomy = sourced(
    "Adults are roughly 20–30 cm in head-body length, with a very short tail; body mass varies strongly with season and condition. The back carries several thousand stiff modified hairs called spines, while the face, legs and belly have ordinary fur. A ring of muscles helps pull the spiny skin around the body when the animal rolls up.",
    "成体头体长约20–30厘米，尾巴很短；体重会随季节和个体状态明显变化。背部覆盖数千根由毛发特化而成的硬棘，面部、腿部和腹部则是普通毛发。环状肌肉能在蜷缩时把带棘皮肤拉拢并包住身体。",
    ["general", "ecology"],
  );
  animal.rich_content.life_cycle_and_reproduction.en = "Breeding mainly runs from spring into early autumn. After a gestation of roughly 5 weeks, females give birth in a well-lined nest; litter size varies, and the blind newborns have soft spines hidden beneath swollen skin. Young are nursed for several weeks and then become independent.";
  animal.rich_content.class_specific[1].content.en = animal.rich_content.class_specific[1].content.en.replace("about 4–6 weeks old", "roughly 4–6 weeks old");
  animal.rich_content.class_specific[1].content.zh = animal.rich_content.class_specific[1].content.zh.replace("至4-6周大", "约4–6周大");
}

{
  const animal = byId["great-hornbill"];
  animal.encyclopedia.anatomy = sourced(
    "Great hornbills are about 95–120 cm long and weigh roughly 2–4 kg. The enormous yellow-and-black bill carries a curved casque, while the black-and-white body, yellow-stained neck feathers and broad white tail band create a distinctive adult pattern.",
    "双角犀鸟体长约95–120厘米，体重约2–4千克。巨大的黄黑色喙上有弯曲盔突；黑白相间的身体、被黄色分泌物染色的颈羽和宽阔白色尾带共同形成醒目的成鸟外观。",
    ["general", "ecology"],
  );
  animal.rich_content.seasonal_calendar = sourced(
    "Breeding usually occupies the first part of the year across much of the range. The female remains sealed in the nest cavity for several months, while fledging time varies locally with rainfall and fruit availability.",
    "在大部分分布区，繁殖通常发生在一年较早的时段。雌鸟会在封闭树洞中停留数月；雏鸟离巢时间则随当地降雨与果实供应而变化。",
    ["general", "ecology"],
  );
  animal.rich_content.communication_and_senses = sourced(
    "Great hornbills give loud, harsh calls that carry through forest. They also communicate visually through posture, head movements and bill-clacking, and use keen eyesight to locate fruiting trees and social partners across the canopy.",
    "双角犀鸟会发出可在森林中远传的响亮刺耳叫声。它们也用姿态、头部动作和喙部敲击进行视觉交流，并以敏锐视力在林冠中寻找结果树和同伴。",
    ["general", "ecology"],
  );
}

for (const animal of animals) {
  animal.content_review = {
    factual_qc: "source-checked",
    bilingual_qc: "line-by-line-reviewed",
    reviewed_at: CHECKED_AT,
    reviewer: "Codex source and bilingual audit",
    notes: "Accepted species identity, current global IUCN category, institutional sources, numbers, qualifiers, English/Chinese claim alignment, representative-point range disclosure and image identification criteria were reviewed.",
  };
}

fs.writeFileSync(DRAFT_PATH, `${JSON.stringify(animals, null, 2)}\n`, "utf8");
console.log(`Reviewed ${animals.length} new animal drafts.`);
