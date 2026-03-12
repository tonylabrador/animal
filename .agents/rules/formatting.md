---
trigger: always_on
---

# JSON Formatting Rule

- **Formatting**: 在生成 JSON 文件时，`global_distribution_polygons` 需采用横向排列 (one polygon per line)，保持文件简洁。

# 🌍 Antigravity - Wild Explorer 动物数据开发规范 (Animal Develop Rules)

本规范旨在确保 Wild Explorer 数据库中所有动物 JSON 数据的高度统一性、科学严谨性以及趣味性，同时兼顾底层地图系统的高精度渲染。

## 1. 核心工作流 (Core Workflow)

1. **查重校验**：在生成任何新动物数据前，必须严格比对最新的 `ANIMALS_LIST.md`，绝对不允许生成已存在的动物。
2. **级别确认**：所有生成的动物必须是**种级 (Species)** 的正式名称，**严禁使用亚种 (Subspecies)** 的名称或仅提供属名（除非有特殊要求）。

## 2. 内容撰写标准 (Content Guidelines)

* **双语支持**：`description` 和 `encyclopedia` 等长文本必须严格包含英文 (`en`) 和中文 (`zh`)。
* **目标受众**：
  * 语言需生动有趣，避免极其干涩的学术表达。
  * 必须包含该动物最独特、最抓人眼球的「硬核」特征（如：不朽水母的返老还童、食蚁兽的舌头等）。
  * 尽量详细，科学
* **中文标点符号**：在中文文本中，**必须严格使用直角引号「」**，绝对不允许使用弯引号 “” 或英文双引号 ""。

## 3. 地理与坐标规范 (Map & Coordinates Rules)

这是前端地图渲染的核心，**严禁偷懒**：

1. **坐标顺序**：严格遵守 `[latitude, longitude]`（纬度, 经度）的格式。
2. **精度要求**：`global_distribution_polygons`（分布多边形）必须**高精度贴合真实的地理环境**（如海岸线轮廓、山脉走向、沙漠真实边界）。**严禁使用敷衍的四个点画“大方块”**。
3. **排版格式**：多边形的坐标数组必须在代码中**横向压缩（写在同一行）**，避免 JSON 垂直占据过长篇幅，便于开发者一键复制。

## 4. JSON 字段详尽定义 (JSON Schema Requirements)

每个动物的 JSON 结构必须严格包含以下字段，不得遗漏或更改键名：

* `id`: 英文短横线命名 (kebab-case)，如 `black-footed-cat`。
* `name_zh`: 中文俗名。
* `name_en`: 英文俗名。
* `scientific_name`: 二名法正式拉丁学名（种级）。
* `ui_tags`: 包含 3 个元素的数组，通常为 `["大类/纲", "典型生境", "食性"]`（例如 `["Mammal", "Desert", "Carnivore"]`）。
* `taxonomy`: 必须包含界 (kingdom)、门 (phylum)、纲 (class)、目 (order)、科 (family)、属 (genus) 完整的双语信息。
* `conservation_status`: 必须包含国际自然保护联盟 (IUCN) 的代码、英文和中文（如 `{"code": "VU", "en": "Vulnerable", "zh": "易危"}`）。
* `description`: 一句话精炼总结该动物的最亮眼特征（双语）。
* `encyclopedia`: 包含三个子模块，每个模块字数充实（双语）：
  * `anatomy`（解剖与形态）：描述独特的外貌、大小、特殊生理结构。
  * `ecology_and_behavior`（生态与行为）：描述捕猎技巧、繁衍方式、社会结构或防卫机制。
  * `habitat_and_distribution`（栖息地与分布）：描述其具体的全球地理分布和偏好的微生境。
* `habitat`:
  * `text_en` / `text_zh`: 简短的栖息地描述（如 "Arid deserts and savannas"）。
  * `map_coordinates`: 动物分布中心的默认经纬度 `[lat, lng]`。
  * `map_zoom_level`: 地图默认缩放层级（通常为 3 到 6）。
  * `global_distribution_polygons`: 包含高精度坐标点阵列的三维数组 `[[[lat, lng], ...]]`。
* `image`: 固定为 `null`（占位符，通过后续脚本抓取图片）。


EXAMPLE JSON FILE:

{
  "id": "addax",
  "name_zh": "旋角羚",
  "name_en": "Addax",
  "scientific_name": "Addax nasomaculatus",
  "ui_tags": [
    "Mammal",
    "Desert",
    "Herbivore"
  ],
  "taxonomy": {
    "kingdom": {
      "en": "Animalia",
      "zh": "动物界"
    },
    "phylum": {
      "en": "Chordata",
      "zh": "脊索动物门"
    },
    "class": {
      "en": "Mammalia",
      "zh": "哺乳纲"
    },
    "order": {
      "en": "Artiodactyla",
      "zh": "偶蹄目"
    },
    "family": {
      "en": "Bovidae",
      "zh": "牛科"
    },
    "genus": {
      "en": "Addax",
      "zh": "旋角羚属"
    }
  },
  "conservation_status": {
    "code": "CR",
    "en": "Critically Endangered",
    "zh": "极危"
  },
  "description": {
    "en": "The addax is a desert-dwelling antelope known for its spiral horns and its incredible ability to survive without drinking water.",
    "zh": "旋角羚是一种生活在沙漠中的羚羊，以其螺旋状的角和不喝水也能生存的惊人能力而闻名。"
  },
  "encyclopedia": {
    "anatomy": {
      "en": "Addax are stocky antelopes with long, twisted horns that can reach 85 centimeters. They have broad, flat hooves that prevent them from sinking into the soft desert sand, much like natural snowshoes.",
      "zh": "旋角羚体型粗壮，长着可达85厘米的长螺旋角。它们长有宽大平坦的蹄子，可以防止它们陷进柔软的沙漠沙地中，就像天然的雪鞋一样。"
    },
    "ecology_and_behavior": {
      "en": "They are perfectly adapted to the Sahara, getting most of their water from the plants they eat. Addax are most active during the night or early morning to avoid the scorching heat of the desert sun.",
      "zh": "它们完美适应了撒哈拉沙漠的生活，大部分水分从所食植物中获取。旋角羚在夜间或清晨最为活跃，以躲避沙漠阳光的酷热。"
    },
    "habitat_and_distribution": {
      "en": "Once widespread across the Sahara, the addax is now critically endangered. Only a few small populations remain in isolated parts of Niger and Chad. They are among the rarest mammals in the world.",
      "zh": "旋角羚曾广泛分布于撒哈拉沙漠，但现在已处于极度濒危状态。目前仅在尼日尔和查德的偏远地区留有极少数小种群。它们是世界上最稀有的哺乳动物之一。"
    }
  },
  "habitat": {
    "text_en": "Arid Desert and Semi-desert",
    "text_zh": "干旱沙漠与半沙漠",
    "map_coordinates": [
      16,
      11
    ],
    "map_zoom_level": 5,
    "global_distribution_polygons": [
      [[15, 10.5], [17.5, 10.5], [17.5, 12], [15, 12], [15, 10.5]],
      [[16, 15], [18, 15], [18, 17], [16, 17], [16, 15]]
    ]
  },
  "image": "/images/animals/addax.jpg"
}