'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, FileText, HelpCircle, Info, Compass, Newspaper, Users, Heart } from 'lucide-react';

interface MenuLink {
	title: string;
	href?: string;
	icon: React.ReactNode;
	subLinks?: { title: string; href: string }[];
}

const LINKS: MenuLink[] = [
	{ title: 'Ліст аўтару', href: '#popup:list', icon: <FileText size={20} /> },
	{ title: 'Як карыстацца?', href: '#popup:how-use', icon: <HelpCircle size={20} /> },
	{ title: 'Аб праекце', href: '#popup:about_project', icon: <Info size={20} /> },
	{
		title: 'Падарожніку',
		icon: <Compass size={20} />,
		subLinks: [
			{ title: 'Як выбіраць падарожжа', href: '#popup:how-choose' },
			{ title: 'Чым адрозніваюцца маршруты', href: '#popup:trips' },
		],
	},
	{ title: 'Навіны', href: '#rec165850776', icon: <Newspaper size={20} /> },
	{ title: 'Партнерам', href: 'https://gmm.by/partner', icon: <Users size={20} /> },
	{ title: 'Падтрымаць праект', href: 'https://gmm.by/support_project', icon: <Heart size={20} /> },
];

export default function SideMenu() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			{/* Desktop: фиксированное меню слева */}
			<aside className="hidden lg:flex flex-col w-64 bg-white text-gray-800 border-r h-screen p-4 fixed left-0 top-0 shadow-2xl">
				<h2 className="text-xl font-bold mb-6">Меню</h2>
				<nav className="flex flex-col space-y-3">
					{LINKS.map((link) =>
						link.subLinks ? (
							<div key={link.title}>
								<div className="flex items-center space-x-2 font-semibold">
									{link.icon}
									<span>{link.title}</span>
								</div>
								<div className="ml-6 mt-2 flex flex-col space-y-2">
									{link.subLinks.map((sub) => (
										<Link key={sub.href} href={sub.href} className="text-gray-600 hover:text-[#800000]">
											{sub.title}
										</Link>
									))}
								</div>
							</div>
						) : (
							link.href && (
								<Link key={link.href} href={link.href} className="flex items-center space-x-2 hover:text-[#800000]">
									{link.icon}
									<span>{link.title}</span>
								</Link>
							)
						)
					)}
				</nav>
			</aside>

			{/* Tablet: узкая полоска с иконками */}
			<aside className="hidden md:flex lg:hidden flex-col w-16 bg-white border-r h-screen p-4 fixed left-0 top-0 items-center shadow-xl">
				<nav className="flex flex-col space-y-6">
					{LINKS.map(
						(link) =>
							link.href && (
								<Link key={link.href} href={link.href} title={link.title} className="hover:text-[#800000]">
									{link.icon}
								</Link>
							)
					)}
				</nav>
			</aside>

			{/* Mobile: бургер */}
			<div className="md:hidden shadow-2xl">
				<button
					onClick={() => setIsOpen(true)}
					className="p-2 text-white bg-[#800000] fixed top-4 left-4 z-50 rounded-md"
					aria-label="Открыть меню"
				>
					<Menu size={28} />
				</button>

				{isOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setIsOpen(false)} />
				)}

				<aside
					className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
				>
					<div className="flex justify-between items-center p-4 border-b">
						<h2 className="text-lg font-bold">Меню</h2>
						<button onClick={() => setIsOpen(false)} aria-label="Закрыть меню">
							<X size={24} />
						</button>
					</div>
					<nav className="flex flex-col p-4 space-y-3">
						{LINKS.map((link) =>
							link.subLinks ? (
								<div key={link.title}>
									<div className="flex items-center space-x-2 font-semibold">
										{link.icon}
										<span>{link.title}</span>
									</div>
									<div className="ml-6 mt-2 flex flex-col space-y-2">
										{link.subLinks.map((sub) => (
											<Link
												key={sub.href}
												href={sub.href}
												className="text-gray-600 hover:text-[#800000]"
												onClick={() => setIsOpen(false)}
											>
												{sub.title}
											</Link>
										))}
									</div>
								</div>
							) : (
								link.href && (
									<Link
										key={link.href}
										href={link.href}
										className="flex items-center space-x-2 hover:text-[#800000]"
										onClick={() => setIsOpen(false)}
									>
										{link.icon}
										<span>{link.title}</span>
									</Link>
								)
							)
						)}
					</nav>
				</aside>
			</div>
		</>
	);
}
