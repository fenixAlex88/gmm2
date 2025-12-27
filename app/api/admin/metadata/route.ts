import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const [authors, tags] = await Promise.all([
			prisma.author.findMany({ orderBy: { name: 'asc' } }),
			prisma.tag.findMany({ orderBy: { name: 'asc' } }),
		]);

		return NextResponse.json({ authors, tags });
	} catch {
		return NextResponse.json({ error: 'Ошибка загрузки метаданных' }, { status: 500 });
	}
}