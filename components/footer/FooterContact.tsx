import Link from 'next/link';

const FooterContact: React.FC = () => {
	return (
		<div className="text-xs md:text-sm font-medium text-center text-gray-100/90 leading-relaxed px-2">
			<div className="max-w-5xl mx-auto flex flex-col">
					<p>
						Інфармацыйны турысцкі центр Унітарнага прадпрыемства &quot;БАЭС-сэрвіс&quot;,
						222850, Мінская вобл., Пухавіцкі раён, г.п.Рудзенск, вул.Ленінская, 16-9
					</p>
					<p className="opacity-80">
						УНП 691943648, 15.06.19, Пухавіцкі райвыканкам
					</p>
					<p>
						Распрацоўка сайта: Навукова-вытворчае унітарнае прадпрыемства &quot;БАЭС&quot;, Мінск, 
						e-mail: <Link href="mailto:gmm@gmm.by" className="text-white font-bold hover:text-amber-300 underline transition">gmm@gmm.by</Link>&nbsp;
						<Link href="tel:+375172844220" className="text-white font-bold hover:text-amber-300 transition whitespace-nowrap">
							тэл. +375 17 284-42-20
						</Link>
					</p>
					<p className="text-gray-400 text-[10px] md:text-xs">
						Рэжым працы: 8.00 - 20.00 штодзённа  ©{new Date().getFullYear()} gmm.by
					</p>			
			</div>
		</div>
	);
};

export default FooterContact;