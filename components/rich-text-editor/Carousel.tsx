// components/rich-text-editor/Carousel.tsx
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react'; // Исправлен импорт
import React, { useState, useEffect, useCallback } from 'react';

// --- 1. React-компонент ---

const CarouselComponent = (props: NodeViewProps) => {
	// Типизируем входящие данные
	const images: string[] = props.node.attrs.images || [];
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
	atom: true,
	draggable: true,

	addAttributes() {
		return {
			images: {
				default: [],
			},
			interval: {
				default: 3000,
			}
		};
	},

	parseHTML() {
		return [
			{
				tag: 'div[data-type="carousel"]',
				getAttrs: (node) => {
					// Исправление типизации для node
					if (typeof node === 'string') return {};
					const element = node as HTMLElement;

					const images = element.getAttribute('data-images');
					return {
						images: images ? JSON.parse(images) : []
					}
				}
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'div',
			mergeAttributes(HTMLAttributes, {
				'data-type': 'carousel',
				'data-images': JSON.stringify(HTMLAttributes.images)
			}),
		];
	},

	addNodeView() {
		// Теперь это корректно работает, так как импортировано из @tiptap/react
		return ReactNodeViewRenderer(CarouselComponent);
	},
});