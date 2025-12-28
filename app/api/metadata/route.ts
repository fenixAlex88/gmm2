// app/api/metadata/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const tagsWithCounts = await prisma.tag.findMany({
			select: {
				name: true,
				_count: {
					select: { articles: true }
				}
			},
			orderBy: {
				articles: { _count: 'desc' }
			}
		});

		const [authors, places, subjects] = await Promise.all([
			prisma.author.findMany({ select: { name: true }, orderBy: { name: 'asc' } }),
			prisma.place.findMany({ select: { name: true }, orderBy: { name: 'asc' } }),
			prisma.subject.findMany({ select: { name: true }, orderBy: { name: 'asc' } }),
		]);

		return NextResponse.json({
			authors: authors.map(a => a.name),
			places: places.map(p => p.name),
			subjects: subjects.map(s => s.name),
			tags: tagsWithCounts.map(t => t.name)
		});
	} catch {
		return NextResponse.json({ error: 'Ошибка загрузки метаданных' }, { status: 500 });
	}
}