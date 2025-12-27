// components/rich-text-editor/Carousel.tsx
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react'; // Исправлен импорт
import React, { useState, useEffect, useCallback } from 'react';

// --- 1. React-компонент ---

const CarouselComponent = (props: NodeViewProps) => {
	// Типизируем входящие данные
	const imagesRaw = props.node.attrs.images;
	const images: string[] = Array.isArray(imagesRaw) ? imagesRaw : [];
	const interval: number = props.node.attrs.interval || 3000;

	const [index, setIndex] = useState(0);

	// Оборачиваем в useCallback, чтобы устранить warning в useEffect
	const showSlide = useCallback((i: number) => {
		// Проверка на 0, чтобы избежать деления на ноль, если картинок нет
		if (images.length === 0) return;
		const newIndex = (i + images.length) % images.length;
		setIndex(newIndex);
	}, [images.length]);

	useEffect(() => {
		if (images.length <= 1) return;

		const timer = setInterval(() => {
			// Используем функциональное обновление стейта, чтобы зависеть только от showSlide
			setIndex((prevIndex) => (prevIndex + 1) % images.length);
		}, interval);

		return () => clearInterval(timer);
	}, [images.length, interval]); // showSlide больше не нужен здесь, так как логика внутри

	if (!images.length) {
		return (
			<NodeViewWrapper className="p-4 border border-dashed text-center text-gray-400">
				Пустая карусель
			</NodeViewWrapper>
		);
	}

	return (
		<NodeViewWrapper className="my-4 relative w-full overflow-hidden border rounded-lg shadow-sm group">
			{/* Слайды */}
			<div
				className="flex transition-transform duration-500 ease-in-out"
				style={{ transform: `translateX(-${index * 100}%)` }}
			>
				{images.map((src, i) => (
					<div key={i} className="min-w-full relative bg-gray-100">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={src}
							alt={`slide-${i}`}
							className="w-full h-auto object-cover"
							draggable="false"
						/>
					</div>
				))}
			</div>

			{/* Кнопки навигации */}
			{images.length > 1 && (
				<>
					<button
						onClick={() => showSlide(index - 1)}
						className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded-full transition-colors opacity-0 group-hover:opacity-100"
						type="button"
					>
						‹
					</button>
					<button
						onClick={() => showSlide(index + 1)}
						className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded-full transition-colors opacity-0 group-hover:opacity-100"
						type="button"
					>
						›
					</button>
					{/* Индикаторы */}
					<div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
						{images.map((_, i) => (
							<div key={i} className={`h-1.5 w-1.5 rounded-full shadow-sm ${i === index ? 'bg-white' : 'bg-white/50'}`} />
						))}
					</div>
				</>
			)}
		</NodeViewWrapper>
	);
};

// --- 2. Определение Node ---

export const Carousel = Node.create({
	name: 'carousel',
	group: 'block',
	atom: true, // Это "листовой" узел, контента внутри него в редакторе нет
	draggable: true,

	addAttributes() {
		return {
			images: {
				default: [],
				// ИСПРАВЛЕНИЕ: parseHTML здесь должен извлекать только значение
				parseHTML: element => {
					const data = element.getAttribute('data-images');
					try {
						return data ? JSON.parse(data) : [];
					} catch {
						return [];
					}
				},
			},
			interval: {
				default: 3000,
				parseHTML: element => Number(element.getAttribute('data-interval')) || 3000,
			}
		};
	},

	parseHTML() {
		return [
			{
				tag: 'div[data-type="carousel"]',
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		// Извлекаем изображения из атрибутов, чтобы не дублировать их в теге дважды
		const { images, interval, ...rest } = HTMLAttributes;

		return [
			'div',
			mergeAttributes(rest, {
				'data-type': 'carousel',
				'data-images': JSON.stringify(images),
				'data-interval': interval,
				// Добавляем стили, которые помогут избежать "слипания"
				class: 'carousel-node my-10 block rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5'
			})
			// Здесь НЕТ цифры 0, так как узел атомарный
		];
	},

	addNodeView() {
		return ReactNodeViewRenderer(CarouselComponent);
	},
});