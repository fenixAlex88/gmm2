'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Music, FileText, Download, Maximize2, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Дынамічны імпарт унутранага кампанента
const SafePdfView = dynamic(() => import('./PdfViewInternal'), {
	ssr: false,
	loading: () => (
		<div className="h-96 w-full bg-slate-50 animate-pulse rounded-[2rem] flex items-center justify-center border border-slate-100">
			<FileText className="text-slate-200" size={48} />
		</div>
	)
});

export const PdfDisplay = ({ src }: { src: string }) => {
	const [isFullscreen, setIsFullscreen] = useState(false);

	// Кіраванне пракруткай цела пры адкрыцці поўнаэкраннага рэжыму
	useEffect(() => {
		if (isFullscreen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setIsFullscreen(false);
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [isFullscreen]);

	const FullscreenOverlay = () => {
		if (typeof document === 'undefined') return null;
		return createPortal(
			<div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col animate-in fade-in duration-300">
				{/* Панэль кіравання ў поўнаэкранным рэжыме */}
				<div className="flex items-center justify-between p-6 bg-slate-900/50 backdrop-blur-xl border-b border-white/5">
					<div className="flex items-center gap-3 text-white">
						<FileText size={20} className="text-red-500" />
						<span className="text-sm font-bold tracking-wide">Прагляд кнiгi</span>
					</div>
					<button
						onClick={() => setIsFullscreen(false)}
						className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all border border-white/10"
					>
						<X size={24} />
					</button>
				</div>

				{/* Кантэйнер з пракруткай для PDF */}
				<div className="flex-1 overflow-y-auto p-4 md:p-10 flex justify-center bg-slate-900">
					<div className="w-full max-w-5xl">
						<SafePdfView src={src} mode="full" />
					</div>
				</div>
			</div>,
			document.body
		);
	};

	return (
		<div className="my-16 w-full group">
			{isFullscreen && <FullscreenOverlay />}

			{/* Шапка ридера */}
			<div className="mb-8 flex flex-wrap items-center justify-between gap-4 px-2 md:px-6">
				<div className="flex items-center gap-4">
					<div className="relative">
						<div className="absolute inset-0 bg-amber-300/30 blur-lg rounded-full" />
						<div className="relative bg-gradient-to-br from-amber-400 to-orange-500 p-3 rounded-xl text-white shadow-md shadow-orange-200/50">
							<FileText size={22} />
						</div>
					</div>
					<h3 className="text-lg md:text-xl font-bold text-slate-700 tracking-tight leading-none">
						Прагляд кнігі
					</h3>
				</div>

				<div className="flex items-center gap-3">
					<button
						onClick={() => setIsFullscreen(true)}
						className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-orange-400 hover:text-orange-600 hover:shadow-lg hover:shadow-orange-100/40 transition-all duration-300 active:scale-95"
					>
						<Maximize2 size={16} className="group-hover:rotate-12 transition-transform" />
						Поўны экран
					</button>

					<Link
						href={src}
						download
						target="_blank"
						rel="noopener noreferrer"
						className="group flex items-center gap-2.5 px-6 py-3
               bg-gradient-to-r from-orange-500 to-amber-500 
               text-white font-bold text-sm
               rounded-2xl shadow-lg shadow-orange-200/50
               transition-all duration-300 !no-underline
               hover:from-orange-600 hover:to-amber-600 
               hover:shadow-orange-300/50 active:scale-95"
					>
						<Download
							size={18}
							className="text-white transition-transform duration-300 group-hover:rotate-12"
						/>
						<span className="text-white !no-underline leading-none">
							Захаваць
						</span>
					</Link>


				</div>
			</div>


			{/* Кантэйнер рэндэрынгу */}
			<div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-200/60 p-4 md:p-8 backdrop-blur-sm shadow-inner overflow-hidden">
				<SafePdfView src={src} mode="single" />
			</div>
		</div>
	);
};