// app/api/articles/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';


export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);

		// Извлекаем параметры фильтрации
		const sectionId = searchParams.get('sectionId');
		const authors = searchParams.get('authors')?.split(',').filter(Boolean);
		const subjects = searchParams.get('subjects')?.split(',').filter(Boolean);
		const places = searchParams.get('places')?.split(',').filter(Boolean);
		const tags = searchParams.get('tags')?.split(',').filter(Boolean);
		const search = searchParams.get('search');

		// Параметры сортировки
		const sort = searchParams.get('sort') || 'newest';

		// Формируем объект фильтрации (where)
		const where: Prisma.ArticleWhereInput = {
			AND: [
				sectionId ? { sectionId: Number(sectionId) } : {},
				authors?.length ? { author: { name: { in: authors } } } : {},
				subjects?.length ? { subjects: { some: { name: { in: subjects } } } } : {},
				places?.length ? { places: { some: { name: { in: places } } } } : {},
				tags?.length ? { tags: { some: { name: { in: tags } } } } : {},
				// Глобальный поиск (Partial match)
				search ? {
					OR: [
						{ title: { contains: search, mode: 'insensitive' } },
						{ author: { name: { contains: search, mode: 'insensitive' } } },
						{ subjects: { some: { name: { contains: search, mode: 'insensitive' } } } },
						{ places: { some: { name: { contains: search, mode: 'insensitive' } } } },
					]
				} : {},
			]
		};

		// Формируем объект сортировки
		let orderBy: Prisma.ArticleOrderByWithRelationInput = { updatedAt: 'desc' };
		if (sort === 'oldest') orderBy = { updatedAt: 'asc' };
		if (sort === 'views') orderBy = { views: 'desc' };
		if (sort === 'likes') orderBy = { likes: 'desc' };

		const articles = await prisma.article.findMany({
			where,
			orderBy,
			select: {
				id: true,
				title: true,
				imageUrl: true,
				updatedAt: true,
				views: true,
				likes: true,
				section: { select: { id: true, name: true } },
				tags: { select: { name: true } },
				author: { select: { name: true } },
				subjects: { select: { name: true } },
				places: { select: { name: true } },
			},
		});

		return NextResponse.json(articles);
	} catch (error) {
		console.error("Fetch articles error:", error);
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}