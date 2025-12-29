// components/rich-text-editor/Carousel.tsx
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React from 'react';
import CarouselDisplay from '@/components/CarouselDisplay';

// --- 1. React-оболочка для редактора ---

const CarouselEditorWrapper = (props: NodeViewProps) => {
	// Извлекаем данные из атрибутов узла Tiptap
	const images = props.node.attrs.images || [];
	const interval = props.node.attrs.interval || 3000;

	return (
		<NodeViewWrapper className="carousel-node-container relative">
			{/* Используем тот же самый компонент, что и на живой странице.
                Это гарантирует идентичность отображения (WYSIWYG).
            */}
			<CarouselDisplay images={images} interval={interval} />

			{/* Добавляем небольшую метку для редактора, 
                чтобы было понятно, что это интерактивный блок 
            */}
			<div className="absolute top-2 left-2 z-40 pointer-events-none">
				<span className="bg-slate-800/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm uppercase font-bold tracking-wider">
					Режим редактирования
				</span>
			</div>
		</NodeViewWrapper>
	);
};

// --- 2. Определение Node Tiptap ---

export const Carousel = Node.create({
	name: 'carousel',
	group: 'block',
	atom: true, // Важно: редактор воспринимает это как единый объект
	draggable: true,

	addAttributes() {
		return {
			images: {
				default: [],
				parseHTML: element => {
					const data = element.getAttribute('data-images');
					try {
						return data ? JSON.parse(data) : [];
					} catch { return []; }
				},
			},
			interval: {
				default: 3000,
				parseHTML: element => Number(element.getAttribute('data-interval')) || 3000,
			}
		};
	},

	parseHTML() {
		return [{ tag: 'div[data-type="carousel"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		const { images, interval, ...rest } = HTMLAttributes;
		return [
			'div',
			mergeAttributes(rest, {
				'data-type': 'carousel',
				'data-images': JSON.stringify(images),
				'data-interval': interval,
				// Классы для чистого HTML
				class: 'carousel-node my-8'
			})
		];
	},

	addNodeView() {
		return ReactNodeViewRenderer(CarouselEditorWrapper);
	},
});