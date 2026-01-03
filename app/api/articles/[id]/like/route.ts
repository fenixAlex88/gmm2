import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const articleId = Number(id);

		if (isNaN(articleId)) {
			return NextResponse.json({ error: 'Няправільны ID' }, { status: 400 });
		}

		// 1. Ствараем новы лайк у звязанай табліцы
		await prisma.like.create({
			data: {
				articleId: articleId
			}
		});

		// 2. Атрымліваем актуальную колькасць лайкаў для гэтага артыкула
		const likesCount = await prisma.like.count({
			where: { articleId: articleId }
		});

		// 3. Вяртаем лічбу кліенту
		return NextResponse.json({ likes: likesCount });

	} catch (error) {
		console.error('Памылка пры захаванні лайка:', error);
		return NextResponse.json({ error: 'Памылка сервера' }, { status: 500 });
	}
}