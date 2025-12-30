import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readdir, unlink } from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';

function extractFilesFromHtml(html: string): string[] {
	const $ = cheerio.load(html);
	const files: string[] = [];
	$('img, video, audio, source, iframe').each((_, el) => {
		const src = $(el).attr('src');
		if (src) {
			// Атрымліваем толькі імя файла (напрыклад, "abc.jpg")
			files.push(path.basename(src.split(/[?#]/)[0]));
		}
	});
	$('[data-type="carousel"]').each((_, el) => {
		const dataImages = $(el).attr('data-images');
		try {
			if (dataImages) {
				const parsed = JSON.parse(dataImages);
				if (Array.isArray(parsed)) {
					files.push(...parsed.map((s: string) => path.basename(s.split(/[?#]/)[0])));
				}
			}
		} catch { }
	});
	return files;
}

export async function POST() {
	try {
		// 1. Чытаем усе артыкулы
		const articles = await prisma.article.findMany({
			select: { contentHtml: true, imageUrl: true }
		});

		const usedFiles = new Set<string>();
		articles.forEach(art => {
			// Дадаем галоўную выяву
			if (art.imageUrl) {
				usedFiles.add(path.basename(art.imageUrl.split(/[?#]/)[0]));
			}
			// Дадаем файлы з тэксту
			const contentFiles = extractFilesFromHtml(art.contentHtml);
			contentFiles.forEach(f => usedFiles.add(f));
		});

		// 2. ВАЖНА: Шлях павінен быць ідэнтычны роуту загрузкі!
		// Выкарыстоўваем "storage", "uploads", як у вашым POST для загрузкі
		const uploadsDir = path.join(process.cwd(), "storage", "uploads");

		let filesOnDisk: string[] = [];
		try {
			filesOnDisk = await readdir(uploadsDir);
		} catch (e) {
			return NextResponse.json({ message: 'Тэчка uploads пакуль пустая або не створана' });
		}

		// 3. Працэс выдалення
		let deletedCount = 0;
		const deletedNames: string[] = [];

		for (const fileName of filesOnDisk) {
			// Пропуск сістэмных файлаў
			if (fileName.startsWith('.')) continue;

			// Калі імя файла з дыска няма ў наборы usedFiles — выдаляем
			if (!usedFiles.has(fileName)) {
				await unlink(path.join(uploadsDir, fileName));
				deletedCount++;
				deletedNames.push(fileName);
			}
		}

		return NextResponse.json({
			success: true,
			message: `Ачыстка завершана. Выдалена файлаў: ${deletedCount}`,
			deletedFiles: deletedNames,
			totalUsedFound: usedFiles.size
		});
	} catch (error) {
		console.error('Cleanup error:', error);
		return NextResponse.json({ error: 'Памылка пры ачыстцы' }, { status: 500 });
	}
}