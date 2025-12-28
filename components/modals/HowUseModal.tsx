'use client';

import React from 'react';
import Modal from '../Modal';

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export default function HowUseModal({ isOpen, onClose }: Props) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Як карыстацца?">
			<div className="space-y-6 text-slate-700 leading-relaxed">
				{/* Шапка даведкі */}
				<div className="bg-[#800000]/5 p-4 rounded-lg border-l-4 border-[#800000]">
					<p className="font-bold text-slate-900 uppercase tracking-wide text-sm">Кароткая даведка</p>
				</div>

				<div className="space-y-4">
					<p className="text-xl font-bold text-slate-800">Кожны квадрацік — гэта падарожжа.</p>

					<p className="text-slate-600 italic">
						Тут сабраны падарожжы 4 выглядаў (звяртай увагу на карцінкі ў правым вугле кожнага квадраціка):
					</p>
				</div>

				{/* Сетка типов путешествий */}
				<div className="grid gap-4 md:grid-cols-2">
					{[
						{ type: "Тур", desc: "1-2 дзённае самастойнае падарожжа" },
						{ type: "Падзея", desc: "цікавы факт, падзея, экскурсія або актыўнасць у лакальным месцы" },
						{ type: "Вобраз", desc: "візуальныя, медыйныя (музыка, гук, малюнкі) творы" },
						{ type: "Тэкст", desc: "пісьмовыя вытокі, кнігі, нарысы, меркаванні або каментары" }
					].map((item, i) => (
						<div key={i} className="flex items-start space-x-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
							<div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-[#800000] shrink-0" />
							<div className="text-sm">
								<span className="font-bold text-[#800000] uppercase text-xs tracking-tighter mr-1">{item.type}</span>
								<span className="text-slate-400"> — </span>
								{item.desc}
							</div>
						</div>
					))}
				</div>

				{/* Дополнительная информация */}
				<div className="space-y-4 pt-4 border-t border-slate-100">
					<p>
						Выбірай падарожжы з дапамогай фільтраў па:
						<span className="text-slate-500 ml-1">
							месцам, геніям, сэнсам, фармату, статусу, рэйтынгу, аўтару.
						</span>
					</p>
					<p>
						Вызначы для сябе крытэрый выбару: пазнавальнасць, прыгажосць ці актыўнасць.
						<span className="text-slate-500 ml-1">
							пазнавальнасць, прыгажосць ці актыўнасць.
						</span>
					</p>

					<p className="text-center pt-4 text-slate-500 italic border-t border-slate-50">
						Кожнае падарожжа з сваім геніем — чалавекам, які адмеціў і змяніў сваё месца.
					</p>
				</div>
			</div>
		</Modal>
	);
}