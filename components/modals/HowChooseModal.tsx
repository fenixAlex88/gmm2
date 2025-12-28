'use client';

import React from 'react';
import Modal from '../Modal';

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export default function HowChooseModal({ isOpen, onClose }: Props) {

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Як выбіраць падарожжа">
			<div className="space-y-6 text-slate-700 leading-relaxed">

				<p>
					Сэнсавыя падарожжы – гэта не проста паездка да таго ці іншага адметнага месца. Гэта паняцце абагульняе туры, падзеі, вобразы і тэксты, якія звязаны з месцам і геніямі гэтага месца:
				</p>


				<div className="space-y-2">
					{[
						{ t: "Тур", d: "падарожжа па маршруту на аўтамабіле, ровары ці іншым фарматам" },
						{ t: "Падзея", d: "цікавы факт, падзея, экскурсія або актыўнасць у лакальным месцы" },
						{ t: "Вобраз", d: "візуальныя, медыйныя (музыка, гук, малюнкі) творы, абрады, стравы, паслугі і сэрвісы" },
						{ t: "Тэкст", d: "пісьмовыя вытокі, кнігі, нарысы, меркаванні або каментары" }
					].map((item, idx) => (
						<div key={idx} className="flex items-start">
							<span className="font-bold text-[#800000] min-w-[70px]">{item.t} </span>
							<span className="ml-1">{item.d}</span>
						</div>
					))}
				</div>

				<p>
					Звесткі аб падарожжах размешчаны спісамі ў галерэі ці каталогі. Спісы можна фільтраваць па розных аспектах:
				</p>

				<div className="space-y-2">
					{[
						{ t: "Месцы", d: "адміністрацыйныя раёны ці іншыя геаграфічныя аб'екты, нават і віртуальныя" },
						{ t: "Геніі", d: "славутыя людзі, genius loci, духі або унікальныя з'явы месца" },
						{ t: "Сэнсы", d: "паняцці, з'явы, існасці, фармулёўкі" },
						{ t: "Фармат", d: "сродак і форма падарожжа, напрыклад, аўтатур двухдзённы з начлегам" },
						{ t: "Статус", d: "асаблівасці, стан гатоўнасці падарожжа" },
						{ t: "Рэйтынг", d: "ацэнка падарожжа па пазнавальнасці, эстэтыцы, забаўляльнасці, камфорту" },
						{ t: "Аўтар", d: "аўтар вобраза ці тэкста" },
					].map((item, idx) => (
						<div key={idx} className="flex items-start">
							<span className="font-bold text-[#800000] min-w-[70px]">{item.t} </span>
							<span className="ml-1">{item.d}</span>
						</div>
					))}
				</div>



				<p className="pt-2 border-t border-slate-100 text-sm italic">
					Выстаўленне камбінацыі фільтраў дазваляе абмежаваць набор падарожжаў, згодна індывідуальным перавагам.
				</p>
			</div>
		</Modal>
	);
}