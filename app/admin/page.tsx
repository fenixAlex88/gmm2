import { prisma } from "@/lib/prisma";
import AdminLayout from "./components/AdminLayout";

export default async function AdminPage() {
	// Атрымліваем даныя на серверы праз Prisma
	const [articles, sections, authors, tags, places, subjects] = await Promise.all([
		prisma.article.findMany({
			include: { section: true, author: true, tags: true },
			orderBy: { createdAt: 'desc' }
		}),
		prisma.section.findMany(),
		prisma.author.findMany(),
		prisma.tag.findMany(),
		prisma.place.findMany(),
		prisma.subject.findMany(),
	]);

	const metadata = { authors, tags, places, subjects };

	return (
		<AdminLayout
			initialArticles={JSON.parse(JSON.stringify(articles))}
			sections={sections}
			metadata={metadata}
		/>
	);
}