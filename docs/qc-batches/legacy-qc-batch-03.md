# Legacy animal QC batch 03

- Review date: 2026-08-16
- Scope: 50 existing records, `african-bush-elephant` through `brown-eared-pheasant`
- Result: 50 records upgraded to Rich Content v2; content QC progress is now 71/426
- Baseline: `legacy-qc-batch-03-baseline.json`

## Gates completed

- Accepted species identity and taxonomy cross-checked against GBIF exact species matches.
- Current global IUCN category cross-checked at species level; regional and domestic/wild statuses were not substituted.
- English and Chinese pairs reviewed and automated numeric/qualifier QC run across 2,500 field pairs in this batch.
- Existing map center, zoom and every polygon coordinate compared to the baseline and retained byte-for-byte.
- 48 replacement images selected from exact-taxon open-license candidates after visual review.
- Baiji and black carp images hidden because the available candidates were maps, artwork or unrelated objects rather than verifiable animal photographs.
- Whole-repository schema, data validation, bilingual QC, ESLint and production build passed.
- Browser verification covered the English map, Chinese Gaode map, a representative-point record, and a controlled Chinese primary-tile outage that switched to the second Gaode route.

## Material corrections

| Record | Previous | Reviewed | Reason |
|---|---:|---:|---|
| Alpaca | LC | NE | A domestic species should not be assigned a wild-species global assessment. |
| Aporia hippia | LC | NE | No species-level global IUCN assessment was found. |
| Domestic Bactrian camel | LC | NE | `Camelus bactrianus` is domestic and must not inherit the CR status of `Camelus ferus`. |
| Blue dragon | DD | NE | No species-level global IUCN assessment was found; DD was unsupported. |
| Brown-eared pheasant | VU | LC | Current GBIF/IUCN mapping for taxon 2474098 returns LC; older assessments and secondary pages still show VU. |

The baiji remains CR with the Possibly Extinct qualification. The 2006 survey result was not converted into a formal EX category.

## Map result

- 48 records retain their previous approximate polygons as `legacy-polygon-retained`.
- 2 records (`blue-dragon`, `brown-eared-pheasant`) retain their previous representative points.
- No polygon was replaced or collapsed to a point in this batch.

## Image result

- Human-approved, attribution-complete replacement: 48
- Hidden as unverified with placeholder: 2 (`baiji`, `black-carp`)
- Unresolved image review state: 0

## Batch IDs

`african-bush-elephant`, `african-forest-elephant`, `african-wild-dog`, `alpaca`, `amazon-river-dolphin`, `american-badger`, `american-beaver`, `american-bison`, `american-black-bear`, `american-goldfinch`, `american-red-squirrel`, `andean-condor`, `anhinga`, `annas-hummingbird`, `aporia-hippia`, `arctic-fox`, `asian-elephant`, `atlantic-spotted-dolphin`, `bactrian-camel`, `baiji`, `bald-eagle`, `barn-swallow`, `bat-eared-fox`, `bearded-bellbird`, `bearded-vulture`, `beluga-whale`, `big-brown-bat`, `bighorn-sheep`, `black-backed-kingfisher`, `black-carp`, `black-footed-cat`, `black-headed-spider-monkey`, `black-stork`, `black-swallowtail`, `black-swan`, `black-tailed-prairie-dog`, `black-winged-subterranean-termite`, `blue-crab`, `blue-dragon`, `blue-footed-booby`, `blue-morpho-butterfly`, `blue-whale`, `boa-constrictor`, `bobcat`, `bohemian-waxwing`, `bolivian-anaconda`, `bornean-orangutan`, `boulder-brain-coral`, `brown-bear`, `brown-eared-pheasant`.
