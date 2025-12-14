import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// CREATE
export async function POST(req: Request) {
	const data = await req.json();
	const article = await prisma.article.create({
		data: {
			title: data.title,
			imageUrl: data.imageUrl,
			contentHtml: data.contentHtml,
			sectionId: data.sectionId,
		},
	});
	return NextResponse.json(article);
}

// UPDATE
export async function PUT(req: Request) {
	const data = await req.json();
	const article = await prisma.article.update({
		where: { id: data.id },
		data: {
			title: data.title,
			imageUrl: data.imageUrl,
			contentHtml: data.contentHtml,
			sectionId: data.sectionId,
		},
	});
	return NextResponse.json(article);
}

// DELETE
export async function DELETE(req: Request) {
	const { id } = await req.json();
	await prisma.article.delete({ where: { id } });
	return NextResponse.json({ success: true });
}

// LIST
export async function GET() {
	const articles = await prisma.article.findMany({ include: { section: true } });
	return NextResponse.json(articles);
}
