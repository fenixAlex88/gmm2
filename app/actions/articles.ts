'use server';

import { prisma } from "@/lib/prisma";
import { IArticle } from "@/interfaces/IArticle";
import { FilterState } from "@/app/(main)/components/FilterSection";
import { Prisma } from '@/generated/prisma/client';
import { SortOption } from '@/interfaces/SortOptions';

/**
 * Серверный экшен для получения списка статей с учетом фильтров, поиска и сортировки.
 * Использует гибридный подход для обхода ограничений локали "C" в PostgreSQL.
 */
export async function getArticlesAction(params: {
	skip: number;
	search?: string;
	sortBy?: SortOption;
	filters?: FilterState;
}): Promise<IArticle[]> {
	const { skip, search, sortBy, filters } = params;

	// 1. Формируем базовые условия фильтрации Prisma
	const whereConditions: Prisma.ArticleWhereInput[] = [
		filters?.sectionId ? { sectionId: Number(filters.sectionId) } : {},
		filters?.authors?.length ? { author: { name: { in: filters.authors.map(o => o.value) } } } : {},
		filters?.places?.length ? { places: { some: { name: { in: filters.places.map(o => o.value) } } } } : {},
		filters?.tags?.length ? { tags: { some: { name: { in: filters.tags.map(o => o.value) } } } } : {},
		filters?.subjects?.length ? { subjects: { some: { name: { in: filters.subjects.map(o => o.value) } } } } : {},
	];

	// Вспомогательная функция для нормализации текста (регистр + i/і/и)
	const normalizeText = (t: string | null | undefined) =>
		(t || "").toLowerCase().replace(/[іиi]/g, "i").trim();

	// 2. Глобальный поиск (Title, Author, Places, Subjects)
	// Выполняется в памяти Node.js для 100% регистронезависимости при любой локали БД
	if (search && search.trim() !== "") {
		const normalizedQuery = normalizeText(search);

		// Получаем минимальный набор данных для поиска в памяти
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

		// Если поиск ничего не дал, возвращаем пустой массив сразу
		if (matchedIds.length === 0) return [];

		whereConditions.push({ id: { in: matchedIds } });
	}

	// 3. Определяем логику сортировки на основе Enum
	let orderBy: Prisma.ArticleOrderByWithRelationInput;

	switch (sortBy) {
		case SortOption.Oldest:
			orderBy = { createdAt: 'asc' };
			break;
		case SortOption.Views:
			orderBy = { views: 'desc' };
			break;
		case SortOption.Likes:
			orderBy = { likes: 'desc' };
			break;
		case SortOption.Newest:
		default:
			orderBy = { createdAt: 'desc' };
			break;
	}

	// 4. Финальный запрос к БД
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

	// Сериализуем Date в string для безопасной передачи Client-компонентам
	return JSON.parse(JSON.stringify(articles));
}

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