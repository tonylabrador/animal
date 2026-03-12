import type { Animal } from "@/types/animal";

export interface TaxonomyNode {
  /** Display name (en) */
  name: string;
  /** Display name (zh) */
  nameZh: string;
  /** Taxonomy level label, e.g. "Class", "Order" */
  level: string;
  levelZh: string;
  /** Number of species under this node (leaf count) */
  count: number;
  /** Direct children */
  children: TaxonomyNode[];
  /** Only present at species level */
  animalId?: string;
  image?: string | null;
  scientificName?: string;
}

const LEVELS: {
  key: keyof Animal["taxonomy"];
  label: string;
  labelZh: string;
}[] = [
  { key: "kingdom", label: "Kingdom", labelZh: "界" },
  { key: "phylum",  label: "Phylum",  labelZh: "门" },
  { key: "class",   label: "Class",   labelZh: "纲" },
  { key: "order",   label: "Order",   labelZh: "目" },
  { key: "family",  label: "Family",  labelZh: "科" },
  { key: "genus",   label: "Genus",   labelZh: "属" },
];

/**
 * Build a hierarchical taxonomy tree from a flat array of animals.
 * The tree starts at Kingdom and ends with individual species as leaves.
 */
export function buildTaxonomyTree(animals: Animal[]): TaxonomyNode {
  const root: TaxonomyNode = {
    name: "Animalia",
    nameZh: "动物界",
    level: "Kingdom",
    levelZh: "界",
    count: animals.length,
    children: [],
  };

  for (const animal of animals) {
    let current = root;

    // Walk each taxonomy level (skip kingdom since it's root)
    for (let i = 1; i < LEVELS.length; i++) {
      const lvl = LEVELS[i];
      const nameEn = animal.taxonomy[lvl.key].en;
      const nameZh = animal.taxonomy[lvl.key].zh;

      let child = current.children.find((c) => c.name === nameEn);
      if (!child) {
        child = {
          name: nameEn,
          nameZh: nameZh,
          level: lvl.label,
          levelZh: lvl.labelZh,
          count: 0,
          children: [],
        };
        current.children.push(child);
      }
      child.count++;
      current = child;
    }

    // Add the species as a leaf node
    current.children.push({
      name: animal.name_en,
      nameZh: animal.name_zh,
      level: "Species",
      levelZh: "种",
      count: 1,
      children: [],
      animalId: animal.id,
      image: animal.image,
      scientificName: animal.scientific_name,
    });
  }

  // Sort children at each level alphabetically
  sortNode(root);

  return root;
}

function sortNode(node: TaxonomyNode): void {
  node.children.sort((a, b) => {
    // Sort by count descending (bigger groups first), then alphabetically
    if (a.count !== b.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });
  for (const child of node.children) {
    sortNode(child);
  }
}
