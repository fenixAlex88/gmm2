import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
	return (
		<header className="py-4 w-full bg-[#800000] text-white font-sans overflow-visible z-50">
			<div className="mx-auto max-w-6xl h-[100px] sm:h-[135px] flex items-center justify-between px-4 relative">

				{/* Логотип в белом круге — теперь он может выступать вниз */}
				<div className="relative z-50 flex-shrink-0 bg-white rounded-full shadow-lg overflow-hidden flex items-center justify-center 
                        w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] md:w-[140px] md:h-[140px] lg:w-[170px] lg:h-[170px] xl:w-[220px] xl:h-[220px]
                        translate-y-[12%]">
					<Link href="/" className="relative w-full h-full flex items-center justify-center">
						<Image
							src="/logo.svg"
							alt="Logo Icon"
							fill
							className="object-contain p-4 sm:p-8"
							priority
						/>
					</Link>
				</div>

				{/* Центральный блок */}
				<div className="flex flex-col flex-grow items-center lg:items-start px-6 relative">
					<div className="mb-1 sm:mb-2">
						<Image
							src="/gmm-genii.webp"
							alt="Decorative"
							width={692}
							height={98}
							className="object-contain h-auto w-[200px] sm:w-[692px]"
							priority
						/>
					</div>
					<h1 className="font-semibold text-[#ffe5f8] leading-tight text-center lg:text-left 
                         text-[16px] sm:text-[24px] md:text-[36px] xl:text-[36px]">
						СЭНСАВЫЯ ПАДАРОЖЖЫ ПА БЕЛАРУСІ
					</h1>
				</div>

				{/* Контакты */}
				<div className="flex flex-col items-end space-y-0 sm:space-y-1">
					<Link href="tel:+375172844220" className="flex items-center space-x-2 font-bold 
                          text-[24px] sm:text-[44px] md:text-[48px] lg:text-[52px] xl:text-[60px] hover:text-pink-200 transition-colors">
						<span>277</span>
					</Link>
					<Link href="mailto:gmm@gmm.by" className="hover:underline opacity-80 transition-opacity">
						<span className="text-[10px] sm:text-[14px] xl:text-[16px]">gmm@gmm.by</span>
					</Link>
				</div>

			</div>
		</header>
	);
}