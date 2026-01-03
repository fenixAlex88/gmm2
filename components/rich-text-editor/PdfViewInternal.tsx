'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

// Падключаем неабходныя стылі
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Настройка воркера для Next.js 15/16 (Turbopack)
if (typeof window !== 'undefined') {
	pdfjs.GlobalWorkerOptions.workerSrc = new URL(
		'pdfjs-dist/build/pdf.worker.min.mjs',
		import.meta.url
	).toString();
}

const PDF_OPTIONS = {
	cMapUrl: '/cmaps/',
	cMapPacked: true,
	standardFontDataUrl: 'standard_fonts/',
};

interface PdfViewInternalProps {
	src: string;
	mode?: 'single' | 'full';
}

export default function PdfViewInternal({ src, mode = 'full' }: PdfViewInternalProps) {
	const [numPages, setNumPages] = useState<number | null>(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [containerWidth, setContainerWidth] = useState<number>(0);

	// Вылічэнне шырыні кантэйнера
	useEffect(() => {
		const updateWidth = () => {
			const container = document.getElementById('pdf-render-container');
			if (container) {
				const offset = mode === 'full' ? 80 : 0;
				setContainerWidth(container.offsetWidth - offset);
			}
		};

		updateWidth();
		window.addEventListener('resize', updateWidth);
		return () => window.removeEventListener('resize', updateWidth);
	}, [mode]);

	/**
	 * Апрацоўка клікаў па ўнутраных спасылках PDF (змест, пераходы)
	 * Выпраўлена: правільная тыпізацыя і логіка скролу для mode="full"
	 */
	const handleItemClick = useCallback((args: { pageNumber: number }) => {
		const targetPage = args.pageNumber;

		if (mode === 'single') {
			// У пастаронкавым рэжыме проста мяняем нумар старонкі
			if (targetPage) setPageNumber(targetPage);
		} else {
			// У поўным рэжыме шукаем патрэбную старонку па ID і круцім да яе
			const pageElement = document.getElementById(`page-v-${targetPage}`);
			if (pageElement) {
				pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}
	}, [mode]);

	const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
		setNumPages(numPages);
		setPageNumber(1);
	};

	const LoadingView = () => (
		<div className="p-10 flex flex-col items-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-2" />
			<p className="text-slate-500 text-sm">Загрузка дакумента...</p>
		</div>
	);

	const ErrorView = () => (
		<div className="p-10 flex flex-col items-center bg-rose-50 rounded-2xl border-2 border-dashed border-rose-200 text-center">
			<p className="text-rose-600 font-bold mb-1">Дакумент не знойдзены</p>
			<p className="text-rose-400 text-xs">Файл адсутнічае на серверы (Памылка 404)</p>
		</div>
	);

	return (
		<div id="pdf-render-container" className="w-full flex flex-col items-center min-h-[200px]">
			<Document
				file={src}
				options={PDF_OPTIONS}
				onLoadSuccess={onDocumentLoadSuccess}
				onItemClick={handleItemClick}
				loading={<LoadingView />}
				error={<ErrorView />}
				noData={<ErrorView />}
			>
				{mode === 'full' ? (
					/* РЭЖЫМ ПОЎНАЙ СТУЖКІ (ДЛЯ FULLSCREEN) */
					<div className="flex flex-col gap-8 w-full items-center">
						{Array.from(new Array(numPages || 0), (_, index) => (
							<div
								key={`page_${index + 1}`}
								id={`page-v-${index + 1}`} // ID для працы скролу па спасылках
								className="shadow-2xl ring-1 ring-black/5 bg-white transition-transform"
							>
								<Page
									pageNumber={index + 1}
									width={containerWidth > 0 ? containerWidth : undefined}
									renderTextLayer={true}
									renderAnnotationLayer={true}
								/>
							</div>
						))}
					</div>
				) : (
					/* ПАСТАРОНКАВЫ РЭЖЫМ (ДЛЯ СТАРОНКІ АРТЫКУЛА) */
					<div className="flex flex-col items-center w-full">
						<div className="shadow-2xl ring-1 ring-slate-200 bg-white">
							<Page
								pageNumber={pageNumber}
								width={containerWidth > 0 ? containerWidth : 300}
								renderTextLayer={true}
								renderAnnotationLayer={true}
							/>
						</div>

						{/* Навігацыя па старонках */}
						{numPages && numPages > 1 && (
							<div className="mt-10 flex items-center gap-6 bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-xl">
								<button
									onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
									disabled={pageNumber <= 1}
									className="p-2.5 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-20 transition-all rounded-xl"
								>
									<ChevronLeft size={24} strokeWidth={2.5} />
								</button>

								<div className="flex flex-col items-center min-w-[80px]">
									<span className="text-sm font-black text-slate-700 tabular-nums">
										{pageNumber} <span className="text-slate-300 font-medium">/</span> {numPages}
									</span>
								</div>

								<button
									onClick={() => setPageNumber(prev => Math.min(numPages || 1, prev + 1))}
									disabled={pageNumber >= (numPages || 1)}
									className="p-2.5 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-20 transition-all rounded-xl"
								>
									<ChevronRight size={24} strokeWidth={2.5} />
								</button>
							</div>
						)}
					</div>
				)}
			</Document>
		</div>
	);
}