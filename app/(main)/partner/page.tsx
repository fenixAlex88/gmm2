import Link from "next/link";
import React from "react";

export default function PartnerPage() {
	return (
		<div className="bg-white py-4 md:py-5 min-h-screen">
			<div className="container mx-auto px-4 max-w-5xl">
				<header className="text-center mb-16">
					<span className="text-[#800000] font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
						Супрацоўніцтва
					</span>
					<h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight">
						Партнёрам
					</h1>
					<div className="w-20 h-1.5 bg-[#800000] mx-auto mb-6"></div>
					<h2 className="text-xl md:text-2xl font-bold text-slate-700 max-w-3xl mx-auto leading-relaxed">
						«Геній майго месца» — нацыянальны праект сэнсавага турызму, які аб’ядноўвае людзей і арганізацыі.
					</h2>
				</header>

				{/* Блок преимуществ */}
				<div className="grid md:grid-cols-3 gap-8 text-left mb-12">
					<div className="p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
						<h3 className="text-lg font-bold text-amber-600 mb-3">Супрацоўніцтва</h3>
						<p className="text-gray-700">
							Мы адкрытыя да партнёрства з турыстычнымі кампаніямі, культурнымі ўстановамі і бізнесам.
						</p>
					</div>
					<div className="p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
						<h3 className="text-lg font-bold text-amber-600 mb-3">Развіццё</h3>
						<p className="text-gray-700">
							Праект дапамагае развіваць рэгіёны праз турызм, адукацыю і культурныя ініцыятывы.
						</p>
					</div>
					<div className="p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
						<h3 className="text-lg font-bold text-amber-600 mb-3">Падтрымка</h3>
						<p className="text-gray-700">
							Мы прапануем інфармацыйную і арганізацыйную падтрымку для сумесных праектаў.
						</p>
					</div>
				</div>

				{/* Контакты */}
				<div className="text-lg md:text-xl text-gray-700 leading-relaxed mb-12 text-center">
					<p className="mb-4">
						Каб стаць удзельнікам праекта, звяжыцеся з намі:
					</p>
					<div className="flex flex-col md:flex-row md:justify-center md:space-x-8 space-y-4 md:space-y-0">
						<a
							href="tel:+375172844220"
							className="text-gray-800 font-semibold hover:text-amber-600 transition duration-200"
						>
							📞 +375 (17) 284‑42‑20
						</a>
						<a
							href="mailto:gmm@gmm.by"
							className="text-gray-800 font-semibold hover:text-amber-600 transition duration-200"
						>
							✉️ gmm@gmm.by
						</a>
					</div>
				</div>


				<div className="text-center">
					<Link
						href="mailto:gmm@gmm.by"
						className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-10 rounded-lg text-lg transition duration-300 shadow-lg"
					>
						Стать удзельнiкам
					</Link>
				</div>
			</div>
		</div>
	);
}
