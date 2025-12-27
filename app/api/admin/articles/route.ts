import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';

interface ArticleInput {
	id?: number;
	title: string;
	contentHtml: string;
	sectionId: number;
	imageUrl?: string | null;
	authorName?: string | null;
	tagNames?: string[];
}

// Извлекаем файлы из HTML с типами
function extractFilesFromHtml(html: string): string[] {
	const $ = cheerio.load(html);
	const files: string[] = [];

	$('img, video, audio, source, iframe').each((_, el) => {
		const src = $(el).attr('src');
		if (src) files.push(src);
	});

	$('[data-type="carousel"]').each((_, el) => {
		try {
			const data = $(el).attr('data-images');
			if (data) {
				const parsed = JSON.parse(data);
				if (Array.isArray(parsed)) files.push(...parsed);
			}
		} catch {
			// Игнорируем ошибки парсинга
		}
	});
	return [...new Set(files)];
}

async function deleteFile(fileUrl: string | null | undefined) {
	if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
	const cleanPath = fileUrl.split(/[?#]/)[0].substring(1);
	const filePath = path.join(process.cwd(), 'public', cleanPath);
	try {
		await unlink(filePath);
	} catch (error: unknown) {
		const err = error as { code?: string };
		if (err.code !== 'ENOENT') console.error(`Ошибка удаления: ${filePath}`, error);
	}
}

export async function GET() {
	try {
		const articles = await prisma.article.findMany({
			include: { section: true, author: true, tags: true },
			orderBy: { id: 'desc' },
		});
		return NextResponse.json(articles);
	} catch {
		return NextResponse.json({ error: 'Ошибка получения данных' }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const data: ArticleInput = await req.json();
		const { title, contentHtml, sectionId, imageUrl, authorName, tagNames = [] } = data;

		const article = await prisma.article.create({
			data: {
				title,
				contentHtml,
				imageUrl,
				section: { connect: { id: Number(sectionId) } },
				author: authorName ? {
					connectOrCreate: {
						where: { name: authorName },
						create: { name: authorName }
					}
				} : undefined,
				tags: {
					connectOrCreate: tagNames.map(name => ({
						where: { name },
						create: { name }
					}))
				}
			},
			include: { section: true, author: true, tags: true }
		});
		return NextResponse.json(article);
	} catch (error) {
		console.error('POST Error:', error);
		return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 });
	}
}

export async function PUT(req: Request) {
	try {
		const data: ArticleInput = await req.json();
		const { id, title, contentHtml, sectionId, imageUrl, authorName, tagNames = [] } = data;

		const oldArticle = await prisma.article.findUnique({
			where: { id },
			include: { tags: true }
		});
		if (!oldArticle) return NextResponse.json({ error: 'Не найдена' }, { status: 404 });

		const oldFiles = [oldArticle.imageUrl, ...extractFilesFromHtml(oldArticle.contentHtml)];
		const newFiles = [imageUrl, ...extractFilesFromHtml(contentHtml)];
		const deletedFiles = oldFiles.filter(f => f && !newFiles.includes(f));
		await Promise.allSettled(deletedFiles.map(deleteFile));

		const updated = await prisma.article.update({
			where: { id },
			data: {
				title,
				contentHtml,
				imageUrl,
				section: { connect: { id: Number(sectionId) } },
				author: authorName ? {
					connectOrCreate: {
						where: { name: authorName },
						create: { name: authorName }
					}
				} : { disconnect: true },
				tags: {
					set: [],
					connectOrCreate: tagNames.map(name => ({
						where: { name },
						create: { name }
					}))
				}
			},
			include: { section: true, author: true, tags: true }
		});
		return NextResponse.json(updated);
	} catch (error) {
		console.error('PUT Error:', error);
		return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const id = Number(searchParams.get('id'));

		if (!id) {
			return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
		}

		const article = await prisma.article.findUnique({
			where: { id },
			include: { tags: true } 
		});

		if (article) {
			const files = [article.imageUrl, ...extractFilesFromHtml(article.contentHtml)]
				.filter(Boolean) as string[];

			await Promise.allSettled(files.map(deleteFile));

			await prisma.$transaction(async (tx) => {
				await tx.article.update({
					where: { id },
					data: { tags: { set: [] } }
				});

				await tx.article.delete({ where: { id } });
			});
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error("DELETE_ERROR:", error);

		return NextResponse.json(
			{ error: 'Ошибка удаления', details: error.message },
			{ status: 500 }
		);
	}
}