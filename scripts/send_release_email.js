/**
 * Preview a release email:
 *   npm run email:release -- --release 2026-08-17-priority-a
 *
 * Send it after reviewing the preview:
 *   npm run email:release -- --release 2026-08-17-priority-a --send
 */
require("dotenv").config({ path: ".env.local", quiet: true });
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const RELEASES_PATH = path.join(ROOT, "data", "releases.json");
const ANIMALS_DIR = path.join(ROOT, "data", "animals");

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function loadRelease(releaseId) {
  const releases = JSON.parse(fs.readFileSync(RELEASES_PATH, "utf8"));
  if (!Array.isArray(releases)) throw new Error("data/releases.json must be an array");
  return releases.find((release) => release.id === releaseId);
}

function animalNames(release) {
  return release.animal_ids.map((id) => {
    const filePath = path.join(ANIMALS_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) throw new Error(`Missing animal record: ${id}`);
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const animal = Array.isArray(parsed) ? parsed[0] : parsed;
    return `${animal.name_en} / ${animal.name_zh} (${animal.scientific_name})`;
  });
}

async function main() {
  const releaseId = argumentValue("--release");
  if (!releaseId || !/^[a-z0-9-]+$/.test(releaseId)) {
    throw new Error("Use --release with an exact ID from data/releases.json");
  }

  const release = loadRelease(releaseId);
  if (!release) throw new Error(`Unknown release: ${releaseId}`);
  const names = animalNames(release);

  console.log(`Release: ${release.id}`);
  console.log(`Date: ${release.date}`);
  console.log(`Animals (${names.length}):`);
  for (const name of names) console.log(`- ${name}`);

  if (!process.argv.includes("--send")) {
    console.log("\nPreview only. Add --send after reviewing this exact list.");
    return;
  }

  const secret = process.env.NEWSLETTER_SEND_SECRET;
  const siteUrl = (process.env.NEWSLETTER_SEND_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://animal.prismbase.org").replace(/\/$/, "");
  if (!secret) throw new Error("NEWSLETTER_SEND_SECRET is not configured in .env.local");

  const response = await fetch(`${siteUrl}/api/admin/send-release`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ releaseId }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `Send failed with HTTP ${response.status}`);

  if (result.status === "already_sent") {
    console.log("\nNot sent: this release already has a Broadcast.");
    return;
  }
  console.log(`\nSent ${result.animalCount} animals in Broadcast ${result.broadcastId}.`);
}

main().catch((error) => {
  console.error(`❌ ${error.message}`);
  process.exit(1);
});
