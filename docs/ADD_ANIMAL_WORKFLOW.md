# Wild Explorer — Add New Animal SOP

Standard Operating Procedure for adding new animals to Wild Explorer.

---

## Overview

This document provides a step-by-step workflow for Emily and Dad to add new animals to the app. The core idea: **fill animal names into the Prompt Template below, send it to an AI, paste the output into `animal_source.json`, and run a script to download images.**

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
    "map_zoom_level": 5
  },
  "image": null
}
```

Rules:
1. `id` must be lowercase-kebab-case of the English name (e.g., "Arctic Fox" → "arctic-fox").
2. `ui_tags` should contain 3 tags: [Class, Habitat-type, Diet-type]. Use existing tags when possible: Mammal, Bird, Reptile, Amphibian, Fish, Grassland, Forest, Mountains, Ocean, River, Desert, Tundra, Wetland, Herbivore, Carnivore, Omnivore, Insectivore.
3. `taxonomy` must use accurate biological classification from Wikipedia/ITIS. Each level is `{"en": "...", "zh": "..."}`.
4. `conservation_status.code` must be one of: LC, NT, VU, EN, CR (IUCN Red List).
5. `map_coordinates` should be [latitude, longitude] of a representative location (famous national park, primary habitat center, etc.). `map_zoom_level` is typically 4-7.
6. `encyclopedia` text must be factually accurate, based on Wikipedia-level knowledge, but written for a 9-year-old reader. Keep sentences short and vivid.
7. `image` should always be `null` (we download images separately).
8. Do NOT use curly/smart quotes in any text. For Chinese text needing quotation marks inside JSON strings, use 「」 (U+300C/U+300D).
9. Output ONLY the raw JSON array. No markdown fencing, no commentary.

[ANIMAL LIST]:
- Arctic Fox / 北极狐 / Vulpes lagopus
- Emperor Penguin / 帝企鹅 / Aptenodytes forsteri
- Red Panda / 小熊猫 / Ailurus fulgens
````

### Example: Adding 3 Animals at Once

Replace `[ANIMAL LIST]` with:

```
[ANIMAL LIST]:
- Arctic Fox / 北极狐 / Vulpes lagopus
- Emperor Penguin / 帝企鹅 / Aptenodytes forsteri
- Red Panda / 小熊猫 / Ailurus fulgens
```

If you only know the English name, that's fine too:

```
[ANIMAL LIST]:
- Komodo Dragon
- Blue Whale
- Snow Leopard
```

The AI will fill in the Chinese name and scientific name automatically.

---

## Step 3: Insert into animal_source.json

1. Open `animal_source.json` in your editor.
2. The file is a JSON array `[ ... ]`. Paste the new objects **before the closing `]`**, separated by commas.
3. Or, ask the AI in Cursor: "Please merge these new animals into animal_source.json."

---

## Step 4: Download Images

Open a new terminal and run:

```bash
node download_images.js
```

This script will:
- Find any animal with `"image": null`
- Download a photo from **iNaturalist** (using the scientific name) or **Wikipedia**
- Save it to `public/images/animals/{id}.jpg`
- Update the `image` field in `animal_source.json`

---

## Step 5: Verify

1. Run `npm run dev` (or it may already be running).
2. Open `http://localhost:3000` in your browser.
3. Check that the new animal cards appear on the dashboard.
4. Click a card to verify the detail page: taxonomy breadcrumbs, encyclopedia tabs, and map.

---

## Quick Reference: Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique kebab-case identifier |
| `name_en` | string | English common name |
| `name_zh` | string | Chinese common name |
| `scientific_name` | string | Binomial nomenclature (italicized in UI) |
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
| `image` | string \| null | Local path after download, null before |

---

## IUCN Conservation Status Codes

| Code | English | Chinese | Color in UI |
|------|---------|---------|-------------|
| LC | Least Concern | 无危 | Green |
| NT | Near Threatened | 近危 | Lime |
| VU | Vulnerable | 易危 | Amber |
| EN | Endangered | 濒危 | Orange |
| CR | Critically Endangered | 极危 | Red |

---

## Tips

- **Batch adding**: You can add up to 20 animals at once in a single prompt. For larger batches (50+), split into groups of 15-20 to avoid output truncation.
- **Accuracy check**: The AI's taxonomy and IUCN status are generally accurate but worth a quick Wikipedia cross-check for rare species.
- **Image fallback**: If `download_images.js` can't find a photo, the card will show a paw-print placeholder. You can manually save a `.jpg` to `public/images/animals/{id}.jpg` and update the JSON.
- **Custom tags**: If none of the existing `ui_tags` fit, feel free to create new ones. The UI will render them in a default gray style.
