import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readdir, unlink } from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';

// Используем ту же логику извлечения, что и в основном роуте статей
function extractFilesFromHtml(html: string): string[] {
	const $ = cheerio.load(html);
	const files: string[] = [];
	$('img, video, audio, source, iframe').each((_, el) => {
		const src = $(el).attr('src');
		if (src) files.push(src.split(/[?#]/)[0]); // Чистим от параметров
	});
	$('[data-type="carousel"]').each((_, el) => {
		const dataImages = $(el).attr('data-images');
		try {
			if (dataImages) {
				const parsed = JSON.parse(dataImages);
				if (Array.isArray(parsed)) files.push(...parsed.map((s: string) => s.split(/[?#]/)[0]));
			}
		} catch { }
	});
	return files;
}

export async function POST() {
	try {
		// 1. Собираем ВСЕ ссылки на файлы из ВСЕХ статей в базе
		const articles = await prisma.article.findMany({
			select: { contentHtml: true, imageUrl: true }
		});

		const usedFiles = new Set<string>();
		articles.forEach(art => {
			if (art.imageUrl) usedFiles.add(art.imageUrl.split(/[?#]/)[0]);
			const contentFiles = extractFilesFromHtml(art.contentHtml);
			contentFiles.forEach(f => usedFiles.add(f));
		});

		// 2. Сканируем папку uploads на сервере
		const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
		let filesOnDisk: string[] = [];
		try {
			filesOnDisk = await readdir(uploadsDir);
		} catch {
			return NextResponse.json({ message: 'Папка uploads пуста или не найдена' });
		}

		// 3. Сравниваем и удаляем лишнее
		let deletedCount = 0;
		await Promise.allSettled(
			filesOnDisk.map(async (fileName) => {
				const fileUrl = `/uploads/${fileName}`;

				// Если файла НЕТ в списке используемых — удаляем
				if (!usedFiles.has(fileUrl)) {
					await unlink(path.join(uploadsDir, fileName));
					deletedCount++;
				}
			})
		);

		return NextResponse.json({
			success: true,
			message: `Очистка завершена. Удалено файлов: ${deletedCount}`
		});
	} catch (error) {
		console.error('Cleanup error:', error);
		return NextResponse.json({ error: 'Ошибка при очистке' }, { status: 500 });
	}
}