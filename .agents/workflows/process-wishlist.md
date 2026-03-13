---
description: 许愿池动物批量处理与录入 (Workflow C) - 批量处理 ANIMAL_WISHLIST.md
---

# Workflow C: 许愿池动物批量处理与录入

> [!NOTE]
> 该工作流专用于处理 `ANIMAL_WISHLIST.md` 中的用户许愿池数据。为了避免 AI 上下文过长导致遗忘或格式出错，本工作流强制规定**每次最多处理 5 个动物**。每批次完成并经人工确认后，再清除许愿池对应条目，并可进入下一批次。

## 执行步骤

1. **读取许愿池**：阅读 `ANIMAL_WISHLIST.md`，提取状态为 ⏳ Pending 的动物列表。如果文件为空或没有 Pending 状态的动物，则终止流程并通知用户。
2. **切分批次**：取出前 5 个 Pending 的动物作为当前批次（如果不足 5 个则全部取出）。
3. **执行数据制造与严格质检 (遵循 Workflow B 严格标准)**
    * 针对这批次的每一个动物，按全局规范 `formatting.md` 搜集详尽的百科信息。语言必须生动有趣、包含硬核特征、中英双语完整。
    * **绝对规则**：**严格生成高精度多边形坐标**，并在 JSON 产出时强制对 `global_distribution_polygons` 数组进行**横向压缩排版**（one polygon per line）。
    * 写出对应的 JSON 文件到 `data/animals/<id>.json`。
    * **自我 QA**：检查生成的 JSON 是否是“种级(Species)”而非亚种；是否双语完整；中文标点是否使用了直角引号「」；多边形细节是否足够高精度且进行了横向排版。若有不符，自行打回修改。
4. **自动化脚本执行**
    * 执行图片抓取脚本 `node download_images.js`，自动下载这批新动物的照片。
    * 执行列表刷新脚本 `node update_animals_list.js`，将新动物追加到主目录的 `ANIMALS_LIST.md`。
    * 执行分类树生成脚本 `node build_taxonomy_tree.js`，同步重建 `data/taxonomy-tree.json` 供前端使用。
5. **AI 视觉质检**
    * 读取被下载下来的图片文件，利用视觉能力检查图片是否真的是该野生动物（避免漫威人物、Logo 等错误图片）。如有严重图文不符，必须 **报警 (Alert)** 提示用户。
6. **人工确认与状态清理**
    * 暂停任务，将本批次（最多 5 个）的处理结果及任何报警信息通过 `notify_user` 汇报给 Tony。
    * **等待 Tony 确认 (Approve)**。
    * 获得确认后，从 `ANIMAL_WISHLIST.md` 中**删除**这批成功处理完毕的 5 个动物所在行。
7. **批次循环提示**
    * 告诉 Tony 本批次处理已完全结束。并提示：如果许愿池中还有剩余未处理的动物，请再次召唤本工作流 `/process-wishlist` 以处理下方的批次。
