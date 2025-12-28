//  components\ArticleCard.tsx

import Image from 'next/image';
import Link from 'next/link';
import { IArticle } from '@/interfaces/IArticle';
import { Calendar, Eye, Heart } from 'lucide-react';

interface ArticleCardProps {
	article: IArticle;
}

export default function ArticleCard({ article }: ArticleCardProps) {
	const sectionName = typeof article.section === 'string'
		? article.section
		: article.section?.name;

	const formattedDate = article.updatedAt
		? new Date(article.updatedAt).toLocaleDateString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: '2-digit',
		})
		: '--.--.--';

	return (
		<Link href={`/articles/${article.id}`} className="group h-full block">
			<div className="flex flex-col h-full bg-white border border-slate-100 rounded-[2rem] overflow-hidden transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-amber-100/50 hover:border-amber-200 isolate">

				{/* Изображение */}
				<div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-50">
					<Image
						src={article.imageUrl || "/images/noImage.jpg"}
						alt={article.title}
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
						className="object-cover transition-transform duration-700 group-hover:scale-110"
						unoptimized={!!article.imageUrl?.startsWith('/uploads/')}
					/>

					{/* Категория сверху */}
					{sectionName && (
						<div className="absolute top-4 left-4">
							<span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] bg-white/80 backdrop-blur-md text-slate-900 rounded-xl shadow-sm border border-white/50">
								{sectionName}
							</span>
						</div>
					)}
				</div>

				{/* Контент */}
				<div className="flex flex-col flex-grow p-6">
					<h2 className="text-lg font-bold text-slate-900 leading-snug mb-4 line-clamp-2 group-hover:text-amber-600 transition-colors">
						{article.title}
					</h2>

					{/* Футер карточки */}
					<div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50 text-slate-400">

						{/* Дата */}
						<div className="flex items-center gap-2">
							<Calendar size={14} className="text-slate-300" />
							<span className="text-[11px] font-bold tabular-nums">
								{formattedDate}
							</span>
						</div>

						{/* Метрики (Просмотры и Лайки) */}
						<div className="flex items-center gap-2">
							{/* Просмотры */}
							<div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
								<Eye size={14} className="text-slate-300" />
								<span className="text-[11px] font-black text-slate-500 tabular-nums">
									{(article.views || 0).toLocaleString()}
								</span>
							</div>

							{/* Лайки */}
							<div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
								<Heart size={13} className="text-slate-300 fill-slate-50" />
								<span className="text-[11px] font-black text-slate-500 tabular-nums">
									{(article.likes || 0).toLocaleString()}
								</span>
							</div>
						</div>

					</div>
				</div>
			</div>
		</Link>
	);
}