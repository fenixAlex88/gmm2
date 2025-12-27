import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// Импортируйте ваши настройки authOptions (обычно они в [...nextauth]/route.ts или вынесены в lib/auth.ts)
// Если они в route.ts, лучше вынести их в @/lib/auth.ts для переиспользования.

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);

		// 1. Проверка авторизации
		if (!session || !session.user) {
			return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
		}

		const body = await req.json();
		const { content, articleId } = body;

		// 2. Валидация данных
		if (!content || !articleId) {
			return NextResponse.json({ error: 'Неполные данные' }, { status: 400 });
		}

		// 3. Сохранение в БД
		// Данные автора берем строго из сессии, а не из тела запроса (для безопасности)
		const comment = await prisma.comment.create({
			data: {
				content: content,
				articleId: Number(articleId),
				authorName: session.user.name || 'Аноним',
				authorImage: session.user.image,
				authorEmail: session.user.email || '',
			},
		});

		return NextResponse.json(comment, { status: 201 });
	} catch (error) {
		console.error('Ошибка при создании комментария:', error);
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}