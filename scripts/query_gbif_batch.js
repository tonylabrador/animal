const species = [
  "Pedetes capensis",
  "Ratufa indica",
  "Erethizon dorsatum",
  "Marmota marmota",
  "Rousettus aegyptiacus",
  "Noctilio leporinus",
  "Carlito syrichta",
  "Lasiorhinus latifrons",
  "Potos flavus",
  "Himantopus mexicanus",
  "Caloenas nicobarica",
  "Falco rusticolus",
  "Pulsatrix perspicillata",
  "Ara ararauna",
  "Fregata minor",
  "Somateria spectabilis",
  "Platalea ajaja",
  "Proteus anguinus",
  "Chelus fimbriata",
  "Synchiropus splendidus",
  "Attacus atlas",
  "Maratus volans",
  "Birgus latro",
  "Sepia officinalis",
  "Chrysaora fuscescens",
];

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function main() {
  const results = [];
  for (const requested of species) {
    const match = await getJson(
      `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(requested)}&strict=true`,
    );
    let iucn = null;
    if (match.usageKey) {
      try {
        iucn = await getJson(
          `https://api.gbif.org/v1/species/${match.usageKey}/iucnRedListCategory`,
        );
      } catch (error) {
        iucn = { error: error.message };
      }
    }
    results.push({
      requested,
      usageKey: match.usageKey || null,
      acceptedUsageKey: match.acceptedUsageKey || match.usageKey || null,
      scientificName: match.scientificName || null,
      canonicalName: match.canonicalName || null,
      status: match.status || null,
      rank: match.rank || null,
      kingdom: match.kingdom || null,
      phylum: match.phylum || null,
      class: match.class || null,
      order: match.order || null,
      family: match.family || null,
      genus: match.genus || null,
      iucn,
    });
  }
  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
