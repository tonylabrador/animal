# Wild Explorer — 安全添加动物 SOP

目标：任何新动物在正式发布前，都必须依次通过数据校验、图片许可证检查和人工视觉确认。

## 数据原则

- 一物一文件：`data/animals/<id>.json`。
- 学名默认使用种级二名法；家养型必须明确说明采用的分类口径。
- 坐标统一为 `[latitude, longitude]`。
- 没有可信范围数据时，`global_distribution_polygons` 必须为 `[]`。禁止编造矩形或“看起来精细”的范围。
- `ui_tags` 必须恰好是 `[Class, Habitat, Diet]`，值域由 `scripts/lib/animal-schema.js` 定义。
- IUCN 支持 `EX/EW/CR/EN/VU/NT/LC/DD/NE`，并使用标准中英文名称。
- 正式图片必须有 `data/image-attribution.json` 记录；新图只允许 CC0、CC BY、CC BY-SA 或明确的 Public Domain。

## A. 从许愿池准备草稿

```bash
node scripts/auto_process_wishlist.js
```

该命令每次最多读取 5 条许愿池记录，只写入 `_draft_animals.json`，不会发布、下载图片或删除许愿池条目。若任一条数据不符合 schema，整批停止。

也可以手工编辑 `_draft_animals.json`，但必须是 JSON 数组。

## B. 校验并导入

```bash
node validate_animals.js --draft
node import_animals.js --dry-run
node import_animals.js
```

导入器会先验证整批数据和全库唯一性，然后原子写入。已存在的 ID 默认拒绝覆盖；确需替换时使用 `--replace`，旧文件会备份到 `.import-backups/`。只有整批写入成功后才清空草稿。

## C. 准备图片候选

```bash
node download_images.js --ids arctic-fox,red-panda
```

脚本先解析精确的 iNaturalist taxon ID，再从 research-grade observations 和 Wikimedia Commons 中寻找开放许可候选。它会检查文件类型、尺寸和哈希，并写入：

```text
.image-review/<id>/review.html
.image-review/<id>/review.json
.image-review/<id>/1.jpg ...
```

绝不再使用“模糊搜索第一条结果”。

## D. 人工视觉确认

打开 `.image-review/<id>/review.html`，逐张核对：

- 是否确为目标物种，而非近缘种、亚种或旧分类下的其他物种；
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
node update_animals_list.js
node build_taxonomy_tree.js
npm run qc
```

处理许愿池时，只有 JSON 已发布、图片已人工批准且全库校验通过后，才能删除对应的许愿池行：

```bash
node scripts/auto_process_wishlist.js --finalize arctic-fox,red-panda
```

`--finalize` 只删除明确指定且已通过图片门禁的物种，不会弹出整个 batch。

## 常用维护命令

```bash
npm run validate:data       # 全库 schema、地图、图片、重复项和 attribution
npm run lint                # ESLint 9 / Next.js 16
npm run build               # 生产构建
npm run qc                  # 依次运行以上三项
```

`node scripts/apply_qc_fixes.js` 是本次历史数据迁移脚本，不是日常添加动物命令。
