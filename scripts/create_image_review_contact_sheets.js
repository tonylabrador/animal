#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const batchFlag = args.indexOf("--batch");
const batch = batchFlag >= 0 ? args[batchFlag + 1] : null;
if (batchFlag >= 0) args.splice(batchFlag, 2);
const excludeFlag = args.indexOf("--exclude");
const exclude = excludeFlag >= 0 ? (args[excludeFlag + 1] || "").split(",").filter(Boolean) : [];
if (excludeFlag >= 0) args.splice(excludeFlag, 2);
const unverifiedFlag = args.indexOf("--unverified-only");
const unverifiedOnly = unverifiedFlag >= 0;
if (unverifiedFlag >= 0) args.splice(unverifiedFlag, 1);
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "image-attribution.json"), "utf8"));
const ids = (batch
  ? JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "qc-batches", `${batch}-baseline.json`), "utf8")).animals.map((animal) => animal.id)
  : args)
  .filter((id) => !exclude.includes(id))
  .filter((id) => !unverifiedOnly || manifest[id]?.license_status !== "verified" || manifest[id]?.review_status !== "human-approved")
  .filter((id) => fs.existsSync(path.join(ROOT, ".image-review", id, "review.json")));
if (ids.length === 0) {
  console.error("Usage: node scripts/create_image_review_contact_sheets.js <animal-id> [...]");
  process.exit(1);
}

const escapeXml = (value) => String(value).replace(/[<>&'"]/g, (char) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
})[char]);

async function makeSheet(id) {
  const directory = path.join(ROOT, ".image-review", id);
  const review = JSON.parse(fs.readFileSync(path.join(directory, "review.json"), "utf8"));
  const tileWidth = 500;
  const tileHeight = 420;
  const headerHeight = 70;
  const tiles = [];
  for (let index = 0; index < review.candidates.length; index += 1) {
    const imagePath = path.join(directory, `${index + 1}.jpg`);
    const image = await sharp(imagePath)
      .rotate()
      .resize(tileWidth, tileHeight, { fit: "contain", background: "#111827" })
      .jpeg({ quality: 88 })
      .toBuffer();
    const candidate = review.candidates[index];
    const label = await sharp({
      create: { width: tileWidth, height: headerHeight, channels: 3, background: "#f8fafc" },
    }).composite([{
      input: Buffer.from(`<svg width="${tileWidth}" height="${headerHeight}"><text x="18" y="29" font-family="Arial" font-size="22" font-weight="700" fill="#0f172a">Candidate ${index + 1}</text><text x="18" y="54" font-family="Arial" font-size="15" fill="#475569">${escapeXml(candidate.license_code.toUpperCase())} · ${escapeXml(candidate.attribution)}</text></svg>`),
    }]).jpeg({ quality: 90 }).toBuffer();
    tiles.push({ image, label });
  }
  const width = tileWidth * tiles.length;
  const height = tileHeight + headerHeight + 64;
  const title = Buffer.from(`<svg width="${width}" height="64"><rect width="100%" height="100%" fill="#ffffff"/><text x="20" y="40" font-family="Arial" font-size="28" font-weight="700" fill="#0f172a">${escapeXml(id)} · ${escapeXml(review.scientific_name)}</text></svg>`);
  const composites = [{ input: title, top: 0, left: 0 }];
  tiles.forEach((tile, index) => {
    composites.push({ input: tile.label, top: 64, left: index * tileWidth });
    composites.push({ input: tile.image, top: 64 + headerHeight, left: index * tileWidth });
  });
  await sharp({ create: { width, height, channels: 3, background: "#ffffff" } })
    .composite(composites)
    .jpeg({ quality: 90 })
    .toFile(path.join(directory, "contact-sheet.jpg"));
  console.log(`Created .image-review/${id}/contact-sheet.jpg`);
}

(async () => {
  for (const id of ids) await makeSheet(id);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
