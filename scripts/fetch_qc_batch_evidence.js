#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const batchFlag = args.indexOf("--batch");
const batch = batchFlag >= 0 ? args[batchFlag + 1] : null;
const retryErrors = args.includes("--retry-errors");
if (!batch) {
  console.error("Usage: node scripts/fetch_qc_batch_evidence.js --batch legacy-qc-batch-04");
  process.exit(1);
}
const baselinePath = path.join(ROOT, "docs", "qc-batches", `${batch}-baseline.json`);
const outputPath = path.join(ROOT, "docs", "qc-batches", `${batch}-evidence.json`);
const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const USER_AGENT = "WildExplorerQC/2.0 (https://animal.prismbase.org)";

function normalized(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

async function getJson(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": USER_AGENT } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
  throw new Error(`${lastError.message}: ${url}`);
}

async function fetchOne(animal) {
  const scientificName = animal.scientific_name;
  const gbifUrl = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}`;
  const gbif = await getJson(gbifUrl);
  const gbifIdentityPass = gbif.rank === "SPECIES"
    && gbif.matchType === "EXACT"
    && normalized(gbif.canonicalName) === normalized(scientificName);
  let iucn = null;
  let iucnError = null;
  try {
    iucn = await getJson(`https://api.gbif.org/v1/species/${gbif.usageKey}/iucnRedListCategory`);
  } catch (error) {
    iucnError = error.message;
  }
  const inatSearch = await getJson(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}&rank=species&per_page=30`);
  const inat = (inatSearch.results || []).find((taxon) => normalized(taxon.name) === normalized(scientificName)) || null;
  return {
    id: animal.id,
    name_en: animal.name_en,
    name_zh: animal.name_zh,
    requested_scientific_name: scientificName,
    identity_gate: gbifIdentityPass && Boolean(inat) ? "pass" : "review",
    gbif: {
      query_url: gbifUrl,
      usage_key: gbif.usageKey || null,
      canonical_name: gbif.canonicalName || null,
      scientific_name: gbif.scientificName || null,
      rank: gbif.rank || null,
      status: gbif.status || null,
      match_type: gbif.matchType || null,
      confidence: gbif.confidence || null,
      kingdom: gbif.kingdom || null,
      phylum: gbif.phylum || null,
      class: gbif.class || null,
      order: gbif.order || null,
      family: gbif.family || null,
      genus: gbif.genus || null,
      species_page: gbif.usageKey ? `https://www.gbif.org/species/${gbif.usageKey}` : null,
    },
    iucn: iucn ? {
      code: iucn.code || null,
      category: iucn.category || null,
      taxon_id: iucn.iucnTaxonID || null,
      scientific_name: iucn.scientificName || null,
      query_url: `https://api.gbif.org/v1/species/${gbif.usageKey}/iucnRedListCategory`,
    } : null,
    iucn_error: iucnError,
    inaturalist: inat ? {
      taxon_id: inat.id,
      name: inat.name,
      rank: inat.rank,
      observations_count: inat.observations_count || 0,
      taxon_page: `https://www.inaturalist.org/taxa/${inat.id}`,
      wikipedia_url: inat.wikipedia_url || null,
    } : null,
  };
}

async function main() {
  const previous = retryErrors && fs.existsSync(outputPath)
    ? JSON.parse(fs.readFileSync(outputPath, "utf8"))
    : null;
  const previousById = new Map((previous?.animals || []).map((animal) => [animal.id, animal]));
  const targets = retryErrors
    ? baseline.animals.filter((animal) => previousById.get(animal.id)?.identity_gate === "error")
    : baseline.animals;
  const fresh = [];
  const groupSize = retryErrors ? 1 : 5;
  for (let index = 0; index < targets.length; index += groupSize) {
    const group = targets.slice(index, index + groupSize);
    const settled = await Promise.all(group.map(async (animal) => {
      try {
        return await fetchOne(animal);
      } catch (error) {
        return {
          id: animal.id,
          requested_scientific_name: animal.scientific_name,
          identity_gate: "error",
          error: error.message,
        };
      }
    }));
    fresh.push(...settled);
    console.log(`Checked ${Math.min(index + group.length, targets.length)}/${targets.length}`);
    if (retryErrors && index + group.length < targets.length) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  const freshById = new Map(fresh.map((animal) => [animal.id, animal]));
  const results = retryErrors
    ? baseline.animals.map((animal) => freshById.get(animal.id) || previousById.get(animal.id))
    : fresh;
  const evidence = {
    batch,
    checked_at: new Date().toISOString(),
    authorities: ["GBIF Backbone Taxonomy", "GBIF–IUCN Red List category service", "iNaturalist exact taxon index"],
    animals: results,
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  const pass = results.filter((result) => result.identity_gate === "pass").length;
  const review = results.filter((result) => result.identity_gate === "review").length;
  const errors = results.filter((result) => result.identity_gate === "error").length;
  console.log(`Saved evidence: ${pass} pass, ${review} need review, ${errors} errors → ${path.relative(ROOT, outputPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
