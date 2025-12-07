'use client';

import { useEffect, useState } from 'react';

export default function ScrollToTopButton() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const toggleVisibility = () => {
			if (window.scrollY > 200) {
				setVisible(true);
			} else {
				setVisible(false);
			}
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
			className={`fixed bottom-8 right-8 z-50 flex items-center justify-center rounded-full shadow-xl transition-all duration-150
        ${visible
				? 'opacity-100 bg-red-900 hover:bg-red-900 md:hover:bg-red-950 active:bg-red-950 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24'
					: 'opacity-0 pointer-events-none'
				}`}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 48 48"
				className="w-10 h-10 sm:w-12 sm:-12 md:w-14 md:h-14"
				fill="white"
			>
				<path d="M24 4l-14 14h9v18h10V18h9z" />
			</svg>
		</button>
	);
}
