// components/CarouselDisplay.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

interface CarouselDisplayProps {
	images: string[];
	interval?: number;
}

export default function CarouselDisplay({ images, interval = 3000 }: CarouselDisplayProps) {
	const [index, setIndex] = useState(0);
	const [isFullscreen, setIsFullscreen] = useState(false);

	const showSlide = useCallback((i: number) => {
		if (images.length === 0) return;
		setIndex((i + images.length) % images.length);
	}, [images.length]);

	useEffect(() => {
		if (images.length <= 1 || isFullscreen) return;
		const timer = setInterval(() => showSlide(index + 1), interval);
		return () => clearInterval(timer);
	}, [images.length, interval, isFullscreen, index, showSlide]);

	useEffect(() => {
		if (!isFullscreen) return;
		document.body.style.overflow = 'hidden';
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setIsFullscreen(false);
			if (e.key === 'ArrowLeft') showSlide(index - 1);
			if (e.key === 'ArrowRight') showSlide(index + 1);
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [isFullscreen, index, showSlide]);

	if (!images?.length) return null;

	const FullscreenOverlay = () => {
		if (typeof document === 'undefined') return null;
		return createPortal(
			<div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center animate-in fade-in duration-200">
				<button
					onClick={() => setIsFullscreen(false)}
					className="absolute top-6 right-6 z-[100] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"
				>
					<X size={32} />
				</button>

				<div className="relative w-full h-full p-4 md:p-10">
					<Image
						src={images[index]}
						alt={`fullscreen-slide-${index}`}
						fill
						priority
						className="object-contain"
						sizes="100vw"
					/>
				</div>

				{images.length > 1 && (
					<>
						<button
							onClick={() => showSlide(index - 1)}
							className="absolute left-6 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all"
						>
							<ChevronLeft size={40} />
						</button>
						<button
							onClick={() => showSlide(index + 1)}
							className="absolute right-6 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all"
						>
							<ChevronRight size={40} />
						</button>
						<div className="absolute bottom-8 text-white/40 font-mono text-sm tracking-widest">
							{index + 1} / {images.length}
						</div>
					</>
				)}
			</div>,
			document.body
		);
	};

	return (
		<div className="my-10 relative w-full overflow-hidden rounded-[2.5rem] shadow-2xl group bg-slate-950 select-none">
			{isFullscreen && <FullscreenOverlay />}

			<button
				onClick={() => setIsFullscreen(true)}
				className="absolute top-6 right-6 z-30 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 p-3 bg-black/40 text-white rounded-2xl backdrop-blur-xl border border-white/10"
			>
				<Maximize2 size={22} />
			</button>

			<div
				className="flex transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) cursor-zoom-in"
				style={{ transform: `translateX(-${index * 100}%)` }}
				onClick={() => setIsFullscreen(true)}
			>
				{images.map((src, i) => (
					<div
						key={i}
						className="min-w-full relative h-[400px] md:h-[600px] lg:h-[750px] flex items-center justify-center overflow-hidden"
					>
						{/* Оптимизированный фон (Blur) */}
						<Image
							src={src}
							alt=""
							fill
							className="object-cover blur-2xl opacity-40 scale-110"
							sizes="10vw" // Грузим маленькую копию для блюра
							quality={10}
							priority={i === 0}
						/>

						{/* Основное изображение */}
						<div className="relative w-full h-full z-10 p-4">
							<Image
								src={src}
								alt={`slide-${i}`}
								fill
								className="object-contain drop-shadow-2xl"
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
								priority={i === 0}
							/>
						</div>
					</div>
				))}
			</div>

			{images.length > 1 && (
				<>
					<button
						onClick={(e) => { e.stopPropagation(); showSlide(index - 1); }}
						className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-12 h-12 flex items-center justify-center rounded-full transition-all opacity-0 group-hover:opacity-100 z-20 backdrop-blur-md border border-white/5"
					>
						<ChevronLeft size={28} />
					</button>
					<button
						onClick={(e) => { e.stopPropagation(); showSlide(index + 1); }}
						className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-12 h-12 flex items-center justify-center rounded-full transition-all opacity-0 group-hover:opacity-100 z-20 backdrop-blur-md border border-white/5"
					>
						<ChevronRight size={28} />
					</button>

					<div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
						{images.map((_, i) => (
							<button
								key={i}
								onClick={(e) => { e.stopPropagation(); setIndex(i); }}
								className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'bg-white w-8' : 'bg-white/30 w-4 hover:bg-white/50'
									}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}