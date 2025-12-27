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

export async function DELETE(req: Request) {
	try {
		const { type, id } = await req.json();

		if (type === 'author') {
			await prisma.author.delete({ where: { id: Number(id) } });
		} else if (type === 'tag') {
			await prisma.tag.delete({ where: { id: Number(id) } });
		} else {
			return NextResponse.json({ error: 'Неверный тип' }, { status: 400 });
		}

		return NextResponse.json({ success: true });
	} catch {
		return NextResponse.json({ error: 'Ошибка при удалении. Возможно, данные используются.' }, { status: 500 });
	}
}