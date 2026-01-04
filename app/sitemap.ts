// app/sitemap.ts
import { prisma } from '@/lib/prisma';
import { STATIC_ROUTES } from '@/lib/routes-config';
import { MetadataRoute } from 'next'

// Калі ў вас ёсць API або база дадзеных, імпартуйце функцыю атрымання артыкулаў
// import { getAllPosts } from '@/lib/api' 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = 'https://gmm.by'

	// 1. Статычныя старонкі
	const routes = Object.values(STATIC_ROUTES).map((route) => ({
		url: `${baseUrl}${route.path}`,
		lastModified: new Date().toISOString(),
		changeFrequency: 'daily' as const,
		priority: route.priority,
	}));

	// 2. Дынамічныя старонкі (артыкулы)
	// У рэальным праекце вы будзеце рабіць запыт да БД:
	
	const articles = await prisma.article.findMany({
		select: {
			id: true,
			updatedAt: true
		}
	});
	const articleRoutes = articles.map((article) => ({
		url: `${baseUrl}/articles/${article.id}`,
		lastModified: article.updatedAt,
	  changeFrequency: 'weekly' as const,
	  priority: 0.7,
	}))

	return [...routes, ...articleRoutes]
}