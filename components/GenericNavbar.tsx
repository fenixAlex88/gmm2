'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface NavLink {
	title: string;
	href?: string;
	icon?: React.ReactNode;
	highlight?: boolean;
	modalId?: string;
	subLinks?: { title: string; modalId: string }[];
}

interface GenericNavbarProps {
	links: NavLink[];
	onModalClick?: (id: string) => void;
}

export default function GenericNavbar({ links, onModalClick }: GenericNavbarProps) {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 150);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<nav className="sticky top-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm z-[40]">
			<div className="mx-auto max-w-6xl px-4 flex items-center h-14 relative">

				{/* Лагатып злева (лагатып з'яўляецца пры скроле) */}
				<div className={`transition-all duration-500 ease-in-out flex items-center ${isScrolled ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'
					}`}>
					<Link href="/" className="text-xl font-black tracking-tighter text-slate-900">
						GMM<span className="text-[#800000]">.BY</span>
					</Link>
				</div>

				{/* Блок спасылак, прыціснуты ўправа праз ml-auto */}
				<div className="ml-auto flex items-center space-x-1 h-full">
					{links.map((link) => (
						<div key={link.title} className="relative group flex items-center h-full">
							{link.subLinks ? (
								/* Выпадальнае меню */
								<div className="relative">
									<button className="flex items-center space-x-1 px-3 py-2 rounded-lg text-[13px] font-bold text-slate-600 group-hover:text-[#800000] transition-colors">
										<span>{link.title}</span>
										<ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
									</button>
									<div className="absolute top-full right-0 mt-0 w-64 bg-white border border-slate-100 shadow-2xl rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-[110]">
										{link.subLinks.map((sub) => (
											<button
												key={sub.title}
												onClick={() => onModalClick?.(sub.modalId)}
												className="block w-full text-left px-4 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#800000] transition-colors"
											>
												{sub.title}
											</button>
										))}
									</div>
								</div>
							) : link.href ? (
								/* Звычайная спасылка */
								<a
									href={link.href}
									className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${link.highlight
										? 'text-[#800000] bg-rose-50 hover:bg-rose-100 ml-2'
										: 'text-slate-600 hover:text-[#800000] hover:bg-slate-50'
										}`}
								>
									{link.icon && <span className={link.highlight ? 'text-red-600' : 'text-slate-400'}>{link.icon}</span>}
									<span>{link.title}</span>
								</a>
							) : (
								/* Кнопка для модалкі */
								<button
									onClick={() => link.modalId && onModalClick?.(link.modalId)}
									className="flex items-center space-x-2 px-3 py-2 rounded-lg text-[13px] font-bold text-slate-600 hover:text-[#800000] hover:bg-slate-50 transition-all whitespace-nowrap"
								>
									{link.icon && <span className="text-slate-400">{link.icon}</span>}
									<span>{link.title}</span>
								</button>
							)}
						</div>
					))}
				</div>
			</div>
		</nav>
	);
}