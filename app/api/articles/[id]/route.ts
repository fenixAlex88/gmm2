import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
	params: Promise<{ id: string }>;
};

export async function GET(req: Request, context: RouteContext) {
	try {
		const { id } = await context.params;
		const articleId = parseInt(id);

		if (isNaN(articleId)) {
			return NextResponse.json({ error: "Неверный формат ID" }, { status: 400 });
		}

		const article = await prisma.article.update({
			where: { id: articleId },
			data: {
				views: {
					increment: 1
				}
			},
			include: {
				section: true,
				tags: true,
				author: true,
				comments: {
					orderBy: { createdAt: 'desc' }
				}
			}
		});

		return NextResponse.json(article);
	} catch (error) {
		console.error("API Error:", error);
		return NextResponse.json({ error: "Статья не найдена" }, { status: 404 });
	}
}