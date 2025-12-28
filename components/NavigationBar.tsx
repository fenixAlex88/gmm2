'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
	ChevronDown, FileText, HelpCircle, Info,
	Compass, Users, Heart
} from 'lucide-react';

// Импорт компонентов модальных окон
import HowChooseModal from './modals/HowChooseModal';
import DiffRoutesModal from './modals/DiffRoutesModal';
import HowUseModal from './modals/HowUseModal';


const LINKS = [
	{ title: 'Галоўная', href: '/', icon: <FileText size={16} /> },
	{ title: 'Як карыстацца?', modalId: 'how-use', icon: <HelpCircle size={16} /> },
	{ title: 'Аб праекце', href: '/about_project', icon: <Info size={16} /> },
	{
		title: 'Падарожніку',
		icon: <Compass size={16} />,
		subLinks: [
			{ title: 'Як выбіраць падарожжа', modalId: 'how-choose' },
			{ title: 'Чым адрозніваюцца маршруты', modalId: 'diff-routes' },
		],
	},
	{ title: 'Партнерам', href: '/partner', icon: <Users size={16} /> },
	{ title: 'Падтрымаць', href: '/support', icon: <Heart size={16} />, highlight: true },
];

export default function NavigationBar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [activeModal, setActiveModal] = useState<string | null>(null);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 190);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<>
			<nav className="sticky top-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm z-[40]">
				<div className="mx-auto max-w-6xl px-4 relative flex items-center h-14">

					{/* Логотип при скролле */}
					<div className={`absolute left-4 transition-all duration-500 ease-in-out flex items-center ${isScrolled ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'
						}`}>
						<Link href="/" className="text-xl font-black tracking-tighter text-slate-900 group">
							GMM<span className="text-[#800000]">.BY</span>
						</Link>
					</div>

					{/* Контейнер ссылок */}
					<div className="flex items-center h-full w-full lg:ml-[200px] xl:ml-[240px]">
						<div className="flex items-center space-x-1 py-1">
							{LINKS.map((link) => (
								<div key={link.title} className="relative group">
									{link.subLinks ? (
										/* Выпадающее меню */
										<div className="relative">
											<button className="flex items-center space-x-1 px-3 py-2 rounded-lg text-[13px] font-bold text-slate-600 group-hover:text-[#800000] transition-colors">
												<span>{link.title}</span>
												<ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
											</button>
											<div className="absolute top-full left-0 mt-0 w-64 bg-white border border-slate-100 shadow-2xl rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-[110]">
												{link.subLinks.map((sub) => (
													<button
														key={sub.title}
														onClick={() => setActiveModal(sub.modalId || null)}
														className="block w-full text-left px-4 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#800000] transition-colors"
													>
														{sub.title}
													</button>
												))}
											</div>
										</div>
									) : (
										/* Обычная ссылка или кнопка модалки */
										link.modalId ? (
											<button
												onClick={() => setActiveModal(link.modalId || null)}
												className="flex items-center space-x-2 px-3 py-2 rounded-lg text-[13px] font-bold text-slate-600 hover:text-[#800000] hover:bg-slate-50 transition-all"
											>
												<span className="text-slate-400">{link.icon}</span>
												<span>{link.title}</span>
											</button>
										) : (
											<Link
												href={link.href || '#'}
												className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${link.highlight
														? 'text-[#800000] bg-rose-50 hover:bg-rose-100 ml-2'
														: 'text-slate-600 hover:text-[#800000] hover:bg-slate-50'
													}`}
											>
												<span className={link.highlight ? 'text-red-600' : 'text-slate-400'}>
													{link.icon}
												</span>
												<span>{link.title}</span>
											</Link>
										)
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			</nav>

			{/* Секция модальных окон */}
			<HowUseModal
				isOpen={activeModal === 'how-use'}
				onClose={() => setActiveModal(null)}
			/>
			<HowChooseModal
				isOpen={activeModal === 'how-choose'}
				onClose={() => setActiveModal(null)}
			/>
			<DiffRoutesModal
				isOpen={activeModal === 'diff-routes'}
				onClose={() => setActiveModal(null)}
			/>
		</>
	);
}