# Wild Explorer — 安全添加动物 SOP

目标：任何新动物在正式发布前，都必须依次通过物种身份确认、Rich Content v2 内容审核、数据校验、图片许可证检查和人工视觉确认。

完整字段定义与类群专属模块见 [RICH_CONTENT_SCHEMA.md](RICH_CONTENT_SCHEMA.md)。

## 数据原则

- 一物一文件：`data/animals/<id>.json`。
- 学名默认使用种级二名法；家养型必须明确说明采用的分类口径。
- 坐标统一为 `[latitude, longitude]`。
- 没有可信范围数据时，`global_distribution_polygons` 必须为 `[]`。禁止编造矩形或“看起来精细”的范围。
- 判定“没有可信范围数据”之前，必须依次查找 IUCN 空间数据、类群权威/政府数据和同行评议分布图。旧动物升级时必须比较旧坐标/多边形与新结果，并在 `habitat.range_review` 记录保留、替换或因不可验证而移除的理由。
- `ui_tags` 必须恰好是 `[Class, Habitat, Diet]`，值域由 `scripts/lib/animal-schema.js` 定义。
- IUCN 支持 `EX/EW/CR/EN/VU/NT/LC/DD/NE`，并使用标准中英文名称。
- 正式图片必须有 `data/image-attribution.json` 记录；新图只允许 CC0、CC BY、CC BY-SA 或明确的 Public Domain。
- 新动物和被替换动物必须使用 `content_version: 2`，不得继续创建 legacy 三段式记录。
- 每个事实和 section 必须通过 `source_keys` 指向真实来源；禁止用一个泛化主页支撑整条记录。
- “内容丰富”不等于堆叠文字。数字写范围与背景，section 之间避免重复，未知项明确写未知。
- 生成阶段的 `content_review` 必须保持 `pending`。只有逐条核对事实来源并逐段对照中英文后，才能改为 `source-checked` 与 `line-by-line-reviewed`。

## 双语逐段 QC 门禁

中英文必须表达同一事实，而不只是“读起来都合理”。每一组字段按以下顺序对照：

1. 主语是否为同一物种、性别、年龄或种群；
2. 数字、范围、单位、日期与时间段是否完全相同；
3. `about`、`up to`、`usually`、`may`、`unknown` 等限定和不确定性是否保留；
4. 否定、因果、比较级与“全球/地区”范围是否一致；
5. 近缘种、地名、保护等级和机构名称是否准确对应；
6. 中文是否自然清楚，英文是否无中式表达，同时不得为追求流畅添加原文没有的事实。

先运行自动检查：

```bash
node scripts/qc_bilingual_content.js --draft
```

自动检查会阻止中英文数字不一致、缺失字段和占位文字，并提示可能遗漏的近似值、上限与频率限定词。它不能替代语义审核；审核者仍须逐段阅读全部配对字段。完成后写入：

```json
"content_review": {
  "factual_qc": "source-checked",
  "bilingual_qc": "line-by-line-reviewed",
  "reviewed_at": "YYYY-MM-DD",
  "reviewer": "reviewer name"
}
```

## 分布地图 QC 门禁

地图信息也属于内容审核，不能只检查 JSON 坐标是否合法：

1. 保存修改前的中心点、缩放级别和全部多边形，逐项与新结果比较；
2. 尽量寻找可追溯的权威空间数据，范围文字来源不能自动当作多边形坐标来源；
3. 有权威几何时使用 `verified-polygon`；旧记录的多边形若没有明显错误、但尚未获得可复用的权威几何，必须原样保留并使用 `legacy-polygon-retained`，页面标为“保留的原有近似范围”；只有没有可保留范围时才允许 `representative-point`，并明确说明该点不是完整分布范围；
4. `range_review.source_keys` 必须支持分布判断，`comparison_en/zh` 必须准确对应并说明新旧差异；
5. 分别测试英文地图和中文地图；中文地图还必须模拟主瓦片源失败，确认国内备用线路会自动接管；
6. 图钉、范围线和降级提示不得依赖可能在中国无法访问的外部静态资源。

## 0. 物种与来源预检

开始写 JSON 前先建立 evidence sheet（可记录在任务说明或草稿审查摘要中）：

1. 用分类权威确认接受学名、种级身份和同物异名。
2. 用 IUCN 物种页面确认全球等级、评估年份和 population trend。
3. 找到至少一个覆盖形态/生活史的权威来源，以及一个覆盖生态/分布的来源。
4. 先列出相似物种和可见区分点，供后续图片搜索与视觉 QC 使用。
5. 如果权威资料不足，保留“未知”，不要生成伪精确数字或趣闻。

## A. 从许愿池准备 v2 草稿

```bash
node scripts/auto_process_wishlist.js
```

该命令每次最多读取 5 条许愿池记录，只写入 `_draft_animals.json`，不会发布、下载图片或删除许愿池条目。若任一条数据不符合 schema，整批停止。

也可以手工编辑 `_draft_animals.json`，但必须是 JSON 数组，并以 `.agents/skills/add-animal/assets/animal-v2-template.json` 为结构模板。

草稿审核必须逐项检查：

- quick facts 的数字、单位与适用背景；
- 生命周期、繁殖、生态角色和保护内容是否互相矛盾；
- adaptations 是否解释了功能，而不只是重复外形；
- identification 是否点名相似物种并给出可靠区分点；
- did-you-know 是否有来源且没有重复正文；
- class-specific 模块是否适合该动物类群；
- 中英文是否表达同一组事实；
- 所有阿拉伯数字、范围和单位是否在两种语言中一致；
- 每个 `source_keys` 是否能打开并支持对应内容。

## B. 校验并导入

```bash
node validate_animals.js --draft
node import_animals.js --dry-run
node import_animals.js
```

导入器会先验证整批数据和全库唯一性，然后原子写入。已存在的 ID 默认拒绝覆盖；确需替换时使用 `--replace`，旧文件会备份到 `.import-backups/`。只有整批写入成功后才清空草稿。

替换导入还会把 `range_review.previous_result` 与磁盘上的旧几何实际比较：标记 `retained` 时坐标和多边形必须不变，标记 `replaced` 时必须发生变化，标记 `removed-unverified` 时必须确有旧多边形且新多边形为空。新动物只能使用 `not-applicable`。

## C. 准备图片候选

```bash
node download_images.js --ids arctic-fox,red-panda
```

脚本先解析精确的 iNaturalist taxon ID，再从 research-grade observations 和 Wikimedia Commons 中寻找开放许可候选。搜索时必须把草稿中 `identification` 的识别特征与相似物种作为审核基准。脚本会检查文件类型、尺寸和哈希，并写入：

```text
.image-review/<id>/review.html
.image-review/<id>/review.json
.image-review/<id>/1.jpg ...
```

绝不再使用“模糊搜索第一条结果”。

## D. 人工视觉确认

打开 `.image-review/<id>/review.html`，逐张核对：

- 是否确为目标物种，而非近缘种、亚种或旧分类下的其他物种；
- 照片可见特征是否与 `rich_content.identification.key_features` 一致；若关键特征不可见，不能仅凭文件名批准；
- 是否可能属于 `similar_species` 中列出的易混淆物种；
- 是否是动物主体照片，而非地图、Logo、警示牌、玩具、书封或占位图；
- 主体是否足够清楚；
- attribution 和许可证是否合理。

批准候选：

```bash
node download_images.js --approve arctic-fox:1,red-panda:2
```

没有合格图时：

```bash
node download_images.js --reject arctic-fox
```

如果现有图片本身也无法确认到物种级，直接从线上隐藏并移入隔离区：

```bash
node download_images.js --hide arctic-fox
```

批准操作会原子替换正式图片并记录来源、taxon ID、photo ID、作者、许可证、尺寸、哈希和审核时间。拒绝操作会保留已确认相关但质量不够理想的旧图，并标记为 `replacement-needed`；隐藏操作用于无法确认物种的图片，会将文件移入 `public/images/quarantine/` 并让页面显示占位图。

## E. 发布门禁与收尾

```bash
node validate_animals.js
node scripts/qc_bilingual_content.js
node update_animals_list.js
node build_taxonomy_tree.js
npm run qc
```

处理许愿池时，只有 JSON 已发布、图片已人工批准且全库校验通过后，才能删除对应的许愿池行：

```bash
node scripts/auto_process_wishlist.js --finalize arctic-fox,red-panda
```

`--finalize` 只删除明确指定且已通过图片门禁的物种，不会弹出整个 batch。

发布摘要必须记录：物种名称、content version、关键来源、IUCN 评估、图片来源与许可证、人工图片审核结论、QC 结果。任何一步存在未解决疑点时都不能 finalize。

每完成一条旧动物的逐条升级后运行 `npm run report:content-qc`，更新 `docs/CONTENT_QC_PROGRESS.md`。旧动物不得仅用批量翻译直接标记为审核完成。

## 常用维护命令

```bash
npm run validate:data       # 全库 schema、地图、图片、重复项和 attribution
npm run qc:bilingual        # 所有 v2 记录的自动双语一致性检查
npm run report:content-qc   # 更新旧动物逐条审核进度
npm run lint                # ESLint 9 / Next.js 16
npm run build               # 生产构建
npm run qc                  # 依次运行以上三项
```

`node scripts/apply_qc_fixes.js` 是本次历史数据迁移脚本，不是日常添加动物命令。
