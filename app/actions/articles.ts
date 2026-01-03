'use server';

import { prisma } from "@/lib/prisma";
import { IArticle } from "@/interfaces/IArticle";
import { FilterState } from "@/app/(main)/components/FilterSection";
import { Prisma } from '@/generated/prisma/client';
import { SortOption } from '@/interfaces/SortOptions';

/**
 * Серверны экшэн для атрымання спіса артыкулаў з улікам пагінацыі,
 * фільтраў і новай мадэлі лайкаў.
 */
export async function getArticlesAction(params: {
	skip: number;
	search?: string;
	sortBy?: SortOption;
	filters?: FilterState;
}): Promise<IArticle[]> {
	const { skip, search, sortBy, filters } = params;

	// 1. Фарміруем умовы фільтрацыі (Prisma where)
	const whereConditions: Prisma.ArticleWhereInput[] = [
		filters?.sectionId ? { sectionId: Number(filters.sectionId) } : {},
		filters?.authors?.length ? { author: { name: { in: filters.authors.map(o => o.value) } } } : {},
		filters?.places?.length ? { places: { some: { name: { in: filters.places.map(o => o.value) } } } } : {},
		filters?.tags?.length ? { tags: { some: { name: { in: filters.tags.map(o => o.value) } } } } : {},
		filters?.subjects?.length ? { subjects: { some: { name: { in: filters.subjects.map(o => o.value) } } } } : {},
	];

	// Функцыя для нармалізацыі тэксту (пошук незалежна ад мовы)
	const normalizeText = (t: string | null | undefined) =>
		(t || "").toLowerCase().replace(/[іиi]/g, "i").trim();

	// 2. Глобальны пошук (ваша існуючая логіка)
	if (search && search.trim() !== "") {
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

	// 3. Вызначаем логіку сартавання (ВЫПРАЎЛЕНА для likesRel)
	let orderBy: Prisma.ArticleOrderByWithRelationInput | Prisma.ArticleOrderByWithRelationInput[];

	if (sortBy === SortOption.Default || !sortBy) {
		orderBy = [
			{ priority: { sort: 'asc', nulls: 'last' } },
			{ createdAt: 'desc' }
		];
	} else {
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
				// Сартуем па колькасці запісаў у звязанай табліцы likes
				orderBy = {
					likesRel: {
						_count: 'desc'
					}
				};
				break;
			default:
				orderBy = { createdAt: 'desc' };
				break;
		}
	}

	// 4. Запыт да базы дадзеных
	const articlesData = await prisma.article.findMany({
		where: { AND: whereConditions },
		take: 16,
		skip: skip,
		orderBy,
		include: {
			section: true,
			author: true,
			tags: true,
			places: true,
			subjects: true,
			likesRel: true // Неабходна для падліку likes на стадыі мапінгу
		}
	});

	// 5. Трансфармацыя дадзеных (ВЫПРАЎЛЕНА: захоўваем усе сувязі)
	return articlesData.map(art => {
		// Захоўваем лічбу лайкаў
		const likesCount = art.likesRel.length;

		// Ствараем копію аб'екта без масіва likesRel, каб не перадаваць лішнія дадзеныя
		const { likesRel, ...rest } = art;

		// Ператвараем у JSON-сумяшчальны фармат (Dates -> Strings)
		const plainData = JSON.parse(JSON.stringify(rest));

		return {
			...plainData,
			likes: likesCount // Перадаем лічбу для інтэрфейсу IArticle
		} as IArticle;
	});
}

/**
 * Інкрэмент праглядаў артыкула
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