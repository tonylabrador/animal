/**
 * 自动巡航跑批清空许愿池脚本 (Deterministic Wishlist Auto-Processor)
 * Usage: node scripts/auto_process_wishlist.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WISHLIST_PATH = path.join(__dirname, '..', 'ANIMAL_WISHLIST.md');
const RECENT_PATH = path.join(__dirname, '..', 'RECENTLY_ADDED.md');
const ANIMALS_DIR = path.join(__dirname, '..', 'data', 'animals');
const REVIEW_LOG_PATH = path.join(__dirname, '..', 'REVIEW_MESSAGES.md');

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("❌ 致命错误：找不到 GEMINI_API_KEY，请检查 .env.local 文件。");
    process.exit(1);
}

const GENERATE_PROMPT = `You are a strict biological taxonomy JSON generation engine.
I will provide you with an animal name (Chinese / English / Scientific).
You MUST generate a perfectly formatted JSON file for this animal following the exact schema used in the Wild Explorer app.

CRITICAL INSTRUCTIONS:
1. 简介清楚详细 (Descriptions must be highly detailed, informative, and hardcore, both EN and ZH).
2. 分布地图精确 (Map coordinates MUST precisely outline realistic terrains/coasts with many points).
3. 分布地图不要大方框 (ABSOLUTELY NO lazy 4-point rectangular bounding boxes. Draw detailed polygons).
4. ALL horizontal arrays for polygons: The global_distribution_polygons array should try to remain tight.
5. Return ONLY raw JSON text. No markdown formatting (\`\`\`json). No apologies.

Required JSON Schema:
{
  "id": "kebab-case-name",
  "name_zh": "...",
  "name_en": "...",
  "scientific_name": "...",
  "ui_tags": ["Class", "Habitat", "Diet"],
  "taxonomy": {
    "kingdom": { "en": "...", "zh": "..." },
    "phylum": { "en": "...", "zh": "..." },
    "class": { "en": "...", "zh": "..." },
    "order": { "en": "...", "zh": "..." },
    "family": { "en": "...", "zh": "..." },
    "genus": { "en": "...", "zh": "..." }
  },
  "conservation_status": { "code": "...", "en": "...", "zh": "..." },
  "description": { "en": "...", "zh": "..." },
  "encyclopedia": {
    "anatomy": { "en": "...", "zh": "..." },
    "ecology_and_behavior": { "en": "...", "zh": "..." },
    "habitat_and_distribution": { "en": "...", "zh": "..." }
  },
  "habitat": {
    "text_en": "...",
    "text_zh": "...",
    "map_coordinates": [lat, lng],
    "map_zoom_level": 4,
    "global_distribution_polygons": [[[lat, lng], [lat, lng], ...]]
  },
  "image": null
}`;

const REVIEW_PROMPT = `You are an INDEPENDENT AI REVIEWER for a wildlife application database.
Review the following JSON data representing an animal. Look critically for the following errors:
1. 'global_distribution_polygons' simply being a lazy 4-point/5-point square or rectangle box. (It must be a complex, high-precision shape).
2. Descriptions ("description", "encyclopedia") being too brief, generic, or not strictly bilingual.
3. Missing fields or schema-breaking errors.

Respond with STRICTLY "PASS" if the JSON is highly detailed and polygons look organic and complex.
If there are ANY issues, respond with a short bulleted list of the errors found. DO NOT fix the JSON, just list the errors. Return ONLY the bullet points.`;

async function callGemini(systemPrompt, userText) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nTask Data:\n${userText}` }] }],
            generationConfig: { temperature: 0.2 }
        })
    });
    if (!res.ok) {
        throw new Error(`Gemini API error: ${res.status}`);
    }
    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
}

function parseWishlist() {
    if (!fs.existsSync(WISHLIST_PATH)) return [];
    const content = fs.readFileSync(WISHLIST_PATH, "utf-8");
    const lines = content.split("\n");
    const entries = [];
    let inTable = false;
    for (const line of lines) {
        if (!inTable && line.includes("|---")) {
            inTable = true;
            continue;
        }
        if (inTable && line.trim().startsWith("|")) {
            const cols = line.split("|").map(col => col.trim()).filter(Boolean);
            if (cols.length >= 4 && cols[1] !== "—" && cols[1] !== "中文名") {
                entries.push({ originalLine: line, zh: cols[1], en: cols[2], scientific: cols[3] });
            }
        }
    }
    return entries;
}

function updateWishlistContent(remainingEntries) {
    const header = `# 🌟 Animal Wishlist (许愿池)\n\n> 通过「许愿池分类学拦截网关」验证的待添加物种清单。\n\n| # | 中文名 | English Name | Scientific Name | 状态 |\n|---|--------|-------------|-----------------|------|\n`;
    let body = remainingEntries.map((e, index) => `| ${index + 1} | ${e.zh} | ${e.en} | ${e.scientific} | ⏳ Pending |`).join("\n");
    if (body.length > 0) body += "\n";
    fs.writeFileSync(WISHLIST_PATH, header + body, "utf-8");
}

function updateRecentlyAdded(newAnimals) {
    if (!fs.existsSync(RECENT_PATH)) return;
    const content = fs.readFileSync(RECENT_PATH, "utf-8");
    const lines = content.split("\n");
    const existing = [];
    let inTable = false;
    for (const line of lines) {
        if (!inTable && line.includes("|---")) {
            inTable = true;
            continue;
        }
        if (inTable && line.trim().startsWith("|")) {
            const cols = line.split("|").map(col => col.trim()).filter(Boolean);
            if (cols.length >= 4 && cols[1] !== "—" && cols[1] !== "中文名") {
                const link = cols[4] || "";
                existing.push({ zh: cols[1], en: cols[2], scientific: cols[3], link });
            }
        }
    }

    const formattedNew = newAnimals.map(a => ({
        zh: a.name_zh,
        en: a.name_en,
        scientific: a.scientific_name,
        link: `[Link](https://wild-explorer.vercel.app/animal/${a.id})`
    }));

    const combined = [...formattedNew, ...existing].slice(0, 20); // Keep only latest 20
    const header = `# ✅ Recently Added Animals\n\n> Latest additions successfully parsed by the AI pipeline.\n\n| # | 中文名 | English Name | Scientific Name | Link |\n|---|--------|-------------|-----------------|------|\n`;
    const body = combined.map((e, index) => `| ${index + 1} | ${e.zh} | ${e.en} | ${e.scientific} | ${e.link} |`).join("\n");
    fs.writeFileSync(RECENT_PATH, header + body + "\n", "utf-8");
}

function logReviewIssue(animalName, issueText) {
    if (!fs.existsSync(REVIEW_LOG_PATH)) {
        fs.writeFileSync(REVIEW_LOG_PATH, "# 🚨 Independent AI Review Issues\n\n", "utf-8");
    }
    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
    const logEntry = `\n### [${timestamp}] Review Failed for: ${animalName}\n${issueText}\n`;
    fs.appendFileSync(REVIEW_LOG_PATH, logEntry, "utf-8");
    console.warn(`⚠️ Review Issue logged for ${animalName}`);
}

const BATCH_SIZE = 5;

async function runAutoPipeline() {
    console.log("🚀 Starting Automatic Wishlist Processing Pipeline...");
    
    while (true) {
        let wishlist = parseWishlist();
        if (wishlist.length === 0) {
            console.log("✅ Wishlist is completely empty! Pipeline finished.");
            break;
        }

        const batch = wishlist.slice(0, BATCH_SIZE);
        console.log(`\n📦 Processing batch of ${batch.length} animals...`);
        const successfullyGenerated = [];

        // 1. Generation Step
        for (const animal of batch) {
            console.log(`   ⚙️ Generating JSON for: ${animal.zh} (${animal.en})`);
            try {
                const animalStr = `${animal.zh} | ${animal.en} | ${animal.scientific}`;
                const jsonStr = await callGemini(GENERATE_PROMPT, animalStr);
                const parsed = JSON.parse(jsonStr);
                
                if (!parsed.id) throw new Error("Generated JSON missing 'id' field");

                const filePath = path.join(ANIMALS_DIR, `${parsed.id}.json`);
                fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), "utf-8");
                successfullyGenerated.push(parsed);

            } catch (err) {
                console.error(`   ❌ Failed to generate JSON for ${animal.zh}:`, err.message);
                logReviewIssue(animal.zh, `FATAL JSON GENERATION ERROR: ${err.message}`);
            }
            // Sleep to avoid rate limits
            await new Promise(r => setTimeout(r, 2000));
        }

        // 2. Run Update Scripts (List & Images)
        console.log(`   🔄 Running underlying update scripts...`);
        try {
            console.log("      - Downloading missing images...");
            execSync('node download_images.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
            console.log("      - Updating animals list mappings...");
            execSync('node update_animals_list.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
            console.log("      - Building taxonomy tree...");
            execSync('node build_taxonomy_tree.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
            // Clean wishlist directly to avoid conflicts, though we will prune it ourselves below
            execSync('node scripts/clean_wishlist.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        } catch(e) {
            console.error("   ❌ Error during script execution:", e.message);
        }

        // 3. Independent Review Step
        console.log(`   🧐 Independent AI Review Agent checking output...`);
        for (const animal of successfullyGenerated) {
            try {
                const jsonContent = JSON.stringify(animal);
                const reviewResult = await callGemini(REVIEW_PROMPT, jsonContent);
                
                if (reviewResult.replace(/\s/g, '').toUpperCase() === "PASS") {
                    console.log(`      ✅ ${animal.name_zh}: PASS`);
                } else {
                    console.log(`      ⚠️ ${animal.name_zh}: FAILED REVIEW (check REVIEW_MESSAGES.md)`);
                    logReviewIssue(animal.name_zh, reviewResult);
                }
            } catch(e) {
                console.error(`      ❌ Review failed to execute for ${animal.name_zh}`);
            }
            await new Promise(r => setTimeout(r, 1000));
        }

        // 4. Update Wishlist & Recently Added (Pruning the batch)
        console.log(`   📝 Updating Markdown indices...`);
        // We re-parse just in case clean_wishlist stripped more duplicates
        let currentWishlist = parseWishlist();
        const generatedNamesRegex = successfullyGenerated.map(a => new RegExp(`${a.name_en}|${a.name_zh}`, 'i'));
        
        // Remove from wishlist
        let newWishlist = currentWishlist.filter(w => !generatedNamesRegex.some(rx => rx.test(w.en) || rx.test(w.zh)));
        
        // Ensure we at least manually pop the batch items in case regex fails
        const originalBatchEnKeys = batch.map(b => b.en);
        newWishlist = newWishlist.filter(w => !originalBatchEnKeys.includes(w.en));

        updateWishlistContent(newWishlist);
        updateRecentlyAdded(successfullyGenerated);

        console.log(`Batch complete. Remaining in wishlist: ${newWishlist.length}`);
        
        if (newWishlist.length === 0) {
            break;
        } else {
            console.log(`⏳ Waiting 5 seconds before next batch to cool off API...`);
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    // Attempt final list sync to be safe
    try {
        execSync('node update_animals_list.js', { stdio: 'ignore', cwd: path.join(__dirname, '..') });
        execSync('node build_taxonomy_tree.js', { stdio: 'ignore', cwd: path.join(__dirname, '..') });
    } catch(e) {}
    
    console.log("🎉 ALL DONE!");
}

runAutoPipeline();
