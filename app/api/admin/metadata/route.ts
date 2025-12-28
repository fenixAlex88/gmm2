import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const [authors, tags, places, subjects] = await Promise.all([
			prisma.author.findMany({ orderBy: { name: 'asc' } }),
			prisma.tag.findMany({ orderBy: { name: 'asc' } }),
			prisma.place.findMany({ orderBy: { name: 'asc' } }),
			prisma.subject.findMany({ orderBy: { name: 'asc' } }),
		]);
		return NextResponse.json({ authors, tags, places, subjects });
	} catch {
		return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	try {
		const { type, id } = await req.json();
		const targetId = Number(id);

		switch (type) {
			case 'author': await prisma.author.delete({ where: { id: targetId } }); break;
			case 'tag': await prisma.tag.delete({ where: { id: targetId } }); break;
			case 'place': await prisma.place.delete({ where: { id: targetId } }); break;
			case 'subject': await prisma.subject.delete({ where: { id: targetId } }); break;
			default: return NextResponse.json({ error: 'Неверный тип' }, { status: 400 });
		}

		return NextResponse.json({ success: true });
	} catch {
		return NextResponse.json({ error: 'Данные используются в статьях' }, { status: 500 });
	}
}