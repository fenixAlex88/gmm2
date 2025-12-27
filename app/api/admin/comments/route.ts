import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
	try {
		const { id } = await req.json();
		await prisma.comment.delete({ where: { id: Number(id) } });
		return NextResponse.json({ success: true });
	} catch {
		return NextResponse.json({ error: 'Ошибка удаления комментария' }, { status: 500 });
	}
}

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const articleId = searchParams.get('articleId');

	const comments = await prisma.comment.findMany({
		where: { articleId: Number(articleId) },
		orderBy: { createdAt: 'desc' }
	});
	return NextResponse.json(comments);
}