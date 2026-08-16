---
description: 生成动物草稿并通过数据与图片发布门禁
---

# Workflow B：生成、校验、图片审核、发布

1. 从 `ANIMAL_TO_ADD.md` 读取最多 5 个种级条目，先检查现有 ID、俗名和学名是否重复。
2. 只生成到 `_draft_animals.json`，不要直接写 `data/animals/`。
3. 遵守 `.agents/rules/formatting.md`，并运行：
   - `node validate_animals.js --draft`
   - `node import_animals.js --dry-run`
4. 向用户展示草稿摘要。获得确认后运行 `node import_animals.js`。
5. 只为本批 ID 运行 `node download_images.js --ids <ids>`。
6. 必须实际查看 `.image-review/<id>/` 中的候选图片。地图、Logo、警示牌、插画、近缘种和主体不清晰的图片不能批准。
7. 用 `--approve id:n` 发布通过的图片；无合格候选时用 `--reject id`，不得用不相关图片凑数。
8. 运行 `npm run qc`。全部成功后重建 `ANIMALS_LIST.md` 和 `data/taxonomy-tree.json`。
9. 只有已成功发布并审核的条目才能从 `ANIMAL_TO_ADD.md` 删除；失败项必须保留并说明原因。
