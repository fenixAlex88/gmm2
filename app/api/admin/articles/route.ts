import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';

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
 * Валидация данных статьи
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
 * Извлекает все пути к файлам из контента статьи (включая карусель, видео, аудио, pdf)
 */
function extractFilesFromHtml(html: string): string[] {
	const $ = cheerio.load(html);
	const files: string[] = [];

	// 1. Изображения, видео, аудио
	$('img, video, audio, source').each((_: number, el: cheerio.Element) => {
		const src = $(el).attr('src');
		if (src) files.push(src);
	});

	// 2. PDF в iframe
	$('iframe').each((_: number, el: cheerio.Element) => {
		const src = $(el).attr('src');
		if (src) files.push(src);
	});

	// 3. Данные из карусели TipTap
	$('[data-type="carousel"]').each((_: number, el: cheerio.Element) => {
		const dataImages = $(el).attr('data-images');
		try {
			if (dataImages) {
				const parsed = JSON.parse(dataImages);
				if (Array.isArray(parsed)) files.push(...parsed);
			}
		} catch (e) {
			console.error("Ошибка парсинга карусели:", e);
		}
	});

	return [...new Set(files)]; // Убираем дубликаты
}

/**
 * Физическое удаление файла с диска
 */
async function deleteFile(fileUrl: string | undefined | null): Promise<void> {
	if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;

	// Очищаем путь от параметров (например, #view=FitH)
	const cleanPath = fileUrl.split(/[?#]/)[0];
	const relativePath = cleanPath.substring(1);
	const filePath = path.join(process.cwd(), 'public', relativePath);

	try {
		await unlink(filePath);
		console.log(`Файл успешно удален: ${filePath}`);
	} catch (error) {
		const nodeError = error as NodeError;
		if (nodeError.code !== 'ENOENT') {
			console.error(`Ошибка при удалении файла ${filePath}:`, error);
		}
	}
}

// --- ОБРАБОТЧИКИ МАРШРУТОВ ---

/**
 * POST - Создание статьи
 */
export async function POST(req: Request) {
	try {
		const data: ArticleInput = await req.json();
		if (!validateArticleData(data)) {
			return NextResponse.json({ error: 'Неверные данные.' }, { status: 400 });
		}

		const { title, imageUrl, contentHtml, sectionId } = data;
		const article = await prisma.article.create({
			data: { title, imageUrl, contentHtml, sectionId },
			include: { section: true },
		});
		return NextResponse.json(article);
	} catch (error) {
		console.error('POST Error:', error);
		return NextResponse.json({ error: 'Ошибка при создании.' }, { status: 500 });
	}
}

/**
 * GET - Список статей
 */
export async function GET() {
	try {
		const articles = await prisma.article.findMany({
			include: { section: true },
			orderBy: { id: 'desc' },
		});
		return NextResponse.json(articles);
	} catch {
		return NextResponse.json({ error: 'Ошибка получения данных.' }, { status: 500 });
	}
}

/**
 * PUT - Обновление статьи (с автоматической очисткой удаленных файлов)
 */
export async function PUT(req: Request) {
	try {
		const data: ArticleUpdateInput = await req.json();
		if (!data.id || !validateArticleData(data)) {
			return NextResponse.json({ error: 'Неверные данные для обновления.' }, { status: 400 });
		}

		const { id, title, imageUrl, contentHtml, sectionId } = data;

		// 1. Получаем текущую версию статьи из БД до обновления
		const oldArticle = await prisma.article.findUnique({ where: { id } });
		if (!oldArticle) {
			return NextResponse.json({ error: 'Статья не найдена.' }, { status: 404 });
		}

		// 2. Формируем списки всех файлов (старых и новых)
		const oldFiles = [
			...(oldArticle.imageUrl ? [oldArticle.imageUrl] : []),
			...extractFilesFromHtml(oldArticle.contentHtml)
		];

		const newFiles = [
			...(imageUrl ? [imageUrl] : []),
			...extractFilesFromHtml(contentHtml)
		];

		// 3. Находим разницу: файлы, которые были, но исчезли из нового контента
		const deletedFiles = oldFiles.filter(file => !newFiles.includes(file));

		// 4. Удаляем "выброшенные" файлы с диска
		if (deletedFiles.length > 0) {
			await Promise.allSettled(deletedFiles.map(url => deleteFile(url)));
		}

		// 5. Сохраняем обновленную статью
		const updatedArticle = await prisma.article.update({
			where: { id },
			data: { title, imageUrl, contentHtml, sectionId },
			include: { section: true },
		});

		return NextResponse.json(updatedArticle);
	} catch (error) {
		console.error('PUT Error:', error);
		return NextResponse.json({ error: 'Ошибка при обновлении.' }, { status: 500 });
	}
}

/**
 * DELETE - Полное удаление статьи и всех её медиафайлов
 */
export async function DELETE(req: Request) {
	try {
		const { id }: ArticleIdPayload = await req.json();
		const article = await prisma.article.findUnique({ where: { id } });

		if (!article) {
			return NextResponse.json({ success: true, message: 'Уже удалено.' });
		}

		// Собираем всё: главное фото + файлы из текста
		const filesToDelete = [
			...(article.imageUrl ? [article.imageUrl] : []),
			...extractFilesFromHtml(article.contentHtml)
		];

		// Чистим диск
		await Promise.allSettled(filesToDelete.map(url => deleteFile(url)));

		// Чистим БД
		await prisma.article.delete({ where: { id } });

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('DELETE Error:', error);
		return NextResponse.json({ error: 'Ошибка при удалении.' }, { status: 500 });
	}
}