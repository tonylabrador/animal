---
description: 安全处理许愿池，每批最多 5 条，不在审核前发布或删除
---

# Workflow C：许愿池安全处理

1. 运行 `node scripts/auto_process_wishlist.js`，仅准备最多 5 条草稿。
2. 检查 `_draft_animals.json` 的名称、分类、IUCN、双语内容和来源；运行 `node validate_animals.js --draft`。
3. 向 Tony 汇报草稿并等待批准。
4. 批准后运行 `node import_animals.js`，再只为新 ID 准备图片候选。
5. 实际查看每个候选图。用 `--approve id:n` 发布，或用 `--reject id` 标记待替换。
6. 运行 `npm run qc`。任一步失败都保留许愿池原行。
7. 只有 JSON、图片许可证、人工视觉审核和全库 QC 都通过时，才运行：

   ```bash
   node scripts/auto_process_wishlist.js --finalize <id1,id2>
   ```

8. `--finalize` 只清除精确匹配且已批准的条目，并同步最近添加列表、动物清单和分类树。

禁止使用旧的“无人值守循环清空许愿池”方式。
