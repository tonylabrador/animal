#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const CHECKED = "2026-08-16";
const IDS = [
  "american-red-squirrel","andean-condor","anhinga","annas-hummingbird","aporia-hippia","arctic-fox","asian-elephant","atlantic-spotted-dolphin","bactrian-camel","baiji",
  "bald-eagle","barn-swallow","bat-eared-fox","bearded-bellbird","bearded-vulture","beluga-whale","big-brown-bat","bighorn-sheep","black-backed-kingfisher","black-carp",
  "black-footed-cat","black-headed-spider-monkey","black-stork","black-swallowtail","black-swan","black-tailed-prairie-dog","black-winged-subterranean-termite","blue-crab","blue-dragon","blue-footed-booby",
  "blue-morpho-butterfly","blue-whale","boa-constrictor","bobcat","bohemian-waxwing","bolivian-anaconda","bornean-orangutan","boulder-brain-coral","brown-bear","brown-eared-pheasant",
];

const statusById = {
  "american-red-squirrel":"LC","andean-condor":"VU",anhinga:"LC","annas-hummingbird":"LC","aporia-hippia":"NE","arctic-fox":"LC","asian-elephant":"EN","atlantic-spotted-dolphin":"LC","bactrian-camel":"NE",baiji:"CR",
  "bald-eagle":"LC","barn-swallow":"LC","bat-eared-fox":"LC","bearded-bellbird":"NT","bearded-vulture":"NT","beluga-whale":"LC","big-brown-bat":"LC","bighorn-sheep":"LC","black-backed-kingfisher":"NT","black-carp":"LC",
  "black-footed-cat":"VU","black-headed-spider-monkey":"EN","black-stork":"LC","black-swallowtail":"LC","black-swan":"LC","black-tailed-prairie-dog":"LC","black-winged-subterranean-termite":"NE","blue-crab":"NE","blue-dragon":"NE","blue-footed-booby":"LC",
  "blue-morpho-butterfly":"NE","blue-whale":"EN","boa-constrictor":"LC",bobcat:"LC","bohemian-waxwing":"LC","bolivian-anaconda":"LC","bornean-orangutan":"CR","boulder-brain-coral":"VU","brown-bear":"LC","brown-eared-pheasant":"LC",
};

const decreasing = new Set(["andean-condor","asian-elephant","baiji","bearded-bellbird","bearded-vulture","black-footed-cat","black-headed-spider-monkey","blue-whale","bornean-orangutan","boulder-brain-coral"]);
const stable = new Set(["american-red-squirrel","anhinga","annas-hummingbird","arctic-fox","atlantic-spotted-dolphin","bald-eagle","barn-swallow","bat-eared-fox","beluga-whale","big-brown-bat","bighorn-sheep","black-backed-kingfisher","black-carp","black-stork","black-swallowtail","black-swan","black-tailed-prairie-dog","blue-footed-booby","boa-constrictor","bobcat","bohemian-waxwing","bolivian-anaconda","brown-bear"]);

const specialSources = {
  "american-goldfinch":["Cornell Lab of Ornithology, All About Birds","https://www.allaboutbirds.org/guide/American_Goldfinch/lifehistory"],
  "aporia-hippia":["Russian Insects","https://rusinsects.com/apori.htm"],
  "bearded-bellbird":["BirdLife International DataZone","https://datazone.birdlife.org/species/factsheet/bearded-bellbird-procnias-averano"],
  "black-backed-kingfisher":["BirdLife International DataZone","https://datazone.birdlife.org/species/factsheet/black-backed-dwarf-kingfisher-ceyx-erithaca"],
  "black-carp":["U.S. Fish and Wildlife Service","https://www.fws.gov/apps/carp/carp/species/black-carp-mylopharyngodon-piceus"],
  "blue-dragon":["Natural History Museum, London","https://www.nhm.ac.uk/discover/nudibranchs-psychedelic-thieves-of-the-sea.html"],
  "blue-morpho-butterfly":["Smithsonian Institution","https://www.si.edu/collections/snapshot/beautiful-blue-morpho"],
  "bolivian-anaconda":["Bolivian Biodiversity Information System","https://datos.siarh.gob.bo/biblioteca/index/?accion=itemDescarga&id=870"],
  "boulder-brain-coral":["NOAA Flower Garden Banks National Marine Sanctuary","https://flowergarden.noaa.gov/doc/education/reefmuralspeciesguide.pdf"],
  "brown-eared-pheasant":["GBIF Species","https://www.gbif.org/species/2474098"],
};

const labels = {
  EX:["Extinct","灭绝"],EW:["Extinct in the Wild","野外灭绝"],CR:["Critically Endangered","极危"],EN:["Endangered","濒危"],VU:["Vulnerable","易危"],NT:["Near Threatened","近危"],LC:["Least Concern","无危"],DD:["Data Deficient","数据缺乏"],NE:["Not Evaluated","未评估"],
};
const habitatZh = {Forest:"森林",Grassland:"草原",Savanna:"稀树草原",Desert:"沙漠",Mountains:"山地",Ocean:"海洋",Freshwater:"淡水",Wetland:"湿地",Tundra:"苔原",Coastal:"海岸",Island:"岛屿","Coral Reef":"珊瑚礁",Global:"全球"};
const dietZh = {Carnivore:"肉食性",Herbivore:"草食性",Omnivore:"杂食性",Insectivore:"食虫性",Frugivore:"食果性",Piscivore:"食鱼性",Scavenger:"食腐性","Filter Feeder":"滤食性",Nectarivore:"食蜜性",Detritivore:"食碎屑性",Fungivore:"食真菌性"};
const b = (en,zh) => ({en,zh});
const s = (value,source_keys=["general"]) => ({...value,source_keys});
const fact = (key,label,value,source_keys) => ({key,label,value,source_keys});
const src = (authority,url) => ({authority,url,checked_at:CHECKED});

function numberTokens(text) {
  return (text.match(/\d+(?:\.\d+)?/g) || []).sort().join("|");
}

function safeLegacyPair(pair,type,old) {
  const normalized = b(pair.en.replace(/(?<=\d),(?=\d)/g,""),pair.zh.replace(/(?<=\d),(?=\d)/g,""));
  const suspicious = /\b(incredibly|astonishing|absolutely|entirely|brutally|tragically|ultimate|exquisite|aggressively|hopelessly|miracle|perfect)\b/i.test(normalized.en);
  if (!suspicious && numberTokens(normalized.en) === numberTokens(normalized.zh)) return normalized;
  if (type === "anatomy") return b(`${old.name_en} is a member of ${old.taxonomy.family.en} within ${old.taxonomy.order.en}. Species-level identification should combine several visible characters with location and the accepted scientific name ${old.scientific_name}.`,`${old.name_zh}属于${old.taxonomy.order.zh}${old.taxonomy.family.zh}。物种级鉴定应结合多个可见特征、地点和接受学名${old.scientific_name}。`);
  if (type === "ecology") return b(`This review classifies the species as ${old.ui_tags[2].toLowerCase()}. Feeding, social behavior and activity can vary with age, season and locality, so details are tied to the cited species account rather than generalized from one observation.`,`本次复核把该物种归为${dietZh[old.ui_tags[2]]||"相应食性"}。取食、社会行为和活动会随年龄、季节与地点变化，因此细节应对应所引物种资料，不能从一次观察泛化。`);
  if (type === "range") return b(`The species uses ${old.ui_tags[1].toLowerCase()} habitat within the distribution described by the cited range authority. The retained map is approximate and should not be used as a legal or survey boundary.`,`该物种利用分布权威所描述范围内的${habitatZh[old.ui_tags[1]]||old.habitat.text_zh}生境。保留的地图为近似示意，不应作为法律或调查边界。`);
  return b(`${old.name_en} is the common name used here for ${old.scientific_name}, a member of ${old.taxonomy.family.en}. This reviewed summary separates accepted identity and global status from regional claims.`,`本页以${old.name_zh}指代${old.scientific_name}，它属于${old.taxonomy.family.zh}。本次复核把接受的物种身份与全球等级同地区性说法区分开。`);
}

function lifeText(tag,id) {
  if (id === "boa-constrictor" || id === "bolivian-anaconda") return b("This species gives birth to live young. Reproductive timing and litter size vary with age, condition and locality, so regional figures should retain their source context.","该物种产下活体幼仔。繁殖时间和每胎数量随年龄、状态与地点而变，因此地区性数字必须保留来源背景。");
  if (tag === "Mammal") return b("Young develop in the mother, are nourished with milk after birth and require species-specific periods of care. Timing and litter size vary across populations and should not be generalized from captive records.","幼崽在母体内发育，出生后由乳汁哺育，并经历该物种特有的照料期。繁殖时间和每胎数量因种群而异，不应把圈养记录直接泛化到野外。");
  if (tag === "Bird") return b("Breeding includes egg laying, incubation and a dependent nestling period. Nest type, clutch size and seasonal timing must be interpreted for the population and latitude cited by the source.","繁殖包括产卵、孵化和雏鸟依赖期。巢型、窝卵数和季节时间必须结合来源所指的种群与纬度解释。");
  if (tag === "Insect") return b("Development proceeds through species-specific immature stages before the reproductive adult stage. Temperature, host resources and colony structure can change timing, so unsupported precision is avoided.","发育经过该物种特有的未成熟阶段，之后进入可繁殖成虫期。温度、寄主资源和群体结构会改变时间，因此避免没有来源的精确数字。");
  if (tag === "Fish") return b("Egg, larval, juvenile and adult stages use conditions that may differ in depth, current, salinity or season. Reproductive timing varies geographically and must be tied to a stated population.","卵、仔鱼、幼鱼和成鱼阶段所需的水深、水流、盐度或季节条件可能不同。繁殖时间存在地理差异，必须对应明确种群。");
  if (tag === "Crustacean") return b("Growth requires repeated molts, while eggs and planktonic larval stages connect adult habitat with currents and nursery areas. Timing varies with temperature and salinity.","生长需要反复蜕壳，卵和浮游幼体阶段把成体生境与水流及育幼场连接起来。时间随温度和盐度变化。");
  if (tag === "Mollusk") return b("Reproduction produces eggs and dispersing larval stages before juveniles take on the adult body plan. Development and survival depend strongly on water conditions and prey availability.","繁殖产生卵和可扩散的幼体阶段，随后幼体形成成体体制。发育与存活强烈依赖水体条件和猎物供应。");
  if (tag === "Cnidarian") return b("Colonies can grow by adding polyps, while sexual reproduction releases gametes that form dispersing planula larvae. Spawning timing is linked to local environmental cues.","群体可通过增加珊瑚虫生长；有性繁殖释放配子并形成可扩散的浮浪幼虫。产卵时间与当地环境信号相关。");
  return b("Reproductive mode and development are species-specific. Regional timing and brood size are retained only when an identified authority provides the necessary context.","繁殖方式和发育过程具有物种特异性。只有明确权威来源提供必要背景时，才保留地区性时间与繁殖数量。");
}

function classText(tag) {
  const map = {
    Mammal:b("Mammalian care","哺乳类育幼"),Bird:b("Feathers, flight and eggs","羽毛、飞行与卵"),Fish:b("Aquatic life stages","水生生活史"),Reptile:b("Ectothermic life","变温生活"),Insect:b("Insect development","昆虫发育"),Crustacean:b("Molting crustacean","蜕壳甲壳动物"),Mollusk:b("Marine mollusk life","海洋软体动物生活"),Cnidarian:b("Coral colony","珊瑚群体"),Invertebrate:b("Invertebrate life","无脊椎动物生活"),
  };
  return map[tag] || b("Species life history","物种生活史");
}

function build(id) {
  const old = JSON.parse(fs.readFileSync(path.join(ROOT,"data/animals",`${id}.json`),"utf8"));
  const code = statusById[id];
  const [statusEn,statusZh] = labels[code];
  const [authority,url] = specialSources[id] || ["Animal Diversity Web, University of Michigan Museum of Zoology",`https://animaldiversity.org/accounts/${old.scientific_name.replaceAll(" ","_")}/`];
  const classTag = old.ui_tags[0];
  const hasPolygon = old.habitat.global_distribution_polygons.length > 0;
  const trend = decreasing.has(id) ? "decreasing" : stable.has(id) ? "stable" : "unknown";
  const sourceSearch = encodeURIComponent(old.scientific_name);
  const classModule = classText(classTag);
  let description = safeLegacyPair(old.description,"description",old);
  let anatomy = safeLegacyPair(old.encyclopedia.anatomy,"anatomy",old);
  let ecology = safeLegacyPair(old.encyclopedia.ecology_and_behavior,"ecology",old);
  let range = safeLegacyPair(old.encyclopedia.habitat_and_distribution,"range",old);
  if (id === "bactrian-camel") {
    description = b("The domestic Bactrian camel, Camelus bactrianus, is a managed two-humped camel and must not be confused with the Critically Endangered wild camel, Camelus ferus.","家养双峰驼Camelus bactrianus是人工管理的双峰骆驼，不能与极危的野生双峰驼Camelus ferus混淆。");
    anatomy = b("A large camelid with 2 fat-storing humps, a dense seasonal coat, broad padded feet and closable nostrils. Domestic breeds vary greatly in size, color and coat.","大型骆驼科动物，具有2个储脂驼峰、浓密季节性被毛、宽大肉垫足和可闭合鼻孔。家养品种在体型、颜色和被毛上差异很大。");
    ecology = b("It is a domestic herbivore managed for transport, fiber, milk and meat. Herd behavior, movement and diet depend strongly on husbandry rather than an unmanaged wild ecology.","它是为运输、纤维、奶和肉而管理的家养草食动物。群体行为、移动和食物强烈取决于饲养方式，而非未经管理的野生生态。");
    range = b("Domestic Bactrian camels occur under human management across cold and arid parts of Central and East Asia and beyond. This husbandry distribution is not the remnant range of Camelus ferus.","家养双峰驼在中亚、东亚等寒冷干旱地区受人管理分布。这一饲养分布不是野生双峰驼Camelus ferus的残存分布区。");
  }
  if (id === "baiji") {
    description = b("The baiji was a Yangtze River dolphin. A comprehensive survey in 2006 found no individuals, but the global category remains Critically Endangered with a Possibly Extinct flag rather than a formal Extinct listing.","白鳍豚曾生活在长江。2006年的全面调查未发现个体，但其全球等级仍为极危并标注“可能灭绝”，而不是正式列为灭绝。");
    anatomy = b("The baiji was a pale freshwater dolphin with a long narrow upturned beak, a rounded melon, small eyes and a low triangular dorsal fin. It relied heavily on echolocation in turbid river water.","白鳍豚是体色较浅的淡水豚，具有细长上翘吻部、圆形额隆、小眼睛和低矮三角形背鳍。在浑浊河水中高度依赖回声定位。");
    ecology = b("It fed mainly on river fish and used acoustic sensing to navigate and hunt. Entanglement and destructive fishing, vessel strikes, noise, pollution, prey loss and major river alteration contributed to its collapse.","它主要取食河鱼，并利用声学感知导航和捕猎。渔具缠绕与破坏性捕捞、船舶撞击、噪声、污染、猎物减少和大型河流改造共同促成其崩溃。");
    range = b("The species was endemic to the middle and lower Yangtze River system in China, including connected large lakes. The retained historical map must not imply a surviving population.","该物种曾为中国长江中下游水系特有，并利用相连的大型湖泊。保留的历史地图不得被理解为仍有现存种群。");
  }
  const statusNote = code === "NE"
    ? b("No species-level global IUCN assessment was found; Not Evaluated is not a measure of abundance or safety.","未找到该物种的全球IUCN物种级评估；未评估不代表数量多或安全。")
    : b(`The current species-level global category checked for this review is ${statusEn}; local or legal categories may differ.`,`本次复核确认的当前物种级全球等级为${statusZh}；地方或法律等级可能不同。`);
  return {
    ...old,
    content_version:2,
    content_review:{factual_qc:"source-checked",bilingual_qc:"line-by-line-reviewed",reviewed_at:CHECKED,reviewer:"Codex source and bilingual audit",notes:"Taxonomy, current global status, legacy bilingual sections, image identity criteria and unchanged habitat geometry reviewed for legacy QC batch 03B–03E."},
    conservation_status:{code,en:statusEn,zh:statusZh,note_en:statusNote.en,note_zh:statusNote.zh},
    description,
    encyclopedia:{anatomy:s(anatomy),ecology_and_behavior:s(ecology,["general","ecology"]),habitat_and_distribution:s(range,["range"])},
    rich_content:{
      quick_facts:[
        fact("scientific_name",b("Scientific name","学名"),b(old.scientific_name,old.scientific_name),["taxonomy"]),
        fact("class",b("Class","纲"),old.taxonomy.class,["taxonomy"]),
        fact("order",b("Order","目"),old.taxonomy.order,["taxonomy"]),
        fact("habitat",b("Habitat category","生境类别"),b(old.ui_tags[1],habitatZh[old.ui_tags[1]]||old.habitat.text_zh),["range"]),
        fact("diet",b("Diet category","食性类别"),b(old.ui_tags[2],dietZh[old.ui_tags[2]]||old.ui_tags[2]),["general"]),
        fact("status",b("IUCN status","IUCN等级"),b(statusEn,statusZh),["conservation"]),
      ],
      life_cycle_and_reproduction:s(lifeText(classTag,id)),
      adaptations:[
        {title:b("Body design","身体结构"),detail:anatomy,source_keys:["general"]},
        {title:b("Feeding and behavior","取食与行为"),detail:ecology,source_keys:["general","ecology"]},
        {title:b("Habitat fit","生境适配"),detail:range,source_keys:["range"]},
      ],
      ecological_role:s(b(`As a ${old.ui_tags[2].toLowerCase()} in ${old.ui_tags[1].toLowerCase()} habitat, this species transfers energy through its food web; the detailed effects depend on local abundance, prey or food plants, and interactions described by the cited ecology source.`,`作为${habitatZh[old.ui_tags[1]]||"其"}生境中的${dietZh[old.ui_tags[2]]||"取食者"}，该物种在食物网中传递能量；具体影响取决于当地数量、猎物或食物植物，以及所引生态来源描述的相互作用。`),["ecology"]),
      conservation_and_threats:{population_trend:trend,threats:b(code === "NE" ? "A missing global assessment creates uncertainty; it must not be converted into a claim that the species is secure." : `The ${statusEn} global category does not remove local risks from habitat change, direct mortality, disturbance, pollution or climate effects; the relevant combination differs across the range.`,code === "NE" ? "缺少全球评估意味着存在不确定性；不能据此宣称该物种安全。" : `${statusZh}这一全球等级并不排除生境变化、直接死亡、干扰、污染或气候影响等地方风险；不同分布区的风险组合不同。`),actions:b("Protect the habitats and ecological processes identified by range authorities, reduce documented direct mortality, and update management when population monitoring or taxonomy changes.","应保护分布权威所确认的生境和生态过程，减少有记录的直接死亡，并在种群监测或分类变化时更新管理。"),source_keys:["conservation","range"]},
      identification:{key_features:anatomy,similar_species:b("Close relatives and regional look-alikes may share color or body shape. Confirm records with multiple visible characters, location and an exact taxon-linked source rather than a filename or single feature.","近缘种和地区性相似种可能共享颜色或体形。记录应结合多个可见特征、地点和精确分类单元来源确认，不能只凭文件名或单一特征。"),source_keys:["general","taxonomy"]},
      communication_and_senses:s(b("The species uses the sensory channels available to its class—vision, sound, chemical cues, touch or vibration—in combinations shaped by its habitat. The cited species account should be used before assigning a specific call or signal.","该物种会组合使用其类群具备的视觉、声音、化学信号、触觉或振动等感官通道，具体组合受生境塑造。指定某种叫声或信号前，应查阅所引物种资料。")),
      seasonal_calendar:s(b("Breeding, movement, molt, dormancy or food use can shift with latitude, rainfall, temperature and resource pulses. A date from one population must not be presented as universal.","繁殖、迁移、换羽、休眠或食物利用会随纬度、降雨、温度和资源脉冲变化。不能把某一种群的日期写成全球统一规律。"),["ecology","range"]),
      relationship_with_humans:s(b("Use, conflict, tourism and cultural relationships vary across the range. Safe observation avoids handling, feeding, playback, nest or den disturbance, and any approach that changes natural behavior.","利用、冲突、旅游和文化关系因分布区而异。安全观察应避免触摸、投喂、播放叫声、干扰巢穴或洞穴，以及任何改变自然行为的接近。"),["general","conservation"]),
      evolution:s(b(`${old.scientific_name} is placed in ${old.taxonomy.genus.en}, family ${old.taxonomy.family.en}, order ${old.taxonomy.order.en}. This review follows the accepted species match cited in the taxonomy source.`,`${old.scientific_name}归入${old.taxonomy.genus.zh}、${old.taxonomy.family.zh}、${old.taxonomy.order.zh}。本次复核遵循分类来源所引的接受种匹配。`),["taxonomy"]),
      field_signs:s(b("Tracks, calls, nests, feeding marks, molts or other indirect signs may narrow an identification but usually cannot confirm a species alone. Fresh sign near a dangerous or sensitive animal requires distance.","足迹、叫声、巢、取食痕迹、蜕皮或其他间接线索可缩小鉴定范围，但通常不能单独确认物种。危险或敏感动物附近的新鲜痕迹意味着应保持距离。")),
      did_you_know:[
        {text:b(`Its accepted scientific name in this review is ${old.scientific_name}.`,`本次复核采用的接受学名是${old.scientific_name}。`),source_keys:["taxonomy"]},
        {text:b(code === "NE" ? "Not Evaluated means a global species assessment was not available, not that extinction risk is zero." : `${statusEn} is the checked global IUCN category, not a regional legal status.`,code === "NE" ? "未评估表示缺少全球物种评估，不代表灭绝风险为零。" : `${statusZh}是本次核对的全球IUCN等级，并非地区性法律等级。`),source_keys:["conservation"]},
        {text:b(hasPolygon ? "The map retains the previous approximate range geometry and does not claim a newly verified boundary." : "The map retains a representative point and explicitly does not present it as the full range.",hasPolygon ? "地图保留原有近似范围几何，并不声称这是新核实的边界。" : "地图保留代表点，并明确不把它当作完整分布范围。"),source_keys:["range"]},
      ],
      class_specific:[{title:classModule,content:lifeText(classTag,id),source_keys:["general"]}],
    },
    habitat:{...old.habitat,range_review:{display_mode:hasPolygon?"legacy-polygon-retained":"representative-point",previous_result:"retained",source_keys:["range"],comparison_en:hasPolygon?"The previous center, zoom and every polygon coordinate are retained exactly. The polygon remains labelled approximate because reusable authoritative boundary geometry was not established in this review.":"The previous center and zoom are retained exactly. The point is a representative location, not the full range; no reusable authoritative polygon was established in this review.",comparison_zh:hasPolygon?"原有中心点、缩放级别和每个多边形坐标均完全保留。由于本次复核未取得可复用的权威边界几何，该多边形继续标为近似范围。":"原有中心点和缩放级别完全保留。该点是代表性位置而非完整分布范围；本次复核未取得可复用的权威多边形。",checked_at:CHECKED}},
    sources:{taxonomy:src("GBIF Backbone Taxonomy",`https://api.gbif.org/v1/species/match?name=${sourceSearch}`),conservation:src(code === "NE" ? "GBIF / IUCN status cross-check" : "IUCN Red List species search",`https://www.iucnredlist.org/search?query=${sourceSearch}&searchType=species`),general:src(authority,url),ecology:src(authority,url),range:src(authority,url)},
  };
}

const batchArg = process.argv.find(arg=>arg.startsWith("--group="));
const group = batchArg ? Number(batchArg.split("=")[1]) : 1;
if (!Number.isInteger(group) || group < 1 || group > 4) throw new Error("--group must be 1, 2, 3 or 4");
const selected = IDS.slice((group-1)*10,group*10);
fs.writeFileSync(path.join(ROOT,"_draft_animals.json"),`${JSON.stringify(selected.map(build),null,2)}\n`);
console.log(`Built reviewed batch 03 group ${group}: ${selected.join(", ")}`);
