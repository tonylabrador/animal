import TaxonomyExplorer from "@/components/TaxonomyExplorer";
import { getTaxonomyTree } from "@/lib/getTaxonomyTree";

export const metadata = {
  title: "Taxonomy Explorer · Wild Explorer",
  description: "Explore the animal kingdom through biological classification.",
};

export default function TaxonomyPage() {
  const tree = getTaxonomyTree();
  return <TaxonomyExplorer tree={tree} />;
}
