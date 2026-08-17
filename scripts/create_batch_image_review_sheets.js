#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const batch = process.argv[2];
if (!batch) {
  console.error("Usage: node scripts/create_batch_image_review_sheets.js legacy-qc-batch-04");
  process.exit(1);
}
const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "qc-batches", `${batch}-baseline.json`), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "image-attribution.json"), "utf8"));
const ids = baseline.animals.map((animal) => animal.id).filter((id) => {
  if (manifest[id]?.license_status === "verified" && manifest[id]?.review_status === "human-approved") return false;
  return fs.existsSync(path.join(ROOT, ".image-review", id, "review.json"));
});
const escapeXml = (value) => String(value).replace(/[<>&'\"]/g, (character) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
})[character]);

async function tile(id) {
  const directory = path.join(ROOT, ".image-review", id);
  const review = JSON.parse(fs.readFileSync(path.join(directory, "review.json"), "utf8"));
  const candidate = review.candidates[0];
  const photo = await sharp(path.join(directory, "1.jpg"))
    .rotate()
    .resize(280, 210, { fit: "contain", background: "#111827" })
    .jpeg({ quality: 88 })
    .toBuffer();
  const label = await sharp({ create: { width: 280, height: 74, channels: 3, background: "#f8fafc" } })
    .composite([{ input: Buffer.from(`<svg width="280" height="74"><text x="10" y="24" font-family="Arial" font-size="16" font-weight="700" fill="#0f172a">${escapeXml(id)}</text><text x="10" y="45" font-family="Arial" font-size="13" fill="#334155">${escapeXml(review.scientific_name)}</text><text x="10" y="64" font-family="Arial" font-size="12" fill="#64748b">1 · ${escapeXml(candidate.license_code.toUpperCase())}</text></svg>`) }])
    .jpeg({ quality: 90 })
    .toBuffer();
  return { photo, label };
}

async function main() {
  const perPage = 20;
  const columns = 5;
  const tileWidth = 280;
  const tileHeight = 284;
  const pages = [];
  for (let offset = 0; offset < ids.length; offset += perPage) {
    const pageIds = ids.slice(offset, offset + perPage);
    const tiles = await Promise.all(pageIds.map(tile));
    const rows = Math.ceil(pageIds.length / columns);
    const width = columns * tileWidth;
    const height = rows * tileHeight;
    const composites = [];
    tiles.forEach((item, index) => {
      const left = (index % columns) * tileWidth;
      const top = Math.floor(index / columns) * tileHeight;
      composites.push({ input: item.label, left, top });
      composites.push({ input: item.photo, left, top: top + 74 });
    });
    const output = path.join(ROOT, ".image-review", `${batch}-overview-${pages.length + 1}.jpg`);
    await sharp({ create: { width, height, channels: 3, background: "#ffffff" } })
      .composite(composites)
      .jpeg({ quality: 90 })
      .toFile(output);
    pages.push(path.relative(ROOT, output));
  }
  console.log(`Created ${pages.length} overview sheets for ${ids.length} image candidates:\n${pages.join("\n")}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
