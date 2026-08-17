#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const CHECKED = "2026-08-16";
const IDS = [
  "aardvark", "addax", "adelie-penguin", "american-crow", "american-alligator",
  "axolotl", "atlantic-herring", "army-ant", "emperor-scorpion", "giant-pacific-octopus",
];

const b = (en, zh) => ({ en, zh });
const section = (en, zh, source_keys = ["general"]) => ({ en, zh, source_keys });
const fact = (key, labelEn, labelZh, valueEn, valueZh, source_keys = ["general"]) => ({
  key,
  label: b(labelEn, labelZh),
  value: b(valueEn, valueZh),
  source_keys,
});
const adaptation = (titleEn, titleZh, detailEn, detailZh, source_keys = ["general"]) => ({
  title: b(titleEn, titleZh),
  detail: b(detailEn, detailZh),
  source_keys,
});
const source = (authority, url) => ({ authority, url, checked_at: CHECKED });

const profiles = {
  aardvark: {
    status: { code: "LC", en: "Least Concern", zh: "无危", note_en: "The 2015 global assessment lists the species as Least Concern; precise global population size and trend are not known.", note_zh: "2015年全球评估将其列为无危；全球种群数量和趋势尚无精确数据。" },
    description: b(
      "The aardvark is Africa's only living member of the order Tubulidentata. This solitary nocturnal mammal uses powerful claws and a long sticky tongue to feed mainly on ants and termites, and its abandoned burrows provide shelter for many other animals.",
      "土豚是非洲现存唯一的管齿目动物。这种独居夜行性哺乳动物用强壮的爪和长而黏的舌头主要捕食蚂蚁与白蚁；它遗弃的洞穴还会为许多其他动物提供庇护。"
    ),
    encyclopedia: {
      anatomy: section("Adults are about 100–158 cm long and weigh roughly 40–82 kg. They have a long snout, large ears, thick skin, 4 clawed toes on each forefoot and 5 on each hind foot; their enamel-free cheek teeth are built from columns of dentine.", "成体体长约100–158厘米，体重约40–82千克。它们有长吻、大耳和厚皮；前足各有4个带爪趾，后足各有5个。其无珐琅质的颊齿由一束束牙本质小管构成。"),
      ecology: section("Aardvarks forage alone at night, often travelling 2–5 km. They locate ants and termites mainly by smell and hearing, break into nests with their claws, then sweep insects into the mouth with a sticky tongue.", "土豚夜间独自觅食，常移动2–5公里。它们主要依靠嗅觉和听觉寻找蚂蚁与白蚁，用爪破开巢穴，再用黏性舌头把昆虫卷入口中。", ["general", "ecology"]),
      habitat: section("The species is widespread in suitable habitats across sub-Saharan Africa, but is scarce in hard rocky ground, frequently flooded areas and parts of the West and Central African rainforest. Diggable soil and year-round insect prey are essential.", "该物种广布于撒哈拉以南非洲的适宜生境，但在坚硬岩地、经常洪水的地区以及西非和中非部分雨林中较少。可挖掘的土壤和全年可得的昆虫猎物是关键条件。", ["general", "range"]),
    },
    facts: [
      fact("body_length", "Body length", "体长", "100–158 cm", "100–158厘米"),
      fact("weight", "Weight", "体重", "40–82 kg", "40–82千克"),
      fact("diet", "Diet", "食性", "Mostly ants and termites", "主要为蚂蚁和白蚁", ["ecology"]),
      fact("activity", "Activity", "活动时间", "Nocturnal", "夜行", ["ecology"]),
      fact("gestation", "Gestation", "妊娠期", "About 7 months", "约7个月"),
      fact("young", "Young", "每胎幼崽", "Usually 1", "通常1只"),
    ],
    life: section("A female usually gives birth to 1 young after about 7 months of gestation. The young begins following its mother at about 2 weeks, starts eating insects around 3 months, becomes independent near 6 months and reaches sexual maturity at about 2 years." , "雌性通常在约7个月妊娠后产下1只幼崽。幼崽约2周大时开始跟随母亲，约3个月开始吃昆虫，约6个月独立，并在约2岁时达到性成熟。"),
    adaptations: [
      adaptation("Powerful digging limbs", "强力挖掘四肢", "Spade-like claws open hard insect nests and can rapidly excavate an escape burrow.", "铲状爪既能破开坚硬的昆虫巢，也能迅速挖出逃生洞穴。"),
      adaptation("Sticky insect-catching tongue", "黏性捕虫舌", "A long tongue coated with sticky saliva collects ants and termites from narrow galleries.", "长舌表面覆有黏性唾液，可从狭窄通道中卷走蚂蚁和白蚁。"),
      adaptation("Tubular teeth", "管状牙齿", "Its continuously growing cheek teeth lack enamel and are made of many dentine tubes, the feature behind the name Tubulidentata.", "其不断生长的颊齿没有珐琅质，由许多牙本质小管构成，这正是“管齿目”名称的由来。", ["general", "taxonomy"]),
    ],
    role: section("Aardvarks are ecosystem engineers. Their digging aerates soil, and abandoned burrows create cool refuges used by mammals, birds, reptiles and other animals.", "土豚是生态系统工程师。挖掘会疏松土壤；遗弃洞穴则形成凉爽庇护所，被多种哺乳动物、鸟类、爬行动物及其他动物利用。", ["general", "conservation"]),
    conservation: { trend: "unknown", threats: b("The species remains widespread, but local populations can be reduced by hunting, agricultural expansion, habitat conversion and pesticides that remove insect prey.", "该物种仍分布广泛，但狩猎、农业扩张、生境转化，以及减少昆虫猎物的农药，都可能使地方种群下降。"), actions: b("Maintain connected natural habitat, protect burrow-rich areas, limit indiscriminate pesticide use and monitor populations outside southern Africa, where data are especially sparse.", "应维持连通的自然生境，保护洞穴丰富区域，限制不加选择的农药使用，并加强对南部非洲以外数据稀缺种群的监测。") },
    identification: { key: b("Look for a pig-sized body, very long tapering snout, large upright ears, arched back, thick tail and powerful digging claws.", "辨认要点是猪般大小的身体、很长且渐尖的吻部、直立大耳、弓背、粗尾和强壮挖掘爪。"), similar: b("It is not a pig or an anteater. African pangolins have overlapping scales, while aardvarks have thick, sparsely haired skin and much larger ears.", "它既不是猪，也不是食蚁兽。非洲穿山甲全身覆有叠瓦状鳞片，而土豚是厚而稀毛的皮肤，耳朵也大得多。") },
    communication: section("Smell and hearing are more important than vision when foraging. Scent glands may help individuals space themselves, while large ears detect predators and activity around insect nests.", "觅食时，嗅觉和听觉比视觉更重要。气味腺可能帮助个体保持间距，大耳则用于察觉捕食者和昆虫巢周围的动静。"),
    seasonal: section("Aardvarks forage year-round where ants and termites remain available. Birth timing differs by region: records cited by ADW place births in months 10–11 in northern areas and months 5–7 in South Africa.", "只要蚂蚁和白蚁全年可得，土豚就会持续觅食。产仔时间因地区而异：ADW所引资料记录北部地区多在10–11月，南非多在5–7月。"),
    humans: section("People hunt aardvarks for meat or body parts in some regions, while farmers may view burrows as hazards. At the same time, aardvarks can suppress pest insects and their burrows support biodiversity.", "部分地区会为肉或身体部位捕猎土豚，农民也可能把洞穴视作安全隐患；另一方面，土豚能减少害虫，其洞穴还能支持生物多样性。"),
    evolution: section("Orycteropus afer is the sole living species in Tubulidentata and belongs to Afrotheria, the African mammal radiation that also includes elephants, hyraxes and sirenians; its resemblance to pigs and anteaters is superficial.", "土豚是管齿目唯一现生种，属于非洲兽总目；这一非洲哺乳动物谱系还包括象、蹄兔和海牛。它与猪、食蚁兽的相似只是表面上的。", ["taxonomy", "general"]),
    field: section("Tracks show 4 front toes and 5 hind toes with heavy claws. Large burrow entrances, fresh spoil heaps and claw marks at termite mounds often reveal an aardvark that is rarely seen directly.", "足迹可见前足4趾、后足5趾和粗大爪痕。大型洞口、新鲜弃土堆，以及白蚁丘上的爪痕，常能暴露这种很少被直接看见的动物。"),
    know: [
      section("The name 'aardvark' comes from Afrikaans and means 'earth pig,' although the species is not closely related to pigs.", "“aardvark”来自南非语，意为“土猪”，但土豚与猪并无近缘关系。", ["general", "taxonomy"]),
      section("Aardvark cheek teeth have no enamel; many tiny dentine tubes give the order Tubulidentata its name.", "土豚颊齿没有珐琅质，许多细小牙本质管构成了“管齿目”这一名称。", ["general", "taxonomy"]),
      section("Other animals often move into abandoned aardvark burrows to escape heat, cold or predators.", "其他动物常搬进土豚遗弃的洞穴，以躲避炎热、寒冷或捕食者。", ["conservation"]),
    ],
    classSpecific: { title: b("Mammal feature", "哺乳动物特征"), content: b("The mother gives birth to live young and nurses it in a burrow until it can forage independently.", "母兽产下活体幼崽，并在洞穴中哺乳，直到幼崽能够独立觅食。") },
    sources: {
      taxonomy: source("GBIF Backbone Taxonomy", "https://api.gbif.org/v1/species/match?name=Orycteropus%20afer"),
      general: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Orycteropus_afer/"),
      ecology: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Orycteropus_afer/"),
      conservation: source("Endangered Wildlife Trust conservation assessment", "https://ewt.org/wp-content/uploads/2022/11/Aardvark-Orycteropus-afer_LC.pdf"),
      range: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Orycteropus_afer/"),
    },
  },

  addax: {
    status: { code: "CR", en: "Critically Endangered", zh: "极危", note_en: "The 2016 IUCN assessment lists the addax as Critically Endangered with a decreasing wild population.", note_zh: "IUCN 2016年评估将旋角羚列为极危，野生种群仍在下降。" },
    taxonomy: {
      kingdom: b("Animalia", "动物界"), phylum: b("Chordata", "脊索动物门"), class: b("Mammalia", "哺乳纲"),
      order: b("Artiodactyla", "偶蹄目"), family: b("Bovidae", "牛科"), genus: b("Addax", "旋角羚属"),
    },
    description: b("The addax is a pale, spiral-horned antelope adapted to the Sahara. It can obtain most of its water from plants, but hunting, disturbance and habitat pressures have reduced the wild population to a tiny fraction of its former range.", "旋角羚是一种适应撒哈拉环境、体色浅淡并具有螺旋角的羚羊。它能从植物中获得大部分水分，但狩猎、干扰和生境压力已使野生种群缩减到昔日分布范围的一小部分。"),
    encyclopedia: {
      anatomy: section("Adults have a head-and-body length of about 150–170 cm and weigh 60–125 kg. Both sexes carry long ringed horns averaging about 72 cm with roughly 1.5–3 twists; broad splayed hooves help on soft sand.", "成体头体长约150–170厘米，体重60–125千克。雌雄都有带环纹的长角，平均约72厘米并有约1.5–3圈螺旋；宽而张开的蹄有助于在松软沙地行走。"),
      ecology: section("Addax eat desert grasses, herbs and shrubs and may travel widely to find sparse vegetation. They usually form small herds and reduce heat stress by resting during the hottest periods.", "旋角羚取食沙漠草本、禾草和灌木，可能长距离移动寻找稀疏植被。它们通常组成小群，并在最炎热时段休息以减轻热应激。", ["general", "ecology"]),
      habitat: section("Historically the addax ranged across deserts and semi-deserts from the western Sahara to Egypt and Sudan. Surviving wild animals are now restricted to very small, shifting areas of the central Sahara, with conservation reintroductions also underway in Chad.", "旋角羚历史上曾遍布从西撒哈拉到埃及和苏丹的沙漠与半沙漠。如今残存野生个体只局限于中部撒哈拉极小且变化的区域，乍得也在开展保护性重引入。", ["conservation", "range"]),
    },
    facts: [
      fact("body_length", "Body length", "体长", "150–170 cm", "150–170厘米"),
      fact("weight", "Weight", "体重", "60–125 kg", "60–125千克"),
      fact("horn_length", "Horn length", "角长", "About 72 cm on average", "平均约72厘米"),
      fact("diet", "Diet", "食性", "Desert grasses, herbs and shrubs", "沙漠禾草、草本和灌木", ["ecology"]),
      fact("gestation", "Gestation", "妊娠期", "257–264 days", "257–264天"),
      fact("young", "Young", "每胎幼崽", "Usually 1", "通常1只"),
    ],
    life: section("Breeding can occur year-round, with many births in winter or early spring. Gestation lasts about 257–264 days and a female almost always bears 1 calf; weaning occurs at roughly 23–39 weeks, and sexual maturity is reached around 2–3 years." , "旋角羚全年都可能繁殖，但许多幼崽在冬季或早春出生。妊娠期约257–264天，雌性几乎总是产下1只幼崽；约23–39周断奶，并在约2–3岁时达到性成熟。"),
    adaptations: [
      adaptation("Splayed hooves", "宽张蹄", "Broad hooves spread body weight over loose sand and reduce sinking.", "宽蹄能把体重分散在松沙上，减少下陷。"),
      adaptation("Water from food", "从食物获取水分", "Addax can survive long periods without drinking free water by obtaining moisture from vegetation.", "旋角羚可从植被中取得水分，因此能长期不直接饮水。"),
      adaptation("Seasonal pale coat", "季节性浅色被毛", "The coat is sandy to nearly white in summer and darker in winter, helping reflect intense summer heat.", "夏季被毛从沙色到近白色，冬季变深，有助于反射夏季强烈热量。"),
    ],
    role: section("As a large desert herbivore, the addax transfers nutrients, disperses some seeds and shapes sparse plant communities while serving as prey for large Saharan predators where they coexist.", "作为大型沙漠植食动物，旋角羚会转移养分、传播部分种子并影响稀疏植物群落；在仍与大型撒哈拉捕食者共存之处，它也是猎物。", ["general", "ecology"]),
    conservation: { trend: "decreasing", threats: b("Uncontrolled hunting, armed conflict, oil-related disturbance, vehicle access, drought and habitat degradation have fragmented the remaining wild population.", "失控狩猎、武装冲突、石油开发干扰、车辆进入、干旱和生境退化，使残余野生种群更加破碎。"), actions: b("Protect the last wild groups and their movement areas, stop poaching, coordinate with local communities and industry, monitor by ground and aerial surveys, and use carefully planned reinforcement or reintroduction from managed populations.", "应保护最后的野生群体及其移动区域，制止偷猎，与当地社区和产业方协作，开展地面与航空监测，并以受控种群进行谨慎规划的补充或重引入。") },
    identification: { key: b("A pale antelope with a dark forehead tuft, white facial markings, long corkscrew horns in both sexes and unusually broad hooves.", "浅色羚羊，额部有深色毛簇和白色面纹；雌雄都有长螺旋角，蹄异常宽大。"), similar: b("Scimitar-horned oryx have long horns swept backward in a single curve, not the addax's multiple spiral twists; dama gazelles are slimmer and lack corkscrew horns.", "弯角剑羚的长角以单一弧线向后弯，不像旋角羚有多圈螺旋；达马瞪羚体形更纤细，也没有螺旋角。") },
    communication: section("Addax use visual posture, scent and touch in herd and reproductive interactions. Their pale coloration is camouflage rather than a signal, and much communication is subtle in open desert.", "旋角羚在群体和繁殖互动中使用姿势、气味与触碰。浅色体毛主要用于伪装而非传讯，开阔沙漠中的交流往往较为细微。"),
    seasonal: section("They track short-lived vegetation after rain and adjust daily activity to avoid peak heat. Breeding is possible throughout the year, though birth peaks are reported in winter and early spring.", "它们会追随降雨后短暂出现的植被，并调整日活动以避开最热时段。全年均可繁殖，但据记录产仔高峰多在冬季和早春。"),
    humans: section("The addax has long been hunted for meat and hides. Modern firearms and vehicles made hunting far more efficient, while current conservation depends on cooperation among governments, communities, protected areas and managed breeding programs.", "旋角羚长期因肉和皮被猎捕。现代枪械与车辆大幅提高了捕猎效率；当前保护依赖政府、社区、保护地和受控繁育项目之间的协作。", ["general", "conservation"]),
    evolution: section("Addax nasomaculatus is the only living species in the genus Addax and belongs to Bovidae, alongside cattle, goats, sheep and other antelopes. Its desert specializations evolved within the even-toed ungulate lineage.", "旋角羚是旋角羚属唯一现生种，属于牛科，与牛、羊及其他羚羊同科；其沙漠适应特征是在偶蹄类谱系中演化形成的。", ["taxonomy"]),
    field: section("In suitable habitat, look for broad rounded hoofprints, small groups moving between sparse grazing patches and pale animals that blend into sand. Any encounter with a wild group is conservation-sensitive and should not be approached or chased.", "在适宜生境中，可留意宽而圆的蹄印、在稀疏草地间移动的小群，以及与沙色融为一体的浅色个体。任何野生群体都极具保护敏感性，不应靠近或追逐。", ["general", "conservation"]),
    know: [
      section("Both female and male addax grow spiral horns.", "雌性和雄性旋角羚都会长出螺旋角。"),
      section("Addax can meet most of their water needs from the plants they eat.", "旋角羚可以从所吃植物中满足大部分水分需求。"),
      section("A 2016 survey of key habitat in Niger confirmed only 3 addax in one small group, illustrating the species' extreme wild scarcity at that time.", "2016年对尼日尔关键生境的调查只确认了一个由3只旋角羚组成的小群，显示当时野生个体极其稀少。", ["conservation"]),
    ],
    classSpecific: { title: b("Desert mammal physiology", "沙漠哺乳动物生理"), content: b("Water-saving physiology, moisture-rich forage, pale insulation and heat-avoiding behavior work together; no single adaptation alone explains desert survival.", "节水生理、含水食物、浅色隔热被毛和避热行为共同发挥作用；并非依靠某一种适应就能在沙漠生存。") },
    sources: {
      taxonomy: source("GBIF Backbone Taxonomy", "https://api.gbif.org/v1/species/match?name=Addax%20nasomaculatus"),
      general: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Addax_nasomaculatus/"),
      ecology: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Addax_nasomaculatus/"),
      conservation: source("IUCN and Sahara Conservation Fund survey release", "https://iucn.org/content/saharan-addax-antelope-faces-imminent-extinction-0"),
      range: source("IUCN Red List assessment for Addax nasomaculatus", "https://www.iucnredlist.org/species/512/50180603"),
    },
  },

  "adelie-penguin": {
    status: { code: "LC", en: "Least Concern", zh: "无危", note_en: "Current BirdLife and Australian Antarctic sources list the species as Least Concern, although regional colonies respond differently to sea ice, food and breeding habitat.", note_zh: "目前BirdLife与澳大利亚南极资料将该物种列为无危，但各地区繁殖群会因海冰、食物和繁殖地差异而呈现不同变化。" },
    description: b("The Adélie penguin is a medium-sized Antarctic penguin recognized by its black head and white eye-ring. It breeds on ice-free rocky coasts, feeds mainly on krill and fish, and spends the non-breeding season at sea among pack ice.", "阿德利企鹅是一种中等体型的南极企鹅，以黑色头部和白色眼圈著称。它在无冰岩石海岸繁殖，主要吃磷虾和鱼，并在非繁殖季生活于浮冰海域。"),
    encyclopedia: {
      anatomy: section("Adults stand about 70 cm tall and weigh roughly 3–6 kg. They have a black head and back, white belly, conspicuous white eye-ring, short partly feathered bill and flesh-pink feet; males and females look similar.", "成体高约70厘米，体重约3–6千克。头和背部为黑色，腹部白色，有醒目的白色眼圈、部分被羽毛遮住的短喙和肉粉色脚；雌雄外观相似。", ["general", "identification"]),
      ecology: section("Adélies are colonial breeders and strong swimmers. They eat krill, fish and other small marine animals, usually feeding in the upper 70 m but capable of dives to about 175 m; leopard seals take adults, while skuas take eggs and chicks.", "阿德利企鹅集群繁殖且善于游泳。它们取食磷虾、鱼类及其他小型海洋动物，通常在水深70米以内觅食，但可潜至约175米；豹海豹捕食成鸟，贼鸥则会取食蛋和雏鸟。", ["general", "ecology"]),
      habitat: section("They breed around the Antarctic coast and nearby islands wherever exposed rock is accessible from the sea. In winter they remain at sea in pack-ice habitat and may travel more than 1,000 km from breeding colonies.", "它们环绕南极海岸及附近岛屿繁殖，条件是有从海上可到达的裸露岩地。冬季留在浮冰海域，可能离繁殖群超过1,000公里。", ["general", "range"]),
    },
    facts: [
      fact("height", "Height", "身高", "About 70 cm", "约70厘米", ["general"]),
      fact("weight", "Weight", "体重", "3–6 kg", "3–6千克", ["general"]),
      fact("diet", "Diet", "食性", "Krill, fish and other small marine animals", "磷虾、鱼及其他小型海洋动物", ["ecology"]),
      fact("usual_dive", "Usual feeding depth", "通常觅食深度", "Mostly upper 70 m", "多在水深70米以内", ["ecology"]),
      fact("clutch", "Clutch", "每窝蛋数", "Usually 2 eggs", "通常2枚", ["general"]),
      fact("lifespan", "Life expectancy", "预期寿命", "About 10–20 years", "约10–20年", ["general"]),
    ],
    life: section("Adults return to rocky colonies in spring and build pebble nests. A pair usually lays 2 eggs in mid-month 11 and shares incubation and chick care; chicks hatch in month 12, join groups after about 3 weeks and fledge to sea at roughly 7–9 weeks.", "成鸟春季返回岩石繁殖地并用小石块筑巢。一对亲鸟通常在11月中旬产下2枚蛋，共同孵化和育雏；雏鸟12月孵化，约3周大时加入幼鸟群，约7–9周大时换羽下海。", ["general"]),
    adaptations: [
      adaptation("Streamlined diver", "流线型潜水者", "Flipper-like wings and a compact body provide underwater propulsion while dense plumage limits heat loss.", "鳍状翅和紧凑身体提供水下推进力，浓密羽毛则减少热量流失。", ["general"]),
      adaptation("Countershading", "反荫蔽体色", "A dark back blends with deep water from above and a white belly blends with the bright surface from below.", "从上方看，黑背与深水相融；从下方看，白腹与明亮水面相融。", ["identification"]),
      adaptation("Pebble nest", "石子巢", "A raised, sloping pebble nest helps eggs stay above meltwater on ice-free coastal ground.", "在无冰海岸地面上，抬高且有坡度的石子巢有助于让蛋避开融水。", ["general"]),
    ],
    role: section("Adélie penguins transfer marine nutrients onto land at large colonies and are important consumers of krill and fish. Their population and breeding success also help scientists track changes in the Southern Ocean ecosystem.", "阿德利企鹅在大型繁殖群把海洋养分带到陆地，也是磷虾和鱼类的重要消费者。它们的种群与繁殖成功率还能帮助科学家追踪南大洋生态系统变化。", ["general", "ecology"]),
    conservation: { trend: "increasing", threats: b("The global assessment remains Least Concern, but climate-driven changes in sea ice, prey availability, extreme weather and localized fishery competition can help some colonies while harming others.", "全球评估仍为无危，但气候驱动的海冰变化、猎物供应、极端天气和局部渔业竞争，可能使一些繁殖群受益、另一些受损。"), actions: b("Protect breeding sites and marine foraging areas, manage krill fisheries cautiously, reduce disturbance, and continue long-term colony counts, automated cameras and tracking across contrasting Antarctic regions.", "应保护繁殖地和海上觅食区，谨慎管理磷虾渔业，减少干扰，并在不同南极区域持续开展长期群体计数、自动相机和追踪研究。") },
    identification: { key: b("A medium penguin with a fully black head, white eye-ring, white belly and a short bill whose base is partly hidden by feathers.", "中等体型企鹅，头部全黑，有白色眼圈和白腹；短喙基部部分被羽毛遮住。"), similar: b("Chinstrap penguins have a thin black line under the chin and no full white eye-ring; gentoo penguins have a broad white patch over the eyes and an orange-red bill.", "帽带企鹅下颏有细黑带且没有完整白眼圈；巴布亚企鹅眼上有宽白斑，喙呈橙红色。", ["identification"]) },
    communication: section("Adults use loud individualized calls to recognize mates and chicks in crowded colonies. At sea, contact calls are described as guttural barks; courtship includes rhythmic vocal displays.", "成鸟用响亮且具有个体差异的叫声，在拥挤繁殖群中识别伴侣和雏鸟。海上联系叫声常被描述为低沉吠声，求偶时还会发出有节奏的鸣叫。", ["identification"]),
    seasonal: section("Breeding takes place mainly from months 10 to 2. Adults and fledglings later disperse at sea; tracked adults forage among pack ice through winter and return eastward to colonies the next spring.", "繁殖主要发生在10月至次年2月。之后成鸟和幼鸟分散到海上；追踪研究显示成鸟冬季在浮冰间觅食，并于次年春季向东返回繁殖地。", ["general", "ecology"]),
    humans: section("Long-running Antarctic programs count nests, photograph colonies and track movements to understand ecosystem change. Visitors should keep regulated distances and never enter colonies or remove nest stones.", "长期南极研究会统计巢数、拍摄繁殖群并追踪移动，以了解生态系统变化。访客应遵守距离规定，绝不能进入繁殖群或拿走筑巢石。", ["general"]),
    evolution: section("Adélie, gentoo and chinstrap penguins form the genus Pygoscelis. Their wing-propelled diving body plan is inherited from penguin ancestors, while species-level plumage and breeding ecology distinguish the three close relatives.", "阿德利企鹅、巴布亚企鹅和帽带企鹅同属阿德利企鹅属。它们继承了企鹅祖先用翼潜水的体型，而物种间的羽色和繁殖生态则各有区别。", ["taxonomy", "general"]),
    field: section("On land, white eye-rings and pebble nests are diagnostic. At sea, use the complete black hood and lack of a chinstrap or broad head patch; observe from a distance because colony disturbance can expose eggs and chicks.", "陆地上，白眼圈和石子巢很有辨识度。海上可依据完整黑色头罩，并确认没有下颏黑带或宽头部白斑；应远距离观察，因为干扰繁殖群会使蛋和雏鸟暴露。", ["identification", "general"]),
    know: [
      section("Adélies may slide on their bellies across snow, a movement often called tobogganing.", "阿德利企鹅会趴在雪上用腹部滑行，这种动作常被称为“雪橇式滑行”。", ["general"]),
      section("Both parents share incubation and chick feeding duties.", "雌雄亲鸟共同承担孵化和喂养雏鸟的工作。", ["general"]),
      section("Some tracked Adélies have travelled more than 1,200 km from their breeding site.", "部分接受追踪的阿德利企鹅曾游到距繁殖地1,200多公里之外。", ["general"]),
    ],
    classSpecific: { title: b("Bird breeding", "鸟类繁殖"), content: b("Adélies lay hard-shelled eggs, incubate them with a warm brood patch and feed chicks by regurgitating captured marine food.", "阿德利企鹅产有硬壳的蛋，用温暖的孵卵斑孵化，并把捕到的海洋食物反刍给雏鸟。") },
    sources: {
      taxonomy: source("Australian Antarctic Data Centre Biodiversity Database", "https://data.aad.gov.au/aadc/biodiversity/taxon_data.cfm?taxon_id=1086"),
      general: source("Australian Antarctic Program", "https://www.antarctica.gov.au/about-antarctica/animals/penguins/adelie-penguin/"),
      ecology: source("Australian Antarctic Program satellite tracking", "https://www.antarctica.gov.au/about-antarctica/animals/penguins/adelie-penguin/satellite-tracking/"),
      identification: source("BirdLife Australia", "https://birdlife.org.au/bird-profiles/adelie-penguin/"),
      conservation: source("BirdLife International DataZone", "https://datazone.birdlife.org/species/factsheet/adelie-penguin-pygoscelis-adeliae"),
      range: source("Australian Antarctic Data Centre Biodiversity Database", "https://data.aad.gov.au/aadc/biodiversity/taxon_data.cfm?taxon_id=1086"),
    },
  },

  "american-crow": {
    status: { code: "LC", en: "Least Concern", zh: "无危", note_en: "BirdLife lists the American crow as Least Concern; North American monitoring nevertheless shows regional and multi-year changes, so low extinction risk does not mean every population is increasing.", note_zh: "BirdLife将美洲乌鸦列为无危；但北美监测仍显示地区和多年变化，因此低灭绝风险并不表示每个种群都在增长。" },
    description: b("The American crow is a large, all-black, highly adaptable songbird of North America. Family groups cooperate to raise young, and the species succeeds in farms, suburbs and cities as well as open woodland by learning quickly and eating a very broad diet.", "美洲乌鸦是北美一种大型、全身黑色且适应力很强的鸣禽。家庭成员会合作育雏；凭借快速学习能力和广泛食性，它既生活于开阔林地，也能在农田、郊区和城市中繁盛。"),
    encyclopedia: {
      anatomy: section("Adults are about 40–53 cm long, weigh 316–620 g and span 85–100 cm across the wings. They are entirely black, including bill and legs, with a thick neck, heavy straight bill, broad rounded wings and a short square to rounded tail.", "成鸟体长约40–53厘米，体重316–620克，翼展85–100厘米。全身包括喙和腿均为黑色，颈粗、喙直而厚，翼宽圆，尾较短且末端方形至圆形。", ["general", "identification"]),
      ecology: section("American crows are omnivorous ground foragers that eat grains, fruit, insects, small vertebrates, eggs, carrion and human refuse. They live in social family groups, mob predators and may gather in very large communal winter roosts.", "美洲乌鸦是杂食性地面觅食者，吃谷物、果实、昆虫、小型脊椎动物、鸟蛋、腐肉和人类废弃食物。它们以社会性家庭群生活，会围攻捕食者，冬季还可能聚成极大的公共夜栖群。", ["general", "ecology"]),
      habitat: section("The species occupies much of North America in open woodland, forest edges, farmland, wetlands, coasts, suburbs and cities, generally avoiding treeless desert and extensive unbroken forest. Northern birds are more migratory than many southern populations.", "该物种分布于北美大部，生活在开阔林地、林缘、农田、湿地、海岸、郊区和城市，通常避开无树沙漠及大片连续密林。北方种群比许多南方种群更具迁徙性。", ["general", "range"]),
    },
    facts: [
      fact("length", "Length", "体长", "40–53 cm", "40–53厘米", ["identification"]),
      fact("weight", "Weight", "体重", "316–620 g", "316–620克", ["identification"]),
      fact("wingspan", "Wingspan", "翼展", "85–100 cm", "85–100厘米", ["identification"]),
      fact("diet", "Diet", "食性", "Broad omnivore", "广食性杂食", ["ecology"]),
      fact("clutch", "Clutch", "每窝蛋数", "3–9 eggs", "3–9枚", ["ecology"]),
      fact("incubation", "Incubation", "孵化期", "16–18 days", "16–18天", ["ecology"]),
    ],
    life: section("Pairs build a stick nest high in a tree and lay about 3–9 eggs. Incubation lasts 16–18 days and young remain in the nest roughly 20–40 days; offspring from previous years may stay with their parents and help feed a new brood.", "配偶会在树上较高处用枝条筑巢，每窝约产3–9枚蛋。孵化需16–18天，幼鸟留巢约20–40天；往年出生的后代可能继续留在父母身边，帮助喂养新一窝幼鸟。", ["ecology"]),
    adaptations: [
      adaptation("Flexible bill and diet", "灵活的喙与食性", "A sturdy general-purpose bill handles insects, seeds, carrion and many human-associated foods.", "坚固而通用的喙能处理昆虫、种子、腐肉和多种与人类环境相关的食物。", ["general"]),
      adaptation("Social learning", "社会学习", "Family groups and large gatherings allow crows to learn about food, danger and local conditions from one another.", "家庭群和大型聚集使乌鸦能够彼此学习食物、危险和当地环境信息。", ["ecology"]),
      adaptation("Cooperative defense", "合作防御", "Several crows may mob a hawk or owl, combining calls and close passes to drive it away.", "多只乌鸦可能共同围攻鹰或鸮，以叫声和近距离飞掠把捕食者赶走。", ["ecology"]),
    ],
    role: section("American crows consume carrion, insects, fruit and seeds, acting as scavengers, predators and seed movers. They also take eggs and nestlings, so their ecological effects vary with place and food supply.", "美洲乌鸦会吃腐肉、昆虫、果实和种子，兼具清道夫、捕食者和种子搬运者的作用。它们也会取食蛋和雏鸟，因此生态影响会随地点和食物供应而变化。", ["general", "ecology"]),
    conservation: { trend: "decreasing", threats: b("The species is abundant and of low global concern, but is highly susceptible to West Nile virus and faces collisions, persecution, poisoning and local habitat changes.", "该物种数量多、全球保护关注较低，但对西尼罗河病毒极其敏感，也面临碰撞、人为扑杀、中毒和局部生境变化。"), actions: b("Maintain long-term population monitoring, reduce indiscriminate poison and persecution, manage large roost conflicts without harming birds, and track disease impacts and recovery.", "应持续长期种群监测，减少不加选择的毒杀和扑杀，以不伤害鸟类的方式处理大型夜栖群冲突，并追踪疾病影响及恢复。") },
    identification: { key: b("A large all-black bird with a heavy straight bill, fairly short square or rounded tail, broad rounded wings and a familiar full-throated caw.", "大型全黑鸟，喙粗直，尾较短且末端方形或圆形，翼宽圆，并常发出洪亮的“caw”叫声。"), similar: b("Common ravens are larger with a heavier bill, shaggy throat, longer wedge-shaped tail and more soaring flight. Fish crows are very similar and are often best separated by their more nasal voice.", "渡鸦更大，喙更粗，喉羽蓬松，尾更长且呈楔形，飞行时更常滑翔。鱼鸦外观极相似，通常最好依据更鼻音化的叫声区分。", ["identification"]) },
    communication: section("Crows use varied calls, body postures and social interactions. Loud caws maintain contact and recruit others to threats, while individuals learn to recognize recurring dangers and unusual food opportunities.", "乌鸦使用多种叫声、身体姿势和社会互动。响亮的叫声既维持联系，也可召集同伴应对威胁；个体还能学会识别反复出现的危险和特殊食物机会。", ["general", "ecology"]),
    seasonal: section("Breeding occurs in spring across much of the range. Family groups persist after fledging; in autumn and winter many birds gather at communal roosts, and northern populations may move south.", "在分布区大部，美洲乌鸦于春季繁殖。幼鸟离巢后家庭群仍会维持；秋冬季许多个体聚集到公共夜栖地，北方种群还可能向南移动。", ["ecology"]),
    humans: section("Crows thrive near people and can remove refuse and carrion, but large roosts, crop feeding and opened trash can cause conflict. Their intelligence and social lives also make them prominent in research and culture.", "乌鸦善于在人类附近生活，可清除垃圾和腐肉，但大型夜栖群、取食作物和翻开垃圾也会引发冲突。它们的智慧和社会生活还使其成为科研与文化中的显著动物。", ["general"]),
    evolution: section("American crows belong to Corvidae, the crow and jay family. Birds formerly called Northwestern Crows are now treated as part of the American Crow after evidence of extensive genetic mixing.", "美洲乌鸦属于鸦科。过去被称为“西北乌鸦”的鸟，如今因广泛遗传混合证据而被并入美洲乌鸦。", ["taxonomy", "identification"]),
    field: section("Look for deliberate ground walking, rowing wingbeats, a short square tail and groups calling from exposed perches. Pellets, tracks and mixed food remains are not species-specific, so voice and shape are safer identification evidence.", "可观察其从容的地面步行、划桨般振翅、短方尾，以及群体在开阔栖枝上鸣叫。食丸、足迹和混杂食物残余并非物种特有，因此叫声和体形是更可靠的辨认依据。", ["identification"]),
    know: [
      section("Young crows from earlier years may help their parents raise a new brood.", "往年出生的年轻乌鸦可能帮助父母抚育新一窝幼鸟。", ["ecology"]),
      section("Winter roosts can contain thousands to hundreds of thousands of crows.", "冬季公共夜栖群可由数千乃至数十万只乌鸦组成。", ["ecology"]),
      section("Old feathers may fade brownish, even though fresh American Crow plumage is entirely black.", "旧羽可能褪成棕褐色，但美洲乌鸦的新鲜羽毛是全黑的。", ["identification"]),
    ],
    classSpecific: { title: b("Songbird intelligence", "鸣禽智能"), content: b("As a passerine with a complex social system, the American crow combines vocal learning, long memory and flexible problem-solving rather than relying on one fixed behavior.", "作为具有复杂社会系统的雀形鸟，美洲乌鸦结合了声音学习、长期记忆和灵活解决问题的能力，而不是只依赖固定行为。") },
    sources: {
      taxonomy: source("GBIF Backbone Taxonomy", "https://api.gbif.org/v1/species/match?name=Corvus%20brachyrhynchos"),
      general: source("Cornell Lab of Ornithology, All About Birds", "https://www.allaboutbirds.org/guide/American_Crow/overview"),
      ecology: source("Cornell Lab of Ornithology, All About Birds", "https://www.allaboutbirds.org/guide/American_Crow/lifehistory"),
      identification: source("Cornell Lab of Ornithology, All About Birds", "https://www.allaboutbirds.org/guide/American_Crow/id"),
      conservation: source("BirdLife International DataZone", "https://datazone.birdlife.org/species/factsheet/american-crow-corvus-brachyrhynchos"),
      range: source("Cornell Lab of Ornithology, All About Birds", "https://www.allaboutbirds.org/guide/American_Crow/maps-range"),
    },
  },

  "american-alligator": {
    status: { code: "LC", en: "Least Concern", zh: "无危", note_en: "The 2019 IUCN assessment lists the species as Least Concern with no continuing decline in mature individuals reported.", note_zh: "IUCN 2019年评估将该物种列为无危，并未报告成熟个体仍在持续下降。" },
    taxonomy: {
      kingdom: b("Animalia", "动物界"), phylum: b("Chordata", "脊索动物门"), class: b("Reptilia", "爬行纲"),
      order: b("Crocodylia", "鳄目"), family: b("Alligatoridae", "短吻鳄科"), genus: b("Alligator", "短吻鳄属"),
    },
    description: b("The American alligator is a large freshwater crocodilian of the southeastern United States. Its recovery after severe historical decline is a conservation success, and the ponds and channels it excavates create wet refuges used by many other species.", "美洲短吻鳄是美国东南部的大型淡水鳄类。它在历史上严重衰退后成功恢复，是保护工作的典型案例；其挖出的水塘和通道还会形成被许多其他物种利用的湿地庇护所。"),
    encyclopedia: {
      anatomy: section("American alligators have a broad rounded snout, armored skin with bony scutes, short legs and a muscular flattened tail. Average adult females are about 2.6 m long and males about 3.4 m, while very large males may approach 454 kg.", "美洲短吻鳄有宽圆吻部、带骨质鳞板的装甲皮肤、短腿和强壮扁尾。成年雌性平均长约2.6米，雄性约3.4米；特大型雄性体重可接近454千克。", ["general"]),
      ecology: section("They are ambush predators that eat fish, turtles, invertebrates, birds and mammals. Adults can dig 'gator holes' that hold water during dry periods, while females defend nests and young—unusually extensive parental care for a reptile.", "它们是伏击型捕食者，取食鱼、龟、无脊椎动物、鸟和哺乳动物。成体会挖出在旱期蓄水的“鳄鱼塘”；雌性守护巢和幼体，这在爬行动物中属于较为深入的亲代照料。", ["general", "ecology"]),
      habitat: section("The native range extends through the southeastern United States from coastal North Carolina to central Texas. Alligators inhabit slow rivers, lakes, marshes and swamps and tolerate brackish water only briefly because they lack functional salt glands.", "原生分布区横跨美国东南部，从北卡罗来纳沿海到得克萨斯中部。它们生活在缓流河、湖泊、沼泽和湿地；由于缺乏有效盐腺，只能短时间耐受半咸水。", ["general", "range"]),
    },
    facts: [
      fact("female_length", "Average female", "雌性平均体长", "About 2.6 m", "约2.6米"),
      fact("male_length", "Average male", "雄性平均体长", "About 3.4 m", "约3.4米"),
      fact("diet", "Diet", "食性", "Fish, turtles and other animals", "鱼、龟及其他动物", ["ecology"]),
      fact("lifespan", "Wild lifespan", "野外寿命", "About 50 years", "约50年"),
      fact("clutch", "Clutch", "每窝蛋数", "Usually 35–50 eggs", "通常35–50枚"),
      fact("incubation", "Incubation", "孵化期", "About 65 days", "约65天"),
    ],
    life: section("Courtship begins in spring and mating usually occurs in month 5. A female builds a vegetation mound and generally lays 35–50 eggs in early summer; after about 65 days she opens the nest when hatchlings call and may guard the young for their first years.", "求偶始于春季，交配通常发生在5月。雌性用植物筑成堆状巢，初夏一般产35–50枚蛋；约65天后，听到幼体叫声便会打开巢穴，并可能在幼体最初几年持续守护。", ["general", "ecology"]),
    adaptations: [
      adaptation("Eyes and nostrils on top", "顶部眼鼻", "Eyes and nostrils near the top of the head allow seeing and breathing while most of the body stays submerged.", "眼睛和鼻孔位于头部上方，使身体大部浸水时仍能观察和呼吸。"),
      adaptation("Armored skin", "装甲皮肤", "Bony osteoderms embedded in the back protect the body and help regulate heat exchange.", "背部皮肤内嵌的骨质鳞板保护身体，也参与热量交换调节。"),
      adaptation("Powerful tail", "强壮尾部", "A flattened muscular tail drives swimming and can also help excavate and defend.", "扁平而肌肉发达的尾部提供游泳动力，也能辅助挖掘和防御。"),
    ],
    role: section("As top wetland predators, alligators influence prey communities. Their trails, nests and water-filled gator holes modify habitat and can provide drought refuges for fish, amphibians and other wildlife.", "作为湿地顶级捕食者，美洲短吻鳄会影响猎物群落。它们的通道、巢穴和蓄水“鳄鱼塘”改变生境，并可在干旱时为鱼、两栖动物及其他野生动物提供庇护。", ["general", "ecology"]),
    conservation: { trend: "stable", threats: b("The species has recovered strongly, but wetland loss, altered water management, pollutants, road mortality, illegal killing and conflict with people remain local pressures.", "该物种已显著恢复，但湿地丧失、水文管理改变、污染物、道路致死、非法捕杀和人鳄冲突仍构成地方压力。"), actions: b("Continue regulated harvest and trade controls, protect wetlands and water regimes, monitor contaminants and populations, and use public education and trained wildlife responders to reduce conflict.", "应继续实施受管制的捕猎与贸易控制，保护湿地及水文过程，监测污染物和种群，并通过公众教育及专业野生动物处置人员减少冲突。") },
    identification: { key: b("A broad U-shaped snout, dark armored body and lower fourth tooth hidden when the mouth closes distinguish the American alligator.", "宽阔U形吻部、深色装甲身体，以及闭口时下颌第四齿被遮住，是美洲短吻鳄的辨认特征。"), similar: b("American crocodiles have a narrower V-shaped snout, and the large lower fourth tooth remains visible when the mouth is closed. Never approach either species to check.", "美洲鳄吻部更窄、呈V形，闭口时仍能看到下颌大型第四齿。绝不能靠近任何一种鳄类来检查这些特征。", ["general"]) },
    communication: section("Adults bellow during courtship and territorial interactions, producing low-frequency sound and water vibration. Hatchlings give high-pitched calls that prompt the female to uncover the nest and remain nearby.", "成体在求偶和领域互动中发出吼声，同时产生低频声音和水面振动。幼体会发出高音叫声，促使雌性扒开巢材并留在附近。", ["general", "ecology"]),
    seasonal: section("Activity and courtship rise in spring; nesting follows in early summer and hatching occurs in late summer. In cold weather alligators become dormant in sheltered water or mud hollows rather than truly hibernating.", "春季活动和求偶增加，初夏筑巢，晚夏孵化。寒冷天气中，它们会在受保护的水体或泥穴中进入低活动状态，而不是真正冬眠。", ["general"]),
    humans: section("American alligators support wildlife tourism and regulated industries but can injure people and pets. Feeding wild alligators is dangerous because it teaches them to associate humans with food.", "美洲短吻鳄支持野生动物旅游和受管制产业，但也可能伤害人和宠物。给野生短吻鳄投食十分危险，因为这会使它们把人类与食物联系起来。", ["general"]),
    evolution: section("American alligators belong to Alligatoridae and are closer to caimans and the Chinese alligator than to true crocodiles. Crocodilian body plans are ancient, but living species remain behaviorally and ecologically flexible.", "美洲短吻鳄属于短吻鳄科，与凯门鳄和扬子鳄的亲缘关系比与真鳄更近。鳄类体型方案十分古老，但现生物种在行为和生态上仍很灵活。", ["taxonomy", "general"]),
    field: section("Slides, broad tracks, tail drags and water-edge trails can indicate alligators. View only from a safe distance; never use tracks or calls as a reason to approach dense shoreline vegetation.", "滑行痕、宽足迹、拖尾痕和水边通道可提示短吻鳄存在。只能在安全距离观察；绝不能因足迹或叫声而靠近茂密岸边植被。", ["general"]),
    know: [
      section("An alligator may replace worn teeth thousands of times across its life.", "美洲短吻鳄一生中可反复替换数千枚磨损牙齿。", ["general"]),
      section("Nest temperature influences whether hatchlings develop as male or female.", "巢温会影响幼体发育为雄性还是雌性。", ["general"]),
      section("Gator holes can retain water during dry periods and shelter many other wetland animals.", "“鳄鱼塘”可在旱期蓄水，为多种湿地动物提供庇护。", ["general", "ecology"]),
    ],
    classSpecific: { title: b("Reptile parental care", "爬行动物亲代照料"), content: b("Unlike most reptiles, female alligators guard nests, respond to hatchling calls and protect pods of young after hatching.", "与多数爬行动物不同，雌性短吻鳄会守巢、回应幼体叫声，并在孵化后保护成群幼体。") },
    sources: {
      taxonomy: source("Smithsonian's National Zoo", "https://nationalzoo.si.edu/animals/american-alligator"),
      general: source("Smithsonian's National Zoo", "https://nationalzoo.si.edu/animals/american-alligator"),
      ecology: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Alligator_mississippiensis/"),
      conservation: source("IUCN Red List assessment for Alligator mississippiensis", "https://downloads.regulations.gov/FWS-HQ-IA-2021-0004-0002/attachment_4.pdf"),
      range: source("Smithsonian's National Zoo", "https://nationalzoo.si.edu/animals/american-alligator"),
    },
  },

  axolotl: {
    status: { code: "CR", en: "Critically Endangered", zh: "极危", note_en: "The 2020 IUCN assessment lists the wild species as Critically Endangered with a decreasing population; abundance in captivity does not reduce its extinction risk in nature.", note_zh: "IUCN 2020年评估将野生种群列为极危且仍在下降；人工饲养数量多并不能降低其在自然界中的灭绝风险。" },
    taxonomy: {
      kingdom: b("Animalia", "动物界"), phylum: b("Chordata", "脊索动物门"), class: b("Amphibia", "两栖纲"),
      order: b("Caudata", "有尾目"), family: b("Ambystomatidae", "钝口螈科"), genus: b("Ambystoma", "钝口螈属"),
    },
    description: b("The axolotl is a permanently aquatic salamander native to the Mexico City lake system. Adults retain larval features such as external gills, and their extraordinary tissue-regeneration ability has made them important in research, while the remaining wild population is Critically Endangered.", "墨西哥钝口螈是一种终生水栖、原生于墨西哥城湖泊系统的蝾螈。成体仍保留外鳃等幼体特征；其非凡的组织再生能力使它成为重要研究动物，但残余野生种群已极危。"),
    encyclopedia: {
      anatomy: section("Wild-type axolotls are dark mottled brown-green, unlike many pale captive color forms. Adults average about 20–23 cm and may exceed 30 cm; feathery external gills, a finned tail and a broad head remain throughout normal adult life.", "野生型墨西哥钝口螈呈深色斑驳的棕绿色，不同于许多浅色人工品系。成体平均约20–23厘米，可能超过30厘米；羽毛状外鳃、带鳍尾和宽头在正常成年期仍会保留。"),
      ecology: section("Axolotls are solitary aquatic predators that take worms, arthropods, mollusks and small fish. They use vision, smell and waterborne or electrical cues to locate prey, and historically acted as important predators in the lake community.", "墨西哥钝口螈是独居水栖捕食者，取食蠕虫、节肢动物、软体动物和小鱼。它们利用视觉、嗅觉以及水中或电信号寻找猎物，历史上是湖泊群落中的重要捕食者。", ["general", "ecology"]),
      habitat: section("The species is endemic to the high-altitude Valley of Mexico lake system. Lake Chalco was drained, and the principal surviving natural habitat is the canal and wetland network of Xochimilco in southern Mexico City, where water quality, fragmentation and introduced fish are major concerns.", "该物种为墨西哥谷高海拔湖泊系统特有种。查尔科湖已被排干，主要残存天然生境是墨西哥城南部霍奇米尔科的运河与湿地网络；水质、生境破碎化和外来鱼类是主要问题。", ["conservation", "range"]),
    },
    facts: [
      fact("average_length", "Average length", "平均体长", "About 20–23 cm", "约20–23厘米"),
      fact("maximum_length", "Maximum length", "最大体长", "More than 30 cm", "可超过30厘米"),
      fact("diet", "Diet", "食性", "Aquatic invertebrates and small vertebrates", "水生无脊椎动物和小型脊椎动物", ["ecology"]),
      fact("breeding", "Wild breeding", "野外繁殖期", "Usually months 3–6", "通常3–6月"),
      fact("eggs", "Eggs", "产蛋数", "About 100–300", "约100–300枚"),
      fact("hatching", "Hatching", "孵化时间", "About 10–14 days", "约10–14天"),
    ],
    life: section("Wild breeding is generally reported in months 3–6. A female attaches roughly 100–300 individually jelly-coated eggs to submerged material; they hatch after about 10–14 days, receive no parental care and may mature by the following breeding season.", "野外繁殖通常发生在3–6月。雌性把约100–300枚各自带胶质层的蛋附着在水下物体上；约10–14天后孵化，没有亲代照料，并可能在下一个繁殖季达到成熟。"),
    adaptations: [
      adaptation("Paedomorphic adulthood", "幼态延续的成体", "Adults normally retain larval external gills and tail fins, allowing a fully aquatic life without ordinary salamander metamorphosis.", "成体通常保留幼体的外鳃和尾鳍，无需经历普通蝾螈式变态即可终生水栖。"),
      adaptation("Regenerative tissues", "组织再生", "Axolotls can regenerate limbs and repair several other tissues with much less scarring than mammals, a major reason they are studied.", "墨西哥钝口螈能再生四肢，并以远少于哺乳动物的瘢痕修复多种组织，这是其重要研究价值来源。"),
      adaptation("Aquatic sensory mix", "复合水下感官", "Chemical, visual and electrical cues help locate prey in turbid vegetated canals.", "化学、视觉和电信号共同帮助它们在浑浊且植被丰富的运河中寻找猎物。"),
    ],
    role: section("As a native aquatic predator, the axolotl consumes invertebrates and small vertebrates and historically helped structure the Xochimilco food web. Its decline also signals deterioration of a culturally important urban wetland.", "作为本地水栖捕食者，墨西哥钝口螈取食无脊椎动物和小型脊椎动物，历史上有助于塑造霍奇米尔科食物网。它的衰退也反映了这一重要城市文化湿地的恶化。", ["general", "conservation"]),
    conservation: { trend: "decreasing", threats: b("Urbanization, canal alteration, pollution, poor water quality, disease, and predation or competition from introduced carp and tilapia threaten the small fragmented wild population.", "城市化、运河改造、污染、水质不良、疾病，以及外来鲤鱼和罗非鱼的捕食或竞争，都威胁着规模小且破碎的野生种群。"), actions: b("Restore clean connected canal habitat, work with chinampa farmers, control introduced fish, monitor wild animals genetically and ecologically, and keep conservation breeding genetically managed and distinct from pet color lines.", "应恢复清洁且连通的运河生境，与人工浮田农户合作，控制外来鱼类，对野生个体开展遗传和生态监测，并使保护繁育得到遗传管理且与宠物色系区分。") },
    identification: { key: b("A broad-headed aquatic salamander with 3 feathery external-gill branches on each side, lidless-looking eyes, small limbs and a tall tail fin.", "宽头水栖蝾螈，头两侧各有3支羽毛状外鳃，眼睛看似无眼睑，四肢较小，尾鳍高。"), similar: b("Larval tiger salamanders may look similar but normally metamorphose and are different species. Pale pink, golden and white axolotls common in captivity are color forms, not the usual wild coloration.", "虎纹钝口螈幼体可能相似，但通常会变态，且属于不同物种。人工饲养中常见的粉、金或白色个体是色型，并非通常的野生体色。") },
    communication: section("Most communication is chemical and visual during courtship. Axolotls also detect water movement and weak electrical fields, helping them orient and find prey when visibility is poor.", "交流主要发生在求偶期间，依靠化学和视觉信号。它们还能感知水流和微弱电场，在能见度低时帮助定位和发现猎物。"),
    seasonal: section("Wild spawning is associated mainly with months 3–6. Because canal temperature, rain and water management vary, local timing can shift; captive animals bred under controlled conditions do not represent the wild seasonal cycle.", "野外产卵主要与3–6月相关。由于运河温度、降雨和水管理会变化，地方时间可能偏移；受控条件下人工繁殖的个体不能代表野外季节周期。"),
    humans: section("Axolotls are culturally associated with Xochimilco and are widely kept as pets and laboratory animals. Captive popularity can obscure the crisis in the wild, and pets or laboratory lines must never be released into canals.", "墨西哥钝口螈与霍奇米尔科文化紧密相连，也被广泛作为宠物和实验动物饲养。人工饲养的流行可能掩盖野外危机；宠物或实验品系绝不能放入运河。", ["general", "conservation"]),
    evolution: section("Axolotls are mole salamanders in Ambystomatidae. Their normal retention of larval traits into reproductive adulthood is called paedomorphosis; forced metamorphosis is possible under unusual hormonal conditions but is not the typical wild life history.", "墨西哥钝口螈属于钝口螈科。正常情况下把幼体特征保留到可繁殖成体，称为幼态延续；特殊激素条件可诱导变态，但这不是典型野外生活史。", ["taxonomy", "general"]),
    field: section("Wild axolotls are dark and difficult to see among canal vegetation. Environmental DNA, standardized trapping and expert surveys are safer evidence than casual sightings; do not handle or disturb suspected animals.", "野生个体体色深，在运河植被中很难发现。环境DNA、标准化捕捉和专家调查比随意目击更可靠；不要触碰或干扰疑似个体。", ["conservation"]),
    know: [
      section("An adult axolotl normally keeps the external gills of a salamander larva.", "成年墨西哥钝口螈通常仍保留蝾螈幼体的外鳃。"),
      section("Most pale axolotls seen in homes or laboratories are captive color forms; wild animals are usually dark and mottled.", "家庭或实验室常见的浅色个体多为人工色型；野生个体通常深色且有斑驳花纹。"),
      section("Being common in captivity does not prevent a species from being Critically Endangered in the wild.", "人工饲养中常见，并不妨碍一个物种在野外处于极危状态。", ["conservation"]),
    ],
    classSpecific: { title: b("Amphibian development", "两栖动物发育"), content: b("The axolotl breaks the familiar amphibian pattern: it becomes reproductively mature while retaining an aquatic larval body rather than transforming into a land-adapted adult.", "墨西哥钝口螈打破了人们熟悉的两栖动物模式：它以水生幼体形态达到性成熟，而不是变成适应陆地的成体。") },
    sources: {
      taxonomy: source("GBIF Backbone Taxonomy", "https://api.gbif.org/v1/species/match?name=Ambystoma%20mexicanum"),
      general: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Ambystoma_mexicanum/"),
      ecology: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Ambystoma_mexicanum/"),
      conservation: source("IUCN SSC Amphibian Specialist Group assessment", "https://www.iucnredlist.org/species/1095/53947343"),
      range: source("IUCN Threatened Amphibians of the World profile", "https://www.iucn-amphibians.org/wp-content/uploads/sites/4/2018/11/TAW-Threatened-Species-Profiles_Part5.pdf"),
    },
  },

  "atlantic-herring": {
    status: { code: "LC", en: "Least Concern", zh: "无危", note_en: "The global IUCN assessment is Least Concern; individual fisheries and regional stocks can nevertheless be depleted and require separate management.", note_zh: "IUCN全球评估为无危；但个别渔业和区域种群仍可能衰退，必须分别管理。" },
    taxonomy: {
      kingdom: b("Animalia", "动物界"), phylum: b("Chordata", "脊索动物门"), class: b("Actinopterygii", "辐鳍鱼纲"),
      order: b("Clupeiformes", "鲱形目"), family: b("Clupeidae", "鲱科"), genus: b("Clupea", "鲱属"),
    },
    description: b("Atlantic herring are small silvery schooling fish found on both sides of the North Atlantic. They convert plankton into food for many fish, seabirds and marine mammals, making them ecologically central as well as important to commercial fisheries.", "大西洋鲱是生活在北大西洋两岸的小型银色群游鱼。它们把浮游生物转化为许多鱼类、海鸟和海洋哺乳动物的食物，因此既是商业渔业对象，也是海洋生态中的关键环节。"),
    encyclopedia: {
      anatomy: section("Atlantic herring have a laterally compressed silver body, blue-green back, single mid-body dorsal fin and deeply forked tail. NOAA reports lengths up to about 36 cm in its managed western Atlantic population; older species accounts report larger exceptional fish.", "大西洋鲱身体侧扁呈银色，背部蓝绿色，有一个位于身体中段的背鳍和深叉尾。NOAA对其管理的西大西洋种群报告体长可达约36厘米；较早的物种资料记录过更大的异常个体。", ["general", "ecology"]),
      ecology: section("Herring migrate in dense schools between feeding, spawning and wintering areas. They eat zooplankton, krill and fish larvae, while eggs, juveniles and adults feed a wide range of fishes, sharks, seabirds and marine mammals.", "鲱鱼以密集鱼群在觅食地、产卵地和越冬地之间迁移。它们取食浮游动物、磷虾和鱼类仔体；而其卵、幼鱼和成鱼又被多种鱼、鲨、海鸟和海洋哺乳动物捕食。", ["general", "ecology"]),
      habitat: section("Atlantic herring occupy coastal and continental-shelf waters on both sides of the North Atlantic. In the western Atlantic they range from Labrador south to Cape Hatteras; distinct populations use different spawning grounds and seasons.", "大西洋鲱分布于北大西洋两岸的沿海和大陆架水域。西大西洋分布从拉布拉多向南至哈特拉斯角；不同种群使用不同产卵场和产卵季。", ["general", "range"]),
    },
    facts: [
      fact("maximum_length", "Length", "体长", "Up to about 36 cm in NOAA account", "NOAA资料中可达约36厘米", ["general"]),
      fact("lifespan", "Lifespan", "寿命", "Up to about 15 years in NOAA account", "NOAA资料中可达约15年", ["general"]),
      fact("diet", "Diet", "食性", "Zooplankton, krill and fish larvae", "浮游动物、磷虾和鱼类仔体", ["ecology"]),
      fact("maturity", "Maturity", "性成熟", "Around age 4 in NOAA account", "NOAA资料中约4岁", ["general"]),
      fact("eggs", "Eggs per female", "每尾雌鱼产卵", "About 30000–200000", "约30000–200000枚", ["general"]),
      fact("hatching", "Egg hatching", "卵孵化", "Usually 7–10 days, temperature-dependent", "通常7–10天，取决于温度", ["general"]),
    ],
    life: section("Mature fish gather to broadcast eggs and sperm over rock, gravel or sand. A female may produce about 30000–200000 adhesive eggs; in NOAA's western Atlantic account they usually hatch after 7–10 days depending on temperature, and juveniles later form coastal schools.", "成熟鱼会聚集，在岩石、砾石或沙质海底上成群排卵排精。每尾雌鱼可产约30000–200000枚黏性卵；在NOAA西大西洋资料中，卵通常依温度在7–10天后孵化，幼鱼随后在沿海形成鱼群。", ["general"]),
    adaptations: [
      adaptation("Schooling", "集群游动", "Coordinated schools reduce individual predation risk and help fish track patchy plankton and migration routes.", "协调一致的鱼群既降低单个个体被捕食的风险，也帮助追踪斑块状浮游生物和迁移路线。", ["ecology"]),
      adaptation("Countershaded body", "反荫蔽体色", "A blue-green back and silver sides make a herring less conspicuous against deep water from above and bright surface light from below.", "蓝绿色背部与银色体侧使鲱鱼从上方不易在深水中显现，从下方不易在明亮水面下显现。", ["general"]),
      adaptation("Adhesive bottom eggs", "黏性底栖卵", "Eggs adhere in dense layers to hard or coarse seabed instead of drifting freely in the plankton.", "鱼卵以密集层黏附在坚硬或粗颗粒海底，而不是在浮游层自由漂移。", ["general"]),
    ],
    role: section("Atlantic herring are a forage-fish bridge between plankton and larger predators. Their eggs and bodies support groundfish, tuna, sharks, seabirds, seals and whales, so stock changes can propagate through the food web.", "大西洋鲱是连接浮游生物与大型捕食者的饵料鱼桥梁。它们的卵和身体为底层鱼、金枪鱼、鲨、海鸟、海豹和鲸提供食物，因此种群变化可能沿食物网传导。", ["general", "ecology"]),
    conservation: { trend: "unknown", threats: b("The species is globally Least Concern, but regional stocks face fishing pressure, poor recruitment, warming-driven shifts, habitat disturbance at spawning grounds and changing predator-prey conditions.", "该物种全球为无危，但区域种群面临捕捞压力、补充量不足、海水变暖引起的分布变化、产卵地受扰和捕食—猎物关系改变。"), actions: b("Manage each stock with surveys, acoustic monitoring, catch limits and protected spawning habitat, and account for herring's food-web role rather than relying only on the global Red List category.", "应通过调查、声学监测、捕捞限额和产卵地保护分别管理各区域种群，并考虑鲱鱼的食物网作用，而不能只依赖全球红色名录等级。") },
    identification: { key: b("A small streamlined fish with silver sides, blue-green back, one dorsal fin near mid-body, no adipose fin and a deeply forked tail.", "小型流线鱼，体侧银白、背部蓝绿，身体中段有一个背鳍，无脂鳍，尾深叉。"), similar: b("Pacific herring are a separate North Pacific species and cannot be separated safely by a casual photo alone. Sardines and shads differ in body proportions and fin or belly-keel details; location and expert characters matter.", "太平洋鲱是北太平洋的另一个物种，不能仅凭普通照片可靠区分。沙丁鱼和西鲱在体形、鳍或腹棱细节上不同；地点与专家鉴定特征都很重要。") },
    communication: section("Herring respond to visual, chemical, tactile and acoustic cues in schools. They can produce sounds by releasing gas through the anal duct, but the exact behavioral function remains uncertain and should not be presented as proven language.", "鲱鱼在鱼群中会响应视觉、化学、触觉和声学信号。它们可通过肛管排气产生声音，但其确切行为功能仍不确定，不能把它表述成已证实的“语言”。", ["ecology"]),
    seasonal: section("Timing differs among stocks. In NOAA's western Atlantic account, spawning begins as early as month 8 in Nova Scotia and eastern Maine and occurs mainly in months 10–11 farther south; schools also migrate among feeding and wintering areas.", "不同种群的时间不同。NOAA西大西洋资料显示，新斯科舍和缅因东部最早8月产卵，更南方多在10–11月；鱼群还会在觅食地和越冬地之间迁移。", ["general"]),
    humans: section("Atlantic herring have supported food, bait and reduction fisheries for centuries. Fisheries can be economically important, but management must leave enough fish for predators and distinguish stock-level depletion from global species risk.", "大西洋鲱数百年来支撑食用、饵料和加工渔业。渔业具有经济价值，但管理必须为捕食者保留足够资源，并区分区域种群衰退与全球物种风险。", ["general", "conservation"]),
    evolution: section("Atlantic herring belong to Clupeidae, the herring, sardine and shad family. The accepted species Clupea harengus is distinct from Pacific herring, Clupea pallasii, despite their close relationship and similar appearance.", "大西洋鲱属于鲱科，该科还包括多种鲱、沙丁鱼和西鲱。公认种大西洋鲱与太平洋鲱虽亲缘近、外形相似，但属于不同物种。", ["taxonomy", "general"]),
    field: section("Large moving shoals may darken or ripple surface water, but many forage fish behave similarly. Reliable identification needs a specimen-quality view of anatomical characters plus catch location; underwater schooling footage alone is not enough.", "大型游动鱼群可能使水面变暗或出现波纹，但许多饵料鱼都有类似行为。可靠鉴定需要标本级解剖特征视图并结合捕获地点；仅凭水下群游视频并不足够。", ["general"]),
    know: [
      section("Herring eggs can form a dense carpet several centimeters thick on the seabed.", "鲱鱼卵可在海底形成厚达数厘米的密集“卵毯”。", ["general"]),
      section("A single female may release about 30000–200000 eggs.", "一尾雌鱼可产约30000–200000枚卵。", ["general"]),
      section("A global Least Concern label does not mean every regional herring stock is healthy.", "全球“无危”并不表示每一个区域鲱鱼种群都健康。", ["conservation"]),
    ],
    classSpecific: { title: b("Fish schooling", "鱼类集群"), content: b("The lateral-line and visual systems help each herring match the speed and direction of nearby fish, allowing thousands of individuals to maneuver as a coordinated school.", "侧线和视觉系统帮助每尾鲱鱼匹配邻近个体的速度与方向，使成千上万尾鱼能像一个协调群体般转向。") },
    sources: {
      taxonomy: source("GBIF Backbone Taxonomy", "https://api.gbif.org/v1/species/match?name=Clupea%20harengus"),
      general: source("NOAA Fisheries", "https://www.fisheries.noaa.gov/species/atlantic-herring/commercial"),
      ecology: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Clupea_harengus/"),
      conservation: source("IUCN Red List assessment for Clupea harengus", "https://www.iucnredlist.org/species/155123/115169038"),
      range: source("NOAA Fisheries", "https://www.fisheries.noaa.gov/species/atlantic-herring/commercial"),
    },
  },

  "army-ant": {
    status: { code: "NE", en: "Not Evaluated", zh: "未评估", note_en: "No species-level IUCN Red List assessment was found for Eciton burchellii. The legacy DD label was corrected to NE because absence of an assessment is not Data Deficient.", note_zh: "未找到布氏游蚁的IUCN物种级红色名录评估。旧记录的DD“数据缺乏”已改为NE“未评估”，因为没有评估并不等于数据缺乏。" },
    taxonomy: {
      kingdom: b("Animalia", "动物界"), phylum: b("Arthropoda", "节肢动物门"), class: b("Insecta", "昆虫纲"),
      order: b("Hymenoptera", "膜翅目"), family: b("Formicidae", "蚁科"), genus: b("Eciton", "游蚁属"),
    },
    description: b("Burchell's army ant is a nomadic, swarm-raiding ant of tropical Central and South America. A colony can contain hundreds of thousands of workers that build temporary nests from their own bodies and collectively hunt other arthropods.", "布氏游蚁是中南美洲热带地区一种游猎、群袭的蚂蚁。一个群体可有数十万只工蚁，它们用自己的身体搭成临时蚁巢，并集体捕猎其他节肢动物。"),
    encyclopedia: {
      anatomy: section("Workers are polymorphic and about 3–12 mm long. They have elongated bodies, long legs, hooked mandibles, a sting and tarsal hooks that let workers grip one another to form living bridges and bivouacs; queens and winged males look very different.", "工蚁有明显多型，体长约3–12毫米。身体细长、腿长，具钩状大颚、螫针和跗节钩，可彼此抓牢形成活桥与临时蚁巢；蚁后和有翅雄蚁外形差异很大。"),
      ecology: section("Dense fan-shaped raids capture mainly insects and other arthropods. Colonies alternate a nomadic phase, when larval demand drives frequent raids and moves, with a stationary phase, when pupae develop and the queen lays a new egg batch.", "密集扇形袭击主要捕捉昆虫和其他节肢动物。群体在游猎期与定居期之间交替：幼虫需求高时频繁袭击并迁巢；蛹发育且蚁后产下新一批卵时则相对固定。", ["general", "ecology"]),
      habitat: section("Eciton burchellii occurs in warm humid tropical regions of Central and South America, chiefly on forest floors. Colonies may forage into openings or farms and occasionally bivouac above ground, but continuous forest and abundant prey are important.", "布氏游蚁分布于中南美洲温暖湿润的热带地区，主要活动在森林地面。群体可能进入空地或农田觅食，也偶尔在地面以上结成临时巢，但连续森林和丰富猎物十分重要。", ["general", "range"]),
    },
    facts: [
      fact("worker_length", "Worker length", "工蚁体长", "About 3–12 mm", "约3–12毫米"),
      fact("colony_size", "Colony size", "群体规模", "About 100000–2000000 adults in cited account", "所引资料约100000–2000000只成蚁"),
      fact("diet", "Diet", "食性", "Mostly insects and other arthropods", "主要为昆虫和其他节肢动物", ["ecology"]),
      fact("nest", "Nest", "巢型", "Living temporary bivouac", "由活体工蚁构成的临时巢"),
      fact("egg_cycle", "Queen's egg cycle", "蚁后产卵周期", "About every 3 weeks in cited account", "所引资料约每3周一次"),
      fact("status", "IUCN status", "IUCN等级", "Not Evaluated", "未评估", ["conservation"]),
    ],
    life: section("A wingless queen stores sperm and lays large batches in repeated cycles. Workers care for eggs, larvae and pupae; larval development triggers the nomadic phase, while new colonies form by fission when a young queen leaves with part of the worker force rather than flying away alone.", "无翅蚁后储存精子并周期性产下大批卵。工蚁照料卵、幼虫和蛹；幼虫发育会触发游猎期。新群体通过分群建立：年轻蚁后带着部分工蚁离开，而不是独自飞走。"),
    adaptations: [
      adaptation("Living architecture", "活体建筑", "Tarsal hooks let workers link into bridges and a protective bivouac without building a permanent nest.", "跗节钩使工蚁相互连接成桥和保护性临时巢，无需建造永久巢穴。"),
      adaptation("Worker polymorphism", "工蚁多型", "Workers of different sizes perform complementary tasks, from brood care to carrying prey and colony defense.", "不同体型的工蚁承担互补任务，从照料幼体到搬运猎物和保卫群体。"),
      adaptation("Pheromone traffic control", "信息素交通控制", "Chemical trails coordinate enormous raids even though workers rely little on vision.", "即使工蚁很少依赖视觉，化学路径仍能协调规模巨大的袭击。"),
    ],
    role: section("Army-ant raids disturb and consume many forest-floor arthropods. Ant-following birds catch animals fleeing the swarm, while beetles, mites and other specialized associates live with or track the colony, creating a mobile ecological community.", "游蚁袭击会惊动并捕食大量林地节肢动物。蚁鸟捕捉逃离蚁群的动物，甲虫、螨及其他特化伴生生物则随群体生活或移动，形成流动的生态群落。", ["general", "ecology"]),
    conservation: { trend: "unknown", threats: b("The species has not been formally evaluated by IUCN. Forest loss and fragmentation are plausible major pressures because large nomadic colonies need humid connected habitat and a broad prey base; population trend is not adequately monitored.", "该物种尚未接受IUCN正式评估。森林丧失和破碎化很可能是主要压力，因为大型游猎群体需要湿润、连通的生境和广泛猎物；其种群趋势缺乏充分监测。"), actions: b("Retain large connected forest blocks, limit broad-spectrum insecticide exposure at forest edges, protect ant-following ecological communities and establish repeatable colony-monitoring methods before assigning a threat category.", "应保留大型连通森林，限制林缘广谱杀虫剂暴露，保护依随游蚁的生态群落，并建立可重复的群体监测方法，再据此评定受威胁等级。") },
    identification: { key: b("A broad fan of many golden-brown to dark workers moving in organized columns, with long legs and strongly hooked mandibles; workers vary greatly in size.", "大量金棕至深色工蚁组成宽扇形袭击并排成有序纵队，腿长、大颚强烈弯曲，工蚁体型差异显著。"), similar: b("'Army ant' describes many species. Exact identification of Eciton burchellii requires close morphological or expert evidence; a mass raid alone is not species-specific.", "“游蚁”包含许多物种。精确鉴定布氏游蚁需要近距离形态或专家证据；仅凭大规模袭击行为不能确定物种。") },
    communication: section("Pheromone trails, alarm chemicals, touch and substrate vibration coordinate foraging, nestmate recognition, brood care and defense. Workers have very limited vision, so collective movement is not directed by a single visual leader.", "信息素路径、警报化学物质、触碰和基质振动共同协调觅食、同巢识别、幼体照料和防御。工蚁视觉十分有限，因此集体移动并不是由某个视觉领袖指挥。"),
    seasonal: section("Colony rhythm is driven more by the brood cycle than by a simple annual calendar. Nomadic nights coincide with active larvae and frequent raids; the stationary phase coincides with pupation and a new egg batch, while rain and temperature constrain local activity.", "群体节律更多由幼体周期驱动，而不是简单的年度日历。活跃幼虫期对应频繁袭击和夜间迁巢；化蛹及新一批产卵时对应定居期，降雨和温度则限制当地活动。", ["ecology"]),
    humans: section("Raids can remove household or crop-associated arthropods but workers can sting painfully when trapped or the bivouac is disturbed. The safest response is to give a passing column space rather than spray or break it apart.", "袭击可清除住宅或作物附近的节肢动物，但工蚁受困或临时巢被扰动时会造成疼痛螫伤。最安全做法是给经过的蚁队留出空间，而不是喷药或打散。"),
    evolution: section("Eciton burchellii is a New World army ant in Formicidae. Its eusocial colony—not an individual worker—is the functional unit that reproduces by fission, migrates, hunts and constructs shelter.", "布氏游蚁是蚁科的新世界游蚁。真正通过分群繁殖、迁移、捕猎和建造庇护所的功能单位是整个真社会性群体，而不是单只工蚁。", ["taxonomy", "general"]),
    field: section("A temporary bivouac looks like a hanging or ground-level mass of interlocked ants, and a raid forms a dense fan connected to it by columns. Observe from well outside the traffic lane and never disturb the bivouac.", "临时蚁巢看起来像悬挂或贴地的一团相互钩连的蚂蚁，袭击前缘呈密集扇形，并由纵队连接巢体。应在交通路线之外远观，绝不能扰动临时巢。"),
    know: [
      section("The temporary nest is made largely from the ants' own interlocked bodies.", "临时巢主要由彼此钩连的蚂蚁身体构成。"),
      section("Army-ant queens are wingless, and a new colony forms with a group of workers rather than by a queen flying off alone.", "游蚁蚁后没有翅，新群体由蚁后带部分工蚁分出，而不是蚁后独自飞离建立。"),
      section("Not Evaluated means no IUCN assessment has been completed; it does not mean the species is safe or Data Deficient.", "“未评估”表示尚无IUCN评估；它既不表示物种安全，也不等于“数据缺乏”。", ["conservation"]),
    ],
    classSpecific: { title: b("Eusocial colony", "真社会性群体"), content: b("Reproductive queens and non-reproductive worker castes overlap across generations and cooperate in brood care, meeting the defining features of eusociality.", "繁殖蚁后与不繁殖工蚁品级跨世代共存并合作照料幼体，符合真社会性的定义特征。") },
    sources: {
      taxonomy: source("GBIF Backbone Taxonomy", "https://api.gbif.org/v1/species/match?name=Eciton%20burchellii"),
      general: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Eciton_burchellii/"),
      ecology: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Eciton_burchellii/"),
      conservation: source("IUCN Red List species search", "https://www.iucnredlist.org/search?query=Eciton%20burchellii&searchType=species"),
      range: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Eciton_burchellii/"),
    },
  },

  "emperor-scorpion": {
    status: { code: "NE", en: "Not Evaluated", zh: "未评估", note_en: "The emperor scorpion is not evaluated by IUCN and is listed in CITES Appendix II, which regulates international trade; Appendix II is not an IUCN threat category.", note_zh: "帝王蝎尚未接受IUCN评估，并列入CITES附录II以管制国际贸易；附录II并不是IUCN受威胁等级。" },
    taxonomy: {
      kingdom: b("Animalia", "动物界"), phylum: b("Arthropoda", "节肢动物门"), class: b("Arachnida", "蛛形纲"),
      order: b("Scorpiones", "蝎目"), family: b("Scorpionidae", "蝎科"), genus: b("Pandinus", "帝王蝎属"),
    },
    description: b("The emperor scorpion is a large glossy-black forest scorpion from West Africa. It usually subdues prey with massive pincers rather than relying on its sting, gives birth to live young and is internationally traded under CITES Appendix II controls.", "帝王蝎是原产西非的大型亮黑色森林蝎。它通常用巨大的螯肢制服猎物，而不是主要依赖螫针；它产活体幼体，国际贸易受CITES附录II管制。"),
    encyclopedia: {
      anatomy: section("Adults average about 20 cm long and have a glossy black body, 8 walking legs, 2 massive pedipalps, a segmented tail ending in a sting and comb-like pectines underneath. The exoskeleton fluoresces blue-green under ultraviolet light.", "成体平均长约20厘米，身体亮黑，有8条步足、2个巨大的螯肢、末端具螫针的分节尾，以及腹面的梳状栉器。外骨骼在紫外光下会发出蓝绿色荧光。"),
      ecology: section("This nocturnal predator shelters in burrows, leaf litter, stream banks and termite mounds and eats mainly insects and other arthropods, especially termites. Large pincers usually seize and crush prey; the sting is used more in defense and by juveniles.", "这种夜行捕食者藏身于洞穴、落叶层、溪岸和白蚁丘，主要取食昆虫及其他节肢动物，尤其是白蚁。大型螯肢通常用于抓握和压碎猎物；螫针更多用于防御，幼体也较常使用。", ["general", "ecology"]),
      habitat: section("The species is native to hot humid West African forests and adjacent humid savannas, with records from countries including Benin, Côte d'Ivoire, Ghana, Guinea, Liberia, Nigeria, Sierra Leone and Togo. It depends on moist shelters and diggable substrate.", "该物种原产西非炎热湿润的森林及相邻湿润稀树草原，记录国家包括贝宁、科特迪瓦、加纳、几内亚、利比里亚、尼日利亚、塞拉利昂和多哥。它依赖湿润隐蔽处和可挖掘基质。", ["cites", "range"]),
    },
    facts: [
      fact("length", "Length", "体长", "About 20 cm on average", "平均约20厘米"),
      fact("diet", "Diet", "食性", "Mostly insects and other arthropods", "主要为昆虫和其他节肢动物", ["ecology"]),
      fact("activity", "Activity", "活动时间", "Nocturnal", "夜行", ["ecology"]),
      fact("gestation", "Gestation", "妊娠期", "About 9 months", "约9个月"),
      fact("young", "Young", "每胎幼体", "About 10–12", "约10–12只"),
      fact("trade", "Trade listing", "贸易名录", "CITES Appendix II", "CITES附录II", ["cites"]),
    ],
    life: section("After a courtship promenade and internal sperm transfer, gestation averages about 9 months. A female gives live birth to roughly 10–12 pale young, carries them on her back through their vulnerable first stage and becomes especially defensive; maturity is reported near 4 years.", "经过求偶步行和体内精子转移后，妊娠平均约9个月。雌性产下约10–12只浅色活体幼体，在脆弱的早期阶段背负它们并表现出更强防御性；据记录约4岁成熟。"),
    adaptations: [
      adaptation("Massive pincers", "巨型螯肢", "Broad muscular pedipalps grasp and crush prey, so adults often do not need to sting while feeding.", "宽大有力的螯肢能抓握并压碎猎物，因此成体进食时常无需螫刺。"),
      adaptation("Vibration sensors", "振动感受器", "Sensory hairs and ventral pectines detect substrate texture and vibrations despite poor eyesight.", "感觉毛和腹面栉器能在视觉较差的情况下探测基质纹理与振动。"),
      adaptation("Burrow microclimate", "洞穴微气候", "Burrows and humid debris buffer heat and water loss in tropical forest and savanna mosaics.", "洞穴和湿润碎屑能在热带森林—稀树草原镶嵌环境中缓冲高温与水分流失。"),
    ],
    role: section("Emperor scorpions consume termites and other arthropods and in turn are prey for birds, bats, mammals and spiders. Their burrowing and predation connect soil, litter and above-ground forest food webs.", "帝王蝎捕食白蚁和其他节肢动物，又被鸟、蝙蝠、哺乳动物和蜘蛛捕食。其挖洞与捕食把土壤、落叶层和地上森林食物网连接起来。", ["general", "ecology"]),
    conservation: { trend: "unknown", threats: b("No IUCN population trend is available. Habitat loss and collection for the pet trade are concerns; international trade is controlled under CITES Appendix II because unregulated trade could become harmful.", "IUCN没有可用的种群趋势。生境丧失和宠物贸易采集值得关注；国际贸易受CITES附录II管制，因为不受控贸易可能造成危害。"), actions: b("Use legal traceable captive-bred stock, enforce CITES permits and non-detriment decisions, protect humid West African habitat and collect field population and trade data before inferring security from captive availability.", "应使用合法可追溯的人工繁育个体，执行CITES许可和无害性判定，保护西非湿润生境，并收集野外种群与贸易数据，不能因人工市场常见就推断野外安全。") },
    identification: { key: b("Very large glossy-black scorpion with exceptionally broad textured pincers, a thick body and blue-green fluorescence under UV light.", "体型很大且亮黑，螯肢异常宽厚并有颗粒纹理，身体粗壮，在紫外光下呈蓝绿色荧光。"), similar: b("Asian forest scorpions in Heterometrus can look extremely similar and are often confused in trade. Exact identification needs provenance and expert morphological examination, not color or size alone.", "亚洲异蝎属森林蝎外形极其相似，贸易中常被混淆。精确鉴定需要来源信息和专家形态检查，不能只看颜色或大小。") },
    communication: section("Courtship relies on touch and substrate-borne movement. Sensory hairs and pectines detect prey, terrain and vibrations; vision is poor, and UV fluorescence should not be described as a proven communication signal.", "求偶依靠触碰和沿基质传播的动作。感觉毛和栉器用于探测猎物、地形及振动；视觉较差，而紫外荧光不能被说成已经证实的交流信号。"),
    seasonal: section("Breeding can occur through the year in humid tropical conditions, and activity rises at night when humidity is higher. Local rain and dry periods affect surface activity, while sheltered burrows buffer extremes.", "在湿润热带条件下全年都可能繁殖；夜间湿度较高时活动增加。当地雨季和旱季影响地表活动，隐蔽洞穴则缓冲极端条件。", ["ecology"]),
    humans: section("The species is popular in the pet trade and film because of its size and generally defensive rather than aggressive behavior. Its pinch and sting can still hurt, allergies are possible, and wild-caught trade requires legal documentation.", "该物种因体型大、通常偏防御而非主动攻击的行为，在宠物贸易和影视中较受欢迎。但夹击和螫刺仍会疼痛，也可能引起过敏；野生来源贸易必须有合法文件。", ["general", "cites"]),
    evolution: section("Emperor scorpions are arachnids, not insects: like spiders they have 8 walking legs and no antennae. Scorpions are an ancient arachnid lineage, while Pandinus imperator is one modern West African member of Scorpionidae.", "帝王蝎是蛛形动物而非昆虫：与蜘蛛一样有8条步足且没有触角。蝎类是古老的蛛形动物谱系，而帝王蝎是蝎科的一个现代西非成员。", ["taxonomy", "general"]),
    field: section("At night, experts may locate scorpions with ultraviolet lamps because the cuticle fluoresces, but many scorpion species glow. Never reach into burrows or identify a wild scorpion solely by fluorescence.", "夜间专家可用紫外灯寻找会发荧光的蝎，但许多蝎种都会发光。绝不能把手伸进洞穴，也不能只凭荧光鉴定野生蝎。"),
    know: [
      section("Newborn emperor scorpions ride on their mother's back until after their vulnerable early stage.", "帝王蝎幼体在脆弱的早期阶段会骑在母体背上。"),
      section("Adults often use their enormous pincers instead of the sting to overpower prey.", "成体常用巨大的螯肢而不是螫针制服猎物。"),
      section("CITES Appendix II regulates trade; it is not the same as an IUCN endangered category.", "CITES附录II用于贸易管制，并不等同于IUCN的濒危等级。", ["cites", "conservation"]),
    ],
    classSpecific: { title: b("Arachnid senses", "蛛形动物感官"), content: b("Comb-like pectines sweep near the ground and add chemical and mechanical information to signals from sensory hairs on the legs and body.", "梳状栉器贴近地面扫动，与腿和身体感觉毛提供的信号一起补充化学与机械信息。") },
    sources: {
      taxonomy: source("GBIF Backbone Taxonomy", "https://api.gbif.org/v1/species/match?name=Pandinus%20imperator"),
      general: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Pandinus_imperator/"),
      ecology: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Pandinus_imperator/"),
      conservation: source("IUCN Red List species search", "https://www.iucnredlist.org/search?query=Pandinus%20imperator&searchType=species"),
      cites: source("CITES Animals Committee range and trade review", "https://cites.org/sites/default/files/eng/com/ac/26/E26-12-02-A.pdf"),
      range: source("CITES Animals Committee range and trade review", "https://cites.org/sites/default/files/eng/com/ac/26/E26-12-02-A.pdf"),
    },
  },

  "giant-pacific-octopus": {
    status: { code: "LC", en: "Least Concern", zh: "无危", note_en: "The 2014 global IUCN assessment is Least Concern; population trend is not well established across the entire North Pacific.", note_zh: "IUCN 2014年全球评估为无危；整个北太平洋范围内的种群趋势尚未充分确定。" },
    taxonomy: {
      kingdom: b("Animalia", "动物界"), phylum: b("Mollusca", "软体动物门"), class: b("Cephalopoda", "头足纲"),
      order: b("Octopoda", "八腕目"), family: b("Enteroctopodidae", "巨蛸科"), genus: b("Enteroctopus", "巨蛸属"),
    },
    description: b("The giant Pacific octopus is a large, short-lived predator of cool North Pacific coasts. It changes skin color and texture for camouflage, explores with thousands of chemical-sensitive suckers and reproduces only once near the end of its life.", "北太平洋巨型章鱼是北太平洋寒凉沿岸的大型、短寿命捕食者。它能改变皮肤颜色与纹理进行伪装，用数千个具化学感受能力的吸盘探索环境，并在生命末期只繁殖一次。"),
    encyclopedia: {
      anatomy: section("This octopus has a muscular mantle, 8 arms, a beak and up to about 280 suckers on each arm. Most individuals are far smaller than record claims; ADW gives an average mass around 60 kg, while color cells and skin muscles rapidly alter appearance.", "这种章鱼有肌肉质外套膜、8条腕、喙，每条腕最多约有280个吸盘。多数个体远小于纪录级说法；ADW给出的平均体重约60千克，色素细胞和皮肤肌肉能迅速改变外观。", ["general", "ecology"]),
      ecology: section("A solitary octopus occupies a den and hunts crabs, clams, fish and squid. It may pull shells apart, crush them with the beak or drill and inject saliva, then leave hard remains in a midden near the den entrance.", "单独生活的个体占据洞穴，捕食蟹、蛤、鱼和鱿鱼。它可能拉开贝壳、用喙压碎，或钻孔注入唾液，并把硬质残骸留在洞口附近形成食物残堆。", ["general", "ecology"]),
      habitat: section("The species inhabits the North Pacific from Japan and Korea across the Aleutians to western North America and Mexico. It favors cool coastal rocky habitat, kelp areas and dens but has been recorded from tide pools to much deeper water.", "该物种分布于北太平洋，从日本、韩国经阿留申群岛到北美西岸和墨西哥。它偏好寒凉沿岸岩石生境、海带区和洞穴，但记录深度从潮池一直到远为深水处。", ["general", "range"]),
    },
    facts: [
      fact("average_mass", "Average mass", "平均体重", "About 60 kg in cited account", "所引资料约60千克", ["ecology"]),
      fact("arms", "Arms", "腕数", "8", "8条", ["general"]),
      fact("suckers", "Suckers", "吸盘", "Up to about 280 per arm", "每条腕最多约280个", ["ecology"]),
      fact("diet", "Diet", "食性", "Crabs, clams, fish and squid", "蟹、蛤、鱼和鱿鱼", ["ecology"]),
      fact("lifespan", "Lifespan", "寿命", "About 4.5–5 years", "约4.5–5年", ["ecology"]),
      fact("eggs", "Eggs", "产卵数", "About 20000–100000", "约20000–100000枚", ["ecology"]),
    ],
    life: section("Giant Pacific octopuses grow rapidly and mature around 3–5 years. A female mates 1 time, hangs roughly 20000–100000 eggs in her den and continuously cleans and aerates them for about 5 months to nearly 1 year without feeding; she dies around hatching, and males die after breeding.", "北太平洋巨型章鱼生长迅速，约3–5岁成熟。雌性一生交配1次，在洞穴中悬挂约20000–100000枚卵，并在约5个月到近1年期间不进食地持续清洁和充氧；她在孵化前后死亡，雄性也在繁殖后死亡。", ["ecology"]),
    adaptations: [
      adaptation("Instant camouflage", "瞬时伪装", "Chromatophores and skin muscles change color, pattern and texture to match rocks, kelp or sand.", "色素细胞和皮肤肌肉改变颜色、图案与纹理，以匹配岩石、海带或沙地。", ["general"]),
      adaptation("Chemosensory suckers", "化学感受吸盘", "Thousands of suckers combine grip, touch and chemical sensing so each arm can explore complex surfaces.", "数千个吸盘结合抓握、触觉和化学感受，使每条腕都能探索复杂表面。", ["ecology"]),
      adaptation("Flexible boneless body", "柔软无骨身体", "Without a rigid skeleton, the animal can squeeze through openings little wider than its hard beak.", "由于没有刚性骨骼，它能挤过只比坚硬喙部略宽的开口。", ["general"]),
    ],
    role: section("The giant Pacific octopus is a generalist predator of benthic animals and fish and is itself eaten by marine mammals and large fishes, especially when young. Shell middens near dens also concentrate hard remains and clues about local prey.", "北太平洋巨型章鱼是捕食底栖动物和鱼类的广食性捕食者，尤其幼年时也会被海洋哺乳动物和大型鱼类捕食。洞穴附近的贝壳残堆还会集中硬质残骸，记录当地猎物信息。", ["general", "ecology"]),
    conservation: { trend: "unknown", threats: b("The global status is Least Concern, but population trend is uncertain. Local fishing, bycatch, warming and deoxygenation may alter abundance, size and distribution, and the species' rapid one-time reproduction can make local monitoring important.", "全球等级为无危，但种群趋势不明。地方捕捞、兼捕、海水变暖和缺氧可能改变其数量、体型与分布；其快速生长且一生一次繁殖的生活史使地方监测尤为重要。"), actions: b("Track catch and bycatch, protect rocky and kelp habitat, include temperature and oxygen in surveys, and avoid assuming that a global LC assessment guarantees every local population is stable.", "应追踪捕获与兼捕，保护岩石和海带生境，在调查中纳入温度与溶氧，并避免把全球无危等级误解为每个地方种群都稳定。") },
    identification: { key: b("Very large reddish-brown octopus with a broad mantle, rough papillose skin, 8 thick arms and two rows of large suckers; color and texture can change within moments.", "体型很大，常呈红褐色，外套膜宽，皮肤粗糙有乳突，8条腕粗壮且有两列大吸盘；颜色和纹理可瞬间改变。"), similar: b("Several North Pacific octopuses overlap in color and can change appearance. Size alone is unreliable, especially for juveniles; high-quality views of mantle, skin, suckers and location should be checked by a cephalopod expert.", "北太平洋有多种章鱼体色重叠且都能变色。仅凭大小不可靠，尤其对幼体；应让头足类专家结合外套膜、皮肤、吸盘和地点的高质量视图鉴定。") },
    communication: section("Vision is acute, and skin color or posture can signal arousal as well as camouflage. Suckers taste and touch surfaces; the nervous system distributes much processing through the arms, but claims that each arm has an independent 'brain' are oversimplified.", "视觉敏锐，皮肤颜色和姿势除伪装外也可反映兴奋状态。吸盘能品尝并触摸表面；神经系统把大量处理分布到各腕，但把每条腕说成有一个独立“大脑”是过度简化。", ["general", "ecology"]),
    seasonal: section("Breeding can occur year-round with regional peaks. Development time is strongly temperature-dependent: cool water lengthens egg brooding, and juveniles spend an early planktonic period before settling to the bottom.", "全年都可能繁殖，但地区高峰不同。发育时间强烈受温度影响：冷水会延长护卵期；幼体先经历早期浮游阶段，再沉降到底部。", ["ecology"]),
    humans: section("The species supports aquarium education, research, diving tourism and fisheries. Captive individuals are famous for exploration and escape behavior, so welfare requires complex secure enclosures; wild dens should never be handled or blocked.", "该物种用于水族教育、科研、潜水旅游和渔业。人工个体以探索和逃逸行为闻名，因此福利需要复杂且安全的设施；野外洞穴绝不能被触碰或堵塞。", ["general"]),
    evolution: section("Giant Pacific octopuses are cephalopod mollusks, closer to squid and cuttlefish than to vertebrates. Their intelligence, camera-like eyes and flexible arms evolved independently from similar vertebrate capabilities, an example of convergent solutions.", "北太平洋巨型章鱼是头足类软体动物，与鱿鱼和乌贼的亲缘关系比与脊椎动物更近。它的智能、相机式眼睛和灵活腕足与脊椎动物的类似能力独立演化，是趋同解决方案的例子。", ["taxonomy", "general"]),
    field: section("A den may have a midden of freshly opened crab shells and clam valves outside. Empty shells alone are not species-specific; never reach into a crevice, move den stones or crowd an octopus for a photograph.", "洞穴外可能堆有新近打开的蟹壳和蛤壳残堆。空壳本身并非物种特有证据；绝不能把手伸进缝隙、移动洞石，或为拍照围堵章鱼。", ["ecology"]),
    know: [
      section("Each arm can carry up to about 280 suckers that both grip and sense chemicals.", "每条腕最多约有280个既能抓握又能感受化学物质的吸盘。", ["ecology"]),
      section("A brooding female guards and cleans tens of thousands of eggs without leaving to feed.", "护卵雌性会在不离巢进食的情况下守护并清洁数万枚卵。", ["ecology"]),
      section("Despite its large adult size, the species usually lives only about 5 years.", "尽管成体很大，该物种通常只生活约5年。", ["ecology"]),
    ],
    classSpecific: { title: b("Cephalopod nervous system", "头足类神经系统"), content: b("A large central brain coordinates a nervous system with many neurons in the arms, allowing rapid local sensing and flexible whole-body behavior.", "大型中央脑协调着大量神经元分布于腕部的神经系统，使局部快速感知与全身灵活行为得以结合。") },
    sources: {
      taxonomy: source("GBIF Backbone Taxonomy", "https://api.gbif.org/v1/species/match?name=Enteroctopus%20dofleini"),
      general: source("Monterey Bay Aquarium", "https://www.montereybayaquarium.org/animals/animals-a-to-z/giant-pacific-octopus"),
      ecology: source("Animal Diversity Web, University of Michigan Museum of Zoology", "https://animaldiversity.org/accounts/Enteroctopus_dofleini/"),
      conservation: source("IUCN status indexed by SeaLifeBase", "https://www.sealifebase.ca/summary/Enteroctopus-dofleini.html"),
      range: source("Monterey Bay Aquarium", "https://www.montereybayaquarium.org/animals/animals-a-to-z/giant-pacific-octopus"),
    },
  },
};

function taxonomyFromExisting(animal) {
  return animal.taxonomy;
}

function compileAnimal(id, profile) {
  const existing = JSON.parse(fs.readFileSync(path.join(ROOT, "data/animals", `${id}.json`), "utf8"));
  const hasPolygons = existing.habitat.global_distribution_polygons.length > 0;
  const encyclopedia = {
    anatomy: profile.encyclopedia.anatomy,
    ecology_and_behavior: profile.encyclopedia.ecology,
    habitat_and_distribution: profile.encyclopedia.habitat,
  };
  return {
    ...existing,
    content_version: 2,
    content_review: {
      factual_qc: "source-checked",
      bilingual_qc: "line-by-line-reviewed",
      reviewed_at: CHECKED,
      reviewer: "Codex source and bilingual audit",
      notes: "Species identity, taxonomy, protection status, numerical claims, English/Chinese scope and preserved legacy map geometry were checked for pilot batch 01.",
    },
    taxonomy: profile.taxonomy || taxonomyFromExisting(existing),
    conservation_status: profile.status,
    description: profile.description,
    encyclopedia,
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
        source_keys: profile.identification.source_keys || ["general"],
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
          ? "The previous center and polygon coordinates are retained exactly. Authoritative text sources support the broad distribution, but reusable authoritative boundary geometry was not available; the polygon is therefore labelled as a retained approximate legacy range, not a verified range."
          : "The previous representative center point is retained exactly. Authoritative text sources were checked, but no reusable authoritative polygon geometry was available; the point is explicitly labelled as not showing the full range.",
        comparison_zh: hasPolygons
          ? "原有中心点和多边形坐标完全保留。权威文字来源支持其大致分布，但未获得可复用的权威边界几何，因此该多边形标为“保留的原有近似范围”，而非“已核实范围”。"
          : "原有代表性中心点完全保留。已核查权威文字来源，但未获得可复用的权威多边形几何；页面明确标注该点并不表示完整分布范围。",
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
