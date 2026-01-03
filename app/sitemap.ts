// app/sitemap.ts
import { MetadataRoute } from 'next'

// Калі ў вас ёсць API або база дадзеных, імпартуйце функцыю атрымання артыкулаў
// import { getAllPosts } from '@/lib/api' 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = 'https://gmm.by'

	// 1. Статычныя старонкі
	const routes = [
		'',
		'/articles',
		'/about_project',
		'/partner',
		'/support'
	].map((route) => ({
		url: `${baseUrl}${route}`,
		lastModified: new Date().toISOString(),
		changeFrequency: 'daily' as const,
		priority: 1.0,
	}))

	// 2. Дынамічныя старонкі (артыкулы)
	// У рэальным праекце вы будзеце рабіць запыт да БД:
	/*
	const posts = await getAllPosts()
	const postRoutes = posts.map((post) => ({
	  url: `${baseUrl}/articles/${post.slug}`,
	  lastModified: post.updatedAt,
	  changeFrequency: 'weekly' as const,
	  priority: 0.7,
	}))
	*/

	// Пакуль дадамо пустую заглушку для дынамічных дадзеных
	const postRoutes: MetadataRoute.Sitemap = []

	return [...routes, ...postRoutes]
}