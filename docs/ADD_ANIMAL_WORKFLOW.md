# Wild Explorer — Add New Animal SOP

Standard Operating Procedure for adding new animals to Wild Explorer.

---

## Overview

数据采用 **一物一文件** 架构：每只动物对应 `data/animals/[id].json`。  
添加新动物的流程：**用 AI 生成 JSON 数组 → 粘贴到草稿箱 `_draft_animals.json` → 运行导入脚本 → 运行图片下载脚本**。

---

## 数据与脚本位置

| 路径 | 说明 |
|------|------|
| `data/animals/*.json` | 正式数据，一物一文件；前端从这里读取 |
| `_draft_animals.json` | 草稿箱，粘贴 AI 生成的 JSON 数组，导入后会被自动清空 |
| `import_animals.js` | 将草稿箱中的动物写入 `data/animals/`，并清空草稿箱 |
| `download_images.js` | 为 `data/animals/` 中缺少图片的动物下载图片并写回对应 JSON |
| `update_animals_list.js` | 根据 `data/animals/` 生成根目录 **ANIMALS_LIST.md**（按纲/目/科分类的动物清单，便于追踪） |

---

## Step 1: Prepare Your Animal List

Decide which animals to add. You need:
- The **English common name** (e.g., "Arctic Fox")
- The **Chinese common name** (e.g., "北极狐")
- The **scientific name** (e.g., *Vulpes lagopus*) — if unsure, the AI will fill it in.

---

## Step 2: Generate JSON Data

Copy the **Prompt Template** below into any AI chat (Cursor, ChatGPT, Claude, etc.).  
Replace the `[ANIMAL LIST]` placeholder with your animals.

### Prompt Template

````
Role: You are a wildlife biologist and bilingual encyclopedia writer creating data for a children's animal education app. Target audience: 9-year-old readers.

Task: Generate a JSON **array** of animal objects for the animals listed below. Each object must EXACTLY match this schema (no extra fields, no missing fields):

```json
{
  "id": "arctic-fox",
  "name_zh": "北极狐",
  "name_en": "Arctic Fox",
  "scientific_name": "Vulpes lagopus",
  "ui_tags": ["Mammal", "Tundra", "Omnivore"],
  "taxonomy": {
    "kingdom": { "en": "Animalia", "zh": "动物界" },
    "phylum":  { "en": "Chordata", "zh": "脊索动物门" },
    "class":   { "en": "Mammalia", "zh": "哺乳纲" },
    "order":   { "en": "Carnivora", "zh": "食肉目" },
    "family":  { "en": "Canidae", "zh": "犬科" },
    "genus":   { "en": "Vulpes", "zh": "狐属" }
  },
  "conservation_status": {
    "code": "LC",
    "en": "Least Concern",
    "zh": "无危"
  },
  "description": {
    "en": "One-sentence overview in English.",
    "zh": "一句话中文概述。"
  },
  "encyclopedia": {
    "anatomy": {
      "en": "2-3 sentences: body size, weight, distinctive physical features.",
      "zh": "2-3句：体型、体重、独特的身体特征。"
    },
    "ecology_and_behavior": {
      "en": "2-3 sentences: diet, social structure, interesting behaviors.",
      "zh": "2-3句：饮食、社会结构、有趣行为。"
    },
    "habitat_and_distribution": {
      "en": "2-3 sentences: where they live, geographic range, notable locations.",
      "zh": "2-3句：栖息地、分布范围、知名地点。"
    }
  },
  "habitat": {
    "text_en": "Short habitat label in English",
    "text_zh": "栖息地短标签（中文）",
    "map_coordinates": [latitude, longitude],
    "map_zoom_level": 5,
    "global_distribution_polygons": [[[lng, lat], ...]]
  },
  "image": null
}
```

Rules:
1. `id` must be lowercase-kebab-case of the English name (e.g., "Arctic Fox" → "arctic-fox").
2. `ui_tags` should contain 3 tags: [Class, Habitat-type, Diet-type]. Use existing tags when possible: Mammal, Bird, Reptile, Amphibian, Fish, Grassland, Forest, Mountains, Ocean, River, Desert, Tundra, Wetland, Herbivore, Carnivore, Omnivore, Insectivore.
3. `taxonomy` must use accurate biological classification from Wikipedia/ITIS. Each level is `{"en": "...", "zh": "..."}`.
4. `conservation_status.code` must be one of: LC, NT, VU, EN, CR, DD (IUCN Red List).
5. `map_coordinates` should be [latitude, longitude]. `global_distribution_polygons` is an array of polygons, each polygon an array of [lat, lng] points (optional but recommended for map display).
6. `encyclopedia` text must be factually accurate, written for a 9-year-old reader.
7. `image` should always be `null` (we download images separately).
8. Do NOT use curly/smart quotes. For Chinese quotation marks inside JSON strings, use 「」 (U+300C/U+300D).
9. Output ONLY the raw JSON array. No markdown fencing, no commentary.

[ANIMAL LIST]:
- Arctic Fox / 北极狐 / Vulpes lagopus
- Emperor Penguin / 帝企鹅 / Aptenodytes forsteri
- Red Panda / 小熊猫 / Ailurus fulgens
````

### Example: Adding 3 Animals at Once

Replace `[ANIMAL LIST]` with your list. If you only know the English name, the AI can fill in Chinese and scientific name.

---

## Step 3: 粘贴到草稿箱并导入

1. 打开项目根目录下的 **`_draft_animals.json`**。
2. 将 AI 输出的 **纯 JSON 数组** 粘贴进去，替换原有内容（或合并到现有数组末尾）。确保是合法 JSON，例如 `[{ ... }, { ... }]`。
3. 在终端执行：

```bash
node import_animals.js
```

脚本会：
- 读取 `_draft_animals.json` 中的数组；
- 将每个动物写入/覆盖到 `data/animals/[id].json`；
- **导入完成后自动把 `_draft_animals.json` 清空为 `[]`**，方便下次粘贴。

若草稿箱为空，脚本会提示并直接退出。

---

## Step 4: Download Images

在终端执行：

```bash
node download_images.js
```

脚本会：
- 读取 **`data/animals/`** 目录下的所有 `.json` 文件；
- 对 `image` 为空且本地尚无 `public/images/animals/[id].jpg` 的动物，从 **iNaturalist**（学名）或 **Wikipedia**（英文名）下载图片；
- 将图片保存到 `public/images/animals/[id].jpg`，并更新对应 `data/animals/[id].json` 中的 `image` 字段。

已有图片的动物会被跳过，不会覆盖。

---

## Step 5: 更新动物清单（可选）

在根目录执行：

```bash
node update_animals_list.js
```

会刷新根目录的 **ANIMALS_LIST.md**，按纲 → 目 → 科列出所有已收录动物，便于追踪和避免重复添加。

---

## Step 6: Verify

1. 运行 `npm run dev`（若已在运行可忽略）。
2. 打开 `http://localhost:3000`，确认新动物卡片出现在首页。
3. 点进详情页检查：分类面包屑、百科 Tab、地图是否正常。

---

## Quick Reference: Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique kebab-case identifier |
| `name_en` | string | English common name |
| `name_zh` | string | Chinese common name |
| `scientific_name` | string | Binomial nomenclature |
| `ui_tags` | string[] | 3 tags: [Class, Habitat, Diet] |
| `taxonomy` | object | 6 levels: kingdom → genus, each bilingual |
| `conservation_status` | object | IUCN code + bilingual label |
| `description` | {en, zh} | One-sentence bilingual summary |
| `encyclopedia.anatomy` | {en, zh} | 2-3 sentences on body/size/features |
| `encyclopedia.ecology_and_behavior` | {en, zh} | 2-3 sentences on diet/social/behavior |
| `encyclopedia.habitat_and_distribution` | {en, zh} | 2-3 sentences on range/habitat |
| `habitat.text_en` / `text_zh` | string | Short habitat label |
| `habitat.map_coordinates` | [lat, lng] | Representative GPS point |
| `habitat.map_zoom_level` | number | Leaflet zoom (4-7 typical) |
| `habitat.global_distribution_polygons` | number[][][] | Optional; for distribution map |
| `image` | string \| null | Set by download script; use null in draft |

---

## IUCN Conservation Status Codes

| Code | English | Chinese | Color in UI |
|------|---------|---------|-------------|
| LC | Least Concern | 无危 | Green |
| NT | Near Threatened | 近危 | Lime |
| VU | Vulnerable | 易危 | Amber |
| EN | Endangered | 濒危 | Orange |
| CR | Critically Endangered | 极危 | Red |
| DD | Data Deficient | 数据缺乏 | Gray |

---

## Tips

- **批量添加**：单次可生成 15–20 只动物，避免 AI 截断。更多数量可分批生成、多次粘贴并执行 `import_animals.js`。
- **草稿箱**：每次导入后草稿箱会自动清空，如需保留副本请事先另存。
- **图片**：若下载脚本未找到图片，卡片会显示爪印占位；可手动将 `.jpg` 放到 `public/images/animals/[id].jpg`，并在 `data/animals/[id].json` 中设置 `"image": "/images/animals/[id].jpg"`。
- **新标签**：若现有 `ui_tags` 不够用，可新增；UI 会以默认样式显示。
