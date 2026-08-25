#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const decisionsArg = process.argv[2];
if (!decisionsArg) {
  console.error("Usage: node scripts/create_selected_image_review_sheets.js docs/qc-batches/decisions.json");
  process.exit(1);
}
const decisionsPath = path.isAbsolute(decisionsArg) ? decisionsArg : path.join(ROOT, decisionsArg);
const decisions = JSON.parse(fs.readFileSync(decisionsPath, "utf8"));
const esc = (value) => String(value).replace(/[<>&'\"]/g, (character) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
})[character]);

async function tile(decision) {
  const photoPath = path.join(ROOT, ".image-review", decision.id, `${decision.candidate}.jpg`);
  const photo = await sharp(photoPath).rotate().resize(390, 280, { fit: "contain", background: "#111827" }).jpeg({ quality: 92 }).toBuffer();
  const label = Buffer.from(`<svg width="390" height="76"><rect width="100%" height="100%" fill="#f8fafc"/><text x="12" y="25" font-family="Arial" font-size="18" font-weight="700" fill="#0f172a">${esc(decision.id)} · ${decision.candidate}</text><text x="12" y="49" font-family="Arial" font-size="15" font-style="italic" fill="#334155">${esc(decision.scientific_name)}</text><text x="12" y="68" font-family="Arial" font-size="12" fill="#64748b">${esc(decision.source)} · ${esc(String(decision.license).toUpperCase())}</text></svg>`);
  return sharp({ create: { width: 390, height: 356, channels: 3, background: "#fff" } })
    .composite([{ input: label, left: 0, top: 0 }, { input: photo, left: 0, top: 76 }])
    .jpeg({ quality: 92 }).toBuffer();
}

(async () => {
  const perPage = 12;
  const columns = 3;
  const pages = [];
  for (let offset = 0; offset < decisions.approvals.length; offset += perPage) {
    const batch = decisions.approvals.slice(offset, offset + perPage);
    const tiles = await Promise.all(batch.map(tile));
    const rows = Math.ceil(batch.length / columns);
    const output = path.join(ROOT, ".image-review", `selected-${pages.length + 1}.jpg`);
    await sharp({ create: { width: columns * 390, height: rows * 356, channels: 3, background: "#fff" } })
      .composite(tiles.map((input, index) => ({ left: (index % columns) * 390, top: Math.floor(index / columns) * 356, input })))
      .jpeg({ quality: 92 }).toFile(output);
    pages.push(output);
  }
  console.log(pages.join("\n"));
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
