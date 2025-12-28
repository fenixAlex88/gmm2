// app/(main)/articles/components/ArticleHero.tsx
import Image from 'next/image';
import { User as UserIcon, Calendar, Eye, MapPin } from 'lucide-react';
import { IArticle } from '@/interfaces/IArticle';

interface ArticleHeroProps {
	article: Omit<IArticle, 'updatedAt'> & {
		updatedAt: string | Date;
		section?: { name: string } | null;
		author?: { name: string } | null;
	};
}

export default function ArticleHero({ article }: ArticleHeroProps) {
	const dateDisplay = article.updatedAt
		? new Date(article.updatedAt).toLocaleDateString('ru-RU')
		: 'Дата не указана';

	// Получаем названия для вывода
	const placeName = article.places?.[0]?.name;
	const subjectName = article.subjects?.[0]?.name;

	return (
		<section className="relative w-full h-[60vh] md:h-[80vh] flex items-end bg-slate-900">
			{article.imageUrl && (
				<Image
					src={article.imageUrl}
					alt={article.title}
					fill
					priority
					className="object-cover opacity-80"
				/>
			)}
			<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

			<div className="relative max-w-5xl mx-auto px-6 pb-12 w-full">
				<div className="flex flex-col items-start gap-4">

					{/* Бейджи: Секция и Субъект РФ */}
					<div className="flex flex-wrap gap-2">
						<span className="bg-amber-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
							{article.section?.name || 'Общее'}
						</span>

						{subjectName && (
							<span className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
								{subjectName}
							</span>
						)}
					</div>

					<h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
						{article.title}
					</h1>

					<div className="flex flex-wrap items-center gap-y-4 gap-x-6 mt-4 text-white/90 text-sm font-bold">
						{/* Автор */}
						{article.author && (
							<div className="flex items-center gap-2">
								<UserIcon size={18} className="text-amber-400" />
								<span>{article.author.name}</span>
							</div>
						)}

						{/* Место (Город/Объект) */}
						{placeName && (
							<div className="flex items-center gap-2">
								<MapPin size={18} className="text-blue-400" />
								<span>{placeName}</span>
							</div>
						)}

						{/* Дата */}
						<div className="flex items-center gap-2">
							<Calendar size={18} className="text-amber-400" />
							<span>{dateDisplay}</span>
						</div>

						{/* Просмотры */}
						<div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
							<Eye size={18} className="text-slate-300" />
							<span className="tabular-nums">{article.views?.toLocaleString() ?? 0}</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}