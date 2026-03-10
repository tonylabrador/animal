// download_images.js
// 用法: node download_images.js
// 数据源: data/animals/*.json（一物一文件）
//
// 图片来源:
//   主要 → iNaturalist API (按学名查询，真实野生动物照片，无需 Key)
//   备用 → Wikipedia API (百科图片)

const fs   = require("fs");
const path = require("path");

const ANIMALS_DIR = path.join(__dirname, "data", "animals");
const OUTPUT_DIR  = path.join(__dirname, "public", "images", "animals");
const DELAY_MS    = 1200;

const HEADERS = {
  "User-Agent": "WildExplorerApp/1.0 (educational; contact: dev@example.com)",
  Accept: "application/json",
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Source 1: iNaturalist ────────────────────────────────────────────────────
async function getINaturalistImageUrl(scientificName) {
  const url =
    `https://api.inaturalist.org/v1/taxa` +
    `?q=${encodeURIComponent(scientificName)}&rank=species&per_page=1`;

  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`iNaturalist HTTP ${res.status}`);

  const data = await res.json();
  const taxon = data.results?.[0];
  const imgUrl = taxon?.default_photo?.medium_url;
  if (!imgUrl) throw new Error("iNaturalist 无图片");
  return imgUrl.replace("/medium.", "/large.").replace("/square.", "/large.");
}

// ── Source 2: Wikipedia ──────────────────────────────────────────────────────
async function getWikipediaImageUrl(animalName) {
  const url =
    `https://en.wikipedia.org/w/api.php` +
    `?action=query&titles=${encodeURIComponent(animalName)}` +
    `&prop=pageimages&format=json&pithumbsize=800&redirects=1`;

  const res = await fetch(url, { headers: { ...HEADERS, Accept: "*/*" } });
  if (!res.ok) throw new Error(`Wikipedia HTTP ${res.status}`);

  const data  = await res.json();
  const pages = data.query?.pages ?? {};
  const page  = Object.values(pages)[0];
  const imgUrl = page?.thumbnail?.source;
  if (!imgUrl) throw new Error("Wikipedia 无图片");
  return imgUrl;
}

async function downloadImage(url, destPath) {
  const res = await fetch(url, {
    headers: { "User-Agent": HEADERS["User-Agent"] },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`下载 HTTP ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 5000) throw new Error("文件过小，可能不是有效图片");

  fs.writeFileSync(destPath, buffer);
  return buffer.length;
}

// ── 主流程 ───────────────────────────────────────────────────────────────────
async function main() {
  const files = fs.readdirSync(ANIMALS_DIR).filter((f) => f.endsWith(".json"));
  const animals = files.map((f) => {
    const raw = fs.readFileSync(path.join(ANIMALS_DIR, f), "utf-8");
    return { ...JSON.parse(raw), _file: f };
  });

  console.log(`📋 共找到 ${animals.length} 只动物 (data/animals/)\n`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 输出目录: ${OUTPUT_DIR}\n`);

  let successCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < animals.length; i++) {
    const animal  = animals[i];
    const dest   = path.join(OUTPUT_DIR, `${animal.id}.jpg`);
    const jsonPath = path.join(ANIMALS_DIR, animal._file);
    const webPath = `/images/animals/${animal.id}.jpg`;

    const prefix = `[${String(i + 1).padStart(2, "0")}/${animals.length}] ${animal.name_en.padEnd(28)} `;

    if (animal.image && fs.existsSync(dest)) {
      console.log(`${prefix}⏭  已有图片，跳过`);
      skippedCount++;
      continue;
    }

    process.stdout.write(prefix);

    const sources = [
      { name: "iNaturalist", fn: () => getINaturalistImageUrl(animal.scientific_name) },
      { name: "Wikipedia",   fn: () => getWikipediaImageUrl(animal.name_en) },
    ];

    let saved = false;
    for (const source of sources) {
      try {
        const imgUrl = await source.fn();
        const bytes  = await downloadImage(imgUrl, dest);
        animal.image = webPath;
        console.log(`✅  ${source.name.padEnd(12)} ${(bytes / 1024).toFixed(1)} KB`);
        saved = true;
        successCount++;
        break;
      } catch (err) {
        process.stdout.write(`[${source.name} ✗] `);
      }
    }

    if (!saved && !animal.image) animal.image = null;

    // 写回当前动物的 JSON 文件（去掉临时字段 _file）
    delete animal._file;
    fs.writeFileSync(jsonPath, JSON.stringify(animal, null, 2), "utf-8");

    if (i < animals.length - 1) await delay(DELAY_MS);
  }

  console.log(`\n✨ 完成！新下载 ${successCount} 张，跳过 ${skippedCount} 张（已有图片）`);
  console.log("   data/animals/*.json 已更新。");
}

main().catch((err) => {
  console.error("脚本出错:", err);
  process.exit(1);
});
