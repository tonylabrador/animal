---
description: 生成动物草稿并通过数据与图片发布门禁
---

# Workflow B：生成、校验、图片审核、发布

1. 从 `ANIMAL_TO_ADD.md` 读取最多 5 个种级条目，先检查现有 ID、俗名和学名是否重复。
2. 先核对分类权威、IUCN 页面、生活史来源和分布来源，并记录相似物种与可见识别点。
3. 只生成 `content_version: 2` 到 `_draft_animals.json`，不要直接写 `data/animals/`。使用 `.agents/skills/add-animal/assets/animal-v2-template.json`，完整填写 rich content 和逐 section `source_keys`。
4. 遵守 `.agents/rules/formatting.md`，逐项审核 quick facts、生命周期、生存适应、生态角色、保护、识别、感官、年度节律、人类关系、演化、踪迹、冷知识和类群专属模块。逐段对照中英文本，核对数字、单位、范围、限定词、否定和专名，然后运行：
   - `node scripts/qc_bilingual_content.js --draft`
   - `node validate_animals.js --draft`
   - `node import_animals.js --dry-run`
5. 自动与逐段审核通过后，填写 `content_review` 的 completed 状态、日期和审核者。向用户展示草稿摘要、关键来源、未知项、双语 QC 结论和图片识别标准。获得确认后运行 `node import_animals.js`。
6. 只为本批 ID 运行 `node download_images.js --ids <ids>`。
7. 必须实际查看 `.image-review/<id>/` 中的候选图片，并逐项对照 `identification.key_features` 与 `similar_species`。地图、Logo、警示牌、插画、近缘种和主体不清晰的图片不能批准。
8. 用 `--approve id:n` 发布通过的图片；无合格候选时用 `--reject id`，不得用不相关图片凑数。
9. 运行 `npm run qc` 和 `npm run report:content-qc`。全部成功后重建 `ANIMALS_LIST.md` 和 `data/taxonomy-tree.json`。
10. 只有已成功发布并审核的条目才能从 `ANIMAL_TO_ADD.md` 删除；失败项必须保留并说明原因。
