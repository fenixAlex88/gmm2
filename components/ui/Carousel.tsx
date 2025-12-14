"use client";

import React, { useState, useEffect } from "react";

interface CarouselProps {
	images: string[];
	interval?: number; // время автопрокрутки в мс
}

export default function Carousel({ images, interval = 3000 }: CarouselProps) {
	const [index, setIndex] = useState(0);

	const showSlide = (i: number) => {
		const newIndex = (i + images.length) % images.length;
		setIndex(newIndex);
	};

	useEffect(() => {
		const timer = setInterval(() => {
			showSlide(index + 1);
		}, interval);
		return () => clearInterval(timer);
	}, [index, interval, showSlide]);

	return (
		<div className="relative w-full overflow-hidden">
			<div
				className="flex transition-transform duration-500"
				style={{ transform: `translateX(-${index * 100}%)` }}
			>
				{images.map((src, i) => (
					<img
						key={i}
						src={src}
						alt={`slide-${i}`}
						className="w-full flex-shrink-0 rounded-lg"
					/>
				))}
			</div>

			{/* Кнопки */}
			<button
				onClick={() => showSlide(index - 1)}
				className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded"
			>
				‹
			</button>
			<button
				onClick={() => showSlide(index + 1)}
				className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded"
			>
				›
			</button>
		</div>
	);
}
