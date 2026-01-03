'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Mail, Menu, Phone, X } from 'lucide-react';
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
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 150);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Закрыццё меню пры кліку на спасылку
	const handleAction = (modalId?: string) => {
		if (modalId) onModalClick?.(modalId);
		setIsMobileMenuOpen(false);
	};

	return (
		<nav
			className="sticky top-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm z-[45]"
			aria-label="Галоўная навігацыя"
		>
			<div className="mx-auto max-w-6xl px-4 flex items-center h-14 justify-between relative">

				{/* 1. Лагатып */}
				<div className={` hidden lg:inline-flex transition-all duration-500 ease-in-out items-center ${isScrolled ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 pointer-events-none'
					}`}>
					<Link href="/" className="text-xl font-black tracking-tighter text-slate-900" aria-label="GMM.BY Галоўная">
						GMM<span className="text-[#800000]">.BY</span>
					</Link>
				</div>

				{/* 2. Дэсктопнае меню (схавана на мабільных) */}
				<div className="hidden md:flex items-center space-x-1 h-full ml-auto">
					{links.map((link) => (
						<div key={link.title} className="relative group flex items-center h-full">
							{link.subLinks ? (
								<div className="relative">
									<button
										aria-expanded="false"
										aria-haspopup="true"
										className="flex items-center space-x-1 px-3 py-2 rounded-lg text-[13px] font-bold text-slate-600 group-hover:text-[#800000] transition-colors"
									>
										<span>{link.title}</span>
										<ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
									</button>
									{/* Dropdown */}
									<div className="absolute top-full right-0 mt-0 w-64 bg-white border border-slate-100 shadow-2xl rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200">
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
							) : (
								<LinkOrButton link={link} onClick={onModalClick} />
							)}
						</div>
					))}
				</div>

				{/* 3. Мабільны блок (Кантакты + Бургер) */}
				<div className="md:hidden flex items-center justify-between w-full h-full">
					<button
						className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						aria-label={isMobileMenuOpen ? "Закрыць меню" : "Адкрыць меню"}
						aria-expanded={isMobileMenuOpen}
					>
						{isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
					</button>
					<div className="flex items-center gap-3 text-[#800000]" aria-label="Кантактная інфармацыя">
						<Link
							href="tel:+375172844220"
							className="flex items-center gap-1 font-black"
							aria-label="Пазваніць нам: кароткі нумар 277"
						>
							<Phone size={16} fill="currentColor" />
							<span className="text-[20px] leading-none tracking-tighter">277</span>
						</Link>

						<div className="w-[1px] h-4 bg-[#800000]/20" />

						<Link
							href="mailto:gmm@gmm.by"
							className="flex items-center gap-1 opacity-90"
							aria-label="Напісаць на электронную пошту"
						>
							<Mail size={14} />
							<span className="text-[11px] font-bold border-b border-[#800000]/30 leading-none">
								gmm@gmm.by
							</span>
						</Link>
					</div>
				</div>
			</div>

			{/* 4. Мабільнае выпадальнае меню */}
			<div className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
				}`}>
				<div className="p-4 space-y-2 flex flex-col">
					{links.map((link) => (
						<div key={link.title} className="flex flex-col">
							{link.subLinks ? (
								<div className="space-y-1">
									<div className="px-3 py-2 text-[12px] uppercase tracking-wider text-slate-400 font-bold">
										{link.title}
									</div>
									{link.subLinks.map((sub) => (
										<button
											key={sub.title}
											onClick={() => handleAction(sub.modalId)}
											className="block w-full text-left px-6 py-3 text-[14px] font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
										>
											{sub.title}
										</button>
									))}
								</div>
							) : (
								<LinkOrButton
									link={link}
									onClick={(id) => handleAction(id)}
									isMobile
								/>
							)}
						</div>
					))}
				</div>
			</div>
		</nav>
	);
}

function LinkOrButton({
	link,
	onClick,
	isMobile
}: {
	link: NavLink,
	onClick?: (id: string) => void,
	isMobile?: boolean
}) {
	const baseStyles = `flex items-center space-x-2 px-3 py-2 rounded-lg text-[13px] sm:text-[14px] font-bold transition-all ${link.highlight
			? 'text-[#800000] bg-rose-50 hover:bg-rose-100'
			: 'text-slate-600 hover:text-[#800000] hover:bg-slate-50'
		} ${isMobile ? 'py-4 text-[16px] w-full' : ''}`;

	if (link.href) {
		return (
			<Link
				href={link.href}
				className={baseStyles}
				onClick={() => isMobile && onClick?.('')}
			>
				{link.icon && (
					<span className={`${link.highlight ? 'text-red-600' : 'text-slate-400'} hidden lg:inline-flex`}>
						{link.icon}
					</span>
				)}
				<span>{link.title}</span>
			</Link>
		);
	}

	return (
		<button
			onClick={() => link.modalId && onClick?.(link.modalId)}
			className={baseStyles}
		>
			{link.icon && <span className="text-slate-400 hidden lg:inline-flex">{link.icon}</span>}
			<span>{link.title}</span>
		</button>
	);
}