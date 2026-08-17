const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const useDraft = process.argv.includes("--draft");
const records = useDraft
  ? JSON.parse(fs.readFileSync(path.join(ROOT, "_draft_animals.json"), "utf8"))
  : fs.readdirSync(path.join(ROOT, "data", "animals"))
      .filter((file) => file.endsWith(".json"))
      .map((file) => JSON.parse(fs.readFileSync(path.join(ROOT, "data", "animals", file), "utf8")));

const references = new Map();
for (const animal of records) {
  for (const [key, sourceOrSources] of Object.entries(animal.sources || {})) {
    for (const source of Array.isArray(sourceOrSources) ? sourceOrSources : [sourceOrSources]) {
      if (!source?.url) continue;
      if (!references.has(source.url)) references.set(source.url, []);
      references.get(source.url).push(`${animal.id}:${key}`);
    }
  }
}

async function check(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Wild Explorer source-link QC/1.0" },
    });
    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": "Wild Explorer source-link QC/1.0", Range: "bytes=0-1024" },
      });
    }
    return { ok: response.ok, status: response.status, finalUrl: response.url };
  } catch (error) {
    return { ok: false, status: 0, finalUrl: url, error: error.message };
  } finally {
    clearTimeout(timeout);
  }
}

(async () => {
  const failures = [];
  const entries = [...references.entries()];
  for (let offset = 0; offset < entries.length; offset += 6) {
    const group = entries.slice(offset, offset + 6);
    const results = await Promise.all(group.map(async ([url, usedBy]) => ({ url, usedBy, ...(await check(url)) })));
    for (const result of results) {
      const label = result.ok ? "OK" : "FAIL";
      console.log(`${label}\t${result.status}\t${result.url}\t${result.usedBy.join(",")}`);
      if (!result.ok) failures.push(result);
    }
  }
  console.log(`Checked ${entries.length} unique source URLs across ${records.length} record(s).`);
  if (failures.length > 0) process.exit(1);
})();
