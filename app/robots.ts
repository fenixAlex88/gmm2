// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: ['/login', '/admin', '/api/'],
		},
		sitemap: 'https://gmm.by/sitemap.xml',
	}
}