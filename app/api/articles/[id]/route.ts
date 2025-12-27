import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
	const articleId = parseInt(params.id);

	const article = await prisma.article.update({
		where: { id: articleId },
		data: {
			views: {
				increment: 1
			}
		},
		include: {
			section: true,
			comments: {
				orderBy: { createdAt: 'desc' }
			}
		}
	});

	return Response.json(article);
}