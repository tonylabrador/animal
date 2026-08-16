# Wild Explorer / 动物探索笔记

一份安静的双语动物笔记 (A quiet, bilingual animal notebook). 

这是一个纯粹的个人业余项目，整理了我收集的动物百科内容。界面极其简单，没有商业广告，也没有评论区。它唯一的目的，是为寻找优质内容的家长、儿童以及语言学习者提供一个不被打扰的阅读空间。

This is a non-commercial, distraction-free personal project. It categorizes and details various animals in both English and Chinese, serving as a quiet educational resource for curious kids, parents, and language learners.

## Features / 特点

* **Bilingual Learning (双语学习)**
  所有动物词条均提供中英对照科普。
  Every animal entry features side-by-side English and Chinese descriptions.
* **Distraction-Free UI (极简无打扰)**
  排版克制，没有花哨的动效和引导弹窗，专注文字内容与自然影像。
  A clean layout prioritizing text and high-quality photography.
* **Family-Friendly (适合亲子共读)**
  科普语言平实自然，是一份非常适合家庭共读的“笔记”。
  The tone is educational but highly accessible, forming a basic nature journal for younger audiences.
* **Scientific Taxonomy (科学分类)**
  包含从界(Kingdom)到属(Genus)的科学分类信息。
  Structured biological classification from kingdom to genus.

---

## Local Development / 常用命令

* **校验草稿 / Validate Draft**
  `node validate_animals.js --draft`
* **安全导入 / Safe Import**
  `node import_animals.js --dry-run`，确认后执行 `node import_animals.js`
* **准备图片候选 / Prepare Image Candidates**
  `node download_images.js --ids <animal-id>`
* **人工批准图片 / Approve Image**
  `node download_images.js --approve <animal-id>:1`
* **全库 QC / Full QC**
  `npm run qc`

(详细工作流请见 [docs/ADD_ANIMAL_WORKFLOW.md](docs/ADD_ANIMAL_WORKFLOW.md)，当前审核范围与遗留项请见 [docs/QC_REPORT_2026-08-16.md](docs/QC_REPORT_2026-08-16.md)。)
