import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: ['*', 'GPTBot', 'ChatGPT-User', 'Google-Extended', 'CCBot', 'anthropic-ai', 'Claude-Web', 'ClaudeBot', 'Bingbot'],
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://animal.prismbase.org/sitemap.xml',
  }
}
