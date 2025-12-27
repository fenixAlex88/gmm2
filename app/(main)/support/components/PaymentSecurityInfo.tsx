import React from "react";
import Link from "next/link";
import Image from "next/image";

const PaymentSecurityInfo: React.FC = () => (
	<div className="mt-12 pt-8 border-t border-gray-200 text-gray-700 space-y-4">
		<h4 className="text-xl font-semibold text-gray-800 mb-4">
			Бяспека вашых плацяжоў
		</h4>

		<p>
			Пасля таго, як Вы ўвялі e‑mail, нумар тэлефона і выбралі суму, націсніце
			кнопку <strong className="text-amber-600">Падтрымаць</strong>.
		</p>

		<p>
			Вы пяройдзеце на спецыяльную абароненую аплатную старонку{" "}
			<Link
				href="https://bepaid.by/"
				target="_blank"
				rel="noopener noreferrer"
				className="text-amber-600 hover:underline"
			>
				працэсінгавай сістэмы bePaid
			</Link>
			. На аплатнай старонцы будзе ўказаны нумар замовы і сума плацяжу. Для
			аплаты варта ўвесці свае картачныя дадзеныя і пацвердзіць плацёж,
			націснуўшы кнопку «Аплаціць».
		</p>

		<p>
			Калі аплатная карта падтрымлівае тэхналогію{" "}
			<strong className="text-amber-600">3‑D Secure</strong>, сістэмай будзе
			прапанавана прайсці стандартную аднахвілінную працэдуру праверкі
			ўладальніка карты на старонцы Вашага банка.
		</p>

		<p>
			Звяртаем Вашу ўвагу, што пасля правядзення плацяжу на ўказаны Вамі
			электронны адрас прыйдзе пацверджанне аплаты. Просім Вас захоўваць
			дадзеныя аплат.
		</p>

		<p>
			Мы прымаем плацяжы па наступных банкаўскіх картах:{" "}
			<span className="font-semibold">Visa, VisaElectron, MasterCard, Maestro, Белкарт</span>.
		</p>

		<Image
			src="/images/bepaid.png"
			alt="Логотипы партнёраў і bePaid"
			width={440}
			height={43}
			className="max-w-full h-auto mx-auto"
		/>

		<p>
			Плацяжы па банкаўскіх картах ажыццяўляюцца праз сістэму электронных
			плацяжоў <strong>bePaid</strong>. Аплатная старонка адпавядае стандарту{" "}
			<strong>PCI DSS Level 1</strong>. Усе канфідэнцыйныя даныя захоўваюцца ў
			зашыфраваным выглядзе і максімальна ўстойлівыя да ўзлому. Доступ да
			аўтарызацыйных старонак ажыццяўляецца праз{" "}
			<strong>SSL/TLS</strong>.
		</p>
	</div>
);

export default PaymentSecurityInfo;
