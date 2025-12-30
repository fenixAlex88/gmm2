//  app\api\admin\upload\route.ts

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
	try {
		const data = await req.formData();
		const file = data.get("file") as File;

		if (!file || file.size === 0) {
			return NextResponse.json({ error: "Файл не предоставлен." }, { status: 400 });
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// --- Генерация уникального имени ---
		const ext = path.extname(file.name);
		const uniqueFileName = crypto.randomBytes(16).toString("hex") + ext;

		// --- Сохранение файла ---
		const uploadDir = path.join(process.cwd(), "public", "uploads");
		await mkdir(uploadDir, { recursive: true });

		const filePath = path.join(uploadDir, uniqueFileName);
		await writeFile(filePath, buffer);

		// Возвращаем URL
		return NextResponse.json({ url: `/uploads/${uniqueFileName}` });

	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json({ error: "Ошибка сервера при загрузке файла." }, { status: 500 });
	}
}