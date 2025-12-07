import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
	return (
		<header className="py-4 w-full bg-[#800000] text-white font-sans overflow-hidden">
			<div className="mx-auto max-w-6xl h-[135px] flex items-center justify-between px-4 relative">

				{/* Логотип в белом круге */}
				<div className="relative flex-shrink-0 bg-white rounded-full overflow-hidden flex items-center justify-center 
                        w-[100px] h-[100px] sm:w-[160px] sm:h-[160px] md:w-[132px] md:h-[132px] lg:w-[168px] lg:h-[168px] xl:w-[240px] xl:h-[240px]">
					<Link href="/">
						<Image
							src="/logo.svg"
							alt="Logo Icon"
							fill
							className="object-contain px-9"
							priority
						/>
					</Link>

				</div>

				{/* Центральный блок: картинка + тексты */}
				<div className="flex flex-col flex-grow items-center lg:items-start px-6 relative">
					{/* Картинка над заголовком */}
					<div className="mb-2">
						<Image
							src="/gmm-genii.webp"
							alt="Decorative"
							width={682}
							height={236}
							className="object-contain"
							priority
						/>
					</div>

					{/* Заголовок */}
					<h1 className="font-semibold text-[#ffe5f8] leading-tight text-center lg:text-left 
                         text-[16px] sm:text-[25px] md:text-[31px] xl:text-[35px]">
						СЭНСАВЫЯ ПАДАРОЖЖЫ ПА БЕЛАРУСІ
					</h1>
				</div>

				{/* Контакты справа */}
				<div className="flex flex-col items-end space-y-1">

					<Link href="tel:+375172844220" className="flex items-center space-x-2 font-bold 
                          text-[28px] sm:text-[54px] md:text-[50px] lg:text-[48px] xl:text-[64px]">
						<Image
							src="/icons/phone.svg"
							alt="Phone Icon"
							width={40}
							height={40}
							className="object-contain pt-3 mx-1"
						/>


						<span>277</span>
					</Link>

					<Link href="mailto:gmm@gmm.by">
						<span className="text-[12px] sm:text-[14px] xl:text-[16px]">gmm@gmm.by</span>
					</Link>


				</div>

			</div>
		</header>
	);
}
