// tiptap-extensions/CarouselExtension.tsx

'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Node, mergeAttributes, ReactNodeViewRenderer, RawCommands } from '@tiptap/react';
import { NodeViewWrapper, NodeViewContent, ReactNodeViewProps } from '@tiptap/react';
import Image from 'next/image';

// --- A. REACT COMPONENT: Интерактивная Карусель ---

interface CarouselComponentProps {
    images: string[];
    interval?: number;
}

function CarouselComponent({ images, interval = 10000 }: CarouselComponentProps) {
    const [index, setIndex] = useState(0);

    const showSlide = (i: number) => {
        const newIndex = (i + images.length) % images.length;
        setIndex(newIndex);
    };
    
    // Функция для автопрокрутки
    const autoScroll = useCallback(() => {
        setIndex(prevIndex => (prevIndex + 1) % images.length);
    }, [images.length]);

    useEffect(() => {
        if (images.length <= 1) return;
        const timer = setInterval(autoScroll, interval);
        return () => clearInterval(timer);
    }, [images.length, interval, autoScroll]);

    if (images.length === 0) return null;
    if (images.length === 1) {
        return <Image src={images[0]} alt="Slide 0" className="w-full h-auto object-cover rounded-lg" />;
    }

    // Вычисляем ширину каждого слайда для корректной прокрутки
    const slideWidth = images.length > 0 ? 100 / images.length : 0;

    return (
        <div className="relative w-full overflow-hidden my-4 border border-gray-300 rounded-lg shadow-md">
            <div
                className="flex transition-transform duration-500"
                style={{ 
                    width: `${images.length * 100}%`, // Общая ширина контейнера
                    transform: `translateX(-${index * slideWidth}%)` 
                }}
            >
                {images.map((src, i) => (
                    <div key={i} className="flex-shrink-0" style={{ width: `${slideWidth}%` }}>
                        <Image
                            src={src}
                            alt={`slide-${i}`}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Кнопки и Индикаторы (для навигации) */}
             <button
                onClick={() => showSlide(index - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                aria-label="Предыдущий слайд"
            >
                ‹
            </button>
            <button
                onClick={() => showSlide(index + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                aria-label="Следующий слайд"
            >
                ›
            </button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/50 hover:bg-white'}`}
                        aria-label={`Перейти к слайду ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}


// --- B. TIP TAP NODE VIEW: Как отображать в Редакторе ---

const CarouselNodeView = (props: ReactNodeViewProps) => {
	const images: string[] = useMemo(() => {
		const urls: string[] = [];
		props.node.content.forEach((child) => {
			if (child.type.name === 'image' && child.attrs.src) {
				urls.push(child.attrs.src);
			}
		});
		return urls;
	}, [props.node.content]);

	return (
		<NodeViewWrapper className="carousel-wrapper">
			<CarouselComponent images={images} />

			<div className="p-3 border border-dashed border-gray-400 mt-2 rounded-md bg-gray-50/50" contentEditable={false}>
				<p className="text-sm text-gray-600 mb-2 font-medium">
					&#9888; Добавьте/удалите изображения ниже:
				</p>
				<div className="min-h-[50px] flex gap-2 overflow-x-auto p-1">
					{/* Вместо props.children используем NodeViewContent */}
					<NodeViewContent className="flex gap-2" />
				</div>
			</div>
		</NodeViewWrapper>
	);
};


// --- C. TIP TAP NODE DEFINITION: Расширение ---

export const CarouselExtension = Node.create({
    name: 'carousel',
    group: 'block',
    content: 'image+', 
    selectable: true,
    draggable: true,
    defining: true,

    addCommands() {
        return {
			setCarousel: () => ({ commands }: { commands: RawCommands }) => {
                // Команда для вставки узла 'carousel' с пустыми изображениями
                return commands.insertContent({
                    type: this.name,
                    content: [
                        { type: 'image', attrs: { src: '/placeholder-1.jpg' } },
                        { type: 'image', attrs: { src: '/placeholder-2.jpg' } },
                    ]
                })
            }
        } as Partial<RawCommands>;
    },

    parseHTML() {
        // Парсер для данных, приходящих из базы (просто div с атрибутом)
        return [{ tag: 'div[data-type="carousel"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        // Как сохраняется в HTML: простой div, содержащий все <img />
        return [
            'div',
            mergeAttributes(HTMLAttributes, { 'data-type': 'carousel', class: 'carousel-node my-4' }),
            0,
        ];
    },

    addNodeView() {
        // Указываем TipTap использовать наш React-компонент для отображения
        return ReactNodeViewRenderer(CarouselNodeView);
    },
});