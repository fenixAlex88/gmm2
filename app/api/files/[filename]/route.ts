import { NextRequest, NextResponse } from "next/server";
import { stat, open } from "fs/promises";
import path from "path";
import mime from "mime-types";
import { existsSync } from 'fs';

type RouteContext = {
	params: Promise<{ filename: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
	try {
		const { filename } = await context.params;
		const filePath = path.join(process.cwd(), "storage", "uploads", filename);

		if (!existsSync(filePath)) {
			console.warn(`[FILE NOT FOUND] ${filename}`);
			return new Response("Файл не знойдзены", { status: 404 });
		}

		// 1. Атрымліваем інфармацыю аб файле (памер)
		const fileStat = await stat(filePath);
		const fileSize = fileStat.size;
		const contentType = mime.lookup(filename) || "application/octet-stream";

		// 2. Правяраем загаловак Range ад браўзера
		const range = req.headers.get("range");

		if (range) {
			// Апрацоўка Range запыту (напрыклад, "bytes=0-1023")
			const parts = range.replace(/bytes=/, "").split("-");
			const start = parseInt(parts[0], 10);
			const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
			const chunksize = end - start + 1;

			const file = await open(filePath, "r");
			const buffer = Buffer.alloc(chunksize);
			await file.read(buffer, 0, chunksize, start);
			await file.close();

			return new NextResponse(buffer, {
				status: 206, // Partial Content
				headers: {
					"Content-Range": `bytes ${start}-${end}/${fileSize}`,
					"Accept-Ranges": "bytes",
					"Content-Length": chunksize.toString(),
					"Content-Type": contentType,
				},
			});
		}

		// 3. Калі Range няма — аддаем файл цалкам (як і было)
		const file = await open(filePath, "r");
		const data = await file.readFile();
		await file.close();

		return new NextResponse(data, {
			status: 200,
			headers: {
				"Accept-Ranges": "bytes",
				"Content-Length": fileSize.toString(),
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		});
	} catch (error) {
		console.error("File serving error:", error);
		return NextResponse.json({ error: "File not found" }, { status: 404 });
	}
}