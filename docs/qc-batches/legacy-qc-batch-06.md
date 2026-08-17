# Legacy Animal QC — Batch 06

- Scope: final 155 existing records, `mangrove-box-jellyfish` through `zebra-jumping-spider`
- Review date: 2026-08-17
- Batch result: all content, bilingual, taxonomy, conservation, source, and map gates passed; 129 image decisions are fully resolved and 26 original images remain on the attribution/license follow-up list
- Permanent status source: `docs/qc-batches/animal-qc-ledger.json`

## Completed gates

- Saved a pre-edit baseline for exactly 155 records.
- Checked species-level identity and the current global conservation category against GBIF/IUCN aggregation and the iNaturalist exact-taxon index; manually resolved six current-authority conflicts.
- Audited 8,060 English/Chinese field pairs before import, including equal numbers, ranges, units, and uncertainty qualifiers.
- Imported 155 Rich Content v2 records with compact bilingual Quick Facts.
- Preserved the original center, zoom, and polygon geometry for 154 records: 137 retained polygon maps and 17 existing representative-point maps.
- Corrected only one clearly obsolete range component: after the American/Eurasian Goshawk split, removed the North American polygon from `northern-goshawk` while retaining its Eurasian and Japanese polygons byte-for-byte. No animal was converted from a polygon to a point.
- Visually reviewed every image overview and expanded all questionable candidate sets: 125 new exact-taxon open-license images approved and 4 previously verified images retained.
- Preserved 26 clearer original images when the new candidates were maps, drawings, toys, carcasses, wrong species, or too unclear; these remain explicit attribution/license follow-ups.
- Passed schema validation, full-data validation, bilingual consistency QC, source URL checks, and replacement dry-run before atomic import.

## Material taxonomy corrections

- `northern-goshawk`: Northern Goshawk / `Accipiter gentilis` → Eurasian Goshawk / `Astur gentilis`; removed only the obsolete North American range polygon.
- `pygmy-slow-loris`: Pygmy Slow Loris / `Nycticebus pygmaeus` → Southern Pygmy Slow Loris / `Xanthonycticebus pygmaeus`.
- `whites-tree-frog`: `Ranoidea caerulea` → `Pelodryas caerulea` following Amphibian Species of the World.
- `wilsons-bird-of-paradise`: `Cicinnurus respublica` → `Diphyllodes respublica` following the eBird/Clements taxonomy update.
- `vicuna`: retained the IUCN-assessed `Vicugna vicugna` and LC while documenting the Mammal Diversity Database's `Lama vicugna` treatment.
- `wild-bactrian-camel`: standardized the Chinese name to the official-list form “野骆驼”; retained EN from the current Mammal Diversity Database species account and rejected a genus-only GBIF NE response.

## Browser and map verification

- English corrected-polygon path: Eurasian Goshawk loaded with `Astur gentilis`, Quick Facts, CARTO tiles, exactly two retained Eurasian/Japanese polygon paths, center marker, and the approximate-range label.
- Chinese corrected-polygon path: 苍鹰 loaded with 关键数据, the primary 高德地图国内线路, both retained polygons, center marker, and no console/framework errors.
- Chinese failover: a controlled primary-route failure switched to 高德地图备用线路 while both range polygons and the center marker remained visible.
- Representative-point path: Wild Bactrian Camel / 野骆驼 loaded in both languages with `Camelus ferus`, no polygon, and the explicit representative-location warning.
- All five browser cases returned HTTP 200, rendered their hero images, and had no error overlay or browser console errors.

## Conservation-category corrections

- `monarch-butterfly`: EN → LC
- `numbat`: EN → NT
- `peacock-mantis-shrimp`: DD → NE
- `southern-blue-ringed-octopus`: NE → LC
- `striped-blue-ringed-octopus`: NE → LC
- `wolverine`: VU → LC
- `zebra-jumping-spider`: LC → NE

## Open image follow-ups

The original image remains published for these records, as requested, because it was visibly better and species-relevant. It remains marked `replacement-needed` until its attribution/license can be verified or a better licensed exact-taxon image is found:

- `mangrove-box-jellyfish`, `mohol-bushbaby`, `monarch-butterfly`, `moose`
- `northern-goshawk`, `northern-river-terrapin`, `platypus`, `przewalskis-gazelle`
- `red-junglefowl`, `reindeer`, `rueppells-fox`, `saola`, `sea-otter`
- `spectacled-bear`, `spotted-hyena`, `stresemanns-bristlefront`, `striped-skunk`, `swan-goose`
- `takin`, `thorn-bug`, `tibetan-antelope`, `vaquita`, `wallaces-giant-bee`
- `west-indian-manatee`, `yangtze-finless-porpoise`, `yangtze-giant-softshell-turtle`

## Progress after this batch

- Content reviewed: 436 / 436
- Legacy content remaining: 0 / 436
- Fully release-complete: 397 / 436
- Image attribution/license follow-up remaining: 39 / 436

All existing animal content is now migrated and reviewed. The remaining master to-do list contains image-only follow-ups, not unreviewed animal records.
