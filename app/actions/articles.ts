'use server';

import { prisma } from "@/lib/prisma";
import { IArticle } from "@/interfaces/IArticle";
import { FilterState } from "@/app/(main)/components/FilterSection";
import { Prisma } from '@/generated/prisma/client';
import { SortOption } from '@/interfaces/SortOptions';

/**
 * Серверны экшэн для атрымання спіса артыкулаў.
 * Падтрымлівае новую сістэму сартавання "Default" для ТОП-16.
 */
export async function getArticlesAction(params: {
	skip: number;
	search?: string;
	sortBy?: SortOption;
	filters?: FilterState;
}): Promise<IArticle[]> {
	const { skip, search, sortBy, filters } = params;

	// 1. Базавыя ўмовы фільтрацыі
	const whereConditions: Prisma.ArticleWhereInput[] = [
		filters?.sectionId ? { sectionId: Number(filters.sectionId) } : {},
		filters?.authors?.length ? { author: { name: { in: filters.authors.map(o => o.value) } } } : {},
		filters?.places?.length ? { places: { some: { name: { in: filters.places.map(o => o.value) } } } } : {},
		filters?.tags?.length ? { tags: { some: { name: { in: filters.tags.map(o => o.value) } } } } : {},
		filters?.subjects?.length ? { subjects: { some: { name: { in: filters.subjects.map(o => o.value) } } } } : {},
	];

	const normalizeText = (t: string | null | undefined) =>
		(t || "").toLowerCase().replace(/[іиi]/g, "i").trim();

	// 2. Глобальны пошук у памяці
	const isSearching = search && search.trim() !== "";
	if (isSearching) {
		const normalizedQuery = normalizeText(search);

		const allDataForSearch = await prisma.article.findMany({
			select: {
				id: true,
				title: true,
				author: { select: { name: true } },
				places: { select: { name: true } },
				subjects: { select: { name: true } }
			}
		});

		const matchedIds = allDataForSearch
			.filter(article => {
				const inTitle = normalizeText(article.title).includes(normalizedQuery);
				const inAuthor = normalizeText(article.author?.name).includes(normalizedQuery);
				const inPlaces = article.places.some(p => normalizeText(p.name).includes(normalizedQuery));
				const inSubjects = article.subjects.some(s => normalizeText(s.name).includes(normalizedQuery));
				return inTitle || inAuthor || inPlaces || inSubjects;
			})
			.map(article => article.id);

		if (matchedIds.length === 0) return [];
		whereConditions.push({ id: { in: matchedIds } });
	}

	// 3. Вызначэнне сартавання
	let orderBy: Prisma.ArticleOrderByWithRelationInput | Prisma.ArticleOrderByWithRelationInput[];

	// Калі выбрана "Default" (Рэкамендаванае) або параметр адсутнічае
	if (sortBy === SortOption.Default || !sortBy) {
		orderBy = [
			{ priority: { sort: 'asc', nulls: 'last' } } as Prisma.ArticleOrderByWithRelationInput,
			{ createdAt: 'desc' } as Prisma.ArticleOrderByWithRelationInput
		];
	} else {
		// Усе астатнія варыянты ІГНАРУЮЦЬ прыярытэт і выкарыстоўваюць чыстую логіку
		switch (sortBy) {
			case SortOption.Newest:
				orderBy = { createdAt: 'desc' };
				break;
			case SortOption.Oldest:
				orderBy = { createdAt: 'asc' };
				break;
			case SortOption.Views:
				orderBy = { views: 'desc' };
				break;
			case SortOption.Likes:
				orderBy = { likes: 'desc' };
				break;
			default:
				orderBy = { createdAt: 'desc' };
				break;
		}
	}

	// 4. Фінальны запыт
	const articles = await prisma.article.findMany({
		where: { AND: whereConditions },
		take: 16,
		skip: skip,
		orderBy,
		include: {
			section: true,
			author: true,
			tags: true,
			places: true,
			subjects: true
		}
	});

	return JSON.parse(JSON.stringify(articles));
}

/**
 * Інкрэмент праглядаў
 */
export async function incrementViewsAction(id: number) {
	try {
		await prisma.article.update({
			where: { id },
			data: { views: { increment: 1 } }
		});
	} catch (e) {
		console.error("Failed to increment views:", e);
	}
}