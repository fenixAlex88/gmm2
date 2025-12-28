'use client';

import React from 'react';
import Modal from '../Modal';

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export default function DiffRoutesModal({ isOpen, onClose }: Props) {
	const routeDetails = [
		{ t: "Аўта 1 дзень", d: "падарожжа на аўтамабіле ці шэрагу аўтамабіляў працягам 1 дзень (8 гадзін) каля 40-50 км тура, усяго да 150 км з даездам з Мінску" },
		{ t: "Аўта 2 дні", d: "падарожжа на аўтамабіле ці шэрагу аўтамабіляў працягам 2 дні з начлегам, звычайна можна раздзяліць тур на два 1-дзённых, але гэта зніжае ўражанне" },
		{ t: "Велатур, роварны тур", d: "візуальныя, медыйныя (музыка, гук, малюнкі) творы, абрады, стравы, паслугі і сэрвісы" },
		{ t: "Водны тур", d: "пісьмовыя вытокі, кнігі, нарысы, меркаванні або каментары" },
	];

	const specs = [
		{ l: "Месцы", d: "адміністрацыйныя раёны ці іншыя геаграфічныя аб'екты, нават і віртуальныя" },
		{ l: "Геніі", d: "славутыя людзі, genius loci, духі або унікальныя з'явы месца" },
		{ l: "Сэнсы", d: "паняцці, з'явы, існасці, фармулёўкі" },
		{ l: "Фармат", d: "сродак і форма падарожжа, напрыклад, аўтатур двухдзённы з начлегам" },
		{ l: "Статус", d: "асаблівасці, стан гатоўнасці падарожжа" },
		{ l: "Рэйтынг", d: "ацэнка падарожжа па пазнавальнасці, эстэтыцы, забаўляльнасці, камфорту" },
		{ l: "Аўтар", d: "аўтар вобраза ці тэкста" },
	];

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Чым адрозніваюцца маршруты">
			<div className="space-y-6 text-slate-700 leading-relaxed">

				{/* Вступление */}
				<div className="space-y-4">
					<p>
						Маршрут тура аб&apos;ядноўвае тураб&apos;екты і аб&apos;екты сервісу падарожжа. Маршруты маюць фармат г.зн. мадальнасць (сродак транспарту): <strong>аўта, ровар, пешшу, водны, бус (аўтобус)</strong> ды працягласць: <strong>1 дзень, 2 дні з начлегам</strong>:
					</p>
				</div>

				{/* Основные форматы */}
				<div className="space-y-4">
					{routeDetails.map((route, idx) => (
						<div key={idx} className="flex flex-col md:flex-row md:items-start border-l-2 border-[#800000] pl-4 py-1">
							<span className="font-bold text-[#800000] min-w-[180px] shrink-0">
								{route.t} 
							</span>
							<span className="md:ml-2 text-slate-600">
								{route.d}
							</span>
						</div>
					))}
				</div>

				<p className="font-medium">
					Маршруты разлічваюцца на 8 гадзін падарожжа ўдзень.
				</p>

				{/* Характеристики маршрутов */}
				<div className="pt-6 border-t border-slate-100">
					<p className="font-bold mb-4">Звесткі аб маршрутах падаюцца як:</p>
					<div className="grid gap-3">
						{specs.map((spec, idx) => (
							<div key={idx} className="flex items-start text-sm bg-slate-50 p-2 rounded">
								<span className="font-bold text-[#800000] min-w-[80px] shrink-0">{spec.l} </span>
								<span className="ml-2 text-slate-600">{spec.d}</span>
							</div>
						))}
					</div>
				</div>

				{/* Финал */}
				<p className="pt-4 text-sm italic text-slate-500">
					Выстаўленне камбінацыі фільтраў дазваляе абмежаваць набор падарожжаў, згодна індывідуальным перавагам.
				</p>
			</div>
		</Modal>
	);
}