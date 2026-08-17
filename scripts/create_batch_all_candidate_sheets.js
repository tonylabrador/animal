#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const includePublished = process.argv.includes("--published");
const idsArg = process.argv.slice(2).find((argument) => !argument.startsWith("--")) || "";
const ids = idsArg.split(",").filter(Boolean);
if (ids.length === 0) {
  console.error("Usage: node scripts/create_batch_all_candidate_sheets.js id-one,id-two,...");
  process.exit(1);
}

const esc = (value) => String(value).replace(/[<>&'\"]/g, (character) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
})[character]);

async function animalRow(id) {
  const directory = path.join(ROOT, ".image-review", id);
  const review = JSON.parse(fs.readFileSync(path.join(directory, "review.json"), "utf8"));
  const width = includePublished ? 1500 : 1200;
  const height = 220;
  const candidateWidth = 300;
  const candidates = [];
  for (let index = 0; index < review.candidates.length; index += 1) {
    candidates.push(await sharp(path.join(directory, `${index + 1}.jpg`))
      .rotate().resize(candidateWidth, height, { fit: "contain", background: "#111827" }).jpeg({ quality: 88 }).toBuffer());
  }
  const label = Buffer.from(`<svg width="300" height="220"><rect width="100%" height="100%" fill="#f8fafc"/><text x="14" y="42" font-family="Arial" font-size="20" font-weight="700" fill="#0f172a">${esc(id)}</text><text x="14" y="72" font-family="Arial" font-size="16" fill="#334155">${esc(review.scientific_name)}</text><text x="14" y="110" font-family="Arial" font-size="15" fill="#64748b">Candidates ${review.candidates.length}</text></svg>`);
  const composites = [{ input: label, left: 0, top: 0 }];
  let candidateStart = 300;
  if (includePublished) {
    const publishedPath = path.join(ROOT, "public", "images", "animals", `${id}.jpg`);
    if (fs.existsSync(publishedPath)) {
      const published = await sharp(publishedPath).rotate().resize(candidateWidth, height, { fit: "contain", background: "#1e3a8a" }).jpeg({ quality: 88 }).toBuffer();
      composites.push({ input: published, left: 300, top: 0 });
    }
    candidateStart = 600;
  }
  candidates.forEach((input, index) => composites.push({ input, left: candidateStart + index * candidateWidth, top: 0 }));
  return sharp({ create: { width, height, channels: 3, background: "#111827" } }).composite(composites).jpeg({ quality: 90 }).toBuffer();
}

(async () => {
  const perPage = 8;
  const pages = [];
  for (let offset = 0; offset < ids.length; offset += perPage) {
    const pageIds = ids.slice(offset, offset + perPage);
    const rows = await Promise.all(pageIds.map(animalRow));
    const output = path.join(ROOT, ".image-review", `all-candidates-${pages.length + 1}.jpg`);
    await sharp({ create: { width: includePublished ? 1500 : 1200, height: rows.length * 220, channels: 3, background: "#ffffff" } })
      .composite(rows.map((input, index) => ({ input, left: 0, top: index * 220 })))
      .jpeg({ quality: 90 }).toFile(output);
    pages.push(output);
  }
  console.log(pages.join("\n"));
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
