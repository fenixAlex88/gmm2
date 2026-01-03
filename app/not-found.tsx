'use client';

import Link from 'next/link';
import { ArrowLeft, Search, Home } from 'lucide-react';

export default function NotFound() {
	return (
		<main
			className="min-h-[80vh] flex items-center justify-center p-4"
			role="main"
		>
			<div className="text-center">
				{/* Дэкаратыўны блок схаваны ад скринрыдэраў */}
				<div className="relative inline-block" aria-hidden="true">
					<span className="text-[10rem] sm:text-[12rem] font-black text-slate-200 leading-none select-none block">
						404
					</span>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="bg-amber-100 text-amber-600 p-4 rounded-2xl rotate-12 shadow-sm">
							<Search size={48} strokeWidth={2.5} />
						</div>
					</div>
				</div>

				<div className="mt-8 space-y-4">
					{/* Галоўны загаловак для SEO */}
					<h1 className="text-3xl font-bold text-slate-900">
						Старонка не знойдзена
					</h1>
					<p className="text-slate-500 max-w-md mx-auto text-lg">
						На жаль, такога адрасу не існуе. Магчыма, старонка была выдалена або вы памыліліся ў спасылцы.
					</p>
				</div>

				<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
					{/* Кнопка "Назад" для зручнасці (UX) */}
					<button
						onClick={() => window.history.back()}
						aria-label="Вярнуцца на папярэднюю старонку"
						className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all focus:ring-4 focus:ring-slate-100 outline-none w-full sm:w-auto justify-center"
					>
						<ArrowLeft size={20} aria-hidden="true" />
						<span>Назад</span>
					</button>

					{/* Асноўная кнопка вяртання да кантэнту */}
					<Link
						href="/"
						className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all focus:ring-4 focus:ring-amber-100 outline-none w-full sm:w-auto justify-center"
					>
						<Home size={20} aria-hidden="true" />
						Да ўсіх падарожжаў
					</Link>
				</div>
			</div>
		</main>
	);
}