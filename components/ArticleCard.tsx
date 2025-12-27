import Image from 'next/image';
import Link from 'next/link';
import { IArticle } from '@/interfaces/IArticle';
import { ChevronRight } from 'lucide-react';

interface ArticleCardProps {
	article: IArticle;
}

export default function ArticleCard({ article }: ArticleCardProps) {
	const sectionName = typeof article.section === 'string'
		? article.section
		: article.section?.name;

	return (
		<Link href={`/articles/${article.id}`} className="group h-full">
			<div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl group-hover:-translate-y-1 overflow-hidden transition-[box-shadow,border-color] duration-300 hover:shadow-xl hover:border-blue-200 isolate">

				<div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
					<Image
						src={article.imageUrl || "/images/noImage.jpg"}
						alt={article.title}
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						className="object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
						unoptimized={!!article.imageUrl?.startsWith('/uploads/')}
					/>

					{sectionName && (
						<div className="absolute top-3 left-3">
							<span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-white/90 backdrop-blur text-slate-800 rounded-lg shadow-lg">
								{sectionName}
							</span>
						</div>
					)}
				</div>

				<div className="flex flex-col flex-grow p-5">
					<h2 className="text-base md:text-xl font-bold text-slate-900 leading-tight mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
						{article.title}
					</h2>

					<div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
						<span className="text-sm font-bold text-blue-600 flex items-center gap-1">
							Читать
							<ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
						</span>
						<span className="text-[11px] text-slate-400 font-medium">
							ID: {article.id}
						</span>
					</div>
				</div>
			</div>
		</Link>
	);
}