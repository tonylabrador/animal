---
trigger: always_on
---

# Wild Explorer 动物数据规则

## 科学与内容

- 默认只收录种级二名法；家养型或特殊分类口径必须在 `sources` 中说明。
- 使用明确的分类权威和检查日期，不允许仅凭语言模型记忆。
- 内容面向约 9 岁读者：准确、清楚、有趣，但避免夸张和未经来源支持的断言。
- 所有新记录和替换记录必须使用 `content_version: 2`；`description`、三个 `encyclopedia` 模块和全部 `rich_content` 模块必须中英双语完整。
- 中文引号使用「」。
- 每个事实、卡片和 section 必须带非空 `source_keys`，并能解析到 `sources` 中的真实权威来源。
- 生成阶段 `content_review` 必须为 pending；逐段核对后才能写 `factual_qc: source-checked` 与 `bilingual_qc: line-by-line-reviewed`。
- 中英逐段审核必须核对数字、范围、单位、限定词、否定、物种名称和保护范围；事实型数字优先在两种语言中都使用阿拉伯数字，便于自动检查。
- quick facts 为 4–8 项；adaptations 和 did-you-know 各 3–5 项；class-specific 为 1–3 项。
- 数字写明范围、单位和背景；未知或存在争议时必须明确说明，不允许补猜测值。

## 结构

- `id` 为 lowercase-kebab-case。
- `ui_tags` 恰好三个：`[Class, Habitat, Diet]`；允许值见 `scripts/lib/animal-schema.js`。
- taxonomy 必须包含界、门、纲、目、科、属的中英文。
- IUCN code 允许 `EX/EW/CR/EN/VU/NT/LC/DD/NE`，地区性法规另放 `legal_status`。
- 新记录至少包含 `sources.taxonomy`、`sources.conservation`、`sources.general`、`sources.ecology` 与 `sources.range`；每项必须有 authority、真实 URL 和检查日期。
- 草稿中的 `image` 固定为 `null`。

## 地图

- 所有坐标严格使用 `[latitude, longitude]`。
- polygon 必须是闭合环，至少 4 个点（首尾相同），且不能是轴对齐矩形。
- 只有存在可信分布数据时才填写 polygon；否则使用 `[]` 和中心 marker。
- 禁止让 AI 编造“高精度”海岸线或分布边界。数据可信度高于视觉复杂度。
- JSON 使用标准两空格格式；不为追求“一行 polygon”破坏可读性。

任何正式发布前必须运行 `npm run validate:data`。
