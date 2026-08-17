---
name: add-animal
description: Add, replace, or enrich Wild Explorer animal records with source-backed bilingual Rich Content v2, taxonomy and IUCN verification, range data, licensed image candidates, species-level visual identification, and full release QC. Use whenever a user asks to add an animal, process the animal wishlist, replace an animal record, find an animal image, enrich an existing animal page, or audit a newly added animal before publishing.
---

# Add Animal

Treat data identity, factual support, image identity, and image licensing as four separate release gates. Never publish directly from an unreviewed generated response.

## Load the project standard

Read `docs/ADD_ANIMAL_WORKFLOW.md` and `docs/RICH_CONTENT_SCHEMA.md` completely before changing an animal record. Use `assets/animal-v2-template.json` as the structural starting point.

## Execute the workflow

1. Resolve the requested animal to one accepted species-level binomial. Check existing IDs, English and Chinese names, scientific names, and synonyms for duplicates.
2. Verify taxonomy, IUCN global status and population trend with current authoritative pages. Gather at least one authoritative general/life-history source and one ecology/range source. Search IUCN spatial data, specialist authorities, government datasets and peer-reviewed range maps before deciding that only a representative point is supportable.
3. Create only a `content_version: 2` draft in `_draft_animals.json`. Fill every required rich section. Link every fact and section to one or more real entries in `sources` through `source_keys`. Leave both `content_review` statuses as `pending` during generation.
4. Prefer honest uncertainty to invented completeness. Use ranges and context for measurements. Compare every English/Chinese pair line by line: species identity, claim scope, numbers, units, ranges, uncertainty, negation, conservation category, dates, and named organisms must match. Do not review English and Chinese in separate passes. For replacements, compare old and new map coordinates and polygons explicitly; record whether geometry was retained, replaced, or removed as unverified, with a bilingual reason and source keys in `habitat.range_review`. Preserve an existing polygon unless it is clearly wrong. If it remains useful but lacks reusable authoritative geometry, keep it byte-for-byte and use `legacy-polygon-retained`; never relabel it as verified or collapse it to a point for convenience.
5. Run `node scripts/qc_bilingual_content.js --draft`. Resolve every error and inspect every warning. After factual and bilingual review, set `factual_qc: source-checked`, `bilingual_qc: line-by-line-reviewed`, `reviewed_at`, and `reviewer`.
6. Run `node validate_animals.js --draft` and `node import_animals.js --dry-run`. Present the scientific identity, IUCN result, source set, content coverage, uncertain fields, bilingual QC result, and intended image-identification criteria for review.
7. Import only after review with `node import_animals.js`.
8. Prepare image candidates only for the approved IDs. Resolve the exact taxon first; do not accept fuzzy-search ranking as identity evidence.
9. Visually inspect every candidate against `rich_content.identification.key_features` and `similar_species`. Reject maps, illustrations, signs, toys, unclear subjects, captive hybrids, ambiguous close relatives, and images lacking an allowed license.
10. Approve a candidate only when species identity, visible evidence, attribution, and license all pass. Otherwise reject it or hide an unverifiable existing image.
11. Test both English and Chinese map modes. Confirm the English tile source loads, the Chinese domestic primary source loads, the Chinese backup activates when the primary is blocked, and point-only maps are visibly labelled as representative locations rather than full ranges. Run `npm run qc` and `npm run report:content-qc`, rebuild the list and taxonomy tree, and finalize only the exact records that passed all gates. Never remove failed entries from the wishlist.
12. Finalization must update `RECENTLY_ADDED.md` with the Los Angeles release date and prepend the approved batch. Preserve the user's newest-first rule: reverse insertion order within one release, so the animal added last appears first. The homepage release banner and recently-added panel must show that date, the batch count, and that bilingual Quick Facts are included; verify both English and Chinese renderings. Never append a new release below older animals.

## Apply class-specific depth

Add one to three modules appropriate to the class: bird song/migration/nesting; mammal gestation/lactation/social structure; fish depth/salinity/migration; amphibian metamorphosis/toxins; reptile thermoregulation/venom; insect metamorphosis/host/caste; or the equivalent evidence-backed modules for other invertebrates.

## Stop conditions

Do not finalize when the accepted species name is unresolved, a key claim lacks a supporting source, IUCN scope is ambiguous, range geometry is guessed, the previous and new range results were not compared, either map language/fallback test fails, no image can be identified to species level, the license is unverified, either content review status is pending, bilingual facts diverge, or any QC command fails. Report the exact unresolved gate and preserve the draft or wishlist entry.
