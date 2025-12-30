// MediaDisplay.tsx
import { Download, FileText, Music } from 'lucide-react';
import dynamic from 'next/dynamic';

const SafePdfView = dynamic(() => import('./PdfViewInternal'), {
	ssr: false,
	loading: () => (
		<div className="h-96 w-full bg-slate-50 animate-pulse rounded-[2rem] flex items-center justify-center border border-slate-100">
			<FileText className="text-slate-200" size={48} />
		</div>
	)
});

export const VideoDisplay = ({ src }: { src: string }) => (
	<div className="my-12 overflow-hidden rounded-xl shadow-2xl bg-black aspect-video ring-1 ring-slate-200">
		<video src={src} controls className="w-full h-full block" />
	</div>
);

export const AudioDisplay = ({ src }: { src: string }) => (
	<div className="my-10 p-6 bg-gradient-to-r from-slate-50 to-white rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
		<div className="bg-amber-600 p-3 rounded-full text-white shadow-md">
			<Music size={24} />
		</div>
		<audio src={src} controls className="flex-1" />
	</div>
);

export const PdfDisplay = ({ src }: { src: string }) => {
	return (
		<div className="my-16 w-full group">
			{/* Шапка ридера */}
			<div className="mb-4 flex items-center justify-between px-6">
				<div className="flex items-center gap-3">
					<div className="bg-red-500 p-2 rounded-xl text-white shadow-lg shadow-red-200">
						<FileText size={18} />
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-bold text-slate-800 leading-none mb-1">Документ PDF</span>
						<span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Нажмите, чтобы выделить текст</span>
					</div>
				</div>

				<a
					href={src}
					download
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-2 bg-slate-100 hover:bg-amber-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 text-slate-600"
				>
					<Download size={14} />
					Сохранить
				</a>
			</div>

			{/* Контейнер рендеринга */}
			<div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-200/60 p-4 md:p-8 backdrop-blur-sm shadow-inner">
				<SafePdfView src={src} />
			</div>
		</div>
	);
};