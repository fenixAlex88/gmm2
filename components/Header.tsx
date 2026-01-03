import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';

export default function Header() {
	return (
		<header className="relative w-full bg-[#800000] text-white font-sans z-50 shadow-md overflow-visible">
			<div className="mx-auto max-w-7xl px-4 flex items-center justify-between h-24 sm:h-32 lg:h-40">

				{/* Logo Section - Выступае за межы хедэра на дэсктопе */}
				<div className="relative z-50 flex-shrink-0">
					<Link
						href="/"
						className="flex items-center justify-center transition-all hover:scale-105

                   w-16 h-16 

                   sm:w-24 sm:h-24 
 
                   lg:w-40 lg:h-40 bg-white rounded-full lg:shadow-xl lg:translate-y-[20%]

                   xl:w-52 xl:h-52"
						aria-label="На галоўную старонку ГММ"
					>
						<div className="relative w-full h-full lg:w-[80%] lg:h-[80%] p-1 lg:p-0">
							<Image
								src="/logo.svg"
								alt="Лагатып праекта ГММ"
								fill
								className="object-contain"
								priority
							/>
						</div>
					</Link>
				</div>

				<div className="flex flex-col flex-grow items-center lg:items-start px-2 md:px-6">
					<div className="relative w-full lg:max-w-[692px] px-2">
						<Image
							src="/gmm-genii.webp"
							alt="Геній месца"
							width={692}
							height={98}
							className="object-contain w-full h-auto"
							priority
						/>
					</div>

					<h2 className="font-bold text-[#ffe5f8] leading-tight text-center lg:text-left 
                                   text-[14px] sm:text-[18px] md:text-[24px] lg:text-[34px] tracking-wide uppercase">
						Сэнсавыя падарожжы па Беларусі
					</h2>
				</div>

				<div className="hidden md:flex flex-col items-end gap-1" aria-label="Кантактная інфармацыя">
					<Link
						href="tel:+375172844220"
						className="group flex items-center gap-1 sm:gap-2 font-black text-white 
                                   hover:text-amber-300 transition-colors"
						aria-label="Пазваніць нам: кароткі нумар 277"
					>
						<Phone size={20} className="hidden sm:block group-hover:animate-pulse" />
						<span className="text-[22px] sm:text-[36px] md:text-[48px] lg:text-[56px] leading-none">
							277
						</span>
					</Link>

					<Link
						href="mailto:gmm@gmm.by"
						className="group flex items-center gap-1 opacity-90 hover:opacity-100 hover:text-amber-200 transition-all"
						aria-label="Напісаць на электронную пошту"
					>
						<Mail size={14} className="hidden sm:block" />
						<span className="text-[10px] sm:text-[14px] md:text-[16px] border-b border-transparent group-hover:border-amber-200">
							gmm@gmm.by
						</span>
					</Link>
				</div>

			</div>

			{/* Тонкая дэкаратыўная лінія знізу */}
			<div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
		</header>
	);
}