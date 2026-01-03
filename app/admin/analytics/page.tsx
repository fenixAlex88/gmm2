import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, startOfMonth, format } from 'date-fns';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AnalyticsDashboard from './AnalyticsDashboard';

// Вызначаем тыпы для ўнутраных даных
export interface VisitRecord {
	id: number;
	path: string;
	country: string | null;
	city: string | null;
	latitude: number | null;
	longitude: number | null;
	sessionId: string;
	createdAt: Date;
}

export interface PopularPage {
	path: string;
	title: string;
	count: number;
}

export interface EngagementStats {
	newCommentsCount: number;
	topLikedArticles: { id: number; title: string; likes: number }[];
	topCommentedArticles: { id: number; title: string; count: number }[];
}

function aggregateCities(arr: VisitRecord[]): [string, number][] {
	const counts: Record<string, number> = {};
	arr.forEach(item => {
		const city = item.city || 'Невядома';
		const country = item.country || 'Невядомая краіна';
		// Фармуем ключ у выглядзе City/Country
		const key = `${city}/${country}`;
		counts[key] = (counts[key] || 0) + 1;
	});

	return Object.entries(counts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10);
}

async function getEngagementStats(startDate: Date): Promise<EngagementStats> {
	const [newCommentsCount, topLikedArticles, topCommentedArticles] = await Promise.all([
		// Колькасць новых каментароў
		prisma.comment.count({ where: { createdAt: { gte: startDate } } }),

		// ТОП ПА ЛАЙКАХ ЗА ПЕРЫЯД
		prisma.article.findMany({
			where: {
				likesRel: {
					some: { createdAt: { gte: startDate } }
				}
			},
			select: {
				id: true,
				title: true,
				_count: {
					select: {
						likesRel: { where: { createdAt: { gte: startDate } } }
					}
				}
			},
			orderBy: {
				likesRel: { _count: 'desc' }
			},
			take: 5
		}),

		// ТОП ПА КАМЕНТАРАХ ЗА ПЕРЫЯД
		prisma.article.findMany({
			where: {
				comments: {
					some: { createdAt: { gte: startDate } }
				}
			},
			select: {
				id: true,
				title: true,
				_count: {
					select: {
						comments: { where: { createdAt: { gte: startDate } } }
					}
				}
			},
			orderBy: {
				comments: { _count: 'desc' }
			},
			take: 5
		})
	]);

	return {
		newCommentsCount,
		topLikedArticles: topLikedArticles.map(a => ({
			id: a.id,
			title: a.title,
			likes: a._count.likesRel
		})),
		topCommentedArticles: topCommentedArticles.map(a => ({
			id: a.id,
			title: a.title,
			count: a._count.comments
		}))
	};
}

async function getPopularPages(visits: VisitRecord[]): Promise<PopularPage[]> {
	const pathCounts: Record<string, number> = {};
	visits.forEach(v => {
		pathCounts[v.path] = (pathCounts[v.path] || 0) + 1;
	});

	const articleIds = Object.keys(pathCounts)
		.map(path => {
			const match = path.match(/\/articles\/(\d+)/);
			return match ? parseInt(match[1]) : null;
		})
		.filter((id): id is number => id !== null);

	const articles = await prisma.article.findMany({
		where: { id: { in: Array.from(new Set(articleIds)) } },
		select: { id: true, title: true }
	});

	return Object.entries(pathCounts)
		.map(([path, count]) => {
			const match = path.match(/\/articles\/(\d+)/);
			const articleId = match ? parseInt(match[1]) : null;
			const article = articles.find(a => a.id === articleId);

			return {
				path,
				title: article ? article.title : path,
				count
			};
		})
		.sort((a, b) => b.count - a.count)
		.slice(0, 15);
}

export default async function AdminAnalyticsPage({
	searchParams,
}: {
	searchParams: Promise<{ range?: string }>;
}) {
	const params = await searchParams;
	const cookieStore = await cookies();

	if (cookieStore.get('admin_session')?.value !== process.env.ADMIN_SECRET) {
		redirect('/login');
	}

	const range = params.range || 'today';
	let startDate = startOfDay(new Date());
	if (range === 'week') startDate = subDays(new Date(), 7);
	if (range === 'month') startDate = subDays(new Date(), 30);

	// 1. Атрымліваем візіты за перыяд (уплывае на ўсе графікі і карту)
	const visits = await prisma.visit.findMany({
		where: { createdAt: { gte: startDate } },
		orderBy: { createdAt: 'asc' },
	}) as VisitRecord[];

	// 2. Атрымліваем папулярныя старонкі і статыстыку ўцягнутасці за ТОЙ ЖА перыяд
	const [popularPages, engagement] = await Promise.all([
		getPopularPages(visits), // Фільтруецца праз масіў visits
		getEngagementStats(startDate) // Фільтруецца праз SQL запыт
	]);

	const timeline = visits.reduce((acc: Record<string, number>, v) => {
		const date = format(v.createdAt, 'yyyy-MM-dd HH:00');
		acc[date] = (acc[date] || 0) + 1;
		return acc;
	}, {});

	const stats = {
		total: visits.length,
		uniqueSessions: new Set(visits.map(v => v.sessionId)).size,
		byCity: aggregateCities(visits),
		popularPages,
		newComments: engagement.newCommentsCount,
		topLiked: engagement.topLikedArticles,
		topCommented: engagement.topCommentedArticles,
		points: visits
			.filter(v => v.latitude !== null && v.longitude !== null)
			.map(v => ({
				lat: v.latitude!,
				lng: v.longitude!,
				city: v.city || 'Невядома',
				path: v.path
			})),
		timeline
	};

	return (
		<div className="p-8 bg-gray-50 min-h-screen">
			<AnalyticsDashboard initialData={stats} currentRange={range} />
		</div>
	);
}