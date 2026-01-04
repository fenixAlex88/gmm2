import Image from 'next/image';
import { User as UserIcon, Calendar, Eye, MapPin } from 'lucide-react';

export default function ArticleHero({ article }: { article: any }) {
	const placeName = article.places?.[0]?.name;
	const subjectName = article.subjects?.[0]?.name;

	return (
		<section className="relative w-full h-[70vh] md:h-[85vh] flex items-end bg-slate-950 overflow-hidden">
			{article.imageUrl && (
				<>
					<div className="absolute inset-0 z-0" aria-hidden="true">
						<Image
							src={article.imageUrl}
							alt=""
							fill
							priority
							className="object-cover blur-3xl opacity-50 scale-110"
							sizes="10vw"
							quality={10}
						/>
					</div>
					<div className="absolute inset-0 z-10 flex justify-center">
						<div className="relative h-full w-full max-w-[1920px]">
							<Image
								src={article.imageUrl}
								alt={article.title}
								fill
								priority
								className="object-contain"
								sizes="100vw"
							/>
						</div>
					</div>
				</>
			)}

			<div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/20 to-transparent z-20" aria-hidden="true" />

			<div className="relative max-w-6xl mx-auto px-6 pb-12 w-full z-30">
				<div className="flex flex-col items-start gap-4">
					<div className="flex flex-wrap gap-2">
						<span className="bg-amber-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
							{article.section?.name || 'Агульнае'}
						</span>
						{subjectName && (
							<span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
								{subjectName}
							</span>
						)}
					</div>

					<h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] max-w-4xl" itemProp="headline">
						{article.title}
					</h1>

					{article.description && (
						<p className="text-lg md:text-xl text-slate-200 font-medium leading-relaxed max-w-3xl drop-shadow-md mt-2 line-clamp-3">
							{article.description}
						</p>
					)}

					<div className="flex flex-wrap items-center gap-y-4 gap-x-6 mt-6 text-white text-sm font-bold">
						{article.author && (
							<div className="flex items-center gap-2">
								<UserIcon size={18} className="text-amber-400" aria-hidden="true" />
								<span>{article.author.name}</span>
							</div>
						)}
						{placeName && (
							<div className="flex items-center gap-2">
								<MapPin size={18} className="text-blue-400" aria-hidden="true" />
								<span>{placeName}</span>
							</div>
						)}
						<div className="flex items-center gap-2" aria-label={`Дата публікацыі: ${article.displayDate}`}>
							<Calendar size={18} className="text-amber-400" aria-hidden="true" />
							<time dateTime={article.isoDate}>{article.displayDate}</time>
						</div>
						<div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
							<Eye size={18} className="text-slate-300" aria-hidden="true" />
							<span className="tabular-nums">{article.views?.toLocaleString() ?? 0}</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}