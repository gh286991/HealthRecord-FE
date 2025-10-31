import type { MetadataRoute } from 'next'
import { SITE_URL, SITEMAP_URL } from '@/config/brand'

export default function robots(): MetadataRoute.Robots {
  const host = SITE_URL.replace(/\/$/, '')
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    host,
    sitemap: SITEMAP_URL,
  }
}

