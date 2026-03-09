import { notFound } from "next/navigation";
import AnimalDetail from "@/components/AnimalDetail";
import animalsData from "../../../../animal_source.json";
import type { Animal } from "@/types/animal";

const animals = animalsData as Animal[];

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return animals.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const animal = animals.find((a) => a.id === id);
  if (!animal) return { title: "Not Found" };
  return {
    title: `${animal.name_en} · Wild Explorer`,
    description: animal.description.en,
  };
}

export default async function AnimalPage({ params }: PageProps) {
  const { id } = await params;
  const animal = animals.find((a) => a.id === id);
  if (!animal) notFound();

  return <AnimalDetail animal={animal} />;
}
