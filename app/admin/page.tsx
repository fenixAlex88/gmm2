import { prisma } from "@/lib/prisma";
import AdminLayout from "./components/AdminLayout";

export default async function AdminPage() {
	// Атрымліваем даныя на серверы праз Prisma
	const [articlesData, sections, authors, tags, places, subjects] = await Promise.all([
		prisma.article.findMany({
			include: {
				section: true,
				author: true,
				tags: true,
				_count: {
					select: { likesRel: true } // Падлік лайкаў на баку БД
				}
			},
			orderBy: { createdAt: 'desc' }
		}),
		prisma.section.findMany({ orderBy: { name: 'asc' } }),
		prisma.author.findMany({ orderBy: { name: 'asc' } }),
		prisma.tag.findMany({ orderBy: { name: 'asc' } }),
		prisma.place.findMany({ orderBy: { name: 'asc' } }),
		prisma.subject.findMany({ orderBy: { name: 'asc' } }),
	]);

	// Трансфармуем артыкулы, каб 'likes' быў лікам, а не масівам
	const articles = articlesData.map(art => ({
		...art,
		likes: art._count.likesRel
	}));

	const metadata = { authors, tags, places, subjects };

	return (
		<AdminLayout
			initialArticles={JSON.parse(JSON.stringify(articles))}
			sections={JSON.parse(JSON.stringify(sections))}
			metadata={JSON.parse(JSON.stringify(metadata))}
		/>
	);
}