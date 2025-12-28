'use client';

import React from 'react';
import { MapPin, Star, Bike, Heart, Quote, Mail, Phone, Clock, Building2 } from 'lucide-react';

const FEATURES = [
	{
		title: "Сэнсавы турызм — падарожжы па звычайных месцах, але незвычайныя па сэнсе.",
		descr: "Ты вандруеш па Беларусі, агортваючыся падзеямі, творамі, думкамі, сэнсамі. Ты становішся суўдзельнікам, пазнаеш геніяў свайго месца, перажываеш гісторыю, як частку свайго жыцця.",
		icon: <MapPin size={32} className="text-amber-600" />,
		bgColor: "bg-red-50"
	},
	{
		title: "Геній майго месца ГММ — нацыянальны праект сэнсавага турызму.",
		descr: "Сотні падарожжаў па ўсёй Беларусі. Кожны куток слаўны сваім геніем — чалавекам, які адмеціў і змяніў сваё месца. Трэба іх помніць, бо яны наш падмурак і ўзор для нас.",
		icon: <Star size={32} className="text-amber-600" />,
		bgColor: "bg-amber-50"
	},
	{
		title: "ГММ-падарожжы — для самастойных, неабыякавых і актыўных людзей.",
		descr: "Вандруйце самі на аўто, ровары, пешшу. Кожны тур дае мапу, даведнік, аўдыёгід, літаратурныя і медыйныя дадаткі. Можна вандраваць нават на канапе, чытаючы або слухаючы вобразы.",
		icon: <Bike size={32} className="text-amber-600" />,
		bgColor: "bg-blue-50"
	},
	{
		title: "Кожны зможа знайсці падарожжа па душы.",
		descr: "Усе мы розныя: камусьці важна пазнанне, камусьці — эстэтыка, камусьці — актыўнасць. ГММ-падарожжы маюць рэйтынг, які дапаможа знайсці тое, што прынясе вам шмат станоўчыя эмоцый.",
		icon: <Heart size={32} className="text-amber-600" />,
		bgColor: "bg-rose-50"
	}
];

export default function AboutPage() {
	return (
		<div className="bg-white min-h-screen py-16">
			<div className="container mx-auto px-4 max-w-5xl">

				{/* Загаловак */}
				<header className="text-center mb-16">
					<span className="text-[#800000] font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
						Пра нас
					</span>
					<h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight">
						Аб праекце
					</h1>
					<div className="w-20 h-1.5 bg-[#800000] mx-auto"></div>
				</header>

				{/* Аб'яднаны блок: Цытата + Кантакты */}
				<section className="mb-24 relative">
					<div className="bg-slate-50 rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
						{/* Дэкаратыўная вялікая кавычка */}
						<Quote size={120} className="absolute -top-10 -right-10 text-slate-200 opacity-20 rotate-12" />

						<div className="relative z-10">
							{/* Цытата */}
							<div className="text-center mb-12">
								<h4 className="text-2xl md:text-3xl font-serif italic text-slate-800 max-w-2xl mx-auto leading-snug">
									&quot;Мы стараемся выявіць прыгажосць і сілу нашых месцаў і нашых геніяў з усіх бакоў&quot;
								</h4>
								<p className="mt-4 text-amber-600 font-bold tracking-widest uppercase text-[11px]">
									Каманда ГММ
								</p>
							</div>

							<div className="h-px bg-slate-200 w-full mb-10" />

							{/* Кантактная сетка */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
								<div className="space-y-6">
									<h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
										Інфа-тур цэнтр
									</h2>
									<div className="space-y-4">
										<div className="flex items-center space-x-3 text-slate-700">
											<Building2 className="text-amber-600 shrink-0" size={20} />
											<span className="font-bold">УП &quot;БАЭС-сервіс&quot;</span>
										</div>
										<div className="flex items-start space-x-3 text-slate-600">
											<MapPin className="text-amber-600 shrink-0 mt-1" size={20} />
											<span>Мінск, Платонава, 22-1008</span>
										</div>
									</div>
								</div>

								<div className="space-y-4 bg-white/50 p-6 rounded-2xl border border-white/50">
									<a href="mailto:gmm@gmm.by" className="flex items-center space-x-3 text-slate-600 hover:text-[#800000] transition-colors">
										<Mail className="text-amber-600" size={18} />
										<span className="font-medium">gmm@gmm.by</span>
									</a>
									<div className="flex items-center space-x-3">
										<Phone className="text-amber-600" size={18} />
										<span className="text-3xl font-black text-amber-600">277</span>
									</div>
									<div className="flex items-center space-x-3 text-slate-500 text-sm italic">
										<Clock className="text-slate-400" size={16} />
										<span>9.00 - 20.00 штодзённа</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Сетка кантэнту (FEATURES) */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative">
					{/* Вертыкальная лінія па цэнтры для дэсктопа */}
					<div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 hidden lg:block -translate-x-1/2"></div>

					{FEATURES.map((item, index) => (
						<div key={index} className="flex flex-col items-start group relative">
							<div className={`w-14 h-14 ${item.bgColor} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 shadow-sm`}>
								{item.icon}
							</div>
							<h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-4 leading-tight group-hover:text-[#800000] transition-colors">
								{item.title}
							</h3>
							<p className="text-slate-600 text-[17px] leading-relaxed font-light">
								{item.descr}
							</p>
						</div>
					))}
				</div>

			</div>
		</div>
	);
}