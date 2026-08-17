#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const CHECKED = "2026-08-16";
const IDS = [
  "african-buffalo", "alberts-lyrebird", "american-crocodile", "american-lobster",
  "common-fruit-fly", "australian-box-jellyfish", "aye-aye", "bee-hummingbird",
  "bighead-carp", "black-footed-ferret",
];

const b = (en, zh) => ({ en, zh });
const section = (en, zh, source_keys = ["general"]) => ({ en, zh, source_keys });
const fact = (key, labelEn, labelZh, valueEn, valueZh, source_keys = ["general"]) => ({
  key, label: b(labelEn, labelZh), value: b(valueEn, valueZh), source_keys,
});
const adaptation = (titleEn, titleZh, detailEn, detailZh, source_keys = ["general"]) => ({
  title: b(titleEn, titleZh), detail: b(detailEn, detailZh), source_keys,
});
const source = (authority, url) => ({ authority, url, checked_at: CHECKED });

const profiles = {
  "african-buffalo": {
    status: { code: "NT", en: "Near Threatened", zh: "近危", note_en: "The current global IUCN status is Near Threatened and the population trend is decreasing.", note_zh: "当前IUCN全球等级为近危，种群趋势为下降。" },
    taxonomy: { kingdom: b("Animalia", "动物界"), phylum: b("Chordata", "脊索动物门"), class: b("Mammalia", "哺乳纲"), order: b("Artiodactyla", "偶蹄目"), family: b("Bovidae", "牛科"), genus: b("Syncerus", "非洲水牛属") },
    description: b("The African buffalo is a large social bovid of sub-Saharan forests, woodlands and savannas. Herd cooperation, water dependence and flexible grazing let it occupy many habitats, but hunting, disease and habitat fragmentation have contributed to a decreasing population.", "非洲水牛是生活在撒哈拉以南森林、林地和稀树草原的大型群居牛科动物。群体协作、对水源的依赖和灵活的食草方式使其能利用多种生境，但狩猎、疾病和生境破碎化已促使种群下降。"),
    encyclopedia: {
      anatomy: section("Adults vary greatly among regions and subspecies: shoulder height is roughly 1.0–1.7 m and body mass about 300–900 kg. Both sexes carry heavy horns; in mature savanna males the horn bases can fuse into a thick forehead shield called a boss.", "不同地区和亚种的成体差异很大：肩高约1.0–1.7米，体重约300–900千克。雌雄都有粗重的角；成熟草原型雄兽的角基部可在额部融合成厚实的“角盾”。"),
      ecology: section("African buffalo are ruminant grazers that need regular access to water. Females and young form stable herds, while males may be solitary or form bachelor groups; groups can collectively confront lions and other threats.", "非洲水牛是反刍食草动物，需要经常接近水源。雌兽和幼兽组成稳定群体，雄兽可能独居或组成雄兽群；群体可共同面对狮子等威胁。", ["general", "ecology"]),
      habitat: section("The species occurs discontinuously across sub-Saharan Africa in moist savannas, grasslands, woodlands, montane areas and lowland forests, but avoids true deserts and landscapes without dependable water and forage.", "该物种在撒哈拉以南非洲呈不连续分布，栖息于湿润稀树草原、草地、林地、山地和低地森林，但会避开真正的沙漠以及缺少稳定水源和食物的地区。", ["range", "conservation"]),
    },
    facts: [
      fact("shoulder_height", "Shoulder height", "肩高", "About 1.0–1.7 m", "约1.0–1.7米"),
      fact("weight", "Weight", "体重", "About 300–900 kg", "约300–900千克"),
      fact("diet", "Diet", "食性", "Mostly grasses and other vegetation", "主要为禾草及其他植物", ["ecology"]),
      fact("gestation", "Gestation", "妊娠期", "About 11–12 months", "约11–12个月"),
      fact("young", "Young", "每胎幼崽", "Usually 1 calf", "通常1头"),
      fact("status", "IUCN status", "IUCN等级", "Near Threatened", "近危", ["conservation"]),
    ],
    life: section("Breeding timing varies with rainfall and forage. After roughly 11–12 months of gestation, a female usually bears 1 calf; calves remain closely associated with their mothers and the protective herd while they grow.", "繁殖时间会随降雨和食物而变化。妊娠约11–12个月后，雌兽通常产下1头幼崽；幼崽成长期间会紧随母兽并受到群体保护。"),
    adaptations: [
      adaptation("Horn boss", "额部角盾", "The fused horn bases of mature males form a thick shield used in contests and defense.", "成熟雄兽融合的角基部形成厚盾，可用于争斗和防御。"),
      adaptation("Ruminant digestion", "反刍消化", "A multi-chambered stomach extracts nutrients from fibrous grasses.", "多室胃能从纤维丰富的禾草中提取养分。"),
      adaptation("Herd defense", "群体防御", "Coordinated adults can surround calves and confront predators rather than relying only on flight.", "成兽可协调围护幼崽并面对捕食者，而不只是逃跑。", ["ecology"]),
    ],
    role: section("By consuming and trampling vegetation, transporting nutrients in dung and serving as prey for large carnivores, African buffalo influence grassland and woodland food webs. Their wallows and movement paths also modify local ground conditions.", "非洲水牛通过取食和踩踏植被、以粪便转移养分，并作为大型食肉动物的猎物，影响草地和林地食物网；其泥浴坑和行走路径也会改变局部地表环境。", ["ecology"]),
    conservation: { trend: "decreasing", threats: b("Major pressures include habitat loss and fragmentation, hunting for meat, competition with livestock and outbreaks of diseases shared with domestic cattle.", "主要压力包括生境丧失和破碎化、肉用猎捕、与家畜竞争，以及与家牛共患疾病的暴发。"), actions: b("Protect connected habitats and water access, control illegal hunting, monitor disease at wildlife–livestock boundaries and manage populations across protected-area borders.", "应保护连通生境和水源通道，控制非法猎捕，监测野生动物—家畜交界处的疾病，并跨保护地边界管理种群。") },
    identification: { key: b("A massive dark bovid with broad ears, heavy outward-curving horns and, in mature savanna males, a fused horn boss across the forehead.", "体型粗壮、颜色深暗，耳宽，角粗重并向外弯；成熟草原型雄兽额部有融合角盾。"), similar: b("Domestic water buffalo usually have more laterally swept horns and a different head profile. African buffalo vary strongly by subspecies, so color and size alone are not enough for subspecies identification.", "家水牛的角通常更明显地向两侧展开，头部轮廓也不同。非洲水牛各亚种体色和体型差异很大，不能只凭这些特征鉴定亚种。") },
    communication: section("Buffalo use low calls, posture, scent and physical contact to maintain herd cohesion, warn of danger and negotiate rank. Calves and mothers recognize one another within crowded herds.", "非洲水牛通过低沉叫声、姿势、气味和身体接触维持群体联系、警示危险并协调等级；幼崽和母兽能在拥挤群体中相互识别。"),
    seasonal: section("Rainfall drives grass growth, water availability, herd movement and regional calving peaks. In dry periods, herds concentrate around dependable water and remaining forage.", "降雨会影响牧草生长、水源、群体移动和地区性产仔高峰；旱季时，群体会集中到可靠水源和剩余食物附近。", ["ecology"]),
    humans: section("African buffalo are important in tourism and hunting economies and can transmit diseases to or from livestock. They are powerful wild animals; people should keep substantial distance and follow local guide instructions.", "非洲水牛对旅游和狩猎经济具有重要作用，也可能与家畜相互传播疾病。它们力量强大，应保持足够距离并遵循当地向导指示。", ["conservation"]),
    evolution: section("Syncerus caffer is a member of the cattle tribe Bovini. Geographic forms range from small reddish forest buffalo to much larger dark savanna buffalo, with intergradation where some ranges meet.", "非洲水牛属于牛族。不同地理类型从体型较小、偏红的森林水牛，到体型更大、颜色更深的草原水牛；部分分布交界处存在过渡类型。", ["taxonomy", "general"]),
    field: section("Broad cloven hoofprints, large dung pats, muddy wallows and heavily used trails leading to water can reveal a herd. Tracks alone cannot safely identify subspecies or indicate that animals have left the area.", "宽大的偶蹄印、大块粪便、泥浴坑和通往水源的常用路径可显示群体活动；仅凭足迹无法可靠鉴定亚种，也不能说明动物已经离开。"),
    know: [
      section("The horn boss is most developed in mature savanna males and is not equally prominent in every age, sex or geographic form.", "额部角盾在成熟草原型雄兽中最发达，并非所有年龄、性别或地理类型都同样明显。"),
      section("A herd may collectively turn toward lions to defend calves.", "群体可能集体转身面对狮子，以保护幼崽。", ["ecology"]),
      section("African buffalo require dependable access to water even though they occupy many vegetation types.", "尽管能生活在多种植被环境中，非洲水牛仍需要可靠水源。", ["range"]),
    ],
    classSpecific: { title: b("Social mammal", "群居哺乳动物"), content: b("Long-term female associations, calf protection and flexible male grouping make herd membership central to survival, not merely a temporary feeding aggregation.", "长期的雌兽联系、幼崽保护和灵活的雄兽结群，使群体成员关系成为生存核心，而非短暂的取食聚集。") },
    sources: {
      taxonomy: source("GBIF Backbone Taxonomy", "https://api.gbif.org/v1/species/match?name=Syncerus%20caffer"),
      general: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Syncerus_caffer/"),
      ecology: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Syncerus_caffer/"),
      conservation: source("Mammal Diversity Database", "https://www.mammaldiversity.org/taxon/1006274/"),
      range: source("IUCN Species Threat Abatement and Restoration assessment", "https://portals.iucn.org/library/sites/library/files/documents/2024-034-En.pdf"),
    },
  },

  "alberts-lyrebird": {
    status: { code: "LC", en: "Least Concern", zh: "无危", note_en: "The global IUCN status changed from Near Threatened to Least Concern; state listings remain separate and include Vulnerable in New South Wales and Near Threatened in Queensland.", note_zh: "IUCN全球等级已由近危变为无危；州级名录需另行区分，新南威尔士州列为易危，昆士兰州列为近危。" },
    description: b("Albert's lyrebird is a large, elusive ground-foraging songbird found only in a narrow belt of subtropical rainforest and wet forest along the Queensland–New South Wales border. It is known for rich brown plumage, complex mimicry and a male tail less ornate than that of the superb lyrebird.", "艾氏琴鸟是一种大型而隐秘的地面觅食鸣禽，仅分布于昆士兰州—新南威尔士州边界附近狭窄的亚热带雨林和湿润森林带。它以浓郁棕色羽衣、复杂拟声和比华丽琴鸟较朴素的雄鸟尾羽著称。"),
    encyclopedia: {
      anatomy: section("Adults are about 86–93 cm long including the tail and weigh around 930 g. Males and females are rich brown; males have long display feathers, but lack the superb lyrebird's strongly contrasting, elaborate lyre-shaped outer tail feathers.", "成鸟包括尾羽在内体长约86–93厘米，体重约930克。雌雄均呈浓郁棕色；雄鸟有长展示羽，但没有华丽琴鸟那种对比强烈、结构复杂的里拉琴形外侧尾羽。", ["general", "identification"]),
      ecology: section("The bird searches leaf litter for insects, other invertebrates and occasional plant material, using powerful feet to rake the forest floor. Males sing and display on trampled vine platforms; females alone build the domed nest and care for the chick.", "它用强壮双足翻耙林地落叶，寻找昆虫、其他无脊椎动物和少量植物性食物。雄鸟在踩平的藤蔓平台上鸣唱和展示；雌鸟独自建造穹顶巢并照料雏鸟。", ["general", "ecology"]),
      habitat: section("The species is endemic to a small area of south-eastern Queensland and far north-eastern New South Wales, mainly in subtropical rainforest and adjoining wet sclerophyll forest with dense cover and deep moist litter.", "该物种为澳大利亚东南昆士兰州和新南威尔士州最东北部一小片区域的特有种，主要生活在亚热带雨林及相邻湿润硬叶林中，需要茂密遮蔽和深厚湿润落叶层。", ["range", "conservation"]),
    },
    facts: [
      fact("length", "Length", "体长", "About 86–93 cm including tail", "包括尾羽约86–93厘米", ["general"]),
      fact("weight", "Weight", "体重", "About 930 g", "约930克", ["general"]),
      fact("diet", "Diet", "食性", "Mainly forest-floor invertebrates", "主要为林地无脊椎动物", ["ecology"]),
      fact("clutch", "Clutch", "每窝蛋数", "Usually 1 egg", "通常1枚", ["general"]),
      fact("range", "Range", "分布", "South-east Queensland and north-east New South Wales", "昆士兰州东南部及新南威尔士州东北部", ["range"]),
      fact("status", "Global IUCN status", "IUCN全球等级", "Least Concern", "无危", ["conservation"]),
    ],
    life: section("Males advertise from display platforms with song, mimicry and tail movements but do not provide parental care. A female constructs a large domed nest, usually lays 1 egg and incubates and raises the chick alone.", "雄鸟在展示平台上用鸣唱、拟声和尾羽动作求偶，但不承担育幼。雌鸟建造大型穹顶巢，通常产1枚蛋，并独自孵化和抚育雏鸟。", ["general", "ecology"]),
    adaptations: [
      adaptation("Powerful scratching feet", "强力翻耙双足", "Strong legs and claws move compact leaf litter to expose hidden invertebrates.", "强壮腿爪能翻开压实落叶，暴露隐藏的无脊椎动物。", ["ecology"]),
      adaptation("Vocal mimicry", "声音拟态", "A complex syrinx and learned song repertoire let males incorporate calls of other forest birds.", "复杂鸣管和学习形成的曲目使雄鸟能把其他森林鸟类叫声编入鸣唱。", ["general"]),
      adaptation("Forest-brown plumage", "森林棕色羽衣", "Rich brown plumage reduces contrast against wet litter and dense understory.", "浓郁棕色羽衣降低其在湿润落叶和密集林下层中的反差。", ["identification"]),
    ],
    role: section("By turning leaf litter while foraging, Albert's lyrebirds expose and redistribute soil-surface material and consume many invertebrates. They are also prey within the wet-forest food web.", "艾氏琴鸟觅食时翻动落叶，暴露并重新分布地表物质，同时捕食大量无脊椎动物；它们也属于湿润森林食物网中的猎物。", ["ecology"]),
    conservation: { trend: "stable", threats: b("Although the global status is Least Concern, the range is very small. Historic clearing, habitat fragmentation, inappropriate fire, weeds, severe storms and introduced predators remain regional concerns.", "尽管全球等级为无危，其分布范围仍很狭小。历史清林、生境破碎化、不当火情、杂草、强风暴和外来捕食者仍是地区性隐患。"), actions: b("Protect connected rainforest and wet-forest habitat, maintain deep litter and understory, use appropriate fire management and continue acoustic and camera monitoring across both states.", "应保护连通的雨林和湿润森林，维持深厚落叶层与林下植被，采用适当火管理，并在两州持续开展声学和相机监测。") },
    identification: { key: b("A large rich chestnut-brown ground bird with a very long tail; the male's display tail is filamentous and less elaborate than a superb lyrebird's.", "大型栗棕色地栖鸟，尾很长；雄鸟展示尾羽呈丝状，复杂程度低于华丽琴鸟。"), similar: b("The superb lyrebird is generally greyer and its adult male has conspicuous ornate lyre-shaped outer tail feathers. Location, plumage and tail structure should be considered together.", "华丽琴鸟整体通常更偏灰，成年雄鸟具有醒目的华丽里拉琴形外侧尾羽；鉴定时应结合地点、羽色和尾羽结构。", ["identification"]) },
    communication: section("Males give far-carrying territorial song composed of their own phrases and learned imitations. Because the birds are difficult to see in dense forest, passive acoustic recorders are important for monitoring.", "雄鸟发出传播很远的领地鸣唱，由自身乐句和学习来的拟声组成。由于密林中很难看到它们，被动声学记录器是重要监测工具。", ["general", "conservation"]),
    seasonal: section("Male singing and display intensify during the winter breeding period. Rainfall and litter moisture affect invertebrate availability, while severe fire or storms can alter dense forest cover.", "雄鸟鸣唱和展示在冬季繁殖期增强。降雨和落叶湿度会影响无脊椎动物数量，严重火灾或风暴则会改变茂密森林遮蔽。", ["ecology", "conservation"]),
    humans: section("The species is valued as an Australian endemic and acoustic emblem. Visitors should stay on tracks, avoid playback near displaying birds and report records through appropriate monitoring programs rather than approaching nests.", "该物种作为澳大利亚特有鸟和声音象征而备受重视。访客应留在步道上，避免在展示雄鸟附近播放叫声，并通过合适监测项目报告记录，而不要接近鸟巢。", ["conservation"]),
    evolution: section("Albert's and superb lyrebirds are the only living species in Menuridae, an early-diverging lineage of oscine passerines. Similar display behavior is paired with distinct plumage and vocal repertoires.", "艾氏琴鸟和华丽琴鸟是琴鸟科仅有的两个现生种，属于鸣禽中较早分化的谱系；两者展示行为相似，但羽衣和鸣唱曲目不同。", ["taxonomy", "general"]),
    field: section("Large scratchings in moist litter and complex imitated bird calls may indicate a lyrebird, but they are not species-specific. Within overlap or near range edges, recordings and clear views should be checked by experienced observers.", "湿润落叶层中的大型翻耙痕迹和复杂拟鸟声可能表明有琴鸟，但并非物种特异证据。在重叠区或分布边缘，应由有经验者核对录音和清晰影像。", ["identification"]),
    know: [
      section("The global category is Least Concern, while New South Wales and Queensland retain different state-level categories.", "其全球等级为无危，而新南威尔士州和昆士兰州仍采用不同州级等级。", ["conservation"]),
      section("Unlike the superb lyrebird, males display on trampled vine platforms rather than prominent soil mounds.", "与华丽琴鸟不同，雄鸟在踩平的藤蔓平台而非明显土堆上展示。", ["ecology"]),
      section("Females carry out nest building, incubation and chick care without male assistance.", "雌鸟在没有雄鸟协助的情况下完成筑巢、孵化和育雏。", ["general"]),
    ],
    classSpecific: { title: b("Song and nesting", "鸣唱与筑巢"), content: b("A male invests in learned song and visual display, while each female independently builds a domed nest and raises a small clutch, producing a sharp division between courtship and parental roles.", "雄鸟把大量精力投入学习鸣唱和视觉展示，雌鸟则独立建造穹顶巢并抚育很小的窝卵，两性的求偶与育幼角色分工明显。") },
    sources: {
      taxonomy: source("GBIF Backbone Taxonomy", "https://api.gbif.org/v1/species/match?name=Menura%20alberti"),
      general: source("HANZAB, BirdLife Australia", "https://hanzab.birdlife.org.au/sample-species-entry/"),
      ecology: source("HANZAB, BirdLife Australia", "https://hanzab.birdlife.org.au/sample-species-entry/"),
      identification: source("NSW Threatened Species profile", "https://threatenedspecies.bionet.nsw.gov.au/profile?id=10525"),
      conservation: source("HANZAB, BirdLife Australia", "https://hanzab.birdlife.org.au/sample-species-entry/"),
      range: source("NSW National Parks and Wildlife Service", "https://www.nationalparks.nsw.gov.au/plants-and-animals/alberts-lyrebird"),
    },
  },

  "american-crocodile": {
    status: { code: "VU", en: "Vulnerable", zh: "易危", note_en: "The current global IUCN assessment lists the American crocodile as Vulnerable; recovery is uneven across its broad coastal range.", note_zh: "当前IUCN全球评估将美洲鳄列为易危；其广阔沿海分布区内的恢复情况并不均衡。" },
    taxonomy: { kingdom: b("Animalia", "动物界"), phylum: b("Chordata", "脊索动物门"), class: b("Reptilia", "爬行纲"), order: b("Crocodylia", "鳄目"), family: b("Crocodylidae", "鳄科"), genus: b("Crocodylus", "鳄属") },
    description: b("The American crocodile is a large, long-snouted crocodilian of tropical American coasts, rivers and lagoons. Functional salt glands let it use brackish and marine-influenced habitats, while protection of nesting and wetland habitat has allowed some populations to recover.", "美洲鳄是生活在热带美洲海岸、河流和潟湖的大型长吻鳄类。功能性盐腺使它能利用半咸水和受海水影响的生境；保护巢址和湿地已使部分种群得到恢复。"),
    encyclopedia: {
      anatomy: section("Adults have a relatively narrow V-shaped snout, a visible fourth lower tooth when the mouth is closed, armored dorsal skin and a powerful laterally flattened tail. Large males may exceed 4 m, while females are generally smaller.", "成体吻部较窄并呈V形，闭口时可见下颌第四齿，背部皮肤有骨板，尾巴强壮且侧扁。大型雄鳄可超过4米，雌鳄通常较小。", ["general", "identification"]),
      ecology: section("Juveniles eat aquatic invertebrates and small fish; larger animals take fish, crustaceans, turtles, birds and mammals. They regulate body temperature by moving between water, shade and basking sites and by holding the mouth open for cooling.", "幼鳄取食水生无脊椎动物和小鱼；较大个体会捕食鱼、甲壳动物、龟、鸟和哺乳动物。它们在水中、阴影和晒背地点之间移动，并张口散热以调节体温。", ["general", "ecology"]),
      habitat: section("The range extends from southern Florida and Mexico through Central America, the Caribbean and northern South America on both Atlantic and Pacific watersheds. Mangroves, estuaries, lagoons, lower rivers and some inland lakes are important habitats.", "其分布从佛罗里达南部和墨西哥，经中美洲、加勒比地区延伸至南美洲北部，横跨大西洋和太平洋水系。红树林、河口、潟湖、河流下游及部分内陆湖泊都是重要生境。", ["range", "conservation"]),
    },
    facts: [
      fact("adult_length", "Adult length", "成体体长", "Often about 2.5–4 m; large males may exceed 4 m", "通常约2.5–4米；大型雄鳄可超过4米"),
      fact("diet", "Diet", "食性", "Fish and other aquatic or shoreline animals", "鱼类及其他水生或岸边动物", ["ecology"]),
      fact("clutch", "Clutch", "每窝卵数", "Roughly 30–60 eggs", "约30–60枚"),
      fact("incubation", "Incubation", "孵化期", "About 9–10 weeks", "约9–10周"),
      fact("habitat", "Typical habitat", "典型生境", "Mangroves, estuaries, lagoons and rivers", "红树林、河口、潟湖和河流", ["range"]),
      fact("status", "IUCN status", "IUCN等级", "Vulnerable", "易危", ["conservation"]),
    ],
    life: section("Courtship occurs in water. Females excavate hole nests or use mounds above flood level and lay roughly 30–60 eggs. Incubation lasts about 9–10 weeks; hatchling sex is influenced by nest temperature, and females may guard nests and help young reach water.", "求偶在水中进行。雌鳄在洪水线以上挖穴或利用堆巢，产约30–60枚卵。孵化约需9–10周；幼鳄性别受巢温影响，雌鳄可能守巢并帮助幼体到达水中。", ["general", "ecology"]),
    adaptations: [
      adaptation("Salt glands", "盐腺", "Lingual salt glands excrete excess salts and support use of brackish and coastal habitats.", "舌部盐腺能排出多余盐分，帮助其利用半咸水和沿海生境。"),
      adaptation("Pressure-sensitive jaws", "颌部压力感受", "Sensory organs around the jaws detect small water movements made by prey.", "颌部周围的感觉器官能探测猎物造成的微小水流。", ["ecology"]),
      adaptation("Behavioral thermoregulation", "行为性体温调节", "Basking, shade seeking and open-mouth cooling keep body temperature within a workable range.", "晒背、寻找阴影和张口散热使体温保持在可活动范围。", ["ecology"]),
    ],
    role: section("As a large aquatic predator, the American crocodile links fish, shoreline animals and wetland food webs. Nest digging and movement also disturb small patches of sediment, though ecological effects vary by habitat and population density.", "作为大型水生捕食者，美洲鳄连接鱼类、岸边动物和湿地食物网；挖巢和移动也会扰动小片沉积物，但生态影响会随生境和种群密度变化。", ["ecology"]),
    conservation: { trend: "increasing", threats: b("Historic skin hunting caused major declines. Current threats include wetland loss, coastal development, nest disturbance, road mortality, entanglement, pollution and conflict with people.", "历史上的皮革猎捕造成严重下降。当前威胁包括湿地丧失、沿海开发、巢址干扰、道路死亡、缠网、污染及人鳄冲突。"), actions: b("Protect mangroves, lagoons, nesting beaches and freshwater refuges; reduce disturbance and entanglement; maintain legal protection; and use local monitoring and conflict-response programs.", "应保护红树林、潟湖、筑巢岸滩和淡水避难地，减少干扰与缠网，维持法律保护，并开展当地监测和冲突应对。") },
    identification: { key: b("A relatively pale crocodilian with a long narrow V-shaped snout; the fourth lower tooth remains visible when the jaws are closed.", "体色相对较浅，吻部长而窄、呈V形；闭口时下颌第四齿仍可见。"), similar: b("American alligators have a broader U-shaped snout and usually hide lower teeth when the mouth is closed. Morelet's and Cuban crocodiles can overlap regionally, so exact identification should also use location and expert morphology.", "美洲短吻鳄吻部更宽、呈U形，闭口时通常看不到下齿。莫瑞雷鳄和古巴鳄在部分地区可能重叠，因此精确鉴定还应结合地点和专家形态判断。") },
    communication: section("Adults use head slaps, water vibration, posture, vocalizations and chemical cues during courtship and territorial interactions. Hatchlings call from the nest, which can stimulate maternal attention.", "成鳄在求偶和领地互动中使用拍头、水面振动、姿势、叫声和化学线索；幼鳄会从巢中发声，可促使母鳄关注。", ["general"]),
    seasonal: section("Nesting is timed to local dry and wet seasons so nests remain above water while hatchlings later gain access to productive wetlands. Timing differs across the wide tropical range.", "筑巢会配合当地干湿季，使巢在孵化期间高于水面，而幼体之后能进入生产力较高的湿地；其广大热带分布区内时间并不一致。", ["ecology", "range"]),
    humans: section("Recovery near developed coasts creates both conservation success and safety challenges. Never feed or approach crocodiles, keep pets away from shorelines and follow local closures and wildlife-agency instructions.", "沿开发海岸的恢复既是保护成功，也带来安全挑战。绝不能投喂或靠近鳄鱼，应让宠物远离岸边，并遵守当地封闭规定和野生动物机构指示。", ["conservation"]),
    evolution: section("Crocodylus acutus belongs to Crocodylidae, the true crocodiles. Its salt tolerance and coastal dispersal distinguish its ecology from many freshwater-centered crocodilians, but do not make it a fully marine reptile.", "美洲鳄属于鳄科真鳄类。其耐盐能力和沿海扩散生态有别于许多以淡水为主的鳄类，但它并不是完全海生的爬行动物。", ["taxonomy", "range"]),
    field: section("Broad slide marks, large clawed tracks, basking sites and nests above the waterline may indicate crocodilian use. These signs are not species-specific; observe only from a safe distance and report nests to local managers.", "宽阔滑痕、大型带爪足迹、晒背点和高于水线的巢可能显示鳄类活动。这些痕迹并非物种特异；只能在安全距离观察，并向当地管理人员报告巢址。"),
    know: [
      section("American crocodiles can live in fresh, brackish and marine-influenced water because they can excrete excess salt.", "美洲鳄能生活在淡水、半咸水和受海水影响的水域，因为它们能排出多余盐分。"),
      section("A global Vulnerable category does not mean every local population is declining; some protected populations are recovering.", "全球易危等级并不表示每个地方种群都在下降；部分受保护种群正在恢复。", ["conservation"]),
      section("Nest temperature influences the sex of developing hatchlings.", "巢温会影响发育中幼鳄的性别。", ["ecology"]),
    ],
    classSpecific: { title: b("Reptile thermoregulation", "爬行动物体温调节"), content: b("As an ectotherm, the crocodile controls heat mainly through location and posture—moving between sun, shade and water and using open-mouth cooling rather than generating constant internal heat.", "作为变温动物，美洲鳄主要通过地点和姿势控制热量：在阳光、阴影和水中移动，并用张口散热，而不是持续产生内部热量。") },
    sources: {
      taxonomy: source("Smithsonian Ocean", "https://ocean.si.edu/ocean-life/reptiles/american-crocodile"),
      general: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Crocodylus_acutus/"),
      ecology: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Crocodylus_acutus/"),
      conservation: source("IUCN SSC Crocodile Specialist Group", "https://www.iucncsg.org/365_docs/attachments/protarea/3db123987ba4130f88fcfc5af927aab6.pdf"),
      range: source("Smithsonian Ocean", "https://ocean.si.edu/ocean-life/reptiles/american-crocodile"),
      identification: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Crocodylus_acutus/"),
    },
  },

  "american-lobster": {
    status: { code: "LC", en: "Least Concern", zh: "无危", note_en: "The 2009 global IUCN assessment lists the species as Least Concern with a stable trend; regional fishery stocks are managed separately.", note_zh: "2009年IUCN全球评估将该物种列为无危、趋势稳定；不同地区渔业种群仍需分别管理。" },
    description: b("The American lobster is a large clawed crustacean of the north-west Atlantic seafloor. Its crusher and cutter claws perform different jobs, and repeated molting allows lifelong growth; the species also supports one of North America's most valuable fisheries.", "美洲螯龙虾是生活在西北大西洋海底的大型有螯甲壳动物。碎壳螯和剪切螯承担不同功能，反复蜕壳使其能终生生长；该物种也支撑着北美最重要的渔业之一。"),
    encyclopedia: {
      anatomy: section("The body has a hard carapace, 5 pairs of walking legs and a muscular abdomen. One large claw is usually a broad crusher and the other a sharper cutter. Live animals are commonly olive-green to brown with dark or reddish mottling, not the bright red produced by cooking.", "身体有坚硬头胸甲、5对步足和肌肉发达的腹部。一个大螯通常宽厚、用于碎壳，另一个更锐利用于剪切。活体通常呈橄榄绿至棕色并有深色或红色斑驳，并非烹煮后的鲜红色。", ["general"]),
      ecology: section("Adults are opportunistic bottom feeders that eat mollusks, crabs, worms, echinoderms, fish and algae. They shelter among rocks or in burrows and are eaten by fish, sharks, rays, octopuses and other predators, especially when small or newly molted.", "成体是在海底机会性取食的动物，取食软体动物、蟹、蠕虫、棘皮动物、鱼和藻类。它们藏在岩石间或洞穴中，尤其在幼小或刚蜕壳时会被鱼、鲨、鳐、章鱼等捕食。", ["general", "ecology"]),
      habitat: section("American lobsters occur from Labrador to Cape Hatteras in the north-west Atlantic, on coastal and offshore bottoms from shallow water to about 700 m. Rocky shelter is especially important to juveniles.", "美洲螯龙虾分布于西北大西洋拉布拉多至哈特拉斯角，在近岸和离岸海底从浅水到约700米深处生活；岩石隐蔽处对幼体尤为重要。", ["general", "range"]),
    },
    facts: [
      fact("maximum_weight", "Maximum recorded weight", "最大记录体重", "Up to about 20 kg", "可达约20千克", ["general"]),
      fact("depth", "Depth", "水深", "Shallow water to about 700 m", "浅水至约700米", ["range"]),
      fact("diet", "Diet", "食性", "Benthic animals plus some algae", "底栖动物及少量藻类", ["ecology"]),
      fact("eggs", "Eggs", "抱卵数", "About 5000 to more than 100000", "约5000至超过100000枚", ["general"]),
      fact("egg_carrying", "Egg carrying", "抱卵期", "About 9–11 months", "约9–11个月", ["general"]),
      fact("status", "IUCN status", "IUCN等级", "Least Concern", "无危", ["conservation"]),
    ],
    life: section("Mating usually follows the female's molt. She can store sperm, later attaches about 5000 to more than 100000 fertilized eggs beneath her tail and carries them for about 9–11 months. Free-swimming larvae molt 4 times before settling to the bottom; reaching reproductive and legal harvest size often takes 5–8 years.", "交配通常发生在雌虾蜕壳后。雌虾可储存精子，之后把约5000至超过100000枚受精卵附在尾下，并抱卵约9–11个月。浮游幼体蜕壳4次后沉降海底；达到繁殖和法定捕捞尺寸通常需5–8年。", ["general"]),
    adaptations: [
      adaptation("Different claws", "功能不同的双螯", "A broad crusher breaks hard prey while a sharper cutter tears softer tissue.", "宽厚碎壳螯击碎硬质猎物，较锋利的剪切螯撕开软组织。", ["general"]),
      adaptation("Molting growth", "蜕壳生长", "Shedding the rigid exoskeleton creates room for growth, followed by rapid water uptake and shell hardening.", "脱去刚性外骨骼后获得生长空间，随后迅速吸水并硬化新壳。", ["general"]),
      adaptation("Chemical and tactile antennae", "化学与触觉触角", "Two pairs of antennae help locate food, shelter and other lobsters in dim benthic habitat.", "两对触角帮助它在昏暗底栖环境中寻找食物、庇护处和同类。", ["ecology"]),
    ],
    role: section("American lobsters are both predators and prey in north-west Atlantic bottom communities. Their feeding links mollusks, worms, echinoderms, fish and algae, while juveniles transfer energy to many larger predators.", "美洲螯龙虾在西北大西洋底栖群落中既是捕食者也是猎物。其取食连接软体动物、蠕虫、棘皮动物、鱼和藻类，幼体又向多种大型捕食者传递能量。", ["ecology"]),
    conservation: { trend: "stable", threats: b("The global assessment is Least Concern, but warming water, disease, fishing pressure, whale entanglement in pot lines and regional recruitment changes require stock-specific management.", "全球评估为无危，但海水变暖、疾病、捕捞压力、捕虾绳索缠绕鲸类，以及地区补充量变化，都需要针对具体种群管理。"), actions: b("Use size limits, protect egg-bearing and marked females, reduce lost gear and whale-entanglement risk, monitor temperature and recruitment, and manage each stock with current survey data.", "应采用尺寸限制，保护抱卵和有标记雌虾，减少遗失渔具与鲸类缠绕风险，监测温度和补充量，并以最新调查数据分别管理种群。") },
    identification: { key: b("A large north-west Atlantic lobster with 2 unequal massive front claws, a smooth robust carapace and usually dark olive-brown live coloration.", "西北大西洋大型螯龙虾，有2个不对称的巨大前螯，头胸甲光滑粗壮，活体通常呈深橄榄棕色。"), similar: b("Spiny lobsters lack the pair of massive front claws. The European lobster is closely similar; provenance and specialist morphological characters are needed where origin is uncertain.", "刺龙虾没有一对巨大前螯。欧洲螯龙虾与其很相似；来源不明时需要产地信息和专家形态特征。") },
    communication: section("Lobsters use chemical signals carried in urine, antenna contact and postures during dominance, courtship and shelter disputes. Vision contributes, but touch and chemical sensing are especially important on the seafloor.", "龙虾在等级、求偶和庇护处争夺中会使用随尿液释放的化学信号、触角接触和姿势。视觉也参与，但触觉和化学感受在海底尤为重要。", ["ecology"]),
    seasonal: section("Egg-bearing females often move inshore before hatching in late spring or early summer, while some large adults make seasonal movements between shallow and deeper water. Patterns vary among regions and individuals.", "抱卵雌虾常在晚春或初夏孵化前移向近岸，一些大型成体也会在浅水和深水间季节性移动；不同地区和个体的模式并不相同。", ["general", "range"]),
    humans: section("This species supports a major trap fishery and coastal livelihoods. Regulations protect undersized and egg-bearing animals and vary by management area; consumers and fishers should follow current local rules.", "该物种支撑重要笼捕渔业和沿海生计。法规保护未达尺寸和抱卵个体，并随管理区而异；消费者和渔民应遵守最新当地规定。", ["general", "conservation"]),
    evolution: section("Homarus americanus is a decapod crustacean in Nephropidae, closely related to the European lobster. Its asymmetric claw specialization develops through use rather than being fixed to the same side in every animal.", "美洲螯龙虾是海螯虾科十足目甲壳动物，与欧洲螯龙虾近缘。其不对称双螯的功能分化会随使用形成，并非所有个体都固定在同一侧。", ["taxonomy", "general"]),
    field: section("Lobsters shelter in rocky crevices or excavated burrows; shed exoskeletons may resemble dead animals. A shell, burrow or trap catch must be checked carefully before inferring a live resident or exact species.", "龙虾藏在岩缝或挖掘洞穴中；蜕下的外骨骼可能看似死亡个体。不能只凭壳、洞穴或笼捕就推断有活体居民或确定物种。"),
    know: [
      section("A live American lobster is usually dark, and heat changes shell pigments so a cooked lobster appears bright red.", "活体美洲螯龙虾通常颜色较深；加热会改变壳中色素，使熟龙虾呈鲜红色。", ["general"]),
      section("The 2 large claws are specialized for different tasks rather than being mirror copies.", "2个大螯承担不同功能，并不是彼此镜像的复制。", ["general"]),
      section("Age is difficult to estimate because each molt discards much of the hard structure that might record growth.", "由于每次蜕壳都会丢弃可能记录生长的大部分硬结构，因此年龄很难估算。", ["general"]),
    ],
    classSpecific: { title: b("Crustacean molt", "甲壳动物蜕壳"), content: b("Growth requires a risky molt: the old shell splits, the lobster expands a soft new exoskeleton with water, and it remains vulnerable until calcium and other minerals harden the shell.", "生长必须经历风险较高的蜕壳：旧壳裂开，龙虾吸水撑大柔软的新外骨骼，在钙等矿物质使新壳硬化前都很脆弱。") },
    sources: {
      taxonomy: source("GBIF Backbone Taxonomy", "https://api.gbif.org/v1/species/match?name=Homarus%20americanus"),
      general: source("NOAA Fisheries", "https://www.fisheries.noaa.gov/species/american-lobster/resources"),
      ecology: source("NOAA Fisheries", "https://www.fisheries.noaa.gov/species/american-lobster/resources"),
      conservation: source("SeaLifeBase IUCN index", "https://www.sealifebase.se/summary/Homarus-americanus.html"),
      range: source("NOAA Fisheries", "https://www.fisheries.noaa.gov/species/american-lobster/resources"),
    },
  },

  "common-fruit-fly": {
    status: { code: "NE", en: "Not Evaluated", zh: "未评估", note_en: "No species-level IUCN Red List assessment was found for Drosophila melanogaster, so its status is Not Evaluated rather than an inferred low-risk category.", note_zh: "未找到黑腹果蝇的IUCN物种级红色名录评估，因此其等级为未评估，而不是推断出的低风险等级。" },
    description: b("Drosophila melanogaster is a tiny tan fly associated with fermenting fruit and other plant material. Its fast life cycle, 4 chromosome pairs and powerful genetic tools made it one of biology's most influential model organisms.", "黑腹果蝇是一种与发酵水果及其他植物材料相关的微小黄褐色蝇类。快速生命周期、4对染色体和强大的遗传工具，使它成为生物学中最具影响力的模式动物之一。"),
    encyclopedia: {
      anatomy: section("Adults are about 3 mm long, tan with dark abdominal bands, large red compound eyes, 3 small simple eyes, 1 functional pair of wings and a pair of knobbed balancing organs called halteres. Females are generally larger; males have a darker rounded abdominal tip.", "成虫体长约3毫米，黄褐色，腹部有深色横带，具大型红色复眼、3个小单眼、1对功能性翅和一对称为平衡棒的棒状平衡器。雌蝇通常较大；雄蝇腹端更深且较圆。", ["general", "taxonomy"]),
      ecology: section("Adults and larvae live around fermenting plant substrates rich in yeasts and bacteria. Smell and taste guide adults to feeding and egg-laying sites; larvae tunnel through the soft substrate and feed on its microbial community and dissolved nutrients.", "成虫和幼虫生活在富含酵母与细菌的发酵植物基质周围。嗅觉和味觉引导成虫寻找取食与产卵地点；幼虫在柔软基质中钻行，取食其中微生物群落和溶解养分。", ["general", "ecology"]),
      habitat: section("The ancestral range is African, but association with people spread the species through tropical and temperate regions on nearly every continent except Antarctica. Orchards, wineries, markets, kitchens and compost provide warm moist breeding sites.", "其祖先分布区在非洲，但与人类共生使该物种扩散到除南极洲外几乎各大洲的热带和温带地区。果园、酒厂、市场、厨房和堆肥都可提供温暖湿润的繁殖地点。", ["general", "range"]),
    },
    facts: [
      fact("length", "Adult length", "成虫体长", "About 3 mm", "约3毫米", ["general"]),
      fact("chromosomes", "Chromosome pairs", "染色体对数", "4 pairs", "4对", ["research"]),
      fact("development", "Egg to adult", "卵至成虫", "About 10 days at 25°C", "25°C时约10天", ["research"]),
      fact("diet", "Feeding substrate", "取食基质", "Yeasts, microbes and nutrients in fermenting plant material", "发酵植物材料中的酵母、微生物和养分", ["ecology"]),
      fact("metamorphosis", "Development", "发育方式", "Egg, 3 larval instars, pupa, adult", "卵、3个幼虫龄期、蛹、成虫", ["research"]),
      fact("status", "IUCN status", "IUCN等级", "Not Evaluated", "未评估", ["conservation"]),
    ],
    life: section("At about 25°C, development from egg through 3 larval instars and a pupa to an adult takes roughly 10 days, though temperature and food alter the timing. Adults mate soon after emergence, and females lay many small eggs on suitable fermenting substrate.", "在约25°C时，从卵经过3个幼虫龄期和蛹发育为成虫约需10天，但温度和食物会改变速度。成虫羽化后不久即可交配，雌蝇在合适的发酵基质上产下许多小卵。", ["general", "research"]),
    adaptations: [
      adaptation("Halteres", "平衡棒", "Modified hind wings sense rotation and stabilize rapid flight.", "由后翅特化的平衡棒感受旋转并稳定快速飞行。", ["general"]),
      adaptation("Fermentation sensing", "发酵物感受", "Chemical receptors locate volatile compounds produced by yeasts and ripening or decaying plant material.", "化学感受器能定位酵母以及成熟或腐败植物材料释放的挥发物。", ["ecology"]),
      adaptation("Rapid generation time", "快速世代", "Fast development and high reproductive output exploit short-lived food patches.", "快速发育和较高繁殖量可利用短暂存在的食物斑块。", ["general"]),
    ],
    role: section("Fruit flies consume and disperse microbes associated with decomposition and are prey for spiders, insects and small vertebrates. Their greatest human significance is scientific: research on them has revealed fundamental principles of heredity, development, behavior and disease.", "果蝇取食并传播与分解相关的微生物，也会成为蜘蛛、昆虫和小型脊椎动物的猎物。它对人类最大的意义在科研：相关研究揭示了遗传、发育、行为和疾病的基本原理。", ["ecology", "research"]),
    conservation: { trend: "unknown", threats: b("The species has not been assessed by IUCN and is widespread around people. Lack of an assessment should not be presented as a formal Least Concern conclusion; no global population trend is monitored.", "该物种尚未接受IUCN评估，并广泛生活在人类环境周围。不能把缺少评估表述成正式无危结论；也没有受监测的全球种群趋势。"), actions: b("No species-focused conservation program is indicated by current evidence. Maintain accurate taxonomic records and distinguish wild ecological populations from laboratory strains when reporting data.", "现有证据不表明需要物种专项保护计划。报告数据时应保持准确分类，并区分野外生态种群与实验室品系。") },
    identification: { key: b("A roughly 3 mm tan fly with bright red eyes, dark abdominal bands and clear wings; males have a darker rounded abdominal tip and sex combs on the front legs.", "约3毫米长的黄褐色小蝇，红眼、腹部有深色横带、翅透明；雄蝇腹端较深且圆，前足有性梳。"), similar: b("Drosophila simulans and other small drosophilids can look nearly identical. Reliable species identification may require male genitalia, sex-comb details, genetics or an expert key; a fly near fruit is not enough.", "拟果蝇及其他小型果蝇科物种可能几乎相同。可靠鉴定可能需要雄性生殖器、性梳细节、遗传证据或专家检索表；仅凭出现在水果旁不能确定物种。") },
    communication: section("Courtship combines visual following, tapping, chemical pheromones and a species-patterned song made by vibrating one wing. Taste and smell also influence mate and egg-laying choices.", "求偶结合视觉追随、触碰、化学信息素，以及振动单侧翅产生的物种特定求偶歌；味觉和嗅觉也会影响择偶和产卵选择。", ["research"]),
    seasonal: section("Outdoors, warm conditions and fruit availability produce rapid population peaks; cold limits activity. Heated buildings and stored or discarded produce can support overlapping generations year-round.", "在室外，温暖条件和水果供应会造成快速种群高峰，寒冷则限制活动。供暖建筑和储存或丢弃的果蔬可使多个世代全年重叠。", ["ecology", "range"]),
    humans: section("D. melanogaster is a major genetics and biomedical model and a nuisance around fermenting produce, but it should not be confused with larger tephritid fruit flies whose larvae directly damage intact commercial fruit.", "黑腹果蝇是重要遗传和生物医学模式动物，也会在发酹果蔬周围造成滋扰；但不能把它与幼虫直接危害完整商品水果的较大型实蝇科害虫混为一谈。", ["research", "general"]),
    evolution: section("The species belongs to Drosophilidae and is placed in the Sophophora lineage within the broad traditional genus Drosophila. Comparison with close relatives is central to research on gene and trait evolution.", "该物种属于果蝇科，在广义传统果蝇属中归入Sophophora谱系。与近缘种比较是研究基因和性状演化的重要方法。", ["taxonomy", "research"]),
    field: section("Small tan flies hovering over fermenting fruit suggest drosophilids. Eggs and larvae are tiny and hidden in soft substrate; species-level confirmation usually needs magnification and a diagnostic key.", "在发酵水果上方盘旋的黄褐色小蝇提示可能是果蝇科。卵和幼虫很小并藏在柔软基质中；物种级确认通常需要放大观察和鉴定检索表。", ["general"]),
    know: [
      section("D. melanogaster has only 4 pairs of chromosomes, helping make its genetics experimentally tractable.", "黑腹果蝇只有4对染色体，这有助于开展可控遗传实验。", ["research"]),
      section("Its rear wings are transformed into sensory halteres rather than a second pair of flight wings.", "它的后翅变成感觉用平衡棒，而不是第二对飞行翅。", ["general"]),
      section("A name meaning 'fruit fly' does not mean the species mainly eats sound fresh fruit; fermenting microbes are central to its feeding habitat.", "“果蝇”之名并不表示它主要吃完好鲜果；发酵微生物才是其取食生境的核心。", ["ecology"]),
    ],
    classSpecific: { title: b("Complete metamorphosis", "完全变态"), content: b("The egg, 3 feeding larval instars, reorganizing pupa and winged adult perform different tasks, allowing rapid use of fermenting food while adults disperse to new patches.", "卵、3个取食幼虫龄期、发生重组的蛹和有翅成虫承担不同任务，使其能快速利用发酵食物，并由成虫扩散到新斑块。") },
    sources: {
      taxonomy: source("NCBI Taxonomy", "https://www.ncbi.nlm.nih.gov/taxonomy/7227"),
      general: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Drosophila_melanogaster/"),
      ecology: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Drosophila_melanogaster/"),
      research: source("FlyBase", "https://flybase.org/reports/FBrf0238822.html"),
      conservation: source("IUCN Red List species search", "https://www.iucnredlist.org/search?query=Drosophila%20melanogaster&searchType=species"),
      range: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Drosophila_melanogaster/"),
    },
  },

  "australian-box-jellyfish": {
    status: { code: "NE", en: "Not Evaluated", zh: "未评估", note_en: "No species-level IUCN Red List assessment was found for Chironex fleckeri; absence of an assessment does not indicate safety or a population trend.", note_zh: "未找到澳大利亚箱水母的IUCN物种级红色名录评估；缺少评估并不表示该物种安全或具有某种种群趋势。" },
    description: b("The Australian box jellyfish is a large, nearly transparent cubozoan of tropical northern Australian coasts. It is an active visual predator with a box-shaped bell and up to 15 tentacles at each corner; contact with its nematocysts can cause life-threatening envenomation.", "澳大利亚箱水母是生活在澳大利亚北部热带海岸的大型近透明立方水母。它是主动视觉捕食者，伞部呈箱形，每个角触手可达15条；接触其刺丝囊可能造成危及生命的中毒。"),
    encyclopedia: {
      anatomy: section("The transparent bell can reach about 30 cm across, and tentacles can extend to about 3 m. Up to 15 tentacles arise from each of 4 muscular corner structures, while 24 eyes occur in 4 sensory clusters around the bell.", "透明伞部宽可达约30厘米，触手可延伸至约3米。4个肌肉发达的伞角结构各可长出多达15条触手，伞缘周围4个感觉簇共有24只眼。", ["general"]),
      ecology: section("Unlike passive drifters, box jellyfish swim and steer while using vision to navigate shallow coastal habitat. Adults capture prawns and small fish with nematocyst-covered tentacles; contact triggers rapid discharge of microscopic stinging capsules.", "箱水母并非被动漂流，而会游泳、转向并利用视觉在浅海沿岸导航。成体以布满刺丝囊的触手捕捉虾和小鱼；接触会触发微小刺丝囊迅速发射。", ["general", "ecology"]),
      habitat: section("Confirmed Australian distribution spans tropical coastal waters from Western Australia through the Northern Territory to Queensland. Shallow beaches, mangrove creeks and protected coastal waters are important, while records outside Australia require careful species-level confirmation.", "在澳大利亚，确认分布横跨从西澳大利亚州、北领地到昆士兰州的热带沿海水域。浅海岸滩、红树林溪流和受遮蔽近岸水域很重要；澳大利亚以外的记录需要谨慎进行物种级确认。", ["range", "identification"]),
    },
    facts: [
      fact("bell", "Bell width", "伞部宽度", "Up to about 30 cm", "可达约30厘米", ["general"]),
      fact("tentacles", "Tentacle length", "触手长度", "Up to about 3 m", "可达约3米", ["general"]),
      fact("tentacle_count", "Tentacles", "触手数", "Up to 15 at each of 4 corners", "4个伞角各可达15条", ["general"]),
      fact("eyes", "Eyes", "眼睛数", "24 in 4 clusters", "4个感觉簇共24只", ["general"]),
      fact("diet", "Diet", "食性", "Prawns and small fish", "虾和小鱼", ["ecology"]),
      fact("status", "IUCN status", "IUCN等级", "Not Evaluated", "未评估", ["conservation"]),
    ],
    life: section("Sperm and eggs form ciliated planula larvae, which settle and become tiny bottom-attached polyps. A polyp later transforms into a free-swimming juvenile medusa that grows rapidly toward the adult form; timing is seasonal and temperature-dependent.", "精子和卵形成有纤毛的浮浪幼体，随后沉降并变成微小的固着水螅体。水螅体之后转变为自由游动的幼年水母，并快速长成成体；其时间具有季节性并受温度影响。", ["ecology"]),
    adaptations: [
      adaptation("Box-shaped swimming bell", "箱形游泳伞", "A firm bell and muscular corner structures produce stronger directed swimming than in many jellyfish.", "较坚实的伞部和肌肉发达的伞角结构，使其游泳方向性强于许多水母。", ["general"]),
      adaptation("Complex eyes", "复杂眼睛", "Lens-bearing eyes help orient the animal and avoid obstacles in structured coastal habitat.", "带晶状体的眼帮助它在结构复杂的沿海生境中定向并避开障碍。", ["ecology"]),
      adaptation("Nematocyst batteries", "刺丝囊阵列", "Dense stinging capsules on long tentacles rapidly immobilize fast fish and prawns.", "长触手上密集刺丝囊能迅速制伏游速较快的鱼和虾。", ["general"]),
    ],
    role: section("Chironex fleckeri is a mobile coastal predator of prawns and small fish and is itself part of a larger marine food web. Its seasonal abundance can strongly alter risk for swimmers, but its population-level ecological effects remain poorly quantified.", "澳大利亚箱水母是捕食虾和小鱼的活动性沿海捕食者，本身也属于更大的海洋食物网。其季节性数量会显著改变游泳者风险，但种群层面的生态影响仍缺少量化。", ["ecology"]),
    conservation: { trend: "unknown", threats: b("The species has not been assessed by IUCN, and there is no reliable global population trend. Coastal development, water conditions and climate may affect local occurrence, but evidence does not support a precise global conclusion.", "该物种尚未接受IUCN评估，也没有可靠全球种群趋势。沿海开发、水体条件和气候可能影响当地出现情况，但现有证据不足以得出精确全球结论。"), actions: b("Maintain species-confirmed monitoring, preserve coastal and mangrove habitat, record seasonal occurrence and separate public-safety surveillance from unsupported assumptions about conservation status.", "应维持经物种确认的监测，保护沿海与红树林生境，记录季节性出现情况，并把公共安全监测与缺乏证据的保护等级推断区分开。") },
    identification: { key: b("A large nearly transparent box-shaped bell with up to 15 tentacles arising from each corner; the animal may be extremely difficult to see in water.", "大型近透明箱形伞部，每个伞角触手可达15条；在水中可能极难看见。"), similar: b("Many cubozoans are called box jellyfish. Irukandji-type species are much smaller and usually have 1 tentacle per corner; exact Chironex identification requires expert morphology and location, not sting symptoms alone.", "许多立方水母都被称为箱水母。伊鲁康吉型物种小得多，通常每个伞角只有1条触手；精确鉴定澳大利亚箱水母需要专家形态和地点证据，不能只看蜇伤症状。", ["identification"]) },
    communication: section("No social communication is known. The sensory system integrates 24 eyes and gravity-sensing structures to control swimming, obstacle avoidance and prey capture in changing light and current.", "尚不知道它存在社会交流。感觉系统整合24只眼和重力感受结构，以在变化的光线和水流中控制游泳、避障和捕猎。", ["ecology"]),
    seasonal: section("In northern Australia, larger medusae are most associated with the warm wet-season or marine-stinger season, but timing varies locally. Polyps provide a hidden bottom-attached stage between medusa seasons.", "在澳大利亚北部，大型水母阶段多与温暖湿季或海蜇高发季相关，但各地时间不同。水螅体是在水母季之间隐蔽生活于底部的固着阶段。", ["ecology", "safety"]),
    humans: section("Stings can be life-threatening. Follow beach closures and local lifesaving guidance, wear recommended protective clothing in risk areas and never handle a stranded specimen; emergency response should follow current local medical instructions.", "蜇伤可能危及生命。应遵守海滩关闭和当地救生指导，在风险区穿建议的防护服，绝不触碰搁浅个体；急救应遵循最新当地医疗指示。", ["safety"]),
    evolution: section("Box jellyfish belong to Cubozoa within Cnidaria, not to the true jellyfish class Scyphozoa. Their active swimming and complex visual system are unusually developed within gelatinous zooplankton.", "箱水母属于刺胞动物门立方水母纲，而不属于钵水母纲的真水母；其主动游泳和复杂视觉系统在胶质浮游动物中格外发达。", ["taxonomy", "general"]),
    field: section("The bell is transparent and tentacles may be nearly invisible, so absence of a sighting does not indicate safe water. Warning signs, lifeguard surveillance and local seasonal information are more reliable than casual visual searching.", "伞部透明、触手近乎不可见，因此没看到并不代表水域安全。警示牌、救生员监测和当地季节信息比随意目视寻找更可靠。", ["safety"]),
    know: [
      section("The animal has 24 eyes, but no centralized vertebrate-like brain.", "它有24只眼，但没有类似脊椎动物的中央大脑。", ["general"]),
      section("Up to 15 tentacles can emerge from each of the 4 corners of the bell.", "伞部4个角各可达15条触手。", ["general"]),
      section("A bottom-attached polyp stage is part of the life cycle even though the visible adult swims freely.", "尽管可见成体自由游动，其生命周期仍包含固着海底的水螅体阶段。", ["ecology"]),
    ],
    classSpecific: { title: b("Cnidarian life stages", "刺胞动物生活史阶段"), content: b("A tiny settled polyp and a large swimming medusa occupy very different habitats and perform different tasks; transformation between them links hidden benthic persistence to seasonal coastal swarms.", "微小固着水螅体与大型游泳水母生活在不同生境、承担不同任务；两者间的转变把隐蔽底栖存续与季节性沿海出现连接起来。") },
    sources: {
      taxonomy: source("Australian Museum", "https://australian.museum/learn/animals/jellyfish/boxjellyfish/"),
      general: source("Australian Museum", "https://australian.museum/learn/animals/jellyfish/boxjellyfish/"),
      ecology: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Chironex_fleckeri/"),
      identification: source("Australian Museum", "https://australian.museum/learn/animals/jellyfish/boxjellyfish/"),
      safety: source("Surf Life Saving Australia Beachsafe", "https://beachsafe.org.au/surf-safety/box-jellyfish"),
      conservation: source("IUCN Red List species search", "https://www.iucnredlist.org/search?query=Chironex%20fleckeri&searchType=species"),
      range: source("Australian Museum", "https://australian.museum/learn/animals/jellyfish/boxjellyfish/"),
    },
  },

  "aye-aye": {
    status: { code: "EN", en: "Endangered", zh: "濒危", note_en: "The 2018 global IUCN assessment lists the aye-aye as Endangered with a decreasing, severely fragmented population.", note_zh: "2018年IUCN全球评估将指猴列为濒危，其种群下降且严重破碎化。" },
    description: b("The aye-aye is a nocturnal lemur found only in Madagascar. Continuously growing incisors, large movable ears and an extremely slender middle finger let it tap wood, listen for hollow chambers and extract insect larvae—a primate solution resembling a woodpecker's niche.", "指猴是仅分布于马达加斯加的夜行性狐猴。不断生长的门齿、可转动的大耳和极细长中指，使它能敲击木材、聆听空腔并取出昆虫幼虫——以灵长类方式占据类似啄木鸟的生态位。"),
    encyclopedia: {
      anatomy: section("Adults weigh roughly 2.5–2.8 kg and have large ears, forward-facing eyes, coarse dark fur, a bushy tail, continuously growing incisors and elongated fingers. The middle finger is exceptionally thin and mobile, while the fourth finger provides strength for extracting food.", "成体体重约2.5–2.8千克，具有大耳、向前的眼、粗糙深色毛、蓬松长尾、不断生长的门齿和细长手指。中指异常纤细灵活，第四指则在取食时提供力量。", ["general"]),
      ecology: section("Aye-ayes are mostly solitary nocturnal foragers. They tap branches, listen for cavities, gnaw openings and probe out wood-boring larvae, but also eat seeds, nuts, fruit, nectar and fungi and sleep by day in leafy spherical nests.", "指猴主要独居并在夜间觅食。它们敲击树枝、聆听空腔、啃开孔洞，再探取蛀木幼虫；也吃种子、坚果、水果、花蜜和真菌，白天在球形叶巢中睡眠。", ["general", "ecology"]),
      habitat: section("The species occurs in fragmented forest across eastern, northern and parts of western Madagascar, using rainforest, dry deciduous forest, secondary forest and some plantations. Suitable trees and connected canopy are important even where the species tolerates disturbance.", "该物种分布于马达加斯加东部、北部和部分西部的破碎森林，可利用雨林、干燥落叶林、次生林和部分种植园。即使能耐受一定干扰，合适树木和连通树冠仍很重要。", ["range", "conservation"]),
    },
    facts: [
      fact("weight", "Adult weight", "成体体重", "About 2.5–2.8 kg", "约2.5–2.8千克", ["general"]),
      fact("activity", "Activity", "活动时间", "Nocturnal", "夜行", ["ecology"]),
      fact("diet", "Diet", "食性", "Insect larvae, seeds, nuts, fruit and other foods", "昆虫幼虫、种子、坚果、水果及其他食物", ["ecology"]),
      fact("gestation", "Gestation", "妊娠期", "About 172 days", "约172天", ["general"]),
      fact("young", "Young", "每胎幼崽", "1; typically every 2–3 years", "1只；通常每2–3年一次", ["general"]),
      fact("status", "IUCN status", "IUCN等级", "Endangered", "濒危", ["conservation"]),
    ],
    life: section("Mating can occur throughout the year. After about 172 days of gestation, a female gives birth to 1 young and may reproduce only every 2–3 years. The infant rides and nests with its mother before gradually learning independent nocturnal foraging.", "全年都可能交配。妊娠约172天后，雌性产下1只幼崽，可能每2–3年才繁殖一次。幼崽随母亲移动并同巢，之后逐渐学习独立夜间觅食。", ["general"]),
    adaptations: [
      adaptation("Percussive foraging", "敲击觅食", "Rapid tapping and large ears reveal changes in wood resonance that can indicate hidden cavities.", "快速敲击和大耳可识别木材共振变化，从而发现隐藏空腔。", ["ecology"]),
      adaptation("Slender middle finger", "纤细中指", "An extremely mobile middle finger probes tunnels and hooks out larvae or soft food.", "极灵活的中指可探入通道，钩出幼虫或柔软食物。", ["general"]),
      adaptation("Ever-growing incisors", "终生生长门齿", "Continuously growing front teeth gnaw wood and hard seed shells without being permanently worn down.", "不断生长的前齿可啃咬木材和坚硬种壳，而不会被永久磨损。", ["general"]),
    ],
    role: section("Aye-ayes prey on wood-boring insects, open hard seeds and may move seeds or pollen while feeding. Their excavations create small openings in dead wood that other organisms can exploit.", "指猴捕食蛀木昆虫、打开坚硬种子，并可能在取食时移动种子或花粉；其在朽木上凿出的孔洞也可被其他生物利用。", ["ecology"]),
    conservation: { trend: "decreasing", threats: b("Forest loss, fragmentation, hunting, killing as an alleged crop pest and fear linked to local beliefs all affect the species. Slow reproduction increases sensitivity to adult mortality.", "森林丧失和破碎化、猎捕、因被视为作物害兽而遭杀害，以及与地方观念相关的恐惧都会影响该物种；较慢繁殖使其对成体死亡尤其敏感。"), actions: b("Protect and reconnect native forests, reduce hunting and retaliatory killing through community-led programs, safeguard nesting and feeding trees and maintain carefully managed assurance populations.", "应保护并重新连接原生森林，通过社区主导项目减少猎捕和报复性杀害，保护筑巢与取食树木，并维持谨慎管理的保种种群。") },
    identification: { key: b("A dark shaggy lemur with huge ears, prominent incisors, a bushy tail and an exceptionally thin elongated middle finger.", "深色蓬乱毛的狐猴，耳朵巨大、门齿突出、尾巴蓬松，中指异常纤细延长。"), similar: b("No other living lemur combines the aye-aye's rodent-like incisors and skeletal middle finger. Night views can distort proportions, so photographs should show the face, hands and tail rather than rely on eye-shine alone.", "其他现生狐猴都没有同时具备指猴的啮齿样门齿和骨感中指。夜间观察会扭曲比例，因此照片应显示面部、手和尾，而不能只凭眼光反射。") },
    communication: section("Aye-ayes use scent marks, calls and physical signals while mostly ranging alone. Large ears are important not only for social sound but for listening to echoes and movements during foraging.", "指猴虽然主要独自活动，仍会使用气味标记、叫声和身体信号。大耳不仅用于社会声音，也用于觅食时聆听回声和内部动静。", ["general", "ecology"]),
    seasonal: section("Breeding is not confined to one short annual season, and fruit or seed use changes with local availability. Individuals reuse or rebuild multiple leafy nests as they move through home ranges.", "繁殖并不局限于一个短暂年度季节，对水果或种子的利用会随当地供应变化。个体在家域中移动时会重复使用或重建多个叶巢。", ["general"]),
    humans: section("Aye-ayes have complex and locally variable cultural meanings in Madagascar; claims that all Malagasy people fear or kill them are inaccurate. Conservation works best with community-specific knowledge and solutions.", "指猴在马达加斯加具有复杂且地方差异明显的文化含义；声称所有马达加斯加人都害怕或杀死它们并不准确。保护应结合具体社区的知识和解决方案。", ["conservation"]),
    evolution: section("Daubentonia madagascariensis is the only living species in Daubentoniidae. Its closest relatives are other lemurs, while its gnawing teeth and extractive foraging are convergent with features seen in unrelated rodents and woodpeckers.", "指猴是指猴科唯一现生种，最近亲缘仍是其他狐猴；其啃咬牙齿和提取式觅食则与无关的啮齿动物和啄木鸟形成趋同。", ["taxonomy", "general"]),
    field: section("Spherical leafy nests high in trees, paired gnaw openings and tapping sounds may suggest an aye-aye, but nests can be reused and feeding marks are not always diagnostic. Nocturnal surveys should minimize light and disturbance.", "树上的球形叶巢、成对啃洞和敲击声可能提示有指猴，但巢可被重复使用，取食痕迹也不总能确诊。夜间调查应尽量减少灯光和干扰。", ["ecology"]),
    know: [
      section("The aye-aye is a primate, not a rodent, even though its incisors grow continuously.", "尽管门齿不断生长，指猴仍是灵长类而不是啮齿动物。", ["taxonomy"]),
      section("Its middle finger is used for tapping as well as probing food from narrow cavities.", "它的中指既用于敲击，也用于从狭窄空腔中探取食物。", ["ecology"]),
      section("Females usually raise only 1 young and may wait 2–3 years between births.", "雌性通常只抚育1只幼崽，两次生产之间可能相隔2–3年。", ["general"]),
    ],
    classSpecific: { title: b("Slow primate reproduction", "灵长类缓慢繁殖"), content: b("A long gestation, single infant and extended maternal care mean that losing breeding adults cannot be rapidly offset by many young, increasing the value of adult survival.", "较长妊娠、单胎和延长母育意味着繁殖成体损失无法靠大量幼崽迅速弥补，因此成体存活尤为重要。") },
    sources: {
      taxonomy: source("GBIF Backbone Taxonomy", "https://api.gbif.org/v1/species/match?name=Daubentonia%20madagascariensis"),
      general: source("Duke Lemur Center", "https://lemur.duke.edu/discover/meet-the-lemurs/aye-aye/"),
      ecology: source("Duke Lemur Center", "https://lemur.duke.edu/discover/meet-the-lemurs/aye-aye/"),
      conservation: source("Lemur Conservation Network", "https://www.lemurconservationnetwork.org/learn/lemur-species-fact-sheets/aye-aye/"),
      range: source("Lemur Conservation Network", "https://www.lemurconservationnetwork.org/learn/lemur-species-fact-sheets/aye-aye/"),
    },
  },

  "bee-hummingbird": {
    status: { code: "NT", en: "Near Threatened", zh: "近危", note_en: "The current global IUCN assessment lists the Cuban-endemic bee hummingbird as Near Threatened, with habitat loss and fragmentation as key concerns.", note_zh: "当前IUCN全球评估将古巴特有的吸蜜蜂鸟列为近危，生境丧失和破碎化是主要隐患。" },
    description: b("The bee hummingbird is a Cuban endemic and the smallest living bird. Males average about 5.5 cm and 1.95 g, yet the species can hover precisely, defend flowers and pollinate plants using the same high-performance flight system found in larger hummingbirds.", "吸蜜蜂鸟是古巴特有种，也是现存最小的鸟。雄鸟平均约5.5厘米、1.95克，却能利用与大型蜂鸟相同的高性能飞行系统精准悬停、保卫花源并为植物传粉。"),
    encyclopedia: {
      anatomy: section("Males average about 5.5 cm long and 1.95 g; females are slightly larger, around 6 cm and 2.6 g. Breeding males show iridescent red-pink head and throat feathers, whereas females and non-breeding males are greener above and pale below.", "雄鸟平均体长约5.5厘米、体重1.95克；雌鸟稍大，约6厘米、2.6克。繁殖期雄鸟头喉呈虹彩红粉色，雌鸟和非繁殖期雄鸟则上体偏绿、下体浅色。", ["general"]),
      ecology: section("The birds feed on flower nectar and capture tiny insects and spiders for protein. Hovering allows feeding without a perch, and territorial individuals defend productive flower patches; pollen carried on the head and bill contributes to pollination.", "它们取食花蜜，也捕捉微小昆虫和蜘蛛补充蛋白质。悬停使其无需停栖即可取食，具领地性的个体会保卫高产花源；头部和喙携带的花粉有助于传粉。", ["general", "ecology"]),
      habitat: section("The species occurs only in Cuba, with a fragmented distribution in mature and secondary forest, woodland edges, shrubland and well-vegetated gardens. Important areas include the Zapata region, Guanahacabibes and parts of eastern Cuba.", "该物种仅分布于古巴，在成熟林、次生林、林缘、灌丛和植被良好的花园中呈破碎分布。重要地区包括萨帕塔、瓜纳阿卡维韦斯及古巴东部部分地区。", ["range", "conservation"]),
    },
    facts: [
      fact("male_length", "Male length", "雄鸟体长", "About 5.5 cm", "约5.5厘米", ["general"]),
      fact("male_weight", "Male weight", "雄鸟体重", "About 1.95 g", "约1.95克", ["general"]),
      fact("female_weight", "Female weight", "雌鸟体重", "About 2.6 g", "约2.6克", ["general"]),
      fact("diet", "Diet", "食性", "Nectar plus tiny insects and spiders", "花蜜及微小昆虫和蜘蛛", ["ecology"]),
      fact("clutch", "Clutch", "每窝蛋数", "Usually 2 eggs", "通常2枚", ["general"]),
      fact("status", "IUCN status", "IUCN等级", "Near Threatened", "近危", ["conservation"]),
    ],
    life: section("A female builds a tiny cup nest from plant fibers, bark and spider silk, usually lays 2 eggs and carries out incubation and chick care. Males display and defend feeding or courtship areas but do not share nest duties.", "雌鸟用植物纤维、树皮和蛛丝建造微小杯形巢，通常产2枚蛋，并负责孵化和育雏。雄鸟展示并保卫取食或求偶区域，但不分担巢务。", ["general"]),
    adaptations: [
      adaptation("Hovering flight", "悬停飞行", "Rapidly reversing wing forces keep the bird nearly stationary while its bill reaches flowers.", "翅膀快速反转受力，使鸟体几乎停在空中，同时把喙伸入花中。", ["ecology"]),
      adaptation("Miniature body", "微型身体", "Extremely small size permits use of tiny flowers and fine perches but demands frequent energy intake.", "极小体型可利用微小花朵和细枝，但需要频繁摄取能量。", ["general"]),
      adaptation("Torpor", "蛰伏", "Temporary reduction of body temperature and metabolism can reduce overnight energy demand when conditions require it.", "在需要时暂时降低体温和代谢，可减少夜间能量需求。", ["ecology"]),
    ],
    role: section("Bee hummingbirds transfer pollen among Cuban flowers while taking nectar and also consume small arthropods. Their dependence on flowering habitat links bird conservation to native plant communities and seasonal nectar supply.", "吸蜜蜂鸟取食花蜜时在古巴花朵间转移花粉，也捕食小型节肢动物。它对开花生境的依赖把鸟类保护与本地植物群落和季节性花蜜供应连接起来。", ["ecology"]),
    conservation: { trend: "decreasing", threats: b("Forest clearing, agricultural conversion, fragmentation, severe storms and changes in flowering resources threaten a species whose entire native range lies in Cuba.", "森林清理、农业转化、生境破碎化、强风暴和花源变化威胁着这一整个原生分布都在古巴的物种。"), actions: b("Protect and reconnect Cuban forest and shrub habitat, retain diverse native flowering plants, limit pesticide exposure and monitor populations across the species' separated strongholds.", "应保护并重新连接古巴森林和灌丛，保留多样本地开花植物，限制农药暴露，并在各分离核心分布地监测种群。") },
    identification: { key: b("An exceptionally tiny Cuban hummingbird; breeding males have an iridescent red-pink head and throat, while females are green above and pale below with white-tipped outer tail feathers.", "体型异常微小的古巴蜂鸟；繁殖期雄鸟头喉呈虹彩红粉色，雌鸟上绿下浅，外侧尾羽有白尖。"), similar: b("The Cuban emerald is much larger with a longer bill and tail. Females and immature bee hummingbirds are harder to identify, so size, tail pattern, location and expert-quality photographs should be combined.", "古巴翠蜂鸟大得多，喙和尾也更长。雌鸟和幼年吸蜜蜂鸟更难鉴定，应结合体型、尾纹、地点和专家级照片。") },
    communication: section("Males use aerial displays, iridescent plumage and thin high calls in courtship and territorial defense. Visual flashes change with feather angle, so color can appear dull when the light is wrong.", "雄鸟在求偶和领地防御中使用空中展示、虹彩羽毛和细高叫声。视觉闪光随羽毛角度改变，因此光线不合适时颜色可能显得暗淡。", ["general"]),
    seasonal: section("Breeding and flower use track Cuba's seasonal rainfall and bloom patterns, with much nesting reported in spring and early summer. Storms can abruptly alter flowers and cover in a very small range.", "繁殖和花源利用会随古巴季节性降雨与开花模式变化，许多筑巢记录集中在春季和初夏。强风暴可在狭小分布区内突然改变花源和植被遮蔽。", ["ecology", "conservation"]),
    humans: section("The world's-smallest-bird distinction makes the species a strong symbol for Cuban biodiversity and nature tourism. Observation should avoid crowding nests or repeatedly playing calls in small territories.", "“世界最小鸟”使其成为古巴生物多样性和自然旅游的重要象征。观察时应避免围堵巢址或在狭小领地反复播放叫声。", ["conservation"]),
    evolution: section("Mellisuga helenae belongs to Trochilidae, a New World radiation specialized for nectar feeding and hovering. Its extreme miniaturization is an endpoint within that hummingbird flight and metabolic design, not a separate insect-like ancestry.", "吸蜜蜂鸟属于蜂鸟科这一新大陆辐射谱系，专门适应吸蜜和悬停。其极端微型化是在蜂鸟飞行和代谢结构中的极致，并不意味着具有类似昆虫的独立祖先。", ["taxonomy", "general"]),
    field: section("A tiny buzzing bird at flowers may be overlooked as an insect, but size impressions are unreliable. Clear views of bill, tail and sex-specific plumage plus a Cuban location are needed; never infer the species from buzzing alone.", "花边嗡鸣的微小鸟可能被误看成昆虫，但体型印象并不可靠。需要清晰看到喙、尾和性别相关羽衣，并确认在古巴；绝不能只凭嗡鸣判断。"),
    know: [
      section("Male bee hummingbirds average about 1.95 g, making them lighter than many common coins.", "雄性吸蜜蜂鸟平均约1.95克，比许多常见硬币还轻。", ["general"]),
      section("The female alone builds the nest and raises the usual 2-egg clutch.", "雌鸟独自筑巢并抚育通常为2枚蛋的一窝。", ["general"]),
      section("Its native distribution is limited to Cuba, so habitat changes on one archipelago affect the entire species.", "其原生分布仅限古巴，因此一个群岛的生境变化就会影响整个物种。", ["range"]),
    ],
    classSpecific: { title: b("Bird flight and nesting", "鸟类飞行与筑巢"), content: b("High-power hovering lets the adult exploit flowers, while a silk-bound cup nest and 2 tiny eggs shift the reproductive burden to a female that receives no male parental help.", "高功率悬停使成鸟能利用花朵，而蛛丝固定的杯形巢和2枚微小蛋使繁殖负担落在没有雄鸟育幼帮助的雌鸟身上。") },
    sources: {
      taxonomy: source("American Ornithological Society checklist", "https://checklist.americanornithology.org/taxa/867"),
      general: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Mellisuga_helenae/"),
      ecology: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Mellisuga_helenae/"),
      conservation: source("BirdLife International species factsheet", "https://datazone.birdlife.org/species/factsheet/bee-hummingbird-mellisuga-helenae"),
      range: source("BirdLife International species factsheet", "https://datazone.birdlife.org/species/factsheet/bee-hummingbird-mellisuga-helenae"),
    },
  },

  "bighead-carp": {
    status: { code: "DD", en: "Data Deficient", zh: "数据缺乏", note_en: "The 2010 global IUCN assessment remains Data Deficient. Invasive abundance outside the native range does not resolve uncertainty about wild native populations.", note_zh: "2010年IUCN全球评估仍为数据缺乏。原生区外入侵种群数量多，并不能消除对原生野生种群的不确定性。" },
    description: b("The bighead carp is a large East Asian freshwater fish with a massive head, low-set eyes and mottled sides. Dense gill rakers filter zooplankton from the water; the species is a major aquaculture fish in Asia and a disruptive introduced species in several other regions.", "鳙是东亚大型淡水鱼，头部巨大、眼位很低、体侧有斑驳。密集鳃耙从水中过滤浮游动物；它在亚洲是重要养殖鱼，在其他一些地区则是具有破坏性的外来种。"),
    encyclopedia: {
      anatomy: section("The deep laterally compressed body has a very large scaleless head, upward-facing mouth and eyes below the midline. Small scales and irregular dark blotches cover the flanks; long closely spaced but unfused gill rakers form the filter apparatus.", "体高且侧扁，头部很大且无鳞，口向上，眼睛位于体侧中线以下。体侧有小鳞和不规则深色斑块；细长密集但不融合的鳃耙构成过滤装置。", ["general", "identification"]),
      ecology: section("Bighead carp occupy upper and middle water layers and filter mainly zooplankton, with some phytoplankton and detritus. Adults migrate within river systems to spawn during rising warm flows, and semi-buoyant eggs drift downstream while developing.", "鳙活动于水体中上层，主要过滤浮游动物，也摄食部分浮游植物和碎屑。成鱼在温暖涨水期沿河迁移产卵，半浮性卵在发育中随水漂流。", ["general", "ecology"]),
      habitat: section("Native waters include large river systems from southern to north-eastern China and the Amur basin. The species uses rivers, lakes and reservoirs and has been introduced widely for aquaculture, including self-sustaining populations in parts of the Mississippi basin.", "原生水域包括从中国南部到东北的大型河流系统及黑龙江流域。它利用河流、湖泊和水库，并因养殖被广泛引种，包括在密西西比河流域部分地区形成可自我维持的种群。", ["range", "invasive"]),
    },
    facts: [
      fact("maximum_length", "Maximum length", "最大体长", "About 1.46 m", "约1.46米", ["general"]),
      fact("temperature", "Temperature tolerance", "耐受水温", "About 0.5–38°C", "约0.5–38°C", ["general"]),
      fact("diet", "Diet", "食性", "Mainly zooplankton", "主要为浮游动物", ["ecology"]),
      fact("spawning", "Spawning cue", "产卵触发", "Rising warm river flow, often above about 18°C", "温暖上涨河流，常高于约18°C", ["ecology"]),
      fact("eggs", "Egg type", "卵类型", "Semi-buoyant drifting eggs", "半浮性漂流卵", ["ecology"]),
      fact("status", "IUCN status", "IUCN等级", "Data Deficient", "数据缺乏", ["conservation"]),
    ],
    life: section("Mature fish move to flowing river reaches when water rises and warms, often above about 18°C. Spawning releases many semi-buoyant eggs that must remain suspended while drifting; larvae later move into floodplain, lake or reservoir nursery habitats.", "成熟鱼在水位上涨、升温至常高于约18°C时进入有流动的河段。产下的大量半浮性卵必须在漂流中保持悬浮；幼鱼之后进入洪泛区、湖泊或水库育幼生境。", ["general", "ecology"]),
    adaptations: [
      adaptation("Zooplankton filter", "浮游动物过滤器", "Long dense gill rakers strain small animals from large volumes of water.", "细长密集的鳃耙从大量水中过滤小型动物。", ["general"]),
      adaptation("Low-set eyes", "低位眼", "Eyes below the head midline leave room for a large upward-facing mouth and filtering apparatus.", "位于头部中线以下的眼为大型上位口和过滤装置留出空间。", ["general"]),
      adaptation("Drifting eggs", "漂流卵", "Semi-buoyant eggs develop while moving downstream during flood pulses rather than attaching to a nest.", "半浮性卵在洪峰中向下游移动发育，而不是黏附在巢上。", ["ecology"]),
    ],
    role: section("In native rivers, bighead carp convert plankton production into large fish biomass and support predators and fisheries. Where introduced at high density, they compete with native planktivores and can reshape plankton pathways and fish communities.", "在原生河流中，鳙把浮游生物生产转化为大型鱼类生物量，并支撑捕食者和渔业；在高密度引入区，它会与本地食浮游生物鱼类竞争，并重塑浮游食物路径和鱼类群落。", ["ecology", "invasive"]),
    conservation: { trend: "unknown", threats: b("The native-range population trend is insufficiently known, which supports the Data Deficient assessment. River regulation, dams, pollution and loss of flood pulses may affect spawning, while introduced populations create separate ecological problems.", "原生区种群趋势了解不足，因此被评为数据缺乏。河流调控、水坝、污染和洪峰消失可能影响产卵；引入种群则造成另一类生态问题。"), actions: b("Monitor native spawning runs and recruitment, maintain river-flow connectivity where appropriate, prevent further introductions, use region-specific invasive control and never interpret invasive abundance as proof that native populations are secure.", "应监测原生区产卵洄游和补充量，在适当地区维持河流连通，防止进一步引种，采用地区性入侵控制，并绝不能把入侵区数量多当作原生种群安全的证据。") },
    identification: { key: b("A very large-headed carp with eyes below the body midline, an upturned mouth and irregular dark blotches on the sides; the abdominal keel is limited to behind the pelvic fins.", "头部巨大的鲤形鱼，眼位低于体侧中线，口向上，体侧有不规则深斑；腹棱仅位于腹鳍之后。"), similar: b("Silver carp are usually more uniformly silver, have a longer abdominal keel and fused sponge-like gill rakers. Juveniles can be difficult, so gill-raker and keel characters should be checked by a fish expert.", "鲢通常体色更均一银白、腹棱更长，鳃耙融合成海绵状。幼鱼较难区分，应由鱼类专家检查鳃耙和腹棱特征。") },
    communication: section("No elaborate social signaling is documented. The lateral line detects water movement, while taste and smell help locate plankton-rich water; schooling and spawning movements respond to flow, temperature and nearby fish.", "没有记录复杂社会信号。侧线感受水流，味觉和嗅觉帮助寻找浮游生物丰富水体；集群和产卵移动会响应流速、水温及邻近鱼群。", ["ecology"]),
    seasonal: section("Spawning is synchronized with warming, rising river discharge. Outside the reproductive period, fish use productive river, lake and reservoir waters; local timing changes with latitude, hydrology and managed flow.", "产卵与升温和河流涨水同步。非繁殖期利用生产力较高的河流、湖泊和水库；具体时间随纬度、水文和人工调流变化。", ["ecology"]),
    humans: section("Bighead carp are central to Asian aquaculture and cuisine but regulated as invasive fish in several countries. Transport, stocking, harvest and disposal must follow local rules to prevent live release or spread between watersheds.", "鳙是亚洲养殖和饮食的重要鱼类，但在一些国家作为入侵鱼受到监管。运输、放养、捕捞和处理必须遵守当地规定，防止活体释放或跨流域扩散。", ["general", "invasive"]),
    evolution: section("Hypophthalmichthys nobilis is a cypriniform fish closely related to silver carp. Modern sources differ on whether the lineage is treated within Cyprinidae or the separated family Xenocyprididae; this record follows the project's modern Xenocyprididae treatment.", "鳙是鲤形目鱼类，与鲢近缘。现代来源对该谱系归入鲤科还是独立鲴科存在差异；本记录沿用项目采用的现代鲴科口径。", ["taxonomy"]),
    field: section("Large plankton-feeding fish near the surface are not identifiable by behavior alone. A clear side view should show the huge head, low eyes, mottling and short abdominal keel; invasive detections should be reported through local fishery channels.", "水面附近的大型滤食鱼不能仅凭行为鉴定。清晰侧视应显示巨头、低位眼、斑驳和短腹棱；入侵区发现应通过当地渔业渠道报告。", ["identification", "invasive"]),
    know: [
      section("Data Deficient refers to uncertainty about extinction risk in the native range, not a claim that the species is rare everywhere.", "数据缺乏指原生区灭绝风险不确定，并不表示该物种在所有地方都稀少。", ["conservation"]),
      section("Introduced bighead carp can be abundant even while the global assessment remains Data Deficient.", "即使全球评估仍为数据缺乏，引入区的鳙也可能数量很多。", ["conservation", "invasive"]),
      section("Its eggs normally drift in flowing water instead of sticking to vegetation or a nest.", "其卵通常在流水中漂流，而不是黏在植被或巢上。", ["ecology"]),
    ],
    classSpecific: { title: b("River-spawning fish", "江河产卵鱼类"), content: b("Adult migration, warm flood pulses and drifting eggs form one connected reproductive system; dams or altered flow can interrupt it even when adult feeding habitat remains available.", "成鱼迁移、温暖洪峰和漂流卵构成相互连接的繁殖系统；即使成鱼取食生境仍在，水坝或改变流量也可能中断这一系统。") },
    sources: {
      taxonomy: source("FishBase", "https://www.fishbase.org/summary/SpeciesSummary.php?GenusName=Hypophthalmichthys&SpeciesName=nobilis"),
      general: source("FAO Cultured Aquatic Species Information Programme", "https://www.fao.org/fishery/docs/CDrom/aquaculture/I1129m/file/en/en_bigheadcarp.htm"),
      ecology: source("FAO Cultured Aquatic Species Information Programme", "https://www.fao.org/fishery/docs/CDrom/aquaculture/I1129m/file/en/en_bigheadcarp.htm"),
      invasive: source("IUCN Global Invasive Species Database", "https://www.iucngisd.org/gisd/speciesname/Hypophthalmichthys%2Bnobilis"),
      conservation: source("FishBase IUCN status index", "https://www.fishbase.org/summary/SpeciesSummary.php?GenusName=Hypophthalmichthys&SpeciesName=nobilis"),
      range: source("FAO Cultured Aquatic Species Information Programme", "https://www.fao.org/fishery/docs/CDrom/aquaculture/I1129m/file/en/en_bigheadcarp.htm"),
      identification: source("FAO Cultured Aquatic Species Information Programme", "https://www.fao.org/fishery/docs/CDrom/aquaculture/I1129m/file/en/en_bigheadcarp.htm"),
    },
  },

  "black-footed-ferret": {
    status: { code: "EN", en: "Endangered", zh: "濒危", note_en: "The global IUCN assessment lists the black-footed ferret as Endangered. Reintroduced populations remain dependent on intensive management and healthy prairie dog colonies.", note_zh: "IUCN全球评估将黑足鼬列为濒危。重引入种群仍依赖密集管理和健康的草原犬鼠群落。" },
    description: b("The black-footed ferret is North America's only native ferret and a highly specialized nocturnal predator of prairie dogs. Once lost from the wild, it survives through captive breeding, reintroduction and intensive management of plague, prey colonies and genetic diversity.", "黑足鼬是北美唯一原生的鼬属“雪貂”，也是高度特化的夜行草原犬鼠捕食者。它曾在野外消失，如今依靠人工繁育、重引入，以及对鼠疫、猎物群落和遗传多样性的密集管理而存续。"),
    encyclopedia: {
      anatomy: section("Adults have a long flexible body about 46–61 cm including the tail and generally weigh about 0.7–1.1 kg. Pale yellow-buff fur contrasts with a black face mask, black feet and legs and a black tail tip; large eyes and ears support nocturnal hunting.", "成体身体修长灵活，包括尾在内体长约46–61厘米，通常重约0.7–1.1千克。浅黄褐色毛与黑色面罩、黑色足腿和黑色尾尖形成对比；大眼和大耳适合夜间狩猎。", ["general"]),
      ecology: section("Prairie dogs make up most of the diet and their burrows provide shelter, den sites and hunting routes. Ferrets are mostly solitary and nocturnal, moving above ground between burrow openings and pursuing prey underground.", "草原犬鼠构成大部分食物，其洞穴提供庇护、育幼地点和狩猎通道。黑足鼬主要独居、夜行，会在洞口间地面移动，也会进入地下追猎。", ["general", "ecology"]),
      habitat: section("Historically the species followed prairie dog colonies across the Great Plains and intermountain grasslands of Canada, the United States and Mexico. Today it occurs at scattered reintroduction sites that maintain enough connected prairie dog habitat.", "历史上，该物种随草原犬鼠群落分布于加拿大、美国和墨西哥的大平原及山间草地。如今只见于零散重引入地点，这些地区必须维持足够连通的草原犬鼠生境。", ["range", "conservation"]),
    },
    facts: [
      fact("length", "Total length", "全长", "About 46–61 cm including tail", "包括尾约46–61厘米", ["general"]),
      fact("weight", "Weight", "体重", "About 0.7–1.1 kg", "约0.7–1.1千克", ["general"]),
      fact("diet", "Diet", "食性", "Mostly prairie dogs", "主要为草原犬鼠", ["ecology"]),
      fact("gestation", "Gestation", "妊娠期", "About 42–45 days", "约42–45天", ["general"]),
      fact("litter", "Litter", "每胎幼崽", "Often 3–4 kits", "常为3–4只", ["general"]),
      fact("status", "IUCN status", "IUCN等级", "Endangered", "濒危", ["conservation"]),
    ],
    life: section("Mating occurs in late winter or spring. After about 42–45 days of gestation, a female often bears 3–4 kits in a prairie dog burrow; kits emerge above ground in summer and gradually learn to hunt before dispersing.", "交配发生在冬末或春季。妊娠约42–45天后，雌鼬常在草原犬鼠洞中产下3–4只幼崽；幼崽夏季出洞，并在扩散前逐渐学习狩猎。", ["general"]),
    adaptations: [
      adaptation("Burrow-shaped body", "适应洞道的身体", "A long narrow flexible body can pursue prairie dogs and turn inside underground tunnels.", "修长狭窄且灵活的身体能在地下洞道中追逐草原犬鼠并转身。", ["ecology"]),
      adaptation("Nocturnal senses", "夜行感官", "Large eyes, ears and strong smell support hunting and orientation in darkness.", "大眼、大耳和强嗅觉帮助它在黑暗中狩猎和定向。", ["general"]),
      adaptation("Borrowed shelter", "利用猎物洞穴", "Using prairie dog burrows saves digging energy and provides protection from weather and predators.", "利用草原犬鼠洞可节省挖掘能量，并躲避天气和捕食者。", ["ecology"]),
    ],
    role: section("Black-footed ferrets are specialized predators within prairie dog ecosystems. Their dependence makes them indicators of large, connected and functioning prairie dog landscapes that also support many grassland birds, reptiles and mammals.", "黑足鼬是草原犬鼠生态系统中的特化捕食者。其依赖性使它成为大型、连通且功能正常的草原犬鼠景观指标，而这些景观也支撑许多草原鸟、爬行动物和哺乳动物。", ["ecology"]),
    conservation: { trend: "increasing", threats: b("Sylvatic plague, prairie dog poisoning and shooting, drought, habitat conversion and very low genetic diversity constrain recovery. Most wild sites are not self-sustaining without repeated management.", "草原鼠疫、对草原犬鼠的投毒和射杀、干旱、生境转化及极低遗传多样性限制恢复。多数野外地点若没有反复管理，无法自我维持。"), actions: b("Maintain large prairie dog complexes, vaccinate or manage plague where feasible, continue captive breeding and carefully planned releases, reduce inbreeding and monitor survival and reproduction at every site.", "应维持大型草原犬鼠群落，在可行处开展鼠疫疫苗或管理，继续人工繁育和谨慎规划放归，减少近交，并在每个地点监测存活与繁殖。") },
    identification: { key: b("A slender pale mustelid with a sharp black eye mask, black feet and legs and a black tail tip, usually associated with prairie dog colonies.", "体形修长、毛色浅，眼部有鲜明黑面罩，足腿和尾尖为黑色，通常与草原犬鼠群落相关。"), similar: b("Domestic ferrets vary widely in color and are associated with people; long-tailed weasels lack the same combination of broad face mask and black feet. Location and clear full-body views are essential.", "家养雪貂体色变化很大且与人类相伴；长尾鼬没有同样组合的宽黑面罩和黑足。地点和清晰全身视图至关重要。") },
    communication: section("Ferrets use scent marking, body posture and several calls in close interactions. Mothers and kits communicate around dens, while adults usually avoid one another outside breeding.", "黑足鼬在近距离互动中使用气味标记、身体姿势和多种叫声。母鼬与幼崽在巢穴附近交流，成体在非繁殖期通常彼此回避。", ["general"]),
    seasonal: section("Breeding occurs in late winter and spring, kits emerge in summer and young disperse by autumn. Plague, drought and prairie dog activity can cause strong year-to-year changes in survival and available habitat.", "繁殖发生在冬末和春季，幼崽夏季出洞，年轻个体到秋季扩散。鼠疫、干旱和草原犬鼠活动会造成存活率和可用生境的强烈年际变化。", ["ecology", "conservation"]),
    humans: section("The species' recovery depends on cooperation among wildlife agencies, tribes, landowners, zoos and local communities. Prairie dog management can be contentious, so recovery planning must address both ecological needs and working-land concerns.", "该物种恢复依赖野生动物机构、部落、土地所有者、动物园和地方社区合作。草原犬鼠管理可能有争议，因此恢复规划必须同时处理生态需求和生产用地关切。", ["conservation"]),
    evolution: section("Mustela nigripes is a true mustelid and the only ferret species native to the Americas. Its ecological specialization evolved around prairie dog prey and burrow systems in North American grasslands.", "黑足鼬是真正的鼬科动物，也是美洲唯一原生鼬属雪貂。其生态特化围绕北美草原的草原犬鼠猎物和洞穴系统演化。", ["taxonomy", "general"]),
    field: section("Ferrets may appear briefly at prairie dog burrow entrances at night. Tracks and scat overlap with other small carnivores, and spotlighting can disturb animals; surveys should follow recovery-program protocols.", "黑足鼬可能在夜间短暂出现在草原犬鼠洞口。足迹和粪便与其他小型食肉动物重叠，聚光灯调查也会干扰动物；调查应遵循恢复项目规程。", ["conservation"]),
    know: [
      section("The species was rediscovered near Meeteetse, Wyoming, in 1981 after it had been presumed extinct.", "该物种一度被认为灭绝，直到1981年在怀俄明州米蒂齐附近重新发现。", ["general"]),
      section("Prairie dog colonies provide both most of the ferret's food and nearly all of its shelter.", "草原犬鼠群落既提供黑足鼬的大部分食物，也提供几乎全部庇护。", ["ecology"]),
      section("Reintroduction alone is not enough when plague or prairie dog loss removes the ecological foundation of a site.", "当鼠疫或草原犬鼠丧失破坏地点的生态基础时，仅仅重引入并不足够。", ["conservation"]),
    ],
    classSpecific: { title: b("Mammal recovery breeding", "哺乳动物恢复繁育"), content: b("Captive pairing, genetic management, disease control and post-release monitoring must function as one system; producing kits is useful only when released animals also have healthy prairie dog landscapes.", "人工配对、遗传管理、疾病控制和放归后监测必须作为一个系统运作；只有放归个体同时拥有健康草原犬鼠景观时，繁育幼崽才真正有用。") },
    sources: {
      taxonomy: source("GBIF Backbone Taxonomy", "https://api.gbif.org/v1/species/match?name=Mustela%20nigripes"),
      general: source("U.S. Fish and Wildlife Service", "https://www.fws.gov/species/black-footed-ferret-mustela-nigripes"),
      ecology: source("U.S. Fish and Wildlife Service", "https://www.fws.gov/species/black-footed-ferret-mustela-nigripes"),
      conservation: source("IUCN Red List Amazing Species", "https://nc.iucnredlist.org/redlist/amazing-species/mustela-nigripes/pdfs/original/mustela-nigripes.pdf"),
      range: source("U.S. Fish and Wildlife Service", "https://www.fws.gov/species/black-footed-ferret-mustela-nigripes"),
    },
  },
};

function compileAnimal(id, profile) {
  const existing = JSON.parse(fs.readFileSync(path.join(ROOT, "data/animals", `${id}.json`), "utf8"));
  const hasPolygons = existing.habitat.global_distribution_polygons.length > 0;
  return {
    ...existing,
    content_version: 2,
    content_review: {
      factual_qc: "source-checked",
      bilingual_qc: "line-by-line-reviewed",
      reviewed_at: CHECKED,
      reviewer: "Codex source and bilingual audit",
      notes: "Species identity, taxonomy, protection status, numerical claims, English/Chinese scope and preserved legacy map geometry were checked for legacy QC batch 02.",
    },
    taxonomy: profile.taxonomy || existing.taxonomy,
    conservation_status: profile.status,
    description: profile.description,
    encyclopedia: {
      anatomy: profile.encyclopedia.anatomy,
      ecology_and_behavior: profile.encyclopedia.ecology,
      habitat_and_distribution: profile.encyclopedia.habitat,
    },
    rich_content: {
      quick_facts: profile.facts,
      life_cycle_and_reproduction: profile.life,
      adaptations: profile.adaptations,
      ecological_role: profile.role,
      conservation_and_threats: {
        population_trend: profile.conservation.trend,
        threats: profile.conservation.threats,
        actions: profile.conservation.actions,
        source_keys: ["conservation"],
      },
      identification: {
        key_features: profile.identification.key,
        similar_species: profile.identification.similar,
        source_keys: profile.identification.source_keys || ["identification", "general"].filter((key) => profile.sources[key]),
      },
      communication_and_senses: profile.communication,
      seasonal_calendar: profile.seasonal,
      relationship_with_humans: profile.humans,
      evolution: profile.evolution,
      field_signs: profile.field,
      did_you_know: profile.know.map(({ en, zh, source_keys }) => ({ text: b(en, zh), source_keys })),
      class_specific: [{ title: profile.classSpecific.title, content: profile.classSpecific.content, source_keys: profile.classSpecific.source_keys || ["general"] }],
    },
    habitat: {
      ...existing.habitat,
      range_review: {
        display_mode: hasPolygons ? "legacy-polygon-retained" : "representative-point",
        previous_result: "retained",
        source_keys: ["range"],
        comparison_en: hasPolygons
          ? "The previous center, zoom and polygon coordinates are retained exactly. Authoritative text sources support the broad distribution, but reusable authoritative boundary geometry was not available; the polygons are labelled as retained approximate legacy ranges, not verified boundaries."
          : "The previous representative center and zoom are retained exactly. Authoritative range sources were checked, but no reusable authoritative polygon geometry was available; the point is explicitly labelled as not showing the full range.",
        comparison_zh: hasPolygons
          ? "原有中心点、缩放和多边形坐标完全保留。权威文字来源支持其大致分布，但未获得可复用的权威边界几何，因此多边形标为保留的原有近似范围，而非已核实边界。"
          : "原有代表性中心点和缩放完全保留。已检查权威分布来源，但未获得可复用的权威多边形几何；页面明确标注该点并不表示完整分布范围。",
        checked_at: CHECKED,
      },
    },
    sources: profile.sources,
  };
}

const missing = IDS.filter((id) => !profiles[id]);
if (missing.length > 0) {
  console.error(`Profiles still missing: ${missing.join(", ")}`);
  process.exit(1);
}

const draft = IDS.map((id) => compileAnimal(id, profiles[id]));
fs.writeFileSync(path.join(ROOT, "_draft_animals.json"), `${JSON.stringify(draft, null, 2)}\n`);
console.log(`Built ${draft.length} reviewed replacements in _draft_animals.json`);
