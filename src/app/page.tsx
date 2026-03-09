import AnimalDashboard from "@/components/AnimalDashboard";
import animalsData from "../../animal_source.json";
import type { Animal } from "@/types/animal";

const animals = animalsData as Animal[];

export default function HomePage() {
  return <AnimalDashboard animals={animals} />;
}
