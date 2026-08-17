# Legacy Animal QC — Batch 04

- Scope: 100 existing records, `brown-pelican` through `giant-panda`
- Review date: 2026-08-16
- Batch result: content and map gates passed; all records have a published image, with 2 remaining on the image replacement list
- Permanent status source: `docs/qc-batches/animal-qc-ledger.json`

## Completed gates

- Saved a pre-edit baseline for exactly 100 records.
- Checked accepted taxon identity and global conservation category against GBIF/IUCN aggregation and the iNaturalist exact-taxon index.
- Resolved three identity aliases manually: Chinese Sturgeon, Domestic Pig, and Dusky Dolphin.
- Audited 5,200 English/Chinese field pairs before import.
- Imported 100 complete Rich Content v2 records.
- Retained every record's original map center, zoom, and polygon data byte-for-byte. No polygon was converted to a point in this batch.
- Visually reviewed image candidates: 92 new images approved, 6 previously verified images retained.
- Passed schema validation, data validation, bilingual consistency QC, ESLint, production build, and live browser checks.

## Material corrections

- `channel-billed-toucan`: VU → LC
- `common-true-katydid`: LC → NE
- `dromedary-camel`: LC → NE
- `galapagos-tortoise`: corrected from a generic living Galápagos tortoise record to the extinct Floreana Giant Tortoise (`Chelonoidis niger`), VU → EX
- `garden-snail`: LC → NE
- `giant-apple-snail`: LC → NE
- `giant-isopod`: DD → NE
- `giant-otter`: retained EN after direct IUCN evidence overrode an erroneous aggregate NE response

## Open image follow-ups

- `cebu-flowerpecker`: original image retained and labeled `replacement-needed`; no exact, visually suitable candidate met the minimum image-size gate.
- `galapagos-tortoise`: original living Galápagos tortoise image restored at the owner's request so the page is never blank. It is representative only, not verified as the extinct pure Floreana taxon, and remains labeled `replacement-needed` until a defensible historical image is found.

## Browser and map verification

- Chinese primary path: Amap domestic route loaded valid tiles with the retained range overlay and center marker.
- Chinese failover: a controlled primary-route failure switched automatically to the Amap backup route; tiles, polygon, and marker remained visible.
- English path: CARTO loaded valid tiles with the retained range overlay and center marker.
- Corrected Floreana Giant Tortoise page rendered the corrected bilingual identity, EX status, and restored representative image without browser console errors.

## Progress after this batch

- Content reviewed: 171 / 426
- Content remaining: 255 / 426
- Fully release-complete: 166 / 426
- Full-gate follow-up remaining: 260 / 426

The five content-reviewed records that still have an image gate open are `baiji`, `black-carp`, `cebu-flowerpecker`, `galapagos-tortoise`, and `red-ruffed-lemur`.
