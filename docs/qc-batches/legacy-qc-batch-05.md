# Legacy Animal QC — Batch 05

- Scope: 100 existing records, `gila-monster` through `maned-wolf`
- Review date: 2026-08-17
- Batch result: content, bilingual, taxonomy, conservation, source, and map gates passed; 92 image decisions resolved and 8 remain on the image follow-up list
- Permanent status source: `docs/qc-batches/animal-qc-ledger.json`

## Completed gates

- Saved a pre-edit baseline for exactly 100 records.
- Checked species-level identity and global conservation category against GBIF/IUCN aggregation and the iNaturalist exact-taxon index.
- Manually resolved the Kakapo spelling and Longsnout Catfish synonym cases against current authority records.
- Audited 5,200 English/Chinese field pairs before import.
- Imported 100 complete Rich Content v2 records, including compact bilingual Quick Facts.
- Retained every record's original map center, zoom, and polygon data byte-for-byte: 83 polygon maps and 17 existing representative-point maps. No polygon was converted to a point.
- Visually reviewed all generated image contact sheets: 91 new open-license images approved and 1 previously verified image retained.
- Passed schema validation, data validation, bilingual consistency QC, and source URL checks before import.

## Browser and map verification

- English polygon path: Giraffe loaded with Quick Facts, CARTO tiles, the retained polygon, center marker, and the explicit approximate-range label.
- Chinese polygon path: 长颈鹿 loaded with 关键数据, the primary Gaode domestic route, the retained polygon, center marker, and the Chinese approximate-range label.
- Chinese failover: a controlled primary-route failure switched to 高德地图备用线路 while the polygon and marker remained visible.
- Representative-point path: Goblin Shark / 欧氏尖吻鲨 loaded in both languages with no polygon and the explicit “representative location, not the full range” label.
- All five browser cases returned HTTP 200 with visible hero images, no framework error overlay, and no browser console errors.

## Material corrections

- `kakapo`: corrected the scientific-name spelling from `Strigops habroptila` to `Strigops habroptilus` following IUCN, iNaturalist, and New Zealand conservation usage.
- `longsnout-catfish`: retained the IUCN-assessed `Leiocassis longirostris` combination; GBIF treats it as a synonym and the current global category is DD.
- `greater-blue-ringed-octopus`: NE → LC
- `hawaiian-bobtail-squid`: NE → DD
- `house-cricket`: LC → NE
- `human`: LC → NE
- `immortal-jellyfish`: DD → NE
- `island-scrub-jay`: VU → LC
- `japanese-spider-crab`: DD → NE
- `llama`: LC → NE
- `longsnout-catfish`: VU → DD

## Open image follow-ups

The original image remains published for these records, as requested, but is explicitly marked `replacement-needed` until its exact identity and attribution can be verified or a better licensed alternative is found:

- `great-cormorant`: exact-taxon candidates showed only a distant colony.
- `human`: candidates were anatomy diagrams, museum skeletons, or an unrelated map.
- `ili-pika`: the only candidate was a missing-image placeholder.
- `immortal-jellyfish`: only historical line drawings were available; the original photo is not yet species-verified.
- `ivory-billed-woodpecker`: only historical illustrations were available.
- `javan-green-magpie`: candidates were an illustration or dead museum skins.
- `kings-box-jellyfish`: the licensed specimen-in-vial candidate was not clear enough for the hero image.
- `little-spotted-kiwi`: the only candidate was an audio-waveform screenshot.

## Progress after this batch

- Content reviewed: 281 / 436
- Content remaining: 155 / 436
- Fully release-complete: 268 / 436
- Full-gate follow-up remaining: 168 / 436

The gap between content-reviewed and fully complete is the permanent image follow-up queue; it is not counted as completed image QC.
