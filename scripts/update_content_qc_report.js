const fs = require("fs");
const path = require("path");
const { readAnimals } = require("./lib/animal-schema");

const ROOT = path.join(__dirname, "..");
const records = readAnimals(path.join(ROOT, "data", "animals"));
const reviewed = records
  .map(({ animal }) => animal)
  .filter((animal) => animal.content_version === 2
    && animal.content_review?.factual_qc === "source-checked"
    && animal.content_review?.bilingual_qc === "line-by-line-reviewed")
  .sort((a, b) => a.name_en.localeCompare(b.name_en));
const pending = records.map(({ animal }) => animal).filter((animal) => animal.content_version !== 2);
const pendingByClass = new Map();

for (const animal of pending) {
  const className = animal.ui_tags?.[0] || "Unknown";
  pendingByClass.set(className, (pendingByClass.get(className) || 0) + 1);
}

const reviewedRows = reviewed.length > 0
  ? reviewed.map((animal) => `| ${animal.name_en} | ${animal.name_zh} | ${animal.scientific_name} | ${animal.content_review.reviewed_at} | ${animal.content_review.reviewer} |`).join("\n")
  : "| — | — | — | — | — |";
const classRows = [...pendingByClass.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([className, count]) => `| ${className} | ${count} |`)
  .join("\n");
const percentage = records.length === 0 ? "0.0" : ((reviewed.length / records.length) * 100).toFixed(1);

const report = `# Wild Explorer Content QC Progress

此文件由 \`npm run report:content-qc\` 生成。完成一条旧动物的事实与双语逐段审核后必须重新生成。

## Summary

- Total animals: ${records.length}
- Rich Content v2 with source QC and line-by-line bilingual QC: ${reviewed.length}
- Legacy records awaiting migration: ${pending.length}
- Completion: ${percentage}%

## Reviewed records

| English name | 中文名 | Scientific name | Reviewed at | Reviewer |
|---|---|---|---|---|
${reviewedRows}

## Remaining legacy records by class

| Class | Pending |
|---|---:|
${classRows}

## Required completion gate

每条完成记录必须同时满足：\`content_version: 2\`、逐 section 来源、\`factual_qc: source-checked\`、\`bilingual_qc: line-by-line-reviewed\`、自动双语一致性检查通过，以及图片身份与许可证单独审核。
`;

fs.writeFileSync(path.join(ROOT, "docs", "CONTENT_QC_PROGRESS.md"), report, "utf8");
console.log(`✅ Content QC report updated: ${reviewed.length}/${records.length} reviewed, ${pending.length} pending.`);

