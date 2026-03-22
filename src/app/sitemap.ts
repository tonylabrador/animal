import { MetadataRoute } from 'next'
import { getAnimals } from '@/lib/getAnimals'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const animals = getAnimals()
  
  const animalUrls: MetadataRoute.Sitemap = animals.map((animal) => ({
    url: `https://animal.prismbase.org/animal/${animal.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: 'https://animal.prismbase.org',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...animalUrls,
  ]
}
