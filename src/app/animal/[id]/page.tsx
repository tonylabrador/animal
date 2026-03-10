import { notFound } from "next/navigation";
import AnimalDetail from "@/components/AnimalDetail";
import { getAnimals, getAnimalById } from "@/lib/getAnimals";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return getAnimals().map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const animal = getAnimalById(id);
  if (!animal) return { title: "Not Found" };
  return {
    title: `${animal.name_en ?? animal.id} · Wild Explorer`,
    description: animal.description?.en ?? animal.description?.zh ?? "",
  };
}

export default async function AnimalPage({ params }: PageProps) {
  const { id } = await params;
  const animal = getAnimalById(id);
  if (!animal) notFound();

  return <AnimalDetail animal={animal} />;
}
