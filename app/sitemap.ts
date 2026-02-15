import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hackenbush.vercel.app'
  
  // Gere URLs para todos os jogos que existem
  const gameUrls = []
  for (let i = 1; i <= 100; i++) { // Ajuste o número conforme seus jogos
    gameUrls.push({
      url: `${baseUrl}/?game=${i}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...gameUrls,
  ]
}