import AnimalDashboard from "@/components/AnimalDashboard";
import { getAnimals, getLatestRelease } from "@/lib/getAnimals";

export default function HomePage() {
  const animals = getAnimals();
  const latestRelease = getLatestRelease();
  return <AnimalDashboard animals={animals} latestRelease={latestRelease} />;
}
