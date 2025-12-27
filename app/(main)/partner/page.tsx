import Link from "next/link";
import React from "react";

export default function PartnerPage() {
	return (
		<div className="bg-white min-h-screen py-16 md:py-24">
			<div className="container mx-auto px-4">
				<div className="max-w-4xl mx-auto text-center">
					{/* Заголовок */}
					<h1 className="text-4xl md:text-5xl font-extralight text-gray-800 mb-6 uppercase tracking-wide">
						Партнёрам
					</h1>

					{/* Подзаголовок */}
					<h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-10 leading-relaxed">
						«Геній майго месца» — нацыянальны праект сэнсавага турызму, які аб’ядноўвае людзей і арганізацыі
					</h2>

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
					<div className="text-lg md:text-xl text-gray-700 leading-relaxed mb-12">
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


					{/* CTA кнопка */}
					<div>
						<Link
							href="mailto:gmm@gmm.by"
							className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-10 rounded-lg text-lg transition duration-300 shadow-lg"
						>
							Стать удзельнiкам
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
