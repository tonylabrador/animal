import AnimalDashboard from "@/components/AnimalDashboard";
import { getAnimals } from "@/lib/getAnimals";

export default function HomePage() {
  const animals = getAnimals();
  return <AnimalDashboard animals={animals} />;
}
