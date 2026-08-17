# Wild Explorer Rich Content v2

`content_version: 2` 是所有新动物和被替换动物的发布标准。旧记录可继续显示，但只有 v2 记录会展示完整的丰富内容模块。

每条 v2 记录还必须有 `content_review`。生成器只能写 `pending`；完成逐条来源复核和中英逐段对照后，才允许写入 `source-checked` 与 `line-by-line-reviewed`。

每条 v2 记录还必须在 `habitat.range_review` 记录地图审查：显示的是权威多边形、保留的原有近似范围还是代表点，引用哪些分布来源、与旧范围相比发生了什么，以及中英文一致的变更理由。`display_mode` 必须与 `global_distribution_polygons` 是否为空相匹配。旧多边形没有明显错误但缺少可复用权威几何时，使用 `legacy-polygon-retained`，不得误标为 `verified-polygon`，更不得为方便而缩成一个点。

## 页面信息架构

### 快速浏览层

1. 名称、学名、图片、IUCN 状态与标签
2. `quick_facts`：4–8 个结构化双语事实
3. 双语简介
4. `adaptations`：3–5 个“特征 + 功能”卡片

### 深入阅读层

原有三个模块继续保留：

- `encyclopedia.anatomy`
- `encyclopedia.ecology_and_behavior`
- `encyclopedia.habitat_and_distribution`

v2 新增：

- `life_cycle_and_reproduction`：求偶、繁殖、发育、成熟与寿命
- `ecological_role`：食物网、授粉/传播种子、生态系统功能
- `conservation_and_threats`：种群趋势、威胁与保护行动
- `identification`：关键识别特征与相似物种
- `communication_and_senses`：声音、视觉、气味及特殊感官
- `seasonal_calendar`：繁殖、迁徙、换羽、冬眠或其他年度节律
- `relationship_with_humans`：文化、利用、冲突与安全相处
- `evolution`：近缘关系、演化特征与可靠的化石背景
- `field_signs`：叫声、足迹、巢、卵、蜕皮或其他野外踪迹
- `did_you_know`：3–5 条不重复、可追溯的短知识
- `class_specific`：1–3 个类群专属模块

## 类群专属模块选择

| 类群 | 优先模块 |
|---|---|
| Bird | 鸣声、迁徙、筑巢、卵、换羽 |
| Mammal | 社会结构、妊娠、哺乳、领地 |
| Fish | 水深、盐度、洄游、鱼群、发光 |
| Amphibian | 变态发育、皮肤呼吸、毒素、繁殖水体 |
| Reptile | 体温调节、蜕皮、毒液、产卵方式 |
| Insect | 变态、寄主植物、群落等级、拟态 |
| Arachnid | 结网、毒液、捕食感官、蜕皮 |
| Crustacean | 蜕壳、幼体阶段、盐度、洄游 |
| Mollusk | 贝壳/外套膜、齿舌、喷墨、幼体阶段 |
| Cnidarian | 刺细胞、世代阶段、毒性、季节性暴发 |
| Invertebrate | 选择最能解释该物种生活史的 1–3 项 |

## 来源与事实粒度

- `sources` 是来源字典；每个来源必须包含 `authority`、真实 `url` 和 `checked_at`。
- 每个 section、事实和卡片必须使用 `source_keys` 指向 `sources` 中的条目。
- 同一权威可以支持多个 section；一个 section 也可以引用多个来源。
- 数字必须写清范围、单位、性别/年龄/野生或圈养背景。来源互相冲突时，正文说明差异，不取虚假精确值。
- IUCN 全球等级、地区性保护等级和法律地位不能混用。
- 未知信息必须写为未知，不能为了字段完整而猜测。

## 新记录门禁

`node validate_animals.js --draft` 和 `node import_animals.js` 会强制要求：

- `content_version` 为 `2`
- 4–8 个 quick facts
- 3–5 个 adaptations
- 3–5 个 did-you-know facts
- 1–3 个 class-specific modules
- 所有 rich sections 中英文完整
- 所有 `source_keys` 均能解析到有效来源
- v2 来源具有 authority、HTTP(S) URL 和 `YYYY-MM-DD` 检查日期
- `content_review` 的事实与双语审核状态均已完成，并记录日期和审核者
- 自动双语 QC 中的数字、范围和单位一致性检查通过

全库验证允许 legacy 记录继续存在，并发出升级提示，而不是阻塞现有站点。
