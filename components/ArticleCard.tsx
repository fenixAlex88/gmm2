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

	return (
		<article className="h-full">
			<Link
				href={`/articles/${article.id}`}
				className="group h-full block"
				aria-labelledby={`article-title-${article.id}`}
			>
				<div className="flex flex-col h-full bg-white border border-slate-100 rounded-[2rem] overflow-hidden transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-amber-100/50 hover:border-amber-200 isolate">

					<div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-50">
						<Image
							src={article.imageUrl || "/images/noImage.jpg"}
							alt={article.title}
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
							className="object-cover transition-transform duration-700 group-hover:scale-110"
						/>

						{article.description && (
							<div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] p-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<p aria-hidden="true" className="text-white text-lg font-medium leading-relaxed text-center line-clamp-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
									{article.description}
								</p>
							</div>
						)}

						{sectionName && (
							<div className="absolute top-4 left-4">
								<span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] bg-white/80 backdrop-blur-md text-slate-900 rounded-xl shadow-sm border border-white/50">
									<span className="sr-only">Катэгорыя: </span>{sectionName}
								</span>
							</div>
						)}
					</div>

					<div className="flex flex-col flex-grow px-6 py-2">
						<h2 id={`article-title-${article.id}`} className="text-lg font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
							{article.title}
						</h2>

						<div className="mt-auto pt-1 flex items-center justify-between border-t border-slate-50 text-slate-400">
							<div className="flex items-center gap-2" aria-label={`Дата публікацыі: ${article.displayDate}`}>
								<Calendar size={14} aria-hidden="true" className="text-slate-300" />
								<time dateTime={article.isoDate} className="text-[11px] font-bold tabular-nums">
									{article.displayDate}
								</time>
							</div>

							<div className="flex items-center gap-2">
								<div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100" aria-label={`${article.views || 0} праглядаў`}>
									<Eye size={14} aria-hidden="true" className="text-slate-300" />
									<span className="text-[11px] font-black text-slate-500 tabular-nums">
										{article.views || 0}
									</span>
								</div>

								<div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100" aria-label={`${article.likesRel?.length || 0} лайкаў`}>
									<Heart size={13} aria-hidden="true" className="text-slate-300 fill-slate-50" />
									<span className="text-[11px] font-black text-slate-500 tabular-nums">
										{article.likesRel?.length || 0}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Link>
		</article>
	);
}