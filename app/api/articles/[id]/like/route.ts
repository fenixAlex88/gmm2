import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const updated = await prisma.article.update({
		where: { id: Number(id) },
		data: { likes: { increment: 1 } }
	});

	return NextResponse.json({ likes: updated.likes });
}