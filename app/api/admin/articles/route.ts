import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio'; // Исправленный импорт

// --- ИНТЕРФЕЙСЫ ДЛЯ ТИПИЗАЦИИ ДАННЫХ ---

interface ArticleInput {
	title: string;
	contentHtml: string;
	sectionId: number;
	imageUrl?: string | null;
}

interface ArticleUpdateInput extends ArticleInput {
	id: number;
}

interface ArticleIdPayload {
	id: number;
}

interface NodeError extends Error {
	code?: string;
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

/**
 * Базовая валидация данных для создания/обновления статьи.
 */
function validateArticleData({ title, contentHtml, sectionId }: ArticleInput): boolean {
	if (
		!title || typeof title !== 'string' || title.length < 3 ||
		!contentHtml || typeof contentHtml !== 'string' || contentHtml.length < 10 ||
		!sectionId || typeof sectionId !== 'number'
	) {
		return false;
	}
	return true;
}

/**
 * Извлекает все пути к файлам из контента статьи (включая карусель)
 */
function extractFilesFromHtml(html: string): string[] {
	const $ = cheerio.load(html);
	const files: string[] = [];

	// 1. Ищем обычные изображения, видео и аудио
	// Добавлены типы для параметров, чтобы избежать ошибки "implicitly has any type"
	$('img, video, audio, source').each((_: number, el: cheerio.Element) => {
		const src = $(el).attr('src');
		if (src) files.push(src);
	});

	// 2. Ищем PDF в iframe
	$('iframe').each((_: number, el: cheerio.Element) => {
		const src = $(el).attr('src');
		if (src) files.push(src);
	});

	// 3. Ищем изображения в карусели
	$('[data-type="carousel"]').each((_: number, el: cheerio.Element) => {
		const dataImages = $(el).attr('data-images');
		try {
			if (dataImages) {
				const parsed = JSON.parse(dataImages);
				if (Array.isArray(parsed)) files.push(...parsed);
			}
		} catch (e) {
			console.error("Ошибка парсинга картинок карусели при удалении:", e);
		}
	});

	return [...new Set(files)]; // Удаляем дубликаты
}

/**
 * Универсальная функция удаления файла
 */
async function deleteFile(fileUrl: string | undefined | null): Promise<void> {
	if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;

	// Убираем возможные параметры запроса (например, #view=FitH)
	const cleanPath = fileUrl.split(/[?#]/)[0];
	const relativePath = cleanPath.substring(1);
	const filePath = path.join(process.cwd(), 'public', relativePath);

	try {
		await unlink(filePath);
		console.log(`Файл удален: ${filePath}`);
	} catch (error) {
		const nodeError = error as NodeError;
		if (nodeError.code !== 'ENOENT') {
			console.error(`Ошибка удаления файла ${filePath}:`, error);
		}
	}
}

// --- ОБРАБОТЧИКИ МАРШРУТОВ (CRUD) ---

export async function POST(req: Request) {
	try {
		const data: ArticleInput = await req.json();

		if (!validateArticleData(data)) {
			return NextResponse.json({ error: 'Неверные или неполные данные статьи.' }, { status: 400 });
		}

		const { title, imageUrl, contentHtml, sectionId } = data;

		const article = await prisma.article.create({
			data: { title, imageUrl, contentHtml, sectionId },
			include: { section: true },
		});
		return NextResponse.json(article);
	} catch (error) {
		console.error('Prisma error (POST):', error);
		return NextResponse.json({ error: 'Ошибка сервера при создании статьи.' }, { status: 500 });
	}
}

export async function GET() {
	try {
		const articles = await prisma.article.findMany({
			include: { section: true },
			orderBy: { id: 'desc' },
		});
		return NextResponse.json(articles);
	} catch (error) {
		console.error('Prisma error (GET):', error);
		return NextResponse.json({ error: 'Ошибка сервера при получении списка статей.' }, { status: 500 });
	}
}

export async function PUT(req: Request) {
	try {
		const data: ArticleUpdateInput = await req.json();

		if (!data.id || typeof data.id !== 'number' || !validateArticleData(data)) {
			return NextResponse.json({ error: 'Неверные данные для обновления (ID или поля).' }, { status: 400 });
		}

		const { id, title, imageUrl, contentHtml, sectionId } = data;

		const article = await prisma.article.update({
			where: { id },
			data: { title, imageUrl, contentHtml, sectionId },
			include: { section: true },
		});
		return NextResponse.json(article);
	} catch (error) {
		console.error('Prisma error (PUT):', error);
		return NextResponse.json({ error: 'Ошибка сервера при обновлении статьи.' }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	try {
		const { id }: ArticleIdPayload = await req.json();

		if (!id || typeof id !== 'number') {
			return NextResponse.json({ error: 'ID статьи не предоставлен.' }, { status: 400 });
		}

		const article = await prisma.article.findUnique({
			where: { id },
		});

		if (!article) {
			return NextResponse.json({ success: true, message: 'Статья не найдена.' });
		}

		const filesToDelete: string[] = [];

		if (article.imageUrl) {
			filesToDelete.push(article.imageUrl);
		}

		const contentFiles = extractFilesFromHtml(article.contentHtml);
		filesToDelete.push(...contentFiles);

		// Физическое удаление файлов
		await Promise.allSettled(filesToDelete.map(url => deleteFile(url)));

		// Удаление записи из БД
		await prisma.article.delete({ where: { id } });

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Ошибка при полном удалении статьи:', error);
		return NextResponse.json({ error: 'Ошибка сервера при удалении.' }, { status: 500 });
	}
}