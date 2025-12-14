'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface CarouselDisplayProps {
	images: string[];
	interval?: number;
}

export default function CarouselDisplay({ images, interval = 3000 }: CarouselDisplayProps) {
	const [index, setIndex] = useState(0);

	const showSlide = (i: number) => {
		if (images.length === 0) return;
		const newIndex = (i + images.length) % images.length;
		setIndex(newIndex);
	};

	// Автопрокрутка
	useEffect(() => {
		if (images.length <= 1) return;
		const timer = setInterval(() => {
			setIndex((prevIndex) => (prevIndex + 1) % images.length);
		}, interval);
		return () => clearInterval(timer);
	}, [images.length, interval]);

	if (!images.length) return null;

	return (
		<div className="my-4 relative w-full overflow-hidden border rounded-lg shadow-sm">
			{/* Слайды */}
			<div
				className="flex transition-transform duration-500 ease-in-out"
				style={{ transform: `translateX(-${index * 100}%)` }}
			>
				{images.map((src, i) => (
					<div key={i} className="min-w-full relative bg-gray-100 aspect-video">
						<Image
							src={src}
							alt={`slide-${i}`}
							// ⭐ Важно: Установите width/height или fill=true для Next/Image
							// Поскольку контейнер (div) имеет aspect-video, используем fill.
							fill
							sizes="(max-width: 768px) 100vw, 800px"
							style={{ objectFit: 'cover' }}
							priority={i === 0} // Приоритет для первого изображения
						/>
					</div>
				))}
			</div>

			{/* Кнопки и индикаторы */}
			{images.length > 1 && (
				<>
					<button
						onClick={() => showSlide(index - 1)}
						className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded-full transition-colors"
						type="button"
					>
						‹
					</button>
					<button
						onClick={() => showSlide(index + 1)}
						className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded-full transition-colors"
						type="button"
					>
						›
					</button>
					<div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
						{images.map((_, i) => (
							<div key={i} className={`h-1.5 w-1.5 rounded-full shadow-sm ${i === index ? 'bg-white' : 'bg-white/50'}`} />
						))}
					</div>
				</>
			)}
		</div>
	);
}