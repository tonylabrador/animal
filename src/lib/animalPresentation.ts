export const IUCN_COLORS: Record<string, string> = {
  EX: "bg-black text-white border-black",
  EW: "bg-violet-100 text-violet-800 border-violet-200",
  CR: "bg-red-100 text-red-700 border-red-200",
  EN: "bg-orange-100 text-orange-700 border-orange-200",
  VU: "bg-amber-100 text-amber-700 border-amber-200",
  NT: "bg-lime-100 text-lime-700 border-lime-200",
  LC: "bg-green-100 text-green-700 border-green-200",
  DD: "bg-slate-100 text-slate-700 border-slate-200",
  NE: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

const CLASS_TAGS = new Set([
  "Mammal", "Bird", "Reptile", "Amphibian", "Fish", "Insect",
  "Arachnid", "Crustacean", "Mollusk", "Cnidarian", "Invertebrate",
]);
const HABITAT_TAGS = new Set([
  "Forest", "Grassland", "Savanna", "Desert", "Mountains", "Ocean",
  "Freshwater", "Wetland", "Tundra", "Coastal", "Coral Reef", "Urban",
  "Farm", "Cave", "Island", "Global",
]);

export function getTagColor(tag: string): string {
  if (CLASS_TAGS.has(tag)) return "bg-amber-100 text-amber-700";
  if (HABITAT_TAGS.has(tag)) return "bg-sky-100 text-sky-700";
  return "bg-emerald-100 text-emerald-700";
}
