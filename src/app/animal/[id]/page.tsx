import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AnimalDetail from "@/components/AnimalDetail";
import { getAnimals, getAnimalById } from "@/lib/getAnimals";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return getAnimals().map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const animal = getAnimalById(id);
  if (!animal) return { title: "Not Found" };
  return {
    title: `${animal.name_zh} (${animal.name_en}) - Wild Explorer / 动物探索笔记`,
    description: `探索${animal.name_zh}（${animal.name_en}）的自然特征与生活习性。一份安静的双语动物科普笔记，适合亲子共读。`,
  };
}

export default async function AnimalPage({ params }: PageProps) {
  const { id } = await params;
  const animal = getAnimalById(id);
  if (!animal) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "name": `${animal.name_zh} (${animal.name_en})`,
    "description": animal.description.zh,
    "provider": {
      "@type": "Organization",
      "name": "Wild Explorer / 动物探索笔记",
      "url": "https://animal.prismbase.org"
    },
    "educationalUse": "Language Learning & Nature Study",
    "audience": {
      "@type": "Audience",
      "audienceType": "Children and Parents"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnimalDetail animal={animal} />
    </>
  );
}
