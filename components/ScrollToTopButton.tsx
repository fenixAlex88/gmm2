'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react'; // Используем готовую красивую иконку

export default function ScrollToTopButton() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const toggleVisibility = () => {
			// Показываем кнопку, когда прокрутили больше 300px
			setVisible(window.scrollY > 300);
		};

		window.addEventListener('scroll', toggleVisibility);
		return () => window.removeEventListener('scroll', toggleVisibility);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	};

	return (
		<button
			type="button"
			aria-label="Вернуться к началу страницы"
			onClick={scrollToTop}
			className={`fixed bottom-8 right-8 z-50 flex items-center justify-center 
                rounded-2xl shadow-2xl transition-all duration-300 ease-in-out
                group border border-white/10 backdrop-blur-md
                ${visible
					? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
					: 'opacity-0 translate-y-10 scale-75 pointer-events-none'}
                bg-red-900/90 text-white
                w-12 h-12 md:w-16 md:h-16
                hover:bg-red-800 hover:-translate-y-2 active:scale-95
            `}
		>
			{/* Тонкая современная стрелка с анимацией внутри */}
			<ArrowUp
				className="w-6 h-6 md:w-8 md:h-8 transition-transform duration-300 group-hover:-translate-y-1"
				strokeWidth={2.5}
			/>

			{/* Декоративное свечение при наведении */}
			<div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
		</button>
	);
}