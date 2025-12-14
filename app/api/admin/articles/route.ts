import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';

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
 * Функция для удаления файла с диска по его URL.
 */
async function deleteImageFile(imageUrl: string | undefined | null): Promise<void> {
	if (!imageUrl || !imageUrl.startsWith('/uploads/')) return;

	const relativePath = imageUrl.substring(1);
	const filePath = path.join(process.cwd(), 'public', relativePath);

	try {
		await unlink(filePath);
		console.log(`Файл удален: ${filePath}`);
	} catch (error) {
		// Использование Type Assertion для безопасного доступа к error.code
		const nodeError = error as NodeError;

		// Игнорируем ошибку, если файл не найден (ENOENT)
		if (nodeError.code !== 'ENOENT') {
			console.error(`Ошибка удаления файла ${filePath}:`, error);
		}
	}
}

// --- ОБРАБОТЧИКИ МАРШРУТОВ (CRUD) ---

/**
 * POST /api/admin/articles - Создание новой статьи
 */
export async function POST(req: Request) {
	const data: ArticleInput = await req.json();

	if (!validateArticleData(data)) {
		return NextResponse.json({ error: 'Неверные или неполные данные статьи.' }, { status: 400 });
	}

	// Деструктуризация данных для чистого создания объекта
	const { title, imageUrl, contentHtml, sectionId } = data;

	try {
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

/**
 * GET /api/admin/articles - Получение списка статей
 */
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

/**
 * PUT /api/admin/articles - Обновление существующей статьи
 */
export async function PUT(req: Request) {
	const data: ArticleUpdateInput = await req.json();

	if (!data.id || typeof data.id !== 'number' || !validateArticleData(data)) {
		return NextResponse.json({ error: 'Неверные данные для обновления (ID или поля).' }, { status: 400 });
	}

	// Деструктуризация ID и остальных полей
	const { id, title, imageUrl, contentHtml, sectionId } = data;

	try {
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

/**
 * DELETE /api/admin/articles - Удаление статьи
 */
export async function DELETE(req: Request) {
	// Деструктуризация ID из тела запроса
	const { id }: ArticleIdPayload = await req.json();

	if (!id || typeof id !== 'number') {
		return NextResponse.json({ error: 'ID статьи не предоставлен или неверен.' }, { status: 400 });
	}

	try {
		// 1. Находим статью, чтобы получить URL изображения
		const articleToDelete = await prisma.article.findUnique({
			where: { id },
		});

		if (!articleToDelete) {
			return NextResponse.json({ success: true, message: 'Статья не найдена.' });
		}

		// 2. Удаляем файл (если он есть)
		if (articleToDelete.imageUrl) {
			await deleteImageFile(articleToDelete.imageUrl);
		}

		// 3. Удаляем запись из БД
		await prisma.article.delete({ where: { id } });

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Prisma error (DELETE):', error);
		return NextResponse.json({ error: 'Ошибка сервера при удалении статьи.' }, { status: 500 });
	}
}