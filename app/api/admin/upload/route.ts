import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
	try {
		const data = await req.formData();
		const file = data.get("file") as File;

		if (!file || file.size === 0) {
			return NextResponse.json({ error: "Файл не прадастаўлены." }, { status: 400 });
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Генерацыя ўнікальнага імя
		const ext = path.extname(file.name);
		const uniqueFileName = crypto.randomBytes(16).toString("hex") + ext;

		// Захоўваем ПА-ЗА папкай public (у корані праекта)
		const uploadDir = path.join(process.cwd(), "storage", "uploads");
		await mkdir(uploadDir, { recursive: true });

		const filePath = path.join(uploadDir, uniqueFileName);
		await writeFile(filePath, buffer);

		// Вяртаем URL, які будзе апрацоўвацца нашым новым роутам
		return NextResponse.json({ url: `/api/files/${uniqueFileName}` });

	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json({ error: "Памылка сервера пры загрузцы." }, { status: 500 });
	}
}